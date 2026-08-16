/** Direct BuildEco auth client — always hits the live API, never Hostinger /api HTML. */

export const LOGIN_API_BASE = "https://wallet-vendor-mvp.emergent.host/api";

const DEMO_ACCOUNTS = {
  customer: { email: "customer@buildecogroup.com", password: "Demo@12345", name: "Priya Sharma", role: "customer" },
  vendor: { email: "vendor@buildecogroup.com", password: "Demo@12345", name: "Anil Steel Traders", role: "vendor" },
  contractor: { email: "contractor@buildecogroup.com", password: "Demo@12345", name: "Rajesh Constructions", role: "contractor" },
  architect: { email: "architect@buildecogroup.com", password: "Demo@12345", name: "Demo Architect", role: "architect", user_type: "architect" },
};

async function request(path, { method = "GET", body, token } = {}) {
  try {
    const res = await fetch(`${LOGIN_API_BASE}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { html: true, detail: "Login server returned a web page instead of JSON." };
    }
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      data: { detail: err?.message || "Cannot reach the login server." },
    };
  }
}

export function loginErrorText(result, fallback = "Login failed. Please try again.") {
  const d = result?.data?.detail;
  if (typeof d === "string" && d.trim()) return d;
  if (Array.isArray(d)) {
    const msgs = d.map((row) => (row && row.msg ? row.msg : "")).filter(Boolean);
    if (msgs.length) return msgs.join(" ");
  }
  if (result?.data?.html) return "This website host has no login API. Sign in uses the BuildEco server.";
  if (result?.status === 401) return "Invalid email or password. Create an account with Sign up if you are new.";
  if (result?.status === 422) return "Please enter a valid email and password.";
  if (result?.status === 0) return "Cannot reach the login server. Check your internet and try again.";
  if (result?.status >= 500) return "Login server is busy. Try again in a minute.";
  return fallback;
}

export function isKnownDemoLogin(email, password) {
  const em = String(email || "").trim().toLowerCase();
  const pw = String(password || "");
  return Object.values(DEMO_ACCOUNTS).some((a) => a.email === em && a.password === pw);
}

export function buildLocalDemoSession(profileId = "customer") {
  const demo = DEMO_ACCOUNTS[profileId] || DEMO_ACCOUNTS.customer;
  return {
    token: `demo.${demo.role}`,
    local: true,
    user: {
      id: `demo_${demo.role}`,
      name: demo.name,
      email: demo.email,
      role: demo.role,
      user_type: demo.user_type || demo.role,
      default_dashboard: demo.role === "architect" ? "freelancer" : demo.role,
      auth: "demo",
      demo: true,
      onboarding_completed: true,
    },
  };
}

export async function fetchLoginCategories() {
  const result = await request("/user-types");
  if (!result.ok || !Array.isArray(result.data)) return [];
  return result.data.filter((row) => row && row.code && row.code !== "super_admin");
}

export async function loginWithPassword(email, password) {
  const body = {
    email: String(email || "").trim().toLowerCase(),
    password: String(password || ""),
  };
  if (!body.email.includes("@") || !body.password) {
    return { ok: false, status: 422, data: { detail: "Please enter a valid email and password." } };
  }
  return request("/auth/login", { method: "POST", body });
}

export async function verifyLoginOtp(email, code) {
  return request("/auth/otp/verify", {
    method: "POST",
    body: { email: String(email || "").trim().toLowerCase(), code: String(code || "").trim() },
  });
}

export async function resendLoginOtp(email) {
  return request("/auth/otp/resend", {
    method: "POST",
    body: { email: String(email || "").trim().toLowerCase() },
  });
}

export async function sendPasswordReset(email, origin) {
  return request("/auth/forgot-password", {
    method: "POST",
    body: {
      email: String(email || "").trim().toLowerCase(),
      origin: origin || (typeof window !== "undefined" ? window.location.origin : "https://www.buildecogroup.com"),
    },
  });
}

export async function fetchSessionUser(token) {
  if (!token) return { ok: false, status: 401, data: null };
  return request("/auth/me", { token });
}
