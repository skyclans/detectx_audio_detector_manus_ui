import { describe, it, expect } from "vitest";

describe("Google OAuth Configuration", () => {
  it("should have GOOGLE_CLIENT_ID configured", () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    expect(clientId).toBeDefined();
    expect(clientId).not.toBe("");
    // Google Client ID should end with .apps.googleusercontent.com
    expect(clientId).toMatch(/\.apps\.googleusercontent\.com$/);
  });

  it("should have GOOGLE_CLIENT_SECRET configured", () => {
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    expect(clientSecret).toBeDefined();
    expect(clientSecret).not.toBe("");
    // Google Client Secret should be a non-empty string (typically starts with GOCSPX-)
    expect(clientSecret!.length).toBeGreaterThan(10);
  });
});
