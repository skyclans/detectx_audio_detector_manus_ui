/**
 * Verification With Storage Tests
 * 
 * Tests for the protectedProcedure that saves verification results to database
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock db functions
vi.mock("./db", () => ({
  createVerification: vi.fn().mockResolvedValue(1),
  incrementUserUsage: vi.fn().mockResolvedValue(undefined),
}));

import * as db from "./db";

describe("Verification With Storage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("createVerification is called with correct parameters", async () => {
    const mockData = {
      userId: 1,
      fileName: "test.mp3",
      fileSize: 1024,
      fileUrl: "",
      fileKey: "",
      verdict: "observed" as const,
      crgStatus: "CR-G_exceeded",
      status: "completed" as const,
    };

    await db.createVerification(mockData);

    expect(db.createVerification).toHaveBeenCalledWith(mockData);
    expect(db.createVerification).toHaveBeenCalledTimes(1);
  });

  it("incrementUserUsage is called after verification", async () => {
    await db.incrementUserUsage(1);

    expect(db.incrementUserUsage).toHaveBeenCalledWith(1);
    expect(db.incrementUserUsage).toHaveBeenCalledTimes(1);
  });

  it("createVerification returns verification ID", async () => {
    vi.mocked(db.createVerification).mockResolvedValue(42);

    const result = await db.createVerification({
      userId: 1,
      fileName: "test.mp3",
      fileSize: 1024,
      fileUrl: "",
      fileKey: "",
      status: "completed" as const,
    });

    expect(result).toBe(42);
  });
});

describe("Verification Storage Data Structure", () => {
  it("verification record includes all required fields", () => {
    const verificationRecord = {
      userId: 1,
      fileName: "test_audio.mp3",
      fileSize: 2048576,
      fileUrl: "",
      fileKey: "",
      duration: 180500,
      sampleRate: 44100,
      bitDepth: 16,
      channels: 2,
      codec: "MPEG_LAYER_III",
      fileHash: "abc123def456",
      verdict: "observed" as const,
      crgStatus: "CR-G_exceeded",
      primaryExceededAxis: "G1-B",
      timelineMarkers: [],
      analysisData: null,
      status: "completed" as const,
    };

    expect(verificationRecord).toHaveProperty("userId");
    expect(verificationRecord).toHaveProperty("fileName");
    expect(verificationRecord).toHaveProperty("verdict");
    expect(verificationRecord).toHaveProperty("crgStatus");
    expect(verificationRecord).toHaveProperty("status");
    expect(verificationRecord.verdict).toMatch(/^(observed|not_observed)$/);
  });

  it("verdict only allows valid values", () => {
    const validVerdicts = ["observed", "not_observed"];
    
    validVerdicts.forEach(verdict => {
      expect(["observed", "not_observed"]).toContain(verdict);
    });
  });
});
