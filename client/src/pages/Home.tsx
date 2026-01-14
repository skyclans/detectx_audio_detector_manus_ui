import { useState, useRef, useCallback, useEffect } from "react";
import { ForensicLayout } from "@/components/ForensicLayout";
import { AudioUploadPanel } from "@/components/AudioUploadPanel";
import { MetadataPanel } from "@/components/MetadataPanel";
import { Clock } from "lucide-react";
import { WaveformVisualization } from "@/components/WaveformVisualization";
import { AudioPlayerBar } from "@/components/AudioPlayerBar";
import { LiveScanConsole, type ScanLogEntry } from "@/components/LiveScanConsole";
import { VerdictPanel } from "@/components/VerdictPanel";
import { VerdictOrientationSlider, VerdictOrientation } from "@/components/VerdictOrientationSlider";
import { TimelineAnalysis } from "@/components/TimelineAnalysis";
import { TemporalAnalysis } from "@/components/TemporalAnalysis";
import { DetailedAnalysis } from "@/components/DetailedAnalysis";
import { SourceComponents } from "@/components/SourceComponents";
import { GeometryScanTrace } from "@/components/GeometryScanTrace";
import { ExportPanel } from "@/components/ExportPanel";
import { ReportPreview } from "@/components/ReportPreview";
import { trpc } from "@/lib/trpc";
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
 * 5) Manus acts only as UI layer and request forwarder
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

// Verification result interface
interface VerdictResult {
  verdict: DetectXVerificationResult | null;
  crgStatus?: string;
  primaryExceededAxis?: string | null;
  timelineMarkers: { timestamp: number; type: string }[];
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
  const [orientation, setOrientation] = useState<VerdictOrientation>("balanced");
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
  const [scanComplete, setScanComplete] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerdictResult | null>(null);

  // Session time state
  const [sessionStartTime] = useState<Date>(new Date());
  const [sessionElapsed, setSessionElapsed] = useState<string>("00:00:00");

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioRuntimeRef = useRef<AudioRuntime | null>(null);
  const timeLoopCleanupRef = useRef<(() => void) | null>(null);
  const fileDataRef = useRef<string | null>(null); // Store base64 data for processing

  // tRPC mutations - ANONYMOUS (no auth required)
  const uploadMutation = trpc.verification.upload.useMutation();
  const processMutation = trpc.verification.process.useMutation();

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
    
    // Decode audio for playback
    const arrayBuffer = await file.arrayBuffer();
    
    // Store base64 data for later processing (transient, not stored)
    const base64Data = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    fileDataRef.current = base64Data;
    
    if (audioContextRef.current) {
      try {
        const buffer = await audioContextRef.current.decodeAudioData(arrayBuffer.slice(0));
        setAudioBuffer(buffer);
        setDuration(buffer.duration);
        setCurrentTime(0);
        
        // Extract metadata via server (ffprobe) - NO STORAGE
        const uploadResult = await uploadMutation.mutateAsync({
          fileName: file.name,
          fileData: base64Data,
          contentType: file.type,
        });
        
        // Update metadata from server response
        setMetadata({
          fileName: uploadResult.metadata.filename,
          duration: uploadResult.metadata.duration,
          sampleRate: uploadResult.metadata.sampleRate,
          bitDepth: uploadResult.metadata.bitDepth,
          channels: uploadResult.metadata.channels,
          codec: uploadResult.metadata.codec,
          fileHash: uploadResult.metadata.sha256,
          fileSize: uploadResult.metadata.fileSize,
        });
      } catch (error) {
        console.error("Failed to decode audio:", error);
      }
    }
  }, [uploadMutation]);

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
   * VERIFICATION HANDLER - ANONYMOUS, STATELESS
   * 
   * No authentication required.
   * No file storage - file data is sent directly for processing.
   * No database records created.
   */
  const handleVerify = useCallback(async () => {
    if (!selectedFile || !metadata || !fileDataRef.current) return;
    
    // Immediate UI update
    setIsVerifying(true);
    setScanComplete(false);
    setScanLogs([]);
    
    // Generate scan logs with delays
    const sequence = getFullScanSequence();
    const delays = [100, 150, 150, 150, 200, 200, 300, 300, 400, 400, 500, 500, 200, 200, 200, 200, 200, 300, 500];
    for (let i = 0; i < sequence.length; i++) {
      await new Promise(resolve => setTimeout(resolve, delays[i] || 200));
      const log = generateScanLogs(sequence[i]);
      setScanLogs((prev: ScanLog[]) => [...prev, log]);
    }
    
    try {
      // Process verification directly - NO STORAGE, NO DATABASE
      const result = await processMutation.mutateAsync({
        fileName: metadata.fileName,
        fileData: fileDataRef.current,
        fileSize: metadata.fileSize,
        duration: metadata.duration || undefined,
        sampleRate: metadata.sampleRate || undefined,
        orientation: orientation,
      });
      
      // Update result - convert to VerdictResult format
      const verdictText: DetectXVerdictText | null = result.verdict === "observed" 
        ? "AI signal evidence was observed."
        : result.verdict === "not_observed"
        ? "AI signal evidence was not observed."
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
          exceeded_axes: result.primaryExceededAxis ? [result.primaryExceededAxis] : [],
        } : null,
        crgStatus: result.crgStatus,
        primaryExceededAxis: result.primaryExceededAxis,
        timelineMarkers: result.timelineMarkers || [],
      });
      
      setScanComplete(true);
    } catch (error) {
      console.error("Verification failed:", error);
      setScanComplete(true);
    } finally {
      setIsVerifying(false);
    }
  }, [selectedFile, metadata, processMutation]);

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Upload and Metadata */}
        <div className="flex flex-col gap-6">
          {/* Verdict Boundary Orientation Slider */}
          <VerdictOrientationSlider
            value={orientation}
            onChange={setOrientation}
            disabled={isVerifying}
          />
          
          <AudioUploadPanel
            onFileSelect={(fileInfo) => handleFileSelect(fileInfo.file)}
            onVerify={handleVerify}
            isVerifying={isVerifying}
          />
          <MetadataPanel metadata={metadata} />
        </div>
        
        {/* Right column - Waveform and Player */}
        <div className="lg:col-span-2 flex flex-col gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="flex flex-col gap-6">
          <TimelineAnalysis 
            events={null}
            isProcessing={isVerifying}
          />
          <TemporalAnalysis 
            data={null}
            isProcessing={isVerifying}
          />
        </div>
        <div className="flex flex-col gap-6">
          <DetailedAnalysis 
            axes={null}
            isProcessing={isVerifying}
          />
        </div>
        <div className="flex flex-col gap-6">
<SourceComponents 
              data={null}
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
          data={null}
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
