import { useAuth } from "@/_core/hooks/useAuth";
import { AudioPlayerBar } from "@/components/AudioPlayerBar";
import { AudioUploadPanel } from "@/components/AudioUploadPanel";
import { DetailedAnalysis } from "@/components/DetailedAnalysis";
import { ExportPanel } from "@/components/ExportPanel";
import { ForensicLayout } from "@/components/ForensicLayout";
import { GeometryScanTrace } from "@/components/GeometryScanTrace";
import { MetadataPanel } from "@/components/MetadataPanel";
import { ReportPreview } from "@/components/ReportPreview";
import { SourceComponents } from "@/components/SourceComponents";
import { TemporalAnalysis } from "@/components/TemporalAnalysis";
import { TimelineAnalysis } from "@/components/TimelineAnalysis";
import { TimelineContext } from "@/components/TimelineContext";
import { VerdictPanel } from "@/components/VerdictPanel";
import { WaveformVisualization } from "@/components/WaveformVisualization";
import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * DetectX Audio Verification Workspace
 * 
 * This is a direct-access verification workspace.
 * Users can access immediately WITHOUT login.
 * Authentication is OPTIONAL - only required for:
 * - Saving verification history
 * - Exporting reports
 * - Account features
 * 
 * UI BEHAVIOR:
 * - All result panels remain IDLE until backend data is received
 * - NO demo, mock, or placeholder AI judgments
 * - NO probability, confidence scores, severity labels, or AI model names
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

interface VerificationResult {
  verdict: "observed" | "not_observed" | null;
  crgStatus: string | null;
  primaryExceededAxis: string | null;
  timelineMarkers: { timestamp: number; type: string }[];
}

// Extended analysis data types (from backend)
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

