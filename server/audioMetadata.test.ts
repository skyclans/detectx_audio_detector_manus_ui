/**
 * Audio Metadata Extraction Tests
 * 
 * Tests basic metadata extraction without ffprobe dependency.
 * Detailed audio analysis is performed by RunPod server.
 */

import { describe, it, expect } from "vitest";
import { extractAudioMetadata } from "./audioMetadata";

describe("Audio Metadata Extraction", () => {
  describe("extractAudioMetadata", () => {
    it("should extract basic metadata from file buffer", async () => {
      // Create a simple test buffer
      const testData = Buffer.from("test audio data for metadata extraction");
      const filename = "test-audio.mp3";

      const metadata = await extractAudioMetadata(testData, filename);

      expect(metadata.filename).toBe(filename);
      expect(metadata.fileSize).toBe(testData.length);
      expect(metadata.sha256).toBeDefined();
      expect(metadata.sha256.length).toBe(64); // SHA-256 is 64 hex characters
      expect(metadata.codec).toBe("MP3");
      
      // These will be null as they're filled by RunPod server
      expect(metadata.duration).toBeNull();
      expect(metadata.sampleRate).toBeNull();
      expect(metadata.bitDepth).toBeNull();
      expect(metadata.channels).toBeNull();
    });

    it("should detect codec from WAV extension", async () => {
      const testBuffer = Buffer.from("test wav content");
      const metadata = await extractAudioMetadata(testBuffer, "audio.wav");
      expect(metadata.codec).toBe("WAV");
    });

    it("should detect codec from FLAC extension", async () => {
      const testBuffer = Buffer.from("test flac content");
      const metadata = await extractAudioMetadata(testBuffer, "audio.flac");
      expect(metadata.codec).toBe("FLAC");
    });

    it("should detect codec from OGG extension", async () => {
      const testBuffer = Buffer.from("test ogg content");
      const metadata = await extractAudioMetadata(testBuffer, "audio.ogg");
      expect(metadata.codec).toBe("OGG");
    });

    it("should detect codec from M4A extension", async () => {
      const testBuffer = Buffer.from("test m4a content");
      const metadata = await extractAudioMetadata(testBuffer, "audio.m4a");
      expect(metadata.codec).toBe("AAC");
    });

    it("should handle unknown file extensions", async () => {
      const testBuffer = Buffer.from("test unknown content");
      const metadata = await extractAudioMetadata(testBuffer, "audio.unknown");
      expect(metadata.codec).toBeNull();
    });

    it("should handle files without extension", async () => {
      const testBuffer = Buffer.from("test no extension");
      const metadata = await extractAudioMetadata(testBuffer, "audiofile");
      expect(metadata.codec).toBeNull();
      expect(metadata.filename).toBe("audiofile");
    });
  });

  describe("SHA-256 calculation", () => {
    it("should calculate consistent SHA-256 hash for same content", async () => {
      const testContent = "identical content for hash test";
      const buffer1 = Buffer.from(testContent);
      const buffer2 = Buffer.from(testContent);

      const result1 = await extractAudioMetadata(buffer1, "file1.mp3");
      const result2 = await extractAudioMetadata(buffer2, "file2.mp3");

      // Same content should produce same hash
      expect(result1.sha256).toBe(result2.sha256);
    });

    it("should produce different SHA-256 for different content", async () => {
      const buffer1 = Buffer.from("content A");
      const buffer2 = Buffer.from("content B");

      const result1 = await extractAudioMetadata(buffer1, "file1.mp3");
      const result2 = await extractAudioMetadata(buffer2, "file2.mp3");

      // Different content should produce different hash
      expect(result1.sha256).not.toBe(result2.sha256);
    });

    it("should produce valid 64-character hex hash", async () => {
      const testBuffer = Buffer.from("hash validation test");
      const metadata = await extractAudioMetadata(testBuffer, "test.mp3");
      
      expect(metadata.sha256).toMatch(/^[a-f0-9]{64}$/);
    });
  });
});
