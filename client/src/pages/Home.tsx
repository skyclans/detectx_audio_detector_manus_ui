import { useAuth } from "@/_core/hooks/useAuth";
import { AudioPlayerBar } from "@/components/AudioPlayerBar";
import { AudioUploadPanel } from "@/components/AudioUploadPanel";
import { DetailedAnalysis } from "@/components/DetailedAnalysis";
import { ExportPanel } from "@/components/ExportPanel";
import { ForensicLayout } from "@/components/ForensicLayout";
import { GeometryScanTrace } from "@/components/GeometryScanTrace";
import { LiveScanConsole, generateScanLogs, getFullScanSequence } from "@/components/LiveScanConsole";
import { MetadataPanel } from "@/components/MetadataPanel";
import { ReportPreview } from "@/components/ReportPreview";
import { SourceComponents } from "@/components/SourceComponents";
import { TemporalAnalysis } from "@/components/TemporalAnalysis";
import { TimelineAnalysis } from "@/components/TimelineAnalysis";
import { TimelineContext } from "@/components/TimelineContext";
import { VerdictPanel } from "@/components/VerdictPanel";
import { WaveformVisualization } from "@/components/WaveformVisualization";
import { AudioRuntime } from "@/lib/audioRuntime";
import { startDualTimeLoop } from "@/lib/timeLoop";
import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * DetectX Audio Verification Workspace
 * 
 * PERFORMANCE-OPTIMIZED ARCHITECTURE:
 * - AudioRuntime class for audio playback (no inline audio logic)
 * - Ref-based time tracking during playback (no React state on every frame)
 * - Dual time loop: fast (playhead canvas) + slow (React state)
 * - Waveform canvas separated from playhead canvas
 */

interface AudioFileInfo {
  file: File;
  name: string;
  size: number;
  duration: number | null;
  sampleRate: number | null;
  type: string;
}

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

/**
 * DetectX Verification Result Contract (LOCKED - DO NOT MODIFY)
 */
type DetectXVerdictText =
  | "AI signal evidence was observed."
  | "AI signal evidence was not observed.";

interface DetectXVerificationResult {
  verdict: DetectXVerdictText;
  authority: "CR-G";
  exceeded_axes: string[];
}

interface VerificationResult {
  verdict: DetectXVerificationResult | null;
  crgStatus: string | null;
  primaryExceededAxis: string | null;
  timelineMarkers: { timestamp: number; type: string }[];
}

interface TimelineAnalysisData {
  segments: { startTime: number; endTime: number; label: string }[];
  totalDuration: number;
}

interface TemporalAnalysisData {
  patterns: { type: string; interval: number; count: number }[];
  consistency: string;
  anomalyRegions: { start: number; end: number }[];
}

interface DetailedAnalysisData {
  spectralFeatures: { name: string; value: string }[];
  structuralMetrics: { name: string; value: string }[];
  observations: string[];
}

interface SourceComponentData {
  components: { id: string; type: string; description: string }[];
  layerCount: number;
  compositionType: string;
}

interface GeometryScanTraceData {
  scanPoints: { x: number; y: number; label: string }[];
  boundaryStatus: string;
  axisData: { axis: string; status: string }[];
  traceComplete: boolean;
}

interface ReportPreviewData {
  summary: string;
  sections: { title: string; content: string }[];
  generatedAt: string;
  fileHash: string;
}

