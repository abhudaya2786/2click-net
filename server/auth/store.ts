/**
 * File-backed user store with scrypt password hashing.
 * Persists under data/auth/users.json (gitignored content).
 */
import fs from 'fs/promises';
import path from 'path';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

export interface AuthUserRecord {
  id: string;
  userId: string;
  displayName: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicAuthUser {
  id: string;
  userId: string;
  displayName: string;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

const USER_ID_RE = /^[a-zA-Z0-9_]{3,32}$/;
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function dataDir() {
  return path.join(process.cwd(), 'data', 'auth');
}

function usersFile() {
  return path.join(dataDir(), 'users.json');
}

function sessionsFile() {
  return path.join(dataDir(), 'sessions.json');
}

async function ensureDir() {
  await fs.mkdir(dataDir(), { recursive: true });
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, value: unknown) {
  await ensureDir();
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(value, null, 2), 'utf8');
  await fs.rename(tmp, file);
}

function hashPassword(password: string, saltHex?: string) {
  const salt = saltHex ? Buffer.from(saltHex, 'hex') : randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return {
    passwordHash: hash.toString('hex'),
    passwordSalt: salt.toString('hex'),
  };
}

function verifyPassword(password: string, saltHex: string, hashHex: string) {
  const { passwordHash } = hashPassword(password, saltHex);
  const a = Buffer.from(passwordHash, 'hex');
  const b = Buffer.from(hashHex, 'hex');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function toPublic(user: AuthUserRecord): PublicAuthUser {
  return {
    id: user.id,
    userId: user.userId,
    displayName: user.displayName,
    createdAt: user.createdAt,
  };
}

function normalizeUserId(raw: string) {
  return String(raw || '').trim();
}

export function validateUserId(userId: string): string | null {
  const id = normalizeUserId(userId);
  if (!USER_ID_RE.test(id)) {
    return 'User ID must be 3–32 characters (letters, numbers, underscore).';
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (typeof password !== 'string' || password.length < 6) {
    return 'Password must be at least 6 characters.';
  }
  if (password.length > 128) {
    return 'Password is too long.';
  }
  return null;
}

export class AuthStore {
  private users: AuthUserRecord[] = [];
  private sessions: AuthSession[] = [];
  private loaded = false;

  async init() {
    if (this.loaded) return;
    await ensureDir();
    this.users = await readJson<AuthUserRecord[]>(usersFile(), []);
    this.sessions = await readJson<AuthSession[]>(sessionsFile(), []);
    this.pruneExpiredSessions();
    this.loaded = true;
  }

  private async persistUsers() {
    await writeJson(usersFile(), this.users);
  }

  private async persistSessions() {
    this.pruneExpiredSessions();
    await writeJson(sessionsFile(), this.sessions);
  }

  private pruneExpiredSessions() {
    const now = Date.now();
    this.sessions = this.sessions.filter((s) => new Date(s.expiresAt).getTime() > now);
  }

  findByUserId(userId: string) {
    const id = normalizeUserId(userId).toLowerCase();
    return this.users.find((u) => u.userId.toLowerCase() === id) || null;
  }

  async signup(input: {
    userId: string;
    password: string;
    displayName?: string;
  }): Promise<{ user: PublicAuthUser; token: string }> {
    await this.init();
    const userIdError = validateUserId(input.userId);
    if (userIdError) throw Object.assign(new Error(userIdError), { status: 400 });
    const passwordError = validatePassword(input.password);
    if (passwordError) throw Object.assign(new Error(passwordError), { status: 400 });

    if (this.findByUserId(input.userId)) {
      throw Object.assign(new Error('User ID already taken. Try Sign In.'), { status: 409 });
    }

    const now = new Date().toISOString();
    const hashed = hashPassword(input.password);
    const displayName =
      (input.displayName || '').trim() || normalizeUserId(input.userId);

    const user: AuthUserRecord = {
      id: `usr-${randomBytes(8).toString('hex')}`,
      userId: normalizeUserId(input.userId),
      displayName,
      passwordHash: hashed.passwordHash,
      passwordSalt: hashed.passwordSalt,
      createdAt: now,
      updatedAt: now,
    };
    this.users.push(user);
    await this.persistUsers();
    const token = await this.createSession(user.userId);
    return { user: toPublic(user), token };
  }

  async signin(input: {
    userId: string;
    password: string;
  }): Promise<{ user: PublicAuthUser; token: string }> {
    await this.init();
    const user = this.findByUserId(input.userId);
    if (!user || !verifyPassword(input.password, user.passwordSalt, user.passwordHash)) {
      throw Object.assign(new Error('Invalid User ID or password.'), { status: 401 });
    }
    const token = await this.createSession(user.userId);
    return { user: toPublic(user), token };
  }

  private async createSession(userId: string) {
    const token = randomBytes(24).toString('hex');
    const now = Date.now();
    const session: AuthSession = {
      token,
      userId,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + SESSION_TTL_MS).toISOString(),
    };
    this.sessions.unshift(session);
    // Keep last 500 sessions
    if (this.sessions.length > 500) this.sessions.length = 500;
    await this.persistSessions();
    return token;
  }

  async signout(token: string | undefined | null) {
    await this.init();
    if (!token) return;
    this.sessions = this.sessions.filter((s) => s.token !== token);
    await this.persistSessions();
  }

  async getUserForToken(token: string | undefined | null): Promise<PublicAuthUser | null> {
    await this.init();
    if (!token) return null;
    this.pruneExpiredSessions();
    const session = this.sessions.find((s) => s.token === token);
    if (!session) return null;
    const user = this.findByUserId(session.userId);
    return user ? toPublic(user) : null;
  }
}

export const authStore = new AuthStore();

export function readBearerToken(req: { headers: Record<string, any>; body?: any; query?: any }) {
  const header = String(req.headers.authorization || '');
  if (header.toLowerCase().startsWith('bearer ')) {
    return header.slice(7).trim();
  }
  if (req.body?.token) return String(req.body.token);
  if (req.query?.token) return String(req.query.token);
  return '';
}
