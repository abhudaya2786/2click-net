import { api } from "./api";
import { LOGIN_PROFILES } from "./loginProfiles";

export function buildLocalDemoSession(profileId = "customer") {
  const profile = LOGIN_PROFILES.find((p) => p.id === profileId);
  if (!profile) throw new Error("Unknown login category");
  const name = profile.demo?.name || profile.label;
  const email = profile.demo?.email || `${profile.id}@demo.buildecogroup.com`;
  return {
    token: `demo.${profile.id}`,
    local: true,
    user: {
      id: `demo_${profile.id}`,
      name,
      email,
      role: profile.role || profile.id,
      user_type: profile.userType || profile.id,
      default_dashboard: profile.id === "architect" ? "freelancer" : profile.id,
      company: name,
      picture: null,
      auth: "demo",
      demo: true,
      onboarding_completed: true,
    },
  };
}

export async function runDemoLogin(profileId = "customer") {
  const profile = LOGIN_PROFILES.find((p) => p.id === profileId);
  if (!profile?.demo) {
    return buildLocalDemoSession(profileId);
  }
  try {
    const { data } = await api.post("/auth/login", {
      email: profile.demo.email,
      password: profile.demo.password,
    });
    if (data.requires_otp) {
      throw new Error("Demo account requires OTP — use email login on /login");
    }
    return data;
  } catch (err) {
    const status = err?.response?.status;
    if (!err?.response || status === 401 || status === 404) {
      return buildLocalDemoSession(profileId);
    }
    throw err;
  }
}
