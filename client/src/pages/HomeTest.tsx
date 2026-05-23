import { useState, useRef, useCallback, useEffect } from "react";
import { toLocalTimestamp } from "@/lib/utils";
import { ForensicLayout } from "@/components/ForensicLayout";
import { AudioUploadPanel } from "@/components/AudioUploadPanel";
import { MetadataPanel } from "@/components/MetadataPanel";
import { Clock, Lock, X } from "lucide-react";
import { WaveformVisualization } from "@/components/WaveformVisualization";
import { AudioPlayerBar } from "@/components/AudioPlayerBar";
import { LiveScanConsole, type ScanLogEntry } from "@/components/LiveScanConsole";
import { VerdictPanel } from "@/components/VerdictPanel";
import { VerdictOrientationSlider } from "@/components/VerdictOrientationSlider";
import { TimelineAnalysis } from "@/components/TimelineAnalysis";
import { TemporalAnalysis } from "@/components/TemporalAnalysis";
import { DetailedAnalysis } from "@/components/DetailedAnalysis";
import { SourceComponents } from "@/components/SourceComponents";
import { GeometryScanTrace } from "@/components/GeometryScanTrace";
import { ReconV3Display } from "@/components/ReconV3Display";
import { AdvancedSignalAnalysis, getMockForensicData } from "@/components/AdvancedSignalAnalysis";
import { ExportPanel } from "@/components/ExportPanel";
import { ReportPreview } from "@/components/ReportPreview";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { AudioRuntime } from "@/lib/audioRuntime";
import { startDualTimeLoop } from "@/lib/timeLoop";
import type { DetectXVerdictText, DetectXVerificationResult } from "@shared/detectx-verification";

/**
 * ANONYMOUS STATELESS VERIFICATION FLOW
 * 
 * NON-NEGOTIABLE CONSTRAINTS:
 * 1) No login/authentication required
 * 2) No file storage - files are transient
 * 3) No upload history or session-based access control
 * 4) DetectX server is sole authority for processing and results
 * 5) DetectX UI acts only as UI layer and request forwarder
 */

// File metadata interface (forensic input record)
interface FileMetadata {
  fileName: string;
  duration: number | null;
  sampleRate: number | null;
  bitDepth: number | null;
  channels: number | null;
  codec: string | null;
  fileHash: string | null;
  fileSize: number;
}

// Detailed analysis types from server
interface AxisMetric {
  name: string;
  value: string;
}

interface AxisDetail {
  id: string;
  name: string;
  status: "exceeded" | "within_bounds";
  metrics: AxisMetric[];
}

interface TimelineEventData {
  time: number;
  eventType: string;
  axis: string;
  note: string | null;
}

interface StemComponentData {
  id: string;
  name: string;
  available: boolean;
}

interface GeometryTraceAxisData {
  axis: string;
  exceeded: boolean;
  metrics: AxisMetric[];
}

interface DetailedAnalysisData {
  axes: AxisDetail[];
  timelineEvents: TimelineEventData[];
  stemComponents: StemComponentData[];
  geometryTrace: GeometryTraceAxisData[];
}

// RECON V3 metrics interface (from ui-team-recon-v3-display-spec.md)
interface ReconMetrics {
  // V1 existing fields
  band_bass_diff?: number | null;
  band_low_mid_diff?: number | null;
  l1_diff?: number | null;
  snr?: number | null;
  energy_ratio?: number | null;
  phase_coherence?: number | null;
  band_high_ratio?: number | null;
  ai_signals?: number | null;
  
  // V3 new fields
  recon_version?: string | null;
  v2_confidence?: number | null;
  band_mid_diff?: number | null;
  band_high_mid_diff?: number | null;
  spectral_flatness_mean?: number | null;
  stereo_recon_loss?: number | null;
  v2_features?: Record<string, number> | null;
}

