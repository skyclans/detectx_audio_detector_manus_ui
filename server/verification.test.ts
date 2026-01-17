/**
 * Verification Tests - Anonymous Stateless Flow
 * 
 * NON-NEGOTIABLE CONSTRAINTS:
 * 1) No login/authentication required for verification
 * 2) No file storage in DetectX - files are transient
 * 3) No upload history or session-based access control
 * 4) DetectX server is sole authority for processing and results
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock extractAudioMetadata
vi.mock("./audioMetadata", () => ({
  extractAudioMetadata: vi.fn().mockResolvedValue({
    filename: "test.wav",
    duration: 120.5,
    sampleRate: 44100,
    bitDepth: 16,
    channels: 2,
    codec: "pcm_s16le",
    fileSize: 10584000,
    sha256: "abc123def456",
  }),
}));

// Create mock context for anonymous user (no authentication)
function createAnonymousContext(): TrpcContext {
  return {
    user: null, // Anonymous - no user
    req: {
      protocol: "https",
      headers: {},
    } as any,
    res: {
      clearCookie: vi.fn(),
    } as any,
  };
}

// Create mock context for authenticated user (optional)
function createAuthenticatedContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-open-id",
      name: "Test User",
      email: "test@example.com",
      loginMethod: "detectx",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as any,
    res: {
      clearCookie: vi.fn(),
    } as any,
  };
}

describe("verification.upload (Anonymous Stateless)", () => {
  it("allows anonymous upload without authentication", async () => {
    const ctx = createAnonymousContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.verification.upload({
      fileName: "test.wav",
      fileData: Buffer.from("fake audio data").toString("base64"),
      contentType: "audio/wav",
    });

    // Should return metadata only (no storage URL)
    expect(result).toHaveProperty("metadata");
    expect(result.metadata).toHaveProperty("filename");
    expect(result.metadata).toHaveProperty("duration");
    expect(result.metadata).toHaveProperty("sampleRate");
    expect(result.metadata).toHaveProperty("sha256");
  });

  it("does NOT store files - returns metadata only", async () => {
    const ctx = createAnonymousContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.verification.upload({
      fileName: "test.wav",
      fileData: Buffer.from("fake audio data").toString("base64"),
      contentType: "audio/wav",
    });

    // Should NOT have storage-related properties
    expect(result).not.toHaveProperty("url");
    expect(result).not.toHaveProperty("fileKey");
    expect(result).not.toHaveProperty("storageUrl");
  });

  it("extracts forensic metadata from uploaded file", async () => {
    const ctx = createAnonymousContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.verification.upload({
      fileName: "forensic_sample.wav",
      fileData: Buffer.from("fake audio data").toString("base64"),
      contentType: "audio/wav",
    });

    expect(result.metadata.filename).toBe("test.wav");
    expect(result.metadata.duration).toBe(120.5);
    expect(result.metadata.sampleRate).toBe(44100);
    expect(result.metadata.bitDepth).toBe(16);
    expect(result.metadata.channels).toBe(2);
    expect(result.metadata.codec).toBe("pcm_s16le");
    expect(result.metadata.sha256).toBe("abc123def456");
  });
});

describe("verification.process (Anonymous Stateless)", () => {
  it("allows anonymous processing without authentication", async () => {
    const ctx = createAnonymousContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.verification.process({
      fileName: "test.wav",
      fileData: Buffer.from("fake audio data").toString("base64"),
    });

    // Current implementation returns verdict as string, not object
    expect(result).toHaveProperty("verdict");
    expect(result).toHaveProperty("crgStatus");
  }, 30000);

  it("returns valid verdict value", async () => {
    const ctx = createAnonymousContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.verification.process({
      fileName: "test.wav",
      fileData: Buffer.from("fake audio data").toString("base64"),
    });

    // Current implementation returns verdict as "observed" or "not_observed"
    const allowedVerdicts = ["observed", "not_observed"];
    expect(allowedVerdicts).toContain(result.verdict);
  }, 30000);

  it("does NOT persist verification records", async () => {
    const ctx = createAnonymousContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.verification.process({
      fileName: "test.wav",
      fileData: Buffer.from("fake audio data").toString("base64"),
    });

    // Should NOT have database-related properties
    expect(result).not.toHaveProperty("id");
    expect(result).not.toHaveProperty("userId");
    expect(result).not.toHaveProperty("createdAt");
  }, 30000);
});

describe("verdict texts compliance", () => {
  it("only uses allowed verdict values", async () => {
    const ctx = createAnonymousContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.verification.process({
      fileName: "test.wav",
      fileData: Buffer.from("fake audio data").toString("base64"),
    });

    // Current implementation uses "observed" / "not_observed"
    const allowedVerdicts = ["observed", "not_observed"];
    expect(allowedVerdicts).toContain(result.verdict);
  }, 30000);

  it("returns crgStatus field", async () => {
    const ctx = createAnonymousContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.verification.process({
      fileName: "test.wav",
      fileData: Buffer.from("fake audio data").toString("base64"),
    });

    expect(result).toHaveProperty("crgStatus");
  }, 30000);
});

describe("auth.logout", () => {
  it("clears session cookie on logout", async () => {
    const ctx = createAuthenticatedContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(ctx.res.clearCookie).toHaveBeenCalled();
  });
});
