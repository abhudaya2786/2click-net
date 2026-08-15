import { formatApiErrorDetail, formatAxiosError } from "./api";
import { formatLoginError, isDemoCredential } from "./loginError";
import { profilesFromUserTypes } from "./loginProfiles";
import { fallbackTreeForType } from "./signupCategories";
import { buildLocalDemoSession } from "./demoAuth";

describe("login categories and errors", () => {
  it("detects seeded demo credentials", () => {
    expect(isDemoCredential("customer@buildecogroup.com", "Demo@12345")).toBe(true);
    expect(isDemoCredential("customer@buildecogroup.com", "wrong")).toBe(false);
  });

  it("explains live 401 for demo accounts", () => {
    const msg = formatLoginError(
      { response: { status: 401, data: { detail: "Invalid email or password" } } },
      { email: "customer@buildecogroup.com", password: "Demo@12345" },
    );
    expect(msg).toMatch(/not on this server/i);
  });

  it("explains 401 for unknown accounts", () => {
    const msg = formatLoginError(
      { response: { status: 401, data: { detail: "Invalid email or password" } } },
      { email: "person@example.com", password: "secret" },
    );
    expect(msg).toMatch(/Invalid email or password/i);
    expect(msg).toMatch(/Sign up/i);
  });

  it("does not show the generic message for Hostinger HTML 404", () => {
    const msg = formatAxiosError({ response: { status: 404, data: "<!DOCTYPE html><html>404</html>" } });
    expect(msg).not.toBe("Something went wrong. Please try again.");
    expect(msg).toMatch(/not found on this website host/i);
  });

  it("maps empty 401 JSON to invalid password, not the generic fallback", () => {
    const msg = formatAxiosError({ response: { status: 401, data: {} } });
    expect(msg).toBe("Invalid email or password.");
    expect(formatApiErrorDetail(null)).toBe("");
  });

  it("merges API user-types into the login category grid", () => {
    const rows = profilesFromUserTypes([
      { code: "customer", label: "Customer" },
      { code: "freelancer", label: "Freelancer", role: "freelancer" },
      { code: "shop", label: "Shop" },
    ]);
    expect(rows.some((p) => p.id === "customer")).toBe(true);
    expect(rows.some((p) => p.id === "admin")).toBe(false);
    expect(rows.find((p) => p.id === "freelancer").label).toBe("Freelancer");
    expect(rows.find((p) => p.id === "shop").label).toBe("Shop");
  });

  it("builds a local demo session without calling the API", () => {
    const data = buildLocalDemoSession("vendor");
    expect(data.token).toBe("demo.vendor");
    expect(data.user.email).toBe("vendor@buildecogroup.com");
    expect(data.local).toBe(true);
  });

  it("provides offline category trees for signup", () => {
    const tree = fallbackTreeForType("marketplace");
    expect(tree[0].children.some((c) => c.name === "Cement")).toBe(true);
  });
});
