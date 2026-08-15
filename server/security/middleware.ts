/**
 * Shared Express security helpers: rate limit, auth gate, owner check.
 */
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { authStore, readBearerToken } from '../auth/store.ts';

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/** Simple in-memory IP rate limiter (per-process; fine for single instance / demo). */
export function createRateLimiter(opts: {
  windowMs?: number;
  max?: number;
  keyPrefix?: string;
} = {}): RequestHandler {
  const windowMs = opts.windowMs ?? 60_000;
  const max = opts.max ?? 60;
  const keyPrefix = opts.keyPrefix ?? 'rl';

  return (req, res, next) => {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';
    const key = `${keyPrefix}:${ip}:${req.path}`;
    const now = Date.now();
    let b = buckets.get(key);
    if (!b || b.resetAt <= now) {
      b = { count: 0, resetAt: now + windowMs };
      buckets.set(key, b);
    }
    b.count += 1;
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - b.count)));
    if (b.count > max) {
      res.status(429).json({
        error: 'Too many requests. Please wait a moment and try again.',
        retryAfterMs: b.resetAt - now,
      });
      return;
    }
    next();
  };
}

export async function getUserFromRequest(req: Request) {
  const token = readBearerToken(req);
  if (!token) return null;
  return authStore.getUserForToken(token);
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      const err = new Error('Sign in required');
      (err as any).status = 401;
      throw err;
    }
    (req as any).user = user;
    next();
  } catch (e: any) {
    const status = e.status || 401;
    _res.status(status).json({ error: e.message || 'Unauthorized' });
  }
}

/**
 * When live AI keys are configured, require a signed-in user for expensive routes.
 * Demo mode (no keys) stays open so smoke tests and freemium transcript→MoM work.
 */
export function requireAuthWhenLiveAi(): RequestHandler {
  return async (req, res, next) => {
    const live = Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);
    if (!live) return next();
    return requireAuth(req, res, next);
  };
}

export function sanitizePublicError(err: unknown, fallback = 'Request failed') {
  const e = err as any;
  const msg = typeof e?.message === 'string' ? e.message : fallback;
  // Avoid leaking stack / env / paths
  if (/ENOENT|EACCES|api[_-]?key|secret|token|password/i.test(msg)) {
    return fallback;
  }
  return msg.slice(0, 240);
}