async function computeFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function Home() {
  const { isAuthenticated } = useAuth();

  // Audio state
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDecodingAudio, setIsDecodingAudio] = useState(false);

  // Player state (React state for UI display)
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  // Verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [verificationId, setVerificationId] = useState<number | null>(null);

  // Extended analysis data
  const [timelineAnalysis, setTimelineAnalysis] = useState<TimelineAnalysisData | null>(null);
  const [temporalAnalysis, setTemporalAnalysis] = useState<TemporalAnalysisData | null>(null);
  const [detailedAnalysis, setDetailedAnalysis] = useState<DetailedAnalysisData | null>(null);
  const [sourceComponents, setSourceComponents] = useState<SourceComponentData | null>(null);
  const [geometryScanTrace, setGeometryScanTrace] = useState<GeometryScanTraceData | null>(null);
  const [reportPreview, setReportPreview] = useState<ReportPreviewData | null>(null);

  // Live Scan Console logs
  const [scanLogs, setScanLogs] = useState<ReturnType<typeof generateScanLogs>[]>([]);
  const [scanComplete, setScanComplete] = useState(false);

  // AudioRuntime ref (performance-optimized audio engine)
  const audioRuntimeRef = useRef<AudioRuntime | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Waveform visualization is now stateless - no ref needed
  
  // Time loop cleanup ref
  const timeLoopCleanupRef = useRef<(() => void) | null>(null);
  
  // Session ID for audio/waveform bindings
  const sessionIdRef = useRef<string>(crypto.randomUUID());

  // tRPC mutations
  const uploadMutation = trpc.verification.upload.useMutation();
  const createMutation = trpc.verification.create.useMutation();
  const processMutation = trpc.verification.process.useMutation();
  const getByIdQuery = trpc.verification.getById.useQuery(
    { id: verificationId! },
    { enabled: !!verificationId && isVerifying }
  );

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
      audioRuntimeRef.current?.dispose();
    };
  }, []);

  // Get codec from MIME type
  function getCodecFromType(type: string): string {
    const codecMap: Record<string, string> = {
      "audio/wav": "PCM/WAV",
      "audio/mpeg": "MP3",
      "audio/mp3": "MP3",
      "audio/flac": "FLAC",
      "audio/ogg": "OGG Vorbis",
      "audio/m4a": "AAC",
      "audio/x-m4a": "AAC",
      "audio/mp4": "AAC",
    };
    return codecMap[type] || "Unknown";
  }

  /**
   * PERFORMANCE-FIRST FILE SELECTION HANDLER
   */
  const handleFileSelect = useCallback((fileInfo: AudioFileInfo) => {
    sessionIdRef.current = crypto.randomUUID();
    
    // Stop any current playback
    if (audioRuntimeRef.current) {
      audioRuntimeRef.current.reset();
    }
    if (timeLoopCleanupRef.current) {
      timeLoopCleanupRef.current();
      timeLoopCleanupRef.current = null;
    }
    
    // Reset all state
    setAudioBuffer(null);
    setVerificationResult(null);
    setVerificationId(null);
    setTimelineAnalysis(null);
    setTemporalAnalysis(null);
    setDetailedAnalysis(null);
    setSourceComponents(null);
    setGeometryScanTrace(null);
    setReportPreview(null);
    setScanLogs([]);
    setScanComplete(false);
    setIsPlaying(false);
    setCurrentTime(0);
    
    setSelectedFile(fileInfo.file);
    setIsDecodingAudio(true);
    
    // Set preliminary metadata
    setMetadata({
      fileName: fileInfo.name,
      duration: fileInfo.duration ? fileInfo.duration * 1000 : null,
      sampleRate: fileInfo.sampleRate,
      bitDepth: null,
      channels: null,
      codec: getCodecFromType(fileInfo.type),
      fileHash: null,
      fileSize: fileInfo.size,
    });
    
    if (fileInfo.duration) {
      setDuration(fileInfo.duration);
    }
    
    // Async audio decoding
    (async () => {
      try {
        const hashPromise = computeFileHash(fileInfo.file);
        
        const audioContext = audioContextRef.current || new AudioContext();
        if (!audioContextRef.current) {
          audioContextRef.current = audioContext;
          audioRuntimeRef.current = new AudioRuntime(audioContext);
        }
        
        const arrayBuffer = await fileInfo.file.arrayBuffer();
        const buffer = await audioContext.decodeAudioData(arrayBuffer);
        const hash = await hashPromise;
        
        setAudioBuffer(buffer);
        setDuration(buffer.duration);
        setMetadata({
          fileName: fileInfo.name,
          duration: buffer.duration * 1000,
          sampleRate: buffer.sampleRate,
          bitDepth: 16,
          channels: buffer.numberOfChannels,
          codec: getCodecFromType(fileInfo.type),
          fileHash: hash,
          fileSize: fileInfo.size,
        });
      } catch {
        const hash = await computeFileHash(fileInfo.file).catch(() => null);
        setMetadata(prev => prev ? { ...prev, fileHash: hash } : null);
      } finally {
        setIsDecodingAudio(false);
      }
    })();
  }, []);

  /**
   * PERFORMANCE-OPTIMIZED PLAYBACK CONTROLS
   * Using AudioRuntime class for audio management
   */
  
  const startPlayback = useCallback(() => {
    if (!audioBuffer || !audioRuntimeRef.current) return;
    
    // Immediate UI update
    setIsPlaying(true);
    
    // Start audio playback
    audioRuntimeRef.current.play(audioBuffer);
    
    // Start dual time loop: fast (playhead) + slow (React state)
    timeLoopCleanupRef.current = startDualTimeLoop(
      audioRuntimeRef.current,
      duration,
      // Fast callback: no-op (playhead now controlled by currentTime prop)
      () => {},
      // Slow callback: update React state (every 100ms)
      (t) => {
        setCurrentTime(t);
      },
      100 // Update React state every 100ms
    );
  }, [audioBuffer, duration]);

  const pausePlayback = useCallback(() => {
    // Immediate UI update
    setIsPlaying(false);
    
    // Stop time loop
    if (timeLoopCleanupRef.current) {
      timeLoopCleanupRef.current();
      timeLoopCleanupRef.current = null;
    }
    
    // Pause audio
    if (audioRuntimeRef.current) {
      const time = audioRuntimeRef.current.getCurrentTime();
      audioRuntimeRef.current.pause();
      setCurrentTime(time);
    }
  }, []);

  const stopPlayback = useCallback(() => {
    // Immediate UI update
    setIsPlaying(false);
    setCurrentTime(0);
    
    // Stop time loop
    if (timeLoopCleanupRef.current) {
      timeLoopCleanupRef.current();
      timeLoopCleanupRef.current = null;
    }
    
    // Reset audio
    if (audioRuntimeRef.current) {
      audioRuntimeRef.current.reset();
    }
    
    // Playhead is now controlled by currentTime prop
  }, []);

  const seekBackward = useCallback(() => {
    const newTime = Math.max(0, currentTime - 10);
    setCurrentTime(newTime);
    
    if (audioRuntimeRef.current && audioBuffer) {
      audioRuntimeRef.current.seek(newTime, audioBuffer);
    }
  }, [currentTime, audioBuffer]);

  const seekForward = useCallback(() => {
    const newTime = Math.min(duration, currentTime + 10);
    setCurrentTime(newTime);
    
    if (audioRuntimeRef.current && audioBuffer) {
      audioRuntimeRef.current.seek(newTime, audioBuffer);
    }
  }, [currentTime, duration, audioBuffer]);

  /**
   * PERFORMANCE-FIRST SEEK HANDLER
   */
  const handleSeek = useCallback(
    (time: number) => {
      const clampedTime = Math.max(0, Math.min(time, duration));
      
      // Immediate UI update - playhead controlled by currentTime prop
      setCurrentTime(clampedTime);
      
      // Seek audio
      if (audioRuntimeRef.current && audioBuffer) {
        audioRuntimeRef.current.seek(clampedTime, audioBuffer);
      }
    },
    [duration, audioBuffer]
  );

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (audioRuntimeRef.current) {
      audioRuntimeRef.current.setVolume(newVolume);
    }
  }, []);

  /**
   * VERIFICATION HANDLER
   */
  const handleVerify = useCallback(async () => {
    if (!selectedFile || !metadata) return;
    
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
      setScanLogs(prev => [...prev, log]);
    }
    
    try {
      // Upload file
      const formData = new FormData();
      formData.append("file", selectedFile);
      
      // Convert file to base64 for upload
      const arrayBuffer = await selectedFile.arrayBuffer();
      const base64Data = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      
      const uploadResult = await uploadMutation.mutateAsync({
        fileName: metadata.fileName,
        fileData: base64Data,
        contentType: selectedFile.type,
      });
      
      // Create verification record
      const verification = await createMutation.mutateAsync({
        fileName: metadata.fileName,
        fileSize: metadata.fileSize,
        fileUrl: uploadResult.url,
        fileKey: uploadResult.fileKey,
        duration: metadata.duration || undefined,
        sampleRate: metadata.sampleRate || undefined,
        bitDepth: metadata.bitDepth || undefined,
        channels: metadata.channels || undefined,
        codec: metadata.codec || undefined,
        fileHash: metadata.fileHash || undefined,
      });
      
      setVerificationId(verification.id);
      
      // Process verification
      const result = await processMutation.mutateAsync({
        id: verification.id,
      });
      
      // Update result - convert to VerdictResult format
      const verdictText = result.verdict === "observed" 
        ? "AI signal evidence was observed." as const
        : result.verdict === "not_observed"
        ? "AI signal evidence was not observed." as const
        : null;
      
      setVerificationResult({
        verdict: verdictText ? {
          verdict: verdictText,
          authority: "CR-G" as const,
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
  }, [selectedFile, metadata, uploadMutation, createMutation, processMutation]);

  // Poll for verification result
  useEffect(() => {
    if (getByIdQuery.data && isVerifying) {
      const data = getByIdQuery.data;
      if (data.status === "completed") {
        // Convert to VerdictResult format
        const verdictText = data.verdict === "observed" 
          ? "AI signal evidence was observed." as const
          : data.verdict === "not_observed"
          ? "AI signal evidence was not observed." as const
          : null;
        
        setVerificationResult({
          verdict: verdictText ? {
            verdict: verdictText,
            authority: "CR-G" as const,
            exceeded_axes: data.primaryExceededAxis ? [data.primaryExceededAxis] : [],
          } : null,
          crgStatus: data.crgStatus,
          primaryExceededAxis: data.primaryExceededAxis,
          timelineMarkers: [],
        });
        setIsVerifying(false);
        setScanComplete(true);
      }
    }
  }, [getByIdQuery.data, isVerifying]);

  return (
    <ForensicLayout>
      {/* Top section - Upload, Metadata, Waveform */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Upload and Metadata */}
        <div className="flex flex-col gap-6">
          <AudioUploadPanel
            onFileSelect={handleFileSelect}
            onVerify={handleVerify}
            isVerifying={isVerifying}
            disabled={false}
          />
          <div className="flex-1 min-h-[200px]">
            <MetadataPanel metadata={metadata} />
          </div>
        </div>

        {/* Center column - Waveform, Player, and Live Scan Console */}
        <div className="lg:col-span-2 flex flex-col gap-0">
          <WaveformVisualization
            audioBuffer={audioBuffer}
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            isDecoding={isDecodingAudio}
          />
          <AudioPlayerBar
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            onPlay={startPlayback}
            onPause={pausePlayback}
            onStop={stopPlayback}
            onSeekBackward={seekBackward}
            onSeekForward={seekForward}
            onVolumeChange={handleVolumeChange}
            disabled={!audioBuffer}
          />
          <div className="flex-1 min-h-[160px]">
            <LiveScanConsole
              isVerifying={isVerifying}
              isComplete={scanComplete}
              logs={scanLogs}
            />
          </div>
        </div>
      </div>

      {/* Verdict Panel */}
      <div className="mt-6">
        <VerdictPanel
          verdict={verificationResult?.verdict ?? null}
          isProcessing={isVerifying}
        />
      </div>

      {/* Extended analysis sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="flex flex-col gap-6">
          <TimelineAnalysis
            data={timelineAnalysis}
            isProcessing={isVerifying}
          />
          <TemporalAnalysis
            data={temporalAnalysis}
            isProcessing={isVerifying}
          />
          <DetailedAnalysis
            data={detailedAnalysis}
            isProcessing={isVerifying}
          />
        </div>

        <div className="lg:col-span-2 flex flex-col justify-end">
          <SourceComponents
            data={sourceComponents}
            isProcessing={isVerifying}
          />
        </div>
      </div>

      {/* Geometry & Timeline Context */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <GeometryScanTrace
            data={geometryScanTrace}
            isProcessing={isVerifying}
            expanded={true}
          />
        </div>
        <TimelineContext
          markers={verificationResult?.timelineMarkers || []}
          duration={duration}
        />
      </div>

      {/* Report Preview & Export */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <ReportPreview
          verdict={verificationResult?.verdict ?? null}
          crgStatus={verificationResult?.crgStatus ?? null}
          primaryExceededAxis={verificationResult?.primaryExceededAxis ?? null}
          fileName={metadata?.fileName ?? null}
          fileHash={metadata?.fileHash ?? null}
          isProcessing={isVerifying}
        />
        <ExportPanel
          data={metadata && verificationResult ? {
            fileName: metadata.fileName,
            fileSize: metadata.fileSize,
            duration: metadata.duration,
            sampleRate: metadata.sampleRate,
            bitDepth: metadata.bitDepth,
            channels: metadata.channels,
            codec: metadata.codec,
            fileHash: metadata.fileHash,
            verdict: verificationResult.verdict,
            crgStatus: verificationResult.crgStatus,
            primaryExceededAxis: verificationResult.primaryExceededAxis,
            timelineMarkers: verificationResult.timelineMarkers,
            analysisTimestamp: new Date().toISOString(),
          } : null}
          disabled={!verificationResult}
        />
      </div>
    </ForensicLayout>
  );
}
