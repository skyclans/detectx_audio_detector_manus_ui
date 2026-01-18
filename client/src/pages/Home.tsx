import { useState, useRef, useCallback, useEffect } from "react";
import { ForensicLayout } from "@/components/ForensicLayout";
import { AudioUploadPanel } from "@/components/AudioUploadPanel";
import { MetadataPanel } from "@/components/MetadataPanel";
import { Clock } from "lucide-react";
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
import { ExportPanel } from "@/components/ExportPanel";
import { ReportPreview } from "@/components/ReportPreview";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
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

// Verification result interface
interface VerdictResult {
  verdict: DetectXVerificationResult | null;
  crgStatus?: string;
  primaryExceededAxis?: string | null;
  timelineMarkers: { timestamp: number; type: string }[];
  detailedAnalysis?: DetailedAnalysisData | null;
}

// Scan sequence stages
type ScanStage = 
  | "init" | "lock" | "normalize" | "residual" | "persistence" 
  | "cross_stem" | "geometry" | "constraint_1" | "constraint_2" 
  | "constraint_3" | "philosophy_1" | "philosophy_2" | "philosophy_3" 
  | "philosophy_4" | "pre_verdict_1" | "pre_verdict_2" | "complete";

// Alias for ScanLog type
type ScanLog = ScanLogEntry;

// Generate scan log from stage
function generateScanLogs(stage: ScanStage): ScanLog {
  const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });
  
  const stageMessages: Record<ScanStage, { message: string; type: ScanLog["type"] }> = {
    init: { message: "Initializing forensic scan pipeline", type: "process" },
    lock: { message: "Locking analysis parameters", type: "process" },
    normalize: { message: "Establishing normalization coordinate space", type: "process" },
    residual: { message: "Observing residual structure", type: "process" },
    persistence: { message: "Monitoring residual persistence", type: "process" },
    cross_stem: { message: "Evaluating cross-stem geometry", type: "process" },
    geometry: { message: "Comparing against human geometry envelope", type: "process" },
    constraint_1: { message: "No probabilistic inference is performed", type: "constraint" },
    constraint_2: { message: "No authorship or intent is inferred", type: "constraint" },
    constraint_3: { message: "Absence of evidence is a valid outcome", type: "constraint" },
    philosophy_1: { message: "Real-time structural signal observation", type: "philosophy" },
    philosophy_2: { message: "Geometry-primary verification engine active", type: "philosophy" },
    philosophy_3: { message: "Human baseline geometry enforced", type: "philosophy" },
    philosophy_4: { message: "Deterministic execution under fixed conditions", type: "philosophy" },
    pre_verdict_1: { message: "Final geometry evaluation pending", type: "info" },
    pre_verdict_2: { message: "Results will be disclosed after full scan completion", type: "info" },
    complete: { message: "Scan complete", type: "complete" },
  };
  
  const { message, type } = stageMessages[stage];
  return { timestamp, message, type };
}

// Full scan sequence
function getFullScanSequence(): ScanStage[] {
  return [
    "philosophy_1", "philosophy_2", "philosophy_3", "philosophy_4",
    "init", "lock", "normalize", "residual", "persistence", "cross_stem", "geometry",
    "constraint_1", "constraint_2", "constraint_3",
    "pre_verdict_1", "pre_verdict_2",
    "complete"
  ];
}

export default function Home() {
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

  // Session time state
  const [sessionStartTime] = useState<Date>(new Date());
  const [sessionElapsed, setSessionElapsed] = useState<string>("00:00:00");

  // Mode and auth state
  const { user, isAuthenticated } = useAuth();
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
  const DETECTX_API_URL = "https://emjvw2an6oynf9-8000.proxy.runpod.net";

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

      // Build API URL with orientation and optional user_id
      let apiUrl = `${DETECTX_API_URL}/verify-audio?orientation=${orientation}`;
      if (user?.id) {
        apiUrl += `&user_id=${user.id}`;
      }

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
        xhr.send(formData);
      });

      console.log("[Verification] RunPod API response:", result);

      // Wait for animation to complete before showing result
      await animationPromise;
      
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
          authority: "CR-G",
          exceeded_axes: result.exceeded_axes || (result.primaryExceededAxis ? [result.primaryExceededAxis] : []),
        } : null,
        crgStatus: result.crgStatus || result.crg_status,
        primaryExceededAxis: result.primaryExceededAxis || result.primary_exceeded_axis,
        timelineMarkers: result.timelineMarkers || result.timeline_markers || [],
        detailedAnalysis: result.detailedAnalysis || result.detailed_analysis || null,
      });
      
      setScanComplete(true);
      
      // Increment usage count (skip for master users)
      if (!isMasterUser) {
        setUsageCount((prev: number) => {
          const newCount = prev + 1;
          localStorage.setItem("detectx_usage_count", newCount.toString());
          return newCount;
        });
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setUploadProgress(null);
      setScanComplete(true);
    } finally {
      setIsVerifying(false);
    }
  }, [selectedFile, metadata, orientation, user, isAuthenticated, isMasterUser, selectedMode, modeLimit, setLocation, DETECTX_API_URL]);

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
          {/* Live Console with height limit */}
          <LiveScanConsole
            logs={scanLogs}
            isVerifying={isVerifying}
            isComplete={scanComplete}
          />
          
          {/* Verification Result - directly below Live Console */}
          <VerdictPanel
            verdict={verificationResult?.verdict ?? null}
            isProcessing={isVerifying}
          />
        </div>
      </div>

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
            data={null}
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
            crgStatus: verificationResult?.crgStatus || null,
            primaryExceededAxis: verificationResult?.primaryExceededAxis || null,
            timelineMarkers: verificationResult?.timelineMarkers || [],
            analysisTimestamp: new Date().toISOString(),
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
