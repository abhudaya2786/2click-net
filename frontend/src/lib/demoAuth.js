import { api } from "@/lib/api";
import { LOGIN_PROFILES } from "@/lib/loginProfiles";

export async function runDemoLogin(profileId = "customer") {
  const profile = LOGIN_PROFILES.find((p) => p.id === profileId);
  if (!profile?.demo) {
    throw new Error("No demo account for this role");
  }
  const { data } = await api.post("/auth/login", {
    email: profile.demo.email,
    password: profile.demo.password,
  });
  if (data.requires_otp) {
    throw new Error("Demo account requires OTP — use email login on /login");
  }
  return data;
}
