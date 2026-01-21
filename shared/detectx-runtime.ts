/**
 * DetectX Audio Runtime Interfaces
 * 
 * These interfaces define the single source of truth for all UI components.
 * No additional state, timing, audio logic, or verdict logic may be introduced
 * or inferred inside the UI components.
 * 
 * All runtime behavior, analysis results, and verdict authority are provided
 * externally by DetectX.
 */

/**
 * Scan log entry for Live Scan Console
 */
export interface ScanLogEntry {
  timestamp: string;
  message: string;
  type: "info" | "process" | "complete" | "warning" | "constraint" | "philosophy";
}

/**
 * File metadata for forensic input record
 */
export interface FileMetadata {
  fileName?: string;
  duration?: number | null;
  sampleRate?: number | null;
  bitDepth?: number | null;
  channels?: number | null;
  codec?: string | null;
  fileHash?: string | null;
  fileSize?: number;
  artist?: string | null;
  title?: string | null;
  album?: string | null;
}

/**
 * Verdict result from CR-G analysis
 * 
 * ONLY TWO ALLOWED VERDICT TEXTS:
 * - "AI signal evidence was observed."
 * - "AI signal evidence was not observed."
 * 
 * No probability, confidence, severity, or AI model attribution.
 */
export interface VerdictResult {
  verdict: "AI signal evidence was observed." | "AI signal evidence was not observed." | null;
  authority: "CR-G";
  exceeded_axes: string[];
}

/**
 * Runtime State Interface (single source of truth)
 * 
 * All UI components must render from this state only.
 * No other state may be introduced or inferred inside the UI.
 */
export interface DetectXAudioState {
  /** Decoded audio buffer for waveform rendering */
  audioBuffer: AudioBuffer | null;
  
  /** Current playback position in seconds */
  currentTime: number;
  
  /** Total audio duration in seconds */
  duration: number;
  
  /** Whether audio is currently playing */
  isPlaying: boolean;
  
  /** Whether audio is being decoded */
  isDecoding: boolean;
  
  /** Current volume level (0-1) */
  volume: number;
  
  /** File metadata for forensic input record */
  metadata: FileMetadata | null;
  
  /** Scan logs for Live Scan Console */
  scanLogs: ScanLogEntry[];
  
  /** Verdict result from CR-G analysis */
  verdict: VerdictResult | null;
}

/**
 * Runtime Actions Interface (UI callbacks only)
 * 
 * UI components must call only these actions.
 * No audio context creation, volume calculation, or timing logic
 * may be performed inside UI components.
 */
export interface DetectXAudioActions {
  /** Start playback */
  play(): void;
  
  /** Pause playback (preserves position) */
  pause(): void;
  
  /** Stop playback (resets position) */
  stop(): void;
  
  /** Seek to specific time in seconds */
  seek(time: number): void;
  
  /** Seek forward by fixed increment */
  seekForward(): void;
  
  /** Seek backward by fixed increment */
  seekBackward(): void;
  
  /** Set volume level (0-1) */
  setVolume(v: number): void;
}

/**
 * Combined props interface for verify-audio page
 */
export interface VerifyAudioPageProps {
  state: DetectXAudioState;
  actions: DetectXAudioActions;
}
