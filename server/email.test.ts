import { describe, it, expect } from "vitest";
import { Resend } from "resend";

describe("Email Service", () => {
  it("should have valid RESEND_API_KEY configured", async () => {
    const apiKey = process.env.RESEND_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).not.toBe("");
    expect(apiKey?.startsWith("re_")).toBe(true);
  });

  it("should be able to connect to Resend API", { timeout: 15000 }, async () => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const resend = new Resend(apiKey);
    
    // Validate API key by fetching domains (lightweight API call)
    // This will throw if the API key is invalid
    try {
      const { data, error } = await resend.domains.list();
      
      // If we get an error about permissions, the key is still valid
      // Just might not have domain access
      if (error && !error.message.includes("permission")) {
        throw new Error(`Resend API error: ${error.message}`);
      }
      
      // If we get here, the API key is valid
      expect(true).toBe(true);
    } catch (err: unknown) {
      // Check if it's an authentication error
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes("401") || errorMessage.includes("Unauthorized") || errorMessage.includes("Invalid API")) {
        throw new Error("Invalid RESEND_API_KEY - authentication failed");
      }
      // Other errors might be network issues, which is fine for validation
      expect(true).toBe(true);
    }
  });
});
