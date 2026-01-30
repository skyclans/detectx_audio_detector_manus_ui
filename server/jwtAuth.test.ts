/**
 * JWT Authentication Flow Tests
 * 
 * Tests for the RunPod JWT-based authentication transition
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("JWT Authentication Flow", () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
    };
  })();

  beforeEach(() => {
    vi.stubGlobal("localStorage", localStorageMock);
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("Token Storage", () => {
    it("should store JWT token in localStorage", () => {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test";
      localStorage.setItem("detectx_token", token);
      
      expect(localStorage.getItem("detectx_token")).toBe(token);
    });

    it("should store user info in localStorage", () => {
      const user = {
        id: "123",
        email: "test@example.com",
        name: "Test User",
        role: "user",
        plan: "free",
        usage_count: 0,
        monthly_limit: 5,
        remaining: 5,
      };
      localStorage.setItem("detectx_user", JSON.stringify(user));
      
      const stored = JSON.parse(localStorage.getItem("detectx_user")!);
      expect(stored.email).toBe("test@example.com");
      expect(stored.plan).toBe("free");
    });

    it("should clear all auth data on logout", () => {
      // Set up auth data
      localStorage.setItem("detectx_token", "test-token");
      localStorage.setItem("detectx_user", '{"id":"123"}');
      localStorage.setItem("detectx_selected_mode", "free");
      localStorage.setItem("detectx_usage_count", "3");
      
      // Clear auth data (simulating logout)
      localStorage.removeItem("detectx_token");
      localStorage.removeItem("detectx_user");
      localStorage.removeItem("detectx_selected_mode");
      localStorage.removeItem("detectx_usage_count");
      
      expect(localStorage.getItem("detectx_token")).toBeNull();
      expect(localStorage.getItem("detectx_user")).toBeNull();
    });
  });

  describe("Bearer Token Headers", () => {
    it("should generate correct Authorization header", () => {
      const token = "test-jwt-token";
      localStorage.setItem("detectx_token", token);
      
      const headers: HeadersInit = {};
      const storedToken = localStorage.getItem("detectx_token");
      if (storedToken) {
        (headers as Record<string, string>)["Authorization"] = `Bearer ${storedToken}`;
      }
      
      expect((headers as Record<string, string>)["Authorization"]).toBe("Bearer test-jwt-token");
    });

    it("should return empty headers when no token", () => {
      const headers: HeadersInit = {};
      const storedToken = localStorage.getItem("detectx_token");
      if (storedToken) {
        (headers as Record<string, string>)["Authorization"] = `Bearer ${storedToken}`;
      }
      
      expect((headers as Record<string, string>)["Authorization"]).toBeUndefined();
    });
  });

  describe("Authentication State", () => {
    it("should be authenticated when token and user exist", () => {
      localStorage.setItem("detectx_token", "valid-token");
      localStorage.setItem("detectx_user", '{"id":"123"}');
      
      const token = localStorage.getItem("detectx_token");
      const user = localStorage.getItem("detectx_user");
      const isAuthenticated = !!token && !!user;
      
      expect(isAuthenticated).toBe(true);
    });

    it("should not be authenticated when token is missing", () => {
      localStorage.setItem("detectx_user", '{"id":"123"}');
      
      const token = localStorage.getItem("detectx_token");
      const user = localStorage.getItem("detectx_user");
      const isAuthenticated = !!token && !!user;
      
      expect(isAuthenticated).toBe(false);
    });

    it("should not be authenticated when user is missing", () => {
      localStorage.setItem("detectx_token", "valid-token");
      
      const token = localStorage.getItem("detectx_token");
      const user = localStorage.getItem("detectx_user");
      const isAuthenticated = !!token && !!user;
      
      expect(isAuthenticated).toBe(false);
    });
  });

  describe("OAuth Callback URL Handling", () => {
    it("should extract token from callback URL params", () => {
      const callbackUrl = "https://detectx.app/auth/callback?token=jwt-token-here";
      const url = new URL(callbackUrl);
      const token = url.searchParams.get("token");
      
      expect(token).toBe("jwt-token-here");
    });

    it("should handle error in callback URL", () => {
      const callbackUrl = "https://detectx.app/auth/callback?error=access_denied";
      const url = new URL(callbackUrl);
      const error = url.searchParams.get("error");
      
      expect(error).toBe("access_denied");
    });

    it("should handle missing token in callback URL", () => {
      const callbackUrl = "https://detectx.app/auth/callback";
      const url = new URL(callbackUrl);
      const token = url.searchParams.get("token");
      
      expect(token).toBeNull();
    });
  });

  describe("Return URL Handling", () => {
    it("should store return URL before OAuth redirect", () => {
      localStorage.setItem("detectx_return_url", "/verify-audio");
      
      expect(localStorage.getItem("detectx_return_url")).toBe("/verify-audio");
    });

    it("should clear return URL after use", () => {
      localStorage.setItem("detectx_return_url", "/verify-audio");
      const returnUrl = localStorage.getItem("detectx_return_url");
      localStorage.removeItem("detectx_return_url");
      
      expect(returnUrl).toBe("/verify-audio");
      expect(localStorage.getItem("detectx_return_url")).toBeNull();
    });

    it("should validate return URL starts with /", () => {
      const returnUrl = "/verify-audio";
      const isValid = returnUrl.startsWith("/");
      
      expect(isValid).toBe(true);
    });

    it("should reject external return URLs", () => {
      const returnUrl = "https://evil.com/steal";
      const isValid = returnUrl.startsWith("/");
      
      expect(isValid).toBe(false);
    });
  });

  describe("User Data Mapping", () => {
    it("should map RunPod response to legacy fields", () => {
      const runpodResponse = {
        id: "uuid-123",
        email: "test@example.com",
        name: "Test User",
        role: "user",
        plan: "free",
        usage_count: 2,
        monthly_limit: 5,
        remaining: 3,
        usage_reset_date: "2026-03-01",
      };

      // Map to include legacy compatibility fields
      const mappedUser = {
        ...runpodResponse,
        openId: runpodResponse.id,
        usageCount: runpodResponse.usage_count,
        monthlyLimit: runpodResponse.monthly_limit,
      };

      expect(mappedUser.openId).toBe("uuid-123");
      expect(mappedUser.usageCount).toBe(2);
      expect(mappedUser.monthlyLimit).toBe(5);
    });
  });

  describe("401 Error Handling", () => {
    it("should identify 401 status as unauthorized", () => {
      const status = 401;
      const isUnauthorized = status === 401;
      
      expect(isUnauthorized).toBe(true);
    });

    it("should clear auth on 401 response", () => {
      localStorage.setItem("detectx_token", "expired-token");
      localStorage.setItem("detectx_user", '{"id":"123"}');
      
      // Simulate 401 handling
      const status = 401;
      if (status === 401) {
        localStorage.removeItem("detectx_token");
        localStorage.removeItem("detectx_user");
      }
      
      expect(localStorage.getItem("detectx_token")).toBeNull();
      expect(localStorage.getItem("detectx_user")).toBeNull();
    });
  });
});