// Verification result interface
interface VerdictResult {
  verdict: DetectXVerificationResult | null;
  crgStatus?: string;
  primaryExceededAxis?: string | null;
  timelineMarkers: { timestamp: number; type: string }[];
  detailedAnalysis?: DetailedAnalysisData | null;
  reconMetrics?: ReconMetrics | null;  // V3 RECON metrics
  cnnScore?: number | null;  // CNN confidence score (0.0-1.0) for display
}

// Scan sequence stages for Enhanced Mode (DetectX Engine v3 + Reconstruction Engine)
type ScanStage =
  | "init" | "upload" | "decode" | "classifier" | "classifier_check"
  | "recon_init" | "recon_stems" | "recon_compare" | "recon_eval"
  | "constraint_1" | "constraint_2" | "constraint_3"
  | "philosophy_1" | "philosophy_2" | "philosophy_3"
  | "pre_verdict" | "complete";

// Alias for ScanLog type
type ScanLog = ScanLogEntry;

// Generate scan log from stage
function generateScanLogs(stage: ScanStage): ScanLog {
  const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });

  const stageMessages: Record<ScanStage, { message: string; type: ScanLog["type"] }> = {
    // Enhanced Mode Philosophy
    philosophy_1: { message: "DetectX Enhanced Mode: Dual-engine verification active", type: "philosophy" },
    philosophy_2: { message: "DetectX Engine v3 (primary) — trained on millions of verified human samples", type: "philosophy" },
    philosophy_3: { message: "Verification Engine (secondary) — confirms AI signal via multi-layer analysis", type: "philosophy" },

    // Scan Process
    init: { message: "Initializing analysis pipeline", type: "process" },
    upload: { message: "Ingesting audio stream — verifying file integrity", type: "process" },
    decode: { message: "Extracting audio features for deep learning analysis", type: "process" },
    classifier: { message: "Running DetectX Engine v3 — segment-level inference", type: "process" },
    classifier_check: { message: "Evaluating detection threshold against baseline", type: "process" },

    // Verification Engine (only runs if primary threshold exceeded)
    recon_init: { message: "AI signal detected by primary engine — activating Verification Engine for confirmation", type: "process" },
    recon_stems: { message: "Performing multi-layer audio decomposition analysis", type: "process" },
    recon_compare: { message: "Computing verification differential — multi-metric evaluation", type: "process" },
    recon_eval: { message: "Analyzing frequency band differences and signal coherence", type: "process" },

    // Constraints
    constraint_1: { message: "No probabilistic inference is performed", type: "constraint" },
    constraint_2: { message: "No authorship or intent is inferred", type: "constraint" },
    constraint_3: { message: "Absence of evidence is a valid outcome", type: "constraint" },

    // Pre-Verdict
    pre_verdict: { message: "Correlating dual-engine results — generating verdict", type: "info" },
    complete: { message: "DetectX Enhanced Mode scan complete", type: "complete" },
  };

  const { message, type } = stageMessages[stage];
  return { timestamp, message, type };
}

// Full scan sequence for Enhanced Mode
function getFullScanSequence(): ScanStage[] {
  return [
    "philosophy_1", "philosophy_2", "philosophy_3",
    "init", "upload", "decode", "classifier", "classifier_check",
    "recon_init", "recon_stems", "recon_compare", "recon_eval",
    "constraint_1", "constraint_2", "constraint_3",
    "pre_verdict",
    "complete"
  ];
}

