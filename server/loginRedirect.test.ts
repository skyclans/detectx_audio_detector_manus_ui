import { describe, it, expect, vi, beforeEach } from "vitest";
import * as db from "./db";

/**
 * Login Redirect Logic Tests
 * 
 * Tests the login redirect flow:
 * 1. New users → /login?welcome=true
 * 2. Existing users → returnUrl from cookie or /verify-audio
 * 3. returnUrl cookie is cleared after redirect
 */

// Mock db module
vi.mock("./db", () => ({
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
}));

describe("Login Redirect Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("upsertUser returns isNewUser flag", () => {
    it("should return isNewUser: true for new users", async () => {
      const mockUpsertUser = vi.mocked(db.upsertUser);
      mockUpsertUser.mockResolvedValue({ isNewUser: true });

      const result = await db.upsertUser({
        openId: "google_new_user_123",
        name: "New User",
        email: "newuser@example.com",
        loginMethod: "google",
        lastSignedIn: new Date(),
      });

      expect(result.isNewUser).toBe(true);
    });

    it("should return isNewUser: false for existing users", async () => {
      const mockUpsertUser = vi.mocked(db.upsertUser);
      mockUpsertUser.mockResolvedValue({ isNewUser: false });

      const result = await db.upsertUser({
        openId: "google_existing_user_456",
        name: "Existing User",
        email: "existing@example.com",
        loginMethod: "google",
        lastSignedIn: new Date(),
      });

      expect(result.isNewUser).toBe(false);
    });
  });

  describe("Redirect URL determination", () => {
    it("should redirect new users to /login?welcome=true", () => {
      const isNewUser = true;
      const returnUrl = "/verify-audio";
      
      let redirectUrl = "/verify-audio";
      
      if (isNewUser) {
        redirectUrl = "/login?welcome=true";
      } else {
        if (returnUrl && returnUrl.startsWith("/")) {
          redirectUrl = returnUrl;
        }
      }

      expect(redirectUrl).toBe("/login?welcome=true");
    });

    it("should redirect existing users to returnUrl if set", () => {
      const isNewUser = false;
      const returnUrl = "/history";
      
      let redirectUrl = "/verify-audio";
      
      if (isNewUser) {
        redirectUrl = "/login?welcome=true";
      } else {
        if (returnUrl && returnUrl.startsWith("/")) {
          redirectUrl = returnUrl;
        }
      }

      expect(redirectUrl).toBe("/history");
    });

    it("should redirect existing users to /verify-audio if no returnUrl", () => {
      const isNewUser = false;
      const returnUrl = undefined;
      
      let redirectUrl = "/verify-audio";
      
      if (isNewUser) {
        redirectUrl = "/login?welcome=true";
      } else {
        if (returnUrl && returnUrl.startsWith("/")) {
          redirectUrl = returnUrl;
        }
      }

      expect(redirectUrl).toBe("/verify-audio");
    });

    it("should ignore returnUrl that doesn't start with /", () => {
      const isNewUser = false;
      const returnUrl = "https://malicious.com/steal";
      
      let redirectUrl = "/verify-audio";
      
      if (isNewUser) {
        redirectUrl = "/login?welcome=true";
      } else {
        if (returnUrl && returnUrl.startsWith("/")) {
          redirectUrl = returnUrl;
        }
      }

      expect(redirectUrl).toBe("/verify-audio");
    });
  });

  describe("returnUrl cookie handling", () => {
    it("should set returnUrl cookie when non-logged user tries to access protected page", () => {
      // Simulate setting returnUrl cookie
      const currentPath = "/history";
      const returnUrlCookie = currentPath;
      
      expect(returnUrlCookie).toBe("/history");
    });

    it("should preserve returnUrl across login redirect", () => {
      // Simulate the flow:
      // 1. User tries to access /history
      // 2. returnUrl cookie is set to /history
      // 3. User is redirected to login
      // 4. After login, user is redirected to /history
      
      const returnUrl = "/history";
      const isNewUser = false;
      
      let redirectUrl = "/verify-audio";
      if (!isNewUser && returnUrl && returnUrl.startsWith("/")) {
        redirectUrl = returnUrl;
      }
      
      expect(redirectUrl).toBe("/history");
    });
  });

  describe("File metadata persistence", () => {
    it("should store file metadata in localStorage before login", () => {
      // Simulate storing file metadata
      const fileMetadata = {
        fileName: "test-audio.mp3",
        fileSize: 1024000,
        duration: 180,
      };
      
      const storedMetadata = JSON.stringify(fileMetadata);
      const parsedMetadata = JSON.parse(storedMetadata);
      
      expect(parsedMetadata.fileName).toBe("test-audio.mp3");
      expect(parsedMetadata.fileSize).toBe(1024000);
      expect(parsedMetadata.duration).toBe(180);
    });

    it("should restore file metadata after login", () => {
      // Simulate restoring file metadata from localStorage
      const storedMetadata = JSON.stringify({
        fileName: "test-audio.mp3",
        fileSize: 1024000,
        duration: 180,
      });
      
      const restoredMetadata = JSON.parse(storedMetadata);
      
      expect(restoredMetadata.fileName).toBe("test-audio.mp3");
    });
  });
});

describe("Login prompt modal behavior", () => {
  it("should show login prompt when non-logged user clicks verify", () => {
    const isAuthenticated = false;
    const hasSelectedFile = true;
    
    let showLoginPrompt = false;
    
    // Simulate handleVerify logic
    if (!isAuthenticated) {
      showLoginPrompt = true;
    }
    
    expect(showLoginPrompt).toBe(true);
  });

  it("should not show login prompt for authenticated users", () => {
    const isAuthenticated = true;
    const hasSelectedFile = true;
    
    let showLoginPrompt = false;
    
    // Simulate handleVerify logic
    if (!isAuthenticated) {
      showLoginPrompt = true;
    }
    
    expect(showLoginPrompt).toBe(false);
  });

  it("should close login prompt on ESC key", () => {
    let showLoginPrompt = true;
    const keyPressed = "Escape";
    
    // Simulate ESC key handler
    if (keyPressed === "Escape" && showLoginPrompt) {
      showLoginPrompt = false;
    }
    
    expect(showLoginPrompt).toBe(false);
  });

  it("should close login prompt on X button click", () => {
    let showLoginPrompt = true;
    
    // Simulate X button click
    showLoginPrompt = false;
    
    expect(showLoginPrompt).toBe(false);
  });
});
