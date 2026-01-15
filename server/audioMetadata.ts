/**
 * Audio Metadata Extraction - Forensic Intake Record
 * 
 * This module extracts immutable properties from the original uploaded audio file
 * using container-level inspection (ffprobe). No inference, estimation, correction,
 * or normalization is allowed at this layer.
 * 
 * All values reflect the state of the file BEFORE analysis and BEFORE normalization.
 */

import { spawn } from "child_process";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export interface AudioMetadata {
  filename: string;
  duration: number | null; // seconds
  sampleRate: number | null; // Hz
  bitDepth: number | null; // bits per sample (encoding metadata only)
  channels: number | null;
  codec: string | null;
  fileSize: number; // bytes
  sha256: string;
}

/**
 * Extract audio metadata using ffprobe (container-level inspection)
 * This is a forensic best practice - no decoding or normalization occurs.
 */
export async function extractAudioMetadata(
  fileBuffer: Buffer,
  originalFilename: string
): Promise<AudioMetadata> {
  // Create temp file for ffprobe inspection
  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, `detectx-${Date.now()}-${originalFilename}`);

  try {
    // Write buffer to temp file
    fs.writeFileSync(tempFilePath, fileBuffer);

    // Calculate SHA-256 from original file (before any processing)
    const sha256 = calculateSHA256(fileBuffer);

    // Extract metadata using ffprobe
    const ffprobeData = await runFfprobe(tempFilePath);

    // Parse ffprobe output
    const metadata = parseFfprobeOutput(ffprobeData, originalFilename, fileBuffer.length, sha256);

    return metadata;
  } finally {
    // Clean up temp file
    try {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Calculate SHA-256 hash from the original uploaded file.
 * Used solely for file identity verification and audit reproducibility.
 */
function calculateSHA256(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Run ffprobe and return parsed JSON output
 */
function runFfprobe(filePath: string): Promise<FfprobeOutput> {
  return new Promise((resolve, reject) => {
    const args = [
      "-v", "error",
      "-print_format", "json",
      "-show_streams",
      "-show_format",
      filePath,
    ];

    const proc = spawn("ffprobe", args);
    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`ffprobe exited with code ${code}: ${stderr}`));
        return;
      }

      try {
        const data = JSON.parse(stdout);
        resolve(data);
      } catch (e) {
        reject(new Error(`Failed to parse ffprobe output: ${e}`));
      }
    });

    proc.on("error", (err) => {
      reject(new Error(`Failed to spawn ffprobe: ${err.message}`));
    });
  });
}

interface FfprobeStream {
  codec_type?: string;
  codec_name?: string;
  sample_rate?: string;
  bits_per_sample?: number;
  bits_per_raw_sample?: string;
  channels?: number;
}

interface FfprobeFormat {
  duration?: string;
  size?: string;
}

interface FfprobeOutput {
  streams?: FfprobeStream[];
  format?: FfprobeFormat;
}

/**
 * Parse ffprobe output into AudioMetadata structure.
 * Missing values are returned as null - NO estimation or inference allowed.
 */
function parseFfprobeOutput(
  data: FfprobeOutput,
  filename: string,
  fileSize: number,
  sha256: string
): AudioMetadata {
  // Find audio stream
  const audioStream = data.streams?.find((s) => s.codec_type === "audio");

  // Extract values directly from container metadata
  // If unavailable, return null (display as "—" in UI)
  let duration: number | null = null;
  if (data.format?.duration) {
    const parsed = parseFloat(data.format.duration);
    if (!isNaN(parsed)) {
      duration = parsed;
    }
  }

  let sampleRate: number | null = null;
  if (audioStream?.sample_rate) {
    const parsed = parseInt(audioStream.sample_rate, 10);
    if (!isNaN(parsed)) {
      sampleRate = parsed;
    }
  }

  // Bit depth: from encoding metadata only
  // For lossless formats: reflects original PCM bit depth
  // For lossy formats: reflects container declaration only
  let bitDepth: number | null = null;
  if (audioStream?.bits_per_sample && audioStream.bits_per_sample > 0) {
    bitDepth = audioStream.bits_per_sample;
  } else if (audioStream?.bits_per_raw_sample) {
    const parsed = parseInt(audioStream.bits_per_raw_sample, 10);
    if (!isNaN(parsed) && parsed > 0) {
      bitDepth = parsed;
    }
  }

  let channels: number | null = null;
  if (audioStream?.channels && audioStream.channels > 0) {
    channels = audioStream.channels;
  }

  let codec: string | null = null;
  if (audioStream?.codec_name) {
    codec = audioStream.codec_name.toUpperCase();
  }

  return {
    filename,
    duration,
    sampleRate,
    bitDepth,
    channels,
    codec,
    fileSize,
    sha256,
  };
}