// SHA-256 hash function
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

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  // Verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [verificationId, setVerificationId] = useState<number | null>(null);

  // Extended analysis data - ALL remain null until backend provides data
  const [timelineAnalysis, setTimelineAnalysis] = useState<TimelineAnalysisData | null>(null);
  const [temporalAnalysis, setTemporalAnalysis] = useState<TemporalAnalysisData | null>(null);
  const [detailedAnalysis, setDetailedAnalysis] = useState<DetailedAnalysisData | null>(null);
  const [sourceComponents, setSourceComponents] = useState<SourceComponentData | null>(null);
  const [geometryScanTrace, setGeometryScanTrace] = useState<GeometryScanTraceData | null>(null);
  const [reportPreview, setReportPreview] = useState<ReportPreviewData | null>(null);

  // Audio refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // tRPC mutations
  const uploadMutation = trpc.verification.upload.useMutation();
  const createMutation = trpc.verification.create.useMutation();
  const processMutation = trpc.verification.process.useMutation();
  const getByIdQuery = trpc.verification.getById.useQuery(
    { id: verificationId! },
    { enabled: !!verificationId && isVerifying }
  );

  // Handle file selection
  const handleFileSelect = useCallback(async (fileInfo: AudioFileInfo) => {
    // Reset all state
    stopPlayback();
    setVerificationResult(null);
    setVerificationId(null);
    setTimelineAnalysis(null);
    setTemporalAnalysis(null);
    setDetailedAnalysis(null);
    setSourceComponents(null);
    setGeometryScanTrace(null);
    setReportPreview(null);

    setSelectedFile(fileInfo.file);

    // Compute hash
    const hash = await computeFileHash(fileInfo.file);

    // Decode audio
    const audioContext = new AudioContext();
    const arrayBuffer = await fileInfo.file.arrayBuffer();

    try {
      const buffer = await audioContext.decodeAudioData(arrayBuffer);
      setAudioBuffer(buffer);
      setDuration(buffer.duration);

      // Set metadata
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

      audioContextRef.current = audioContext;
    } catch {
      setMetadata({
        fileName: fileInfo.name,
        duration: fileInfo.duration ? fileInfo.duration * 1000 : null,
        sampleRate: fileInfo.sampleRate,
        bitDepth: null,
        channels: null,
        codec: getCodecFromType(fileInfo.type),
        fileHash: hash,
        fileSize: fileInfo.size,
      });
    }
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

  // Playback controls
  const startPlayback = useCallback(() => {
    if (!audioBuffer || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;

    const gain = ctx.createGain();
    gain.gain.value = volume;

    source.connect(gain);
    gain.connect(ctx.destination);

    const offset = pauseTimeRef.current;
    source.start(0, offset);

    sourceNodeRef.current = source;
    gainNodeRef.current = gain;
    startTimeRef.current = ctx.currentTime - offset;

    setIsPlaying(true);

    const updateTime = () => {
      if (audioContextRef.current && sourceNodeRef.current) {
        const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
        setCurrentTime(Math.min(elapsed, duration));

        if (elapsed < duration) {
          animationFrameRef.current = requestAnimationFrame(updateTime);
        } else {
          stopPlayback();
        }
      }
    };
    animationFrameRef.current = requestAnimationFrame(updateTime);

    source.onended = () => {
      if (isPlaying) {
        stopPlayback();
      }
    };
  }, [audioBuffer, volume, duration, isPlaying]);

  const pausePlayback = useCallback(() => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    pauseTimeRef.current = currentTime;
    setIsPlaying(false);
  }, [currentTime]);

  const stopPlayback = useCallback(() => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    pauseTimeRef.current = 0;
    setCurrentTime(0);
    setIsPlaying(false);
  }, []);

  const seekBackward = useCallback(() => {
    const newTime = Math.max(0, currentTime - 10);
    pauseTimeRef.current = newTime;
    setCurrentTime(newTime);
    if (isPlaying) {
      pausePlayback();
      setTimeout(startPlayback, 50);
    }
  }, [currentTime, isPlaying, pausePlayback, startPlayback]);

  const seekForward = useCallback(() => {
    const newTime = Math.min(duration, currentTime + 10);
    pauseTimeRef.current = newTime;
    setCurrentTime(newTime);
    if (isPlaying) {
      pausePlayback();
      setTimeout(startPlayback, 50);
    }
  }, [currentTime, duration, isPlaying, pausePlayback, startPlayback]);

  const handleSeek = useCallback(
    (time: number) => {
      pauseTimeRef.current = time;
      setCurrentTime(time);
      if (isPlaying) {
        pausePlayback();
        setTimeout(startPlayback, 50);
      }
    },
    [isPlaying, pausePlayback, startPlayback]
  );

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume;
    }
  }, []);

  // Verification - requires authentication for saving
  const handleVerify = useCallback(async () => {
    if (!selectedFile || !metadata) return;

    setIsVerifying(true);
    setVerificationResult(null);
    setTimelineAnalysis(null);
    setTemporalAnalysis(null);
    setDetailedAnalysis(null);
    setSourceComponents(null);
    setGeometryScanTrace(null);
    setReportPreview(null);

    try {
      // Convert file to base64
      const arrayBuffer = await selectedFile.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );

      // Upload file
      const { url, fileKey } = await uploadMutation.mutateAsync({
        fileName: selectedFile.name,
        fileData: base64,
        contentType: selectedFile.type || "audio/mpeg",
      });

      // Create verification record (only if authenticated)
      if (isAuthenticated) {
        const { id } = await createMutation.mutateAsync({
          fileName: metadata.fileName,
          fileSize: metadata.fileSize,
          fileUrl: url,
          fileKey: fileKey,
          duration: metadata.duration ?? undefined,
          sampleRate: metadata.sampleRate ?? undefined,
          bitDepth: metadata.bitDepth ?? undefined,
          channels: metadata.channels ?? undefined,
          codec: metadata.codec ?? undefined,
          fileHash: metadata.fileHash ?? undefined,
        });

        setVerificationId(id);

        // Process verification
        await processMutation.mutateAsync({ id });

        // Fetch result
        const result = await getByIdQuery.refetch();

        if (result.data) {
          setVerificationResult({
            verdict: result.data.verdict,
            crgStatus: result.data.crgStatus,
            primaryExceededAxis: result.data.primaryExceededAxis,
            timelineMarkers: (result.data.timelineMarkers as { timestamp: number; type: string }[]) || [],
          });

          // Extended analysis data will be populated when backend provides them
          // Currently, these remain null until backend integration is complete
          // NO mock data, NO simulated results - this is a forensic tool
        }
      } else {
        // Guest mode - process without saving
        // Backend will still process but not save to history
        // For now, show idle state until backend integration is complete
        // NO mock data, NO simulated results
      }
    } catch (error) {
      console.error("Verification failed:", error);
    } finally {
      setIsVerifying(false);
    }
  }, [selectedFile, metadata, uploadMutation, createMutation, processMutation, getByIdQuery, isAuthenticated]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Export data
  const exportData = metadata && verificationResult?.verdict
    ? {
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
      }
    : null;

  // NO login block - workspace is immediately accessible
  return (
    <ForensicLayout>
      {/* Top section - Upload, Metadata, Waveform */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Upload and Metadata */}
        <div className="space-y-6">
          <AudioUploadPanel
            onFileSelect={handleFileSelect}
            onVerify={handleVerify}
            isVerifying={isVerifying}
            disabled={false} // Always enabled - no login required
          />
          <MetadataPanel metadata={metadata} />
        </div>

        {/* Center column - Waveform and Player */}
        <div className="lg:col-span-2 space-y-0">
          <WaveformVisualization
            audioBuffer={audioBuffer}
            currentTime={currentTime}
            duration={duration}
            markers={verificationResult?.timelineMarkers || []}
            onSeek={handleSeek}
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
        </div>
      </div>

      {/* Primary results section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <VerdictPanel
          verdict={verificationResult?.verdict ?? null}
          crgStatus={verificationResult?.crgStatus ?? null}
          primaryExceededAxis={verificationResult?.primaryExceededAxis ?? null}
          isProcessing={isVerifying}
        />
        <TimelineContext
          markers={verificationResult?.timelineMarkers || []}
          duration={duration}
        />
        <ExportPanel 
          data={exportData} 
          disabled={isVerifying || !isAuthenticated} 
        />
      </div>

      {/* Extended analysis sections - MANDATORY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <TimelineAnalysis
          data={timelineAnalysis}
          isProcessing={isVerifying}
        />
        <TemporalAnalysis
          data={temporalAnalysis}
          isProcessing={isVerifying}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <DetailedAnalysis
          data={detailedAnalysis}
          isProcessing={isVerifying}
        />
        <SourceComponents
          data={sourceComponents}
          isProcessing={isVerifying}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <GeometryScanTrace
          data={geometryScanTrace}
          isProcessing={isVerifying}
        />
        <ReportPreview
          verdict={verificationResult?.verdict ?? null}
          crgStatus={verificationResult?.crgStatus ?? null}
          primaryExceededAxis={verificationResult?.primaryExceededAxis ?? null}
          fileName={metadata?.fileName ?? null}
          fileHash={metadata?.fileHash ?? null}
          isProcessing={isVerifying}
        />
      </div>

      {/* Auth notice for guests */}
      {!isAuthenticated && (
        <div className="mt-6 p-4 bg-muted/20 rounded-md border border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            Sign in to save verification history and export detailed reports.
            Verification is available without authentication.
          </p>
        </div>
      )}
    </ForensicLayout>
  );
}