export default function HomeTest() {
  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);
  
  // Audio state
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  
  // Verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const orientation = "enhanced" as const;  // Fixed to Enhanced mode
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
  const [scanComplete, setScanComplete] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerdictResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  
  // Login prompt state (for non-logged-in users)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // ESC key to close login modal
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showLoginPrompt) {
        setShowLoginPrompt(false);
      }
    };
    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [showLoginPrompt]);

  // Session time state
  const [sessionStartTime] = useState<Date>(new Date());
  const [sessionElapsed, setSessionElapsed] = useState<string>("00:00:00");

  // Mode and auth state
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [, setLocation] = useLocation();
  const [usageCount, setUsageCount] = useState(0);
  const [modeLimit, setModeLimit] = useState<number | null>(null);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  // Master emails with unlimited access
  const MASTER_EMAILS = [
    "skyclans2@gmail.com",
    "ceo@detectx.app",
    "support@detectx.app",
    "coolkimy@gmail.com",
  ];
  const isMasterUser = user?.email && MASTER_EMAILS.includes(user.email);

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioRuntimeRef = useRef<AudioRuntime | null>(null);
  const timeLoopCleanupRef = useRef<(() => void) | null>(null);
  const selectedFileRef = useRef<File | null>(null); // Store actual File object for direct upload
  const xhrRef = useRef<XMLHttpRequest | null>(null); // Store XHR for cancel functionality

  // RunPod API URL for direct file upload (bypasses tRPC Base64 encoding)
  const DETECTX_API_URL = "https://emjvw2an6oynf9-8001.proxy.runpod.net/api";

  // Initialize AudioRuntime on mount
  useEffect(() => {
    const ctx = new AudioContext();
    audioContextRef.current = ctx;
    audioRuntimeRef.current = new AudioRuntime(ctx);
    
    // Set callback for when playback ends naturally
    audioRuntimeRef.current.setOnEnded(() => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (timeLoopCleanupRef.current) {
        timeLoopCleanupRef.current();
        timeLoopCleanupRef.current = null;
      }
    });
    
    return () => {
      if (timeLoopCleanupRef.current) {
        timeLoopCleanupRef.current();
      }
      audioRuntimeRef.current?.stop();
      ctx.close();
    };
  }, []);

  // Restore pending file info after login (display only - user needs to re-upload)
  useEffect(() => {
    if (isAuthenticated) {
      const pendingFileStr = localStorage.getItem("detectx_pending_file");
      if (pendingFileStr) {
        try {
          const pendingFile = JSON.parse(pendingFileStr);
          // Set metadata to show the file info in upload panel
          setMetadata({
            fileName: pendingFile.name,
            duration: null,
            sampleRate: null,
            bitDepth: null,
            channels: null,
            codec: pendingFile.name.split('.').pop()?.toUpperCase() || null,
            fileHash: null,
            fileSize: pendingFile.size,
          });
          // Clear the pending file from localStorage
          localStorage.removeItem("detectx_pending_file");
        } catch (e) {
          console.warn("Failed to restore pending file info:", e);
          localStorage.removeItem("detectx_pending_file");
        }
      }
    }
  }, [isAuthenticated]);

  // Session timer - updates every second
  useEffect(() => {
    const formatElapsed = (start: Date): string => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    const interval = setInterval(() => {
      setSessionElapsed(formatElapsed(sessionStartTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Check selected mode from localStorage
  useEffect(() => {
    const mode = localStorage.getItem("detectx_selected_mode");
    const limit = localStorage.getItem("detectx_mode_limit");
    
    if (mode) {
      setSelectedMode(mode);
      if (limit === "unlimited" || mode === "master") {
        setModeLimit(null); // Unlimited
      } else {
        setModeLimit(parseInt(limit || "5", 10));
      }
    }
    
    // Get usage count from localStorage (reset monthly in production)
    const storedUsage = localStorage.getItem("detectx_usage_count");
    if (storedUsage) {
      setUsageCount(parseInt(storedUsage, 10));
    }
  }, []);

  /**
   * FILE SELECTION HANDLER
   */
  const handleFileSelect = useCallback(async (file: File) => {
    // Stop any currently playing audio before switching files
    if (audioRuntimeRef.current) {
      audioRuntimeRef.current.stop();
    }
    if (timeLoopCleanupRef.current) {
      timeLoopCleanupRef.current();
      timeLoopCleanupRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);

    setSelectedFile(file);
    setVerificationResult(null);
    setScanLogs([]);
    setScanComplete(false);
    
    // Set initial metadata from file object
    setMetadata({
      fileName: file.name,
      duration: null,
      sampleRate: null,
      bitDepth: null,
      channels: null,
      codec: null,
      fileHash: null,
      fileSize: file.size,
    });
    
    // Store File object for direct upload to RunPod (no Base64 encoding)
    selectedFileRef.current = file;
    
    // Decode audio for playback
    const arrayBuffer = await file.arrayBuffer();
    
    if (audioContextRef.current) {
      try {
        const buffer = await audioContextRef.current.decodeAudioData(arrayBuffer.slice(0));
        setAudioBuffer(buffer);
        setDuration(buffer.duration);
        setCurrentTime(0);
        
        // Extract metadata from Web Audio API (no server call needed)
        // Full metadata will be extracted by RunPod server during verification
        setMetadata({
          fileName: file.name,
          duration: buffer.duration,
          sampleRate: buffer.sampleRate,
          bitDepth: null, // Will be extracted by RunPod
          channels: buffer.numberOfChannels,
          codec: getCodecFromFilename(file.name),
          fileHash: null, // Will be computed by RunPod
          fileSize: file.size,
        });
      } catch (error) {
        // Web Audio API may not support all formats (e.g., FLAC, some WAV variants)
        // This is expected - verification will still work via RunPod
        console.warn("Audio preview unavailable (format not supported by browser):", error);
        
        // Set basic metadata - full metadata will be extracted by RunPod server
        setMetadata({
          fileName: file.name,
          duration: null,
          sampleRate: null,
          bitDepth: null,
          channels: null,
          codec: getCodecFromFilename(file.name),
          fileHash: null,
          fileSize: file.size,
        });
        
        // Set audioBuffer to null so UI knows preview is unavailable
        setAudioBuffer(null);
        setDuration(0);
      }
    }
  }, []);

  // Helper to get codec from filename
  function getCodecFromFilename(filename: string): string | null {
    const ext = filename.toLowerCase().split('.').pop();
    const codecs: Record<string, string> = {
      'mp3': 'MP3',
      'wav': 'WAV/PCM',
      'flac': 'FLAC',
      'ogg': 'Vorbis',
      'm4a': 'AAC',
      'aac': 'AAC',
      'wma': 'WMA',
      'aiff': 'AIFF',
      'aif': 'AIFF',
      'opus': 'Opus',
      'webm': 'WebM',
    };
    return codecs[ext || ''] || null;
  }

  /**
   * PLAYBACK CONTROLS
   */
  const handlePlay = useCallback(() => {
    if (!audioBuffer || !audioRuntimeRef.current) return;
    
    audioRuntimeRef.current.play(audioBuffer);
    setIsPlaying(true);
    
    // Start time loop for UI updates
    if (timeLoopCleanupRef.current) {
      timeLoopCleanupRef.current();
    }
    
    timeLoopCleanupRef.current = startDualTimeLoop(
      audioRuntimeRef.current,
      duration,
      () => {}, // Fast callback - not used in stateless mode
      (t) => setCurrentTime(t), // Slow callback - update React state
      100 // Update interval
    );
  }, [audioBuffer, duration]);

  const handlePause = useCallback(() => {
    if (!audioRuntimeRef.current) return;
    
    audioRuntimeRef.current.pause();
    setIsPlaying(false);
    
    if (timeLoopCleanupRef.current) {
      timeLoopCleanupRef.current();
      timeLoopCleanupRef.current = null;
    }
  }, []);

  const handleStop = useCallback(() => {
    if (!audioRuntimeRef.current) return;
    
    audioRuntimeRef.current.stop();
    setIsPlaying(false);
    setCurrentTime(0);
    
    if (timeLoopCleanupRef.current) {
      timeLoopCleanupRef.current();
      timeLoopCleanupRef.current = null;
    }
  }, []);

  const handleSeek = useCallback((time: number) => {
    if (!audioBuffer || !audioRuntimeRef.current) return;
    
    const clampedTime = Math.max(0, Math.min(time, duration));
    setCurrentTime(clampedTime);
    
    if (isPlaying) {
      audioRuntimeRef.current.seek(clampedTime, audioBuffer);
    } else {
      audioRuntimeRef.current.setOffset(clampedTime);
    }
  }, [audioBuffer, duration, isPlaying]);

  const handleSeekForward = useCallback(() => {
    handleSeek(currentTime + 10);
  }, [currentTime, handleSeek]);

  const handleSeekBackward = useCallback(() => {
    handleSeek(currentTime - 10);
  }, [currentTime, handleSeek]);

  const handleVolumeChange = useCallback((v: number) => {
    setVolume(v);
    audioRuntimeRef.current?.setVolume(v);
  }, []);

  /**
   * CANCEL VERIFICATION - Abort ongoing upload/verification
   */
  const handleCancelVerification = useCallback(() => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    setIsVerifying(false);
    setUploadProgress(null);
    setScanLogs([]);
    setScanComplete(false);
    console.log("[Verification] Cancelled by user");
  }, []);

  /**
   * VERIFICATION HANDLER - DIRECT RUNPOD API CALL
   * 
   * Calls RunPod API directly with FormData to avoid Base64 encoding overhead.
   * No tRPC intermediary for file upload - direct multipart/form-data.
   * Uses XMLHttpRequest for upload progress tracking.
   */
  const handleVerify = useCallback(async () => {
    if (!selectedFile || !metadata || !selectedFileRef.current) return;
    
    // Check if user is logged in (pre-scan block for non-logged-in users)
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    
    // Check if user needs to select a mode first (for logged-in users)
    if (isAuthenticated && !isMasterUser && !selectedMode) {
      setLocation("/select-mode");
      return;
    }
    
    // Check mode limit (skip for master users)
    if (!isMasterUser && modeLimit !== null && usageCount >= modeLimit) {
      alert(`You have reached your monthly limit of ${modeLimit} verifications. Please upgrade your plan.`);
      setLocation("/plan");
      return;
    }
    
    // Immediate UI update
    setIsVerifying(true);
    setScanComplete(false);
    setScanLogs([]);
    setUploadProgress(0);

    // Start scan animation (runs in parallel with API call)
    const runScanAnimation = async () => {
      const sequence = getFullScanSequence();
      const delays = [100, 150, 150, 150, 200, 200, 300, 300, 400, 400, 500, 500, 200, 200, 200, 200, 200, 300, 500];
      for (let i = 0; i < sequence.length; i++) {
        await new Promise(resolve => setTimeout(resolve, delays[i] || 200));
        const log = generateScanLogs(sequence[i]);
        setScanLogs((prev: ScanLog[]) => [...prev, log]);
      }
    };

    // Start animation without waiting
    const animationPromise = runScanAnimation();

    try {
      // DIRECT RUNPOD API CALL - FormData with actual File object
      // This bypasses tRPC Base64 encoding which causes boundary parsing errors
      // Runs in PARALLEL with scan animation
      // Uses XMLHttpRequest for upload progress tracking
      const formData = new FormData();
      formData.append("file", selectedFileRef.current);

      // Build API URL with orientation (user_id removed - server identifies user from JWT)
      const apiUrl = `${DETECTX_API_URL}/verify-audio?orientation=${orientation}`;
      
      // Get JWT token for Bearer authentication
      const token = localStorage.getItem("detectx_token");

      console.log(`[Verification] Calling RunPod API directly: ${apiUrl}`);
      console.log(`[Verification] File: ${selectedFileRef.current.name}, Size: ${selectedFileRef.current.size}`);

      // Use XMLHttpRequest for upload progress tracking
      // Timeout set to 5 minutes for large WAV files
      const result = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr; // Store ref for cancel functionality
        xhr.timeout = 300000; // 5 minutes timeout for large files

        // Track upload progress
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete);
            console.log(`[Upload Progress] ${percentComplete}%`);
          }
        });

        xhr.upload.addEventListener("load", () => {
          setUploadProgress(100);
          console.log("[Upload] Complete, waiting for server response...");
        });

        xhr.addEventListener("load", () => {
          setUploadProgress(null); // Clear progress after response
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (e) {
              reject(new Error("Failed to parse response"));
            }
          } else if (xhr.status === 401) {
            // Handle 401 Unauthorized - show login prompt
            setShowLoginPrompt(true);
            setIsVerifying(false);
            setScanComplete(false);
            setUploadProgress(null);
            reject(new Error("Please sign in to use this feature."));
          } else if (xhr.status === 429) {
            // Handle 429 Too Many Requests - usage limit exceeded
            setIsVerifying(false);
            setScanComplete(false);
            setUploadProgress(null);
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              alert(errorResponse.detail || "Monthly limit reached. Please upgrade your plan.");
            } catch {
              alert("Monthly limit reached. Please upgrade your plan.");
            }
            setLocation("/plan");
            reject(new Error("Monthly limit reached"));
          } else {
            console.error(`[Verification] RunPod API error: ${xhr.status} - ${xhr.responseText}`);
            reject(new Error(`RunPod API returned ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          setUploadProgress(null);
          reject(new Error("Network error during upload"));
        });

        xhr.addEventListener("abort", () => {
          setUploadProgress(null);
          reject(new Error("Upload aborted"));
        });

        xhr.addEventListener("timeout", () => {
          setUploadProgress(null);
          reject(new Error("Request timeout - file too large or slow connection"));
        });

        xhr.open("POST", apiUrl);
        
        // Add Bearer token for authenticated users
        if (token) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }
        
        xhr.send(formData);
      });

      console.log("[Verification] RunPod API response:", result);

      // Performance: Don't wait for animation - show result immediately after server response
      // Animation continues in background but doesn't block result display
      // await animationPromise; // Removed for performance - was blocking result for ~5 seconds
      
      // Update result - API returns full verdict text directly
      // e.g., "AI signal evidence was observed." or "AI signal evidence was not observed."
      const verdictText: DetectXVerdictText | null =
        result.verdict === "AI signal evidence was observed." ||
        result.verdict === "AI signal evidence was not observed."
          ? result.verdict
          : null;
      
      // Update metadata with server response if available
      if (result.metadata) {
        setMetadata((prev: FileMetadata | null) => prev ? {
          ...prev,
          duration: result.metadata.duration ?? prev.duration,
          sampleRate: result.metadata.sample_rate ?? prev.sampleRate,
          channels: result.metadata.channels ?? prev.channels,
          bitDepth: result.metadata.bit_depth ?? prev.bitDepth,
          codec: result.metadata.codec ?? prev.codec,
          fileSize: result.metadata.file_size ?? prev.fileSize,
        } : prev);
      }
      
      setVerificationResult({
        verdict: verdictText ? {
          verdict: verdictText,
          authority: "DetectX Forensic",
          exceeded_axes: result.exceeded_axes || (result.primaryExceededAxis ? [result.primaryExceededAxis] : []),
        } : null,
        crgStatus: result.crgStatus || result.crg_status,
        primaryExceededAxis: result.primaryExceededAxis || result.primary_exceeded_axis,
        timelineMarkers: result.timelineMarkers || result.timeline_markers || [],
        detailedAnalysis: result.detailedAnalysis || result.detailed_analysis || null,
        reconMetrics: result.recon_metrics || result.reconMetrics || null,  // V3 RECON metrics
        cnnScore: result.cnn_score ?? result.cnnScore ?? null,  // CNN confidence (0.0-1.0)
      });
      
      setScanComplete(true);

      // Usage is incremented server-side in /verify-audio (single source of truth)
      // Update local state + sidebar from server response
      if (result.usage_info) {
        const { usage_count, monthly_limit, remaining } = result.usage_info;
        setUsageCount(usage_count);
        localStorage.setItem("detectx_usage_count", String(usage_count));
        if (monthly_limit !== undefined) {
          localStorage.setItem("detectx_mode_limit", String(monthly_limit));
        }
        // Refresh useAuth user object so sidebar PlanUsageDisplay updates
        refreshUser();
      } else if (!isMasterUser) {
        // Fallback: increment locally if no usage_info in response
        setUsageCount((prev: number) => {
          const newCount = prev + 1;
          localStorage.setItem("detectx_usage_count", newCount.toString());
          return newCount;
        });
        refreshUser();
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setUploadProgress(null);
      setScanComplete(true);
    } finally {
      setIsVerifying(false);
    }
  }, [selectedFile, metadata, orientation, user, isAuthenticated, isMasterUser, selectedMode, modeLimit, setLocation, DETECTX_API_URL, refreshUser]);

  // Debug: Log verification result changes
  useEffect(() => {
    console.log("[DEBUG] verificationResult changed:", verificationResult);
    console.log("[DEBUG] verificationResult.verdict:", verificationResult?.verdict);
    console.log("[DEBUG] isVerifying:", isVerifying);
  }, [verificationResult, isVerifying]);

  return (
    <ForensicLayout>
      {/* Session Time Display */}
      <div className="flex items-center justify-end mb-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-md border border-border/50">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Session:</span>
          <span className="text-sm font-mono text-foreground">{sessionElapsed}</span>
        </div>
      </div>

      {/* Top section - Upload, Metadata, Waveform */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Left column - Upload and Metadata */}
        <div className="flex flex-col gap-4 lg:gap-6">
          {/* Enhanced Mode Badge */}
          <VerdictOrientationSlider
            disabled={isVerifying}
          />
          
          <AudioUploadPanel
            onFileSelect={(fileInfo) => handleFileSelect(fileInfo.file)}
            onVerify={handleVerify}
            onCancel={handleCancelVerification}
            isVerifying={isVerifying}
            uploadProgress={uploadProgress}
          />
          <MetadataPanel metadata={metadata} />
        </div>
        
        {/* Right column - Waveform and Player */}
        <div className="lg:col-span-2 flex flex-col gap-4 lg:gap-6">
          {/* Unified Waveform + Player Card */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <WaveformVisualization
              audioBuffer={audioBuffer}
              currentTime={currentTime}
              duration={duration}
              isDecoding={false}
              onSeek={handleSeek}
            />
            <AudioPlayerBar
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              volume={volume}
              onPlay={handlePlay}
              onPause={handlePause}
              onStop={handleStop}
              onSeekForward={handleSeekForward}
              onSeekBackward={handleSeekBackward}
              onVolumeChange={handleVolumeChange}
            />
          </div>
          {/* Verification Result - now above Live Console */}
          <VerdictPanel
            verdict={verificationResult?.verdict ?? null}
            cnnScore={verificationResult?.cnnScore ?? null}
            isProcessing={isVerifying}
            progress={Math.round((scanLogs.length / 17) * 100)}
          />
          
          {/* Live Console with height limit - now below Verification Result */}
          <LiveScanConsole
            logs={scanLogs}
            isVerifying={isVerifying}
            isComplete={scanComplete}
          />
        </div>
      </div>

      {/* Login Prompt Modal for non-logged-in users */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLoginPrompt(false)}
          />
          {/* Modal */}
          <div className="relative z-10 flex flex-col items-center justify-center py-10 px-12 border border-border rounded-2xl bg-background shadow-2xl max-w-md mx-4 animate-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            <Lock className="w-12 h-12 mb-5 text-primary" />
            <h3 className="text-xl font-semibold mb-3">Please sign in to continue</h3>
            <p className="text-sm text-muted-foreground mb-8 text-center">
              Sign in to analyze your audio files with DetectX.
            </p>
            <Button size="lg" onClick={() => {
              // Save file info to localStorage before redirect so it persists after login
              if (selectedFile) {
                localStorage.setItem("detectx_pending_file", JSON.stringify({
                  name: selectedFile.name,
                  size: selectedFile.size,
                  type: selectedFile.type,
                  lastModified: selectedFile.lastModified
                }));
              }
              // Set returnUrl in localStorage so AuthCallback knows where to redirect
              localStorage.setItem("detectx_return_url", "/verify-audio");
              // Redirect to RunPod OAuth endpoint
              const RUNPOD_API_URL = import.meta.env.VITE_DETECTX_API_URL
                || "https://emjvw2an6oynf9-8000.proxy.runpod.net";
              window.location.href = `${RUNPOD_API_URL}/auth/google`;
            }}>
              Sign in with Google
            </Button>
          </div>
        </div>
      )}

      {/* Extended analysis sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mt-4 lg:mt-6">
        <div className="flex flex-col gap-4 lg:gap-6">
          <TimelineAnalysis
            events={verificationResult?.detailedAnalysis?.timelineEvents?.map((e: TimelineEventData) => ({
              time: e.time,
              eventType: e.eventType as "Structural Event" | "Signal Anomaly" | "Pattern Break" | "Spectral Shift",
              axis: e.axis,
              note: e.note || undefined,
            })) || null}
            isProcessing={isVerifying}
          />
          <TemporalAnalysis
            events={verificationResult?.detailedAnalysis?.timelineEvents?.map((e: TimelineEventData) => ({
              time: e.time,
              eventType: e.eventType,
              axis: e.axis,
              note: e.note || undefined,
            })) || null}
            isProcessing={isVerifying}
          />
        </div>
        <div className="flex flex-col gap-4 lg:gap-6">
          <DetailedAnalysis
            axes={verificationResult?.detailedAnalysis?.axes?.map((a: AxisDetail) => ({
              id: a.id as "G1-A" | "G1-B" | "G2-A" | "G2-B" | "G3-A",
              status: a.status,
              metrics: a.metrics,
            })) || null}
            isProcessing={isVerifying}
          />
          {/* RECON V3 Metrics Display */}
          <ReconV3Display
            metrics={verificationResult?.reconMetrics || null}
            isProcessing={isVerifying}
          />
        </div>
        <div className="flex flex-col gap-4 lg:gap-6">
          <SourceComponents
            data={verificationResult?.detailedAnalysis?.stemComponents ? {
              components: verificationResult.detailedAnalysis.stemComponents.map((s: StemComponentData) => ({
                id: s.id,
                name: s.name,
                available: s.available,
              })),
            } : null}
            isProcessing={isVerifying}
            stemVolumes={{}}
            onVolumeChange={(stemId, volume) => console.log(`Volume change: ${stemId} = ${volume}`)}
            onDownload={(stemId) => console.log(`Download: ${stemId}`)}
          />
        </div>
      </div>

      {/* Tier 4: Advanced Signal Analysis (corroborative forensic display) */}
      <div className="gap-4 lg:gap-6 mt-4 lg:mt-6">
        <AdvancedSignalAnalysis
          data={getMockForensicData()}
          isProcessing={isVerifying}
        />
      </div>

      {/* Geometry Scan Trace */}
      <div className="mt-6">
        <GeometryScanTrace
          data={verificationResult?.detailedAnalysis?.geometryTrace ? {
            axes: verificationResult.detailedAnalysis.geometryTrace.map((g: GeometryTraceAxisData) => ({
              axis: g.axis,
              exceeded: g.exceeded,
              metrics: g.metrics,
            })),
          } : null}
          isProcessing={isVerifying}
        />
      </div>

      {/* Export section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <ExportPanel 
          data={{
            fileName: metadata?.fileName || "",
            fileSize: metadata?.fileSize || 0,
            duration: metadata?.duration || null,
            sampleRate: metadata?.sampleRate || null,
            bitDepth: metadata?.bitDepth || null,
            channels: metadata?.channels || null,
            codec: metadata?.codec || null,
            fileHash: metadata?.fileHash || null,
            verdict: verificationResult?.verdict ?? null,
            timelineMarkers: verificationResult?.timelineMarkers || [],
            analysisTimestamp: toLocalTimestamp(),
          }}
        />
        <ReportPreview 
          verdict={verificationResult?.verdict ?? null}
          crgStatus={verificationResult?.crgStatus || null}
          primaryExceededAxis={verificationResult?.primaryExceededAxis || null}
          fileName={metadata?.fileName || null}
          fileHash={metadata?.fileHash || null}
          isProcessing={isVerifying}
        />
      </div>
    </ForensicLayout>
  );
}
