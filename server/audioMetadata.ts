/**
 * Audio Metadata Extraction - Forensic Intake Record
 * 
 * This module extracts basic properties from the original uploaded audio file.
 * Detailed audio analysis (duration, sample rate, etc.) is performed by the
 * DetectX RunPod server which has full ffprobe/ffmpeg support.
 * 
 * This layer only provides:
 * - Filename
 * - File size
 * - SHA-256 hash for identity verification
 * - Basic format detection from file extension
 */

import * as crypto from "crypto";

export interface AudioMetadata {
  filename: string;
  duration: number | null; // Will be filled by RunPod server
  sampleRate: number | null; // Will be filled by RunPod server
  bitDepth: number | null; // Will be filled by RunPod server
  channels: number | null; // Will be filled by RunPod server
  codec: string | null; // Detected from file extension
  fileSize: number; // bytes
  sha256: string;
}

/**
 * Supported audio format extensions
 */
const AUDIO_EXTENSIONS: Record<string, string> = {
  ".wav": "WAV",
  ".mp3": "MP3",
  ".flac": "FLAC",
  ".ogg": "OGG",
  ".m4a": "AAC",
  ".aac": "AAC",
  ".wma": "WMA",
  ".aiff": "AIFF",
  ".aif": "AIFF",
  ".opus": "OPUS",
  ".webm": "WEBM",
};

/**
 * Extract basic audio metadata without ffprobe
 * Detailed metadata (duration, sample rate, etc.) will be extracted by RunPod server
 */
export async function extractAudioMetadata(
  fileBuffer: Buffer,
  originalFilename: string
): Promise<AudioMetadata> {
  // Calculate SHA-256 from original file (before any processing)
  const sha256 = calculateSHA256(fileBuffer);

  // Detect codec from file extension
  const ext = getFileExtension(originalFilename).toLowerCase();
  const codec = AUDIO_EXTENSIONS[ext] || null;

  return {
    filename: originalFilename,
    duration: null, // Will be filled by RunPod server
    sampleRate: null, // Will be filled by RunPod server
    bitDepth: null, // Will be filled by RunPod server
    channels: null, // Will be filled by RunPod server
    codec,
    fileSize: fileBuffer.length,
    sha256,
  };
}

/**
 * Calculate SHA-256 hash from the original uploaded file.
 * Used solely for file identity verification and audit reproducibility.
 */
function calculateSHA256(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return "";
  return filename.substring(lastDot);
}
