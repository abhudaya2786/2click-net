import {
  buildLocalDemoSession,
  isKnownDemoLogin,
  loginErrorText,
  loginWithPassword,
} from "./loginClient";

describe("fresh loginClient", () => {
  it("maps HTML and 401 to readable errors", () => {
    expect(loginErrorText({ status: 401, data: { detail: "Invalid email or password" } })).toMatch(/Invalid email/i);
    expect(loginErrorText({ status: 404, data: { html: true, detail: "web page" } })).toMatch(/web page|host/i);
    expect(loginErrorText({ status: 422, data: { detail: [{ msg: "value is not a valid email address" }] } })).toMatch(/email/i);
  });

  it("detects demo credentials and builds a local session", () => {
    expect(isKnownDemoLogin("customer@buildecogroup.com", "Demo@12345")).toBe(true);
    const demo = buildLocalDemoSession("vendor");
    expect(demo.token).toBe("demo.vendor");
    expect(demo.user.email).toBe("vendor@buildecogroup.com");
  });

  it("rejects empty login without calling the network", async () => {
    const result = await loginWithPassword("", "");
    expect(result.ok).toBe(false);
    expect(result.status).toBe(422);
  });
});
