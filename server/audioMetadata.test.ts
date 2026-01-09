/**
 * Audio Metadata Extraction Tests
 * 
 * Tests for the forensic intake record functionality.
 * Verifies that metadata is extracted correctly using ffprobe
 * and that SHA-256 hash is calculated properly.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

// Mock child_process spawn
vi.mock("child_process", () => ({
  spawn: vi.fn(),
}));

import { spawn } from "child_process";
import { extractAudioMetadata, type AudioMetadata } from "./audioMetadata";

describe("Audio Metadata Extraction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("extractAudioMetadata", () => {
    it("should extract metadata from a valid audio file", async () => {
      // Mock ffprobe output for a typical MP3 file
      const mockFfprobeOutput = JSON.stringify({
        streams: [
          {
            codec_type: "audio",
            codec_name: "mp3",
            sample_rate: "44100",
            channels: 2,
            bits_per_sample: 0,
          },
        ],
        format: {
          duration: "180.5",
          size: "2880000",
        },
      });

      // Create mock spawn process
      const mockProcess = {
        stdout: {
          on: vi.fn((event, callback) => {
            if (event === "data") {
              callback(Buffer.from(mockFfprobeOutput));
            }
          }),
        },
        stderr: {
          on: vi.fn(),
        },
        on: vi.fn((event, callback) => {
          if (event === "close") {
            callback(0);
          }
        }),
      };

      (spawn as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockProcess);

      // Create a test buffer
      const testBuffer = Buffer.from("test audio content");
      const result = await extractAudioMetadata(testBuffer, "test.mp3");

      expect(result).toMatchObject({
        filename: "test.mp3",
        duration: 180.5,
        sampleRate: 44100,
        channels: 2,
        codec: "MP3",
        fileSize: testBuffer.length,
      });

      // SHA-256 should be a 64-character hex string
      expect(result.sha256).toMatch(/^[a-f0-9]{64}$/);
    });

    it("should return null for missing metadata fields", async () => {
      // Mock ffprobe output with missing fields
      const mockFfprobeOutput = JSON.stringify({
        streams: [
          {
            codec_type: "audio",
            codec_name: "unknown",
          },
        ],
        format: {},
      });

      const mockProcess = {
        stdout: {
          on: vi.fn((event, callback) => {
            if (event === "data") {
              callback(Buffer.from(mockFfprobeOutput));
            }
          }),
        },
        stderr: {
          on: vi.fn(),
        },
        on: vi.fn((event, callback) => {
          if (event === "close") {
            callback(0);
          }
        }),
      };

      (spawn as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockProcess);

      const testBuffer = Buffer.from("test");
      const result = await extractAudioMetadata(testBuffer, "test.mp3");

      // Missing values should be null (displayed as "—" in UI)
      expect(result.duration).toBeNull();
      expect(result.sampleRate).toBeNull();
      expect(result.bitDepth).toBeNull();
      expect(result.channels).toBeNull();
    });

    it("should extract bit depth from bits_per_sample", async () => {
      const mockFfprobeOutput = JSON.stringify({
        streams: [
          {
            codec_type: "audio",
            codec_name: "flac",
            sample_rate: "96000",
            channels: 2,
            bits_per_sample: 24,
          },
        ],
        format: {
          duration: "300.0",
        },
      });

      const mockProcess = {
        stdout: {
          on: vi.fn((event, callback) => {
            if (event === "data") {
              callback(Buffer.from(mockFfprobeOutput));
            }
          }),
        },
        stderr: {
          on: vi.fn(),
        },
        on: vi.fn((event, callback) => {
          if (event === "close") {
            callback(0);
          }
        }),
      };

      (spawn as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockProcess);

      const testBuffer = Buffer.from("test flac content");
      const result = await extractAudioMetadata(testBuffer, "test.flac");

      expect(result.bitDepth).toBe(24);
      expect(result.sampleRate).toBe(96000);
      expect(result.codec).toBe("FLAC");
    });

    it("should extract bit depth from bits_per_raw_sample as fallback", async () => {
      const mockFfprobeOutput = JSON.stringify({
        streams: [
          {
            codec_type: "audio",
            codec_name: "pcm_s16le",
            sample_rate: "48000",
            channels: 1,
            bits_per_sample: 0,
            bits_per_raw_sample: "16",
          },
        ],
        format: {
          duration: "60.0",
        },
      });

      const mockProcess = {
        stdout: {
          on: vi.fn((event, callback) => {
            if (event === "data") {
              callback(Buffer.from(mockFfprobeOutput));
            }
          }),
        },
        stderr: {
          on: vi.fn(),
        },
        on: vi.fn((event, callback) => {
          if (event === "close") {
            callback(0);
          }
        }),
      };

      (spawn as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockProcess);

      const testBuffer = Buffer.from("test wav content");
      const result = await extractAudioMetadata(testBuffer, "test.wav");

      expect(result.bitDepth).toBe(16);
    });
  });

  describe("SHA-256 calculation", () => {
    it("should calculate consistent SHA-256 hash for same content", async () => {
      const mockFfprobeOutput = JSON.stringify({
        streams: [{ codec_type: "audio", codec_name: "mp3" }],
        format: {},
      });

      const mockProcess = {
        stdout: {
          on: vi.fn((event, callback) => {
            if (event === "data") {
              callback(Buffer.from(mockFfprobeOutput));
            }
          }),
        },
        stderr: {
          on: vi.fn(),
        },
        on: vi.fn((event, callback) => {
          if (event === "close") {
            callback(0);
          }
        }),
      };

      (spawn as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockProcess);

      const testContent = "identical content for hash test";
      const buffer1 = Buffer.from(testContent);
      const buffer2 = Buffer.from(testContent);

      const result1 = await extractAudioMetadata(buffer1, "file1.mp3");
      const result2 = await extractAudioMetadata(buffer2, "file2.mp3");

      // Same content should produce same hash
      expect(result1.sha256).toBe(result2.sha256);
    });

    it("should produce different SHA-256 for different content", async () => {
      const mockFfprobeOutput = JSON.stringify({
        streams: [{ codec_type: "audio", codec_name: "mp3" }],
        format: {},
      });

      const mockProcess = {
        stdout: {
          on: vi.fn((event, callback) => {
            if (event === "data") {
              callback(Buffer.from(mockFfprobeOutput));
            }
          }),
        },
        stderr: {
          on: vi.fn(),
        },
        on: vi.fn((event, callback) => {
          if (event === "close") {
            callback(0);
          }
        }),
      };

      (spawn as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockProcess);

      const buffer1 = Buffer.from("content A");
      const buffer2 = Buffer.from("content B");

      const result1 = await extractAudioMetadata(buffer1, "file1.mp3");
      const result2 = await extractAudioMetadata(buffer2, "file2.mp3");

      // Different content should produce different hash
      expect(result1.sha256).not.toBe(result2.sha256);
    });
  });
});
