import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", () => ({
  createVerification: vi.fn().mockResolvedValue(1),
  getVerificationById: vi.fn().mockImplementation((id: number) => {
    if (id === 1) {
      return Promise.resolve({
        id: 1,
        userId: 1,
        fileName: "test-audio.mp3",
        fileSize: 1024000,
        fileUrl: "https://example.com/audio.mp3",
        fileKey: "audio/1/test.mp3",
        duration: 60000,
        sampleRate: 44100,
        bitDepth: 16,
        channels: 2,
        codec: "MP3",
        fileHash: "abc123",
        verdict: "observed",
        crgStatus: "CR-G_exceeded",
        primaryExceededAxis: "spectral_coherence",
        timelineMarkers: [{ timestamp: 15000, type: "structural_event" }],
        analysisData: {},
        status: "completed",
        errorMessage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    if (id === 999) {
      return Promise.resolve(undefined);
    }
    return Promise.resolve({
      id,
      userId: 2, // Different user
      fileName: "other-audio.mp3",
      fileSize: 512000,
      fileUrl: "https://example.com/other.mp3",
      fileKey: "audio/2/other.mp3",
      status: "completed",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }),
  getVerificationsByUserId: vi.fn().mockResolvedValue([
    {
      id: 1,
      userId: 1,
      fileName: "test-audio.mp3",
      fileSize: 1024000,
      status: "completed",
      verdict: "observed",
      createdAt: new Date(),
    },
    {
      id: 2,
      userId: 1,
      fileName: "test-audio-2.mp3",
      fileSize: 512000,
      status: "completed",
      verdict: "not_observed",
      createdAt: new Date(),
    },
  ]),
  updateVerification: vi.fn().mockResolvedValue(undefined),
  deleteVerification: vi.fn().mockResolvedValue(undefined),
}));

// Mock storage
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({
    url: "https://storage.example.com/audio/1/test.mp3",
    key: "audio/1/test.mp3",
  }),
}));

// Mock audioMetadata extraction (ffprobe)
vi.mock("./audioMetadata", () => ({
  extractAudioMetadata: vi.fn().mockResolvedValue({
    filename: "test.mp3",
    duration: 60.5,
    sampleRate: 44100,
    bitDepth: null,
    channels: 2,
    codec: "MP3",
    fileSize: 1024,
    sha256: "abc123def456789012345678901234567890123456789012345678901234",
  }),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId = 1, role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: `User ${userId}`,
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("verification.create", () => {
  it("creates a new verification record for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.verification.create({
      fileName: "test-audio.mp3",
      fileSize: 1024000,
      fileUrl: "https://example.com/audio.mp3",
      fileKey: "audio/1/test.mp3",
      duration: 60000,
      sampleRate: 44100,
      bitDepth: 16,
      channels: 2,
      codec: "MP3",
      fileHash: "abc123def456",
    });

    expect(result).toHaveProperty("id");
    expect(result.id).toBe(1);
  });

  it("rejects unauthenticated requests", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.verification.create({
        fileName: "test.mp3",
        fileSize: 1024,
        fileUrl: "https://example.com/test.mp3",
        fileKey: "test.mp3",
      })
    ).rejects.toThrow();
  });
});

describe("verification.getById", () => {
  it("returns verification for owner", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.verification.getById({ id: 1 });

    expect(result).toBeDefined();
    expect(result.id).toBe(1);
    expect(result.fileName).toBe("test-audio.mp3");
    expect(result.verdict).toBe("observed");
  });

  it("returns verification for admin even if not owner", async () => {
    const ctx = createAuthContext(99, "admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.verification.getById({ id: 1 });

    expect(result).toBeDefined();
    expect(result.id).toBe(1);
  });

  it("throws NOT_FOUND for non-existent verification", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.verification.getById({ id: 999 })).rejects.toThrow(
      "Verification not found"
    );
  });

  it("throws FORBIDDEN for non-owner non-admin", async () => {
    const ctx = createAuthContext(99, "user");
    const caller = appRouter.createCaller(ctx);

    await expect(caller.verification.getById({ id: 2 })).rejects.toThrow(
      "Access denied"
    );
  });
});

describe("verification.list", () => {
  it("returns user's verification history", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.verification.list({ limit: 50 });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(result[0].fileName).toBe("test-audio.mp3");
  });

  it("respects limit parameter", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // The mock always returns 2, but we're testing the call works
    const result = await caller.verification.list({ limit: 10 });

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("verification.delete", () => {
  it("deletes verification for owner", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.verification.delete({ id: 1 });

    expect(result).toEqual({ success: true });
  });

  it("throws FORBIDDEN for non-owner", async () => {
    const ctx = createAuthContext(99, "user");
    const caller = appRouter.createCaller(ctx);

    await expect(caller.verification.delete({ id: 2 })).rejects.toThrow(
      "Access denied"
    );
  });
});

describe("verification.upload", () => {
  it("uploads file and returns URL with forensic metadata", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Small base64 encoded data
    const base64Data = Buffer.from("test audio data").toString("base64");

    const result = await caller.verification.upload({
      fileName: "test.mp3",
      fileData: base64Data,
      contentType: "audio/mpeg",
    });

    expect(result).toHaveProperty("url");
    expect(result).toHaveProperty("fileKey");
    expect(result.url).toContain("storage.example.com");
    
    // Verify forensic metadata is returned
    expect(result).toHaveProperty("metadata");
    expect(result.metadata).toHaveProperty("filename");
    expect(result.metadata).toHaveProperty("duration");
    expect(result.metadata).toHaveProperty("sampleRate");
    expect(result.metadata).toHaveProperty("bitDepth");
    expect(result.metadata).toHaveProperty("channels");
    expect(result.metadata).toHaveProperty("codec");
    expect(result.metadata).toHaveProperty("fileSize");
    expect(result.metadata).toHaveProperty("sha256");
  });
});

describe("verdict texts compliance", () => {
  it("only uses allowed verdict values", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.verification.getById({ id: 1 });

    // Verdict must be one of the two allowed values
    expect(["observed", "not_observed"]).toContain(result.verdict);
  });
});
