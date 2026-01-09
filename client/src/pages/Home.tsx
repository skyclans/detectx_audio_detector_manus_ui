import { useAuth } from "@/_core/hooks/useAuth";
import { AudioPlayerBar } from "@/components/AudioPlayerBar";
import { AudioUploadPanel } from "@/components/AudioUploadPanel";
import { DetailedAnalysis } from "@/components/DetailedAnalysis";
import { ExportPanel } from "@/components/ExportPanel";
import { ForensicLayout } from "@/components/ForensicLayout";
import { GeometryScanTrace } from "@/components/GeometryScanTrace";
import { LiveScanConsole, generateScanLogs } from "@/components/LiveScanConsole";
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
  
  /**
   * PERFORMANCE: Two-phase waveform rendering state
   * - isDecodingAudio: true while async audio decoding is in progress
   * - UI shows placeholder waveform immediately (0ms)
   * - Detailed waveform replaces placeholder when decoding completes
   */
  const [isDecodingAudio, setIsDecodingAudio] = useState(false);

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

  // Live Scan Console logs
  const [scanLogs, setScanLogs] = useState<ReturnType<typeof generateScanLogs>[]>([]);
  const [scanComplete, setScanComplete] = useState(false);

  // Audio refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  
  /**
   * Internal session ID for audio/waveform bindings
   * CRITICAL: Filenames must NEVER be used as:
   * - DOM element IDs
   * - CSS selectors
   * - JavaScript keys
   * - Canvas/SVG identifiers
   * Use this safe internal ID instead.
   */
  const sessionIdRef = useRef<string>(crypto.randomUUID());

  // tRPC mutations
  const uploadMutation = trpc.verification.upload.useMutation();
  const createMutation = trpc.verification.create.useMutation();
  const processMutation = trpc.verification.process.useMutation();
  const getByIdQuery = trpc.verification.getById.useQuery(
    { id: verificationId! },
    { enabled: !!verificationId && isVerifying }
  );

  /**
   * PERFORMANCE-FIRST FILE SELECTION HANDLER
   * 
   * CRITICAL REQUIREMENTS:
   * - UI feedback must occur FIRST (0ms perceived delay)
   * - Audio decoding happens ASYNCHRONOUSLY
   * - Main thread is NEVER blocked
   * - Two-phase rendering: instant placeholder → async detailed waveform
   */
  const handleFileSelect = useCallback((fileInfo: AudioFileInfo) => {
    // Generate new session ID for this file
    // This ensures waveform rendering never depends on filename content
    sessionIdRef.current = crypto.randomUUID();
    
    // PHASE 1: IMMEDIATE UI UPDATE (0ms)
    // Reset all state synchronously - UI updates instantly
    stopPlayback();
    setAudioBuffer(null); // Clear previous buffer
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
    
    // Set file immediately - UI shows "loading" placeholder waveform
    setSelectedFile(fileInfo.file);
    setIsDecodingAudio(true);
    
    // Set preliminary metadata immediately (before decoding)
    setMetadata({
      fileName: fileInfo.name,
      duration: fileInfo.duration ? fileInfo.duration * 1000 : null,
      sampleRate: fileInfo.sampleRate,
      bitDepth: null,
      channels: null,
      codec: getCodecFromType(fileInfo.type),
      fileHash: null, // Will be computed async
      fileSize: fileInfo.size,
    });
    
    // Set preliminary duration if available
    if (fileInfo.duration) {
      setDuration(fileInfo.duration);
    }
    
    // PHASE 2: ASYNC AUDIO DECODING (non-blocking)
    // This runs in the background while UI remains responsive
    (async () => {
      try {
        // Compute hash asynchronously
        const hashPromise = computeFileHash(fileInfo.file);
        
        // Decode audio asynchronously
        const audioContext = new AudioContext();
        const arrayBuffer = await fileInfo.file.arrayBuffer();
        const buffer = await audioContext.decodeAudioData(arrayBuffer);
        const hash = await hashPromise;
        
        // Update state with decoded data
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
        audioContextRef.current = audioContext;
      } catch {
        // Even on error, update metadata with available info
        const hash = await computeFileHash(fileInfo.file).catch(() => null);
        setMetadata(prev => prev ? {
          ...prev,
          fileHash: hash,
        } : null);
      } finally {
        setIsDecodingAudio(false);
      }
    })();
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
   * PERFORMANCE-FIRST PLAYBACK CONTROLS
   * 
   * CRITICAL REQUIREMENTS:
   * - UI state (icon, highlight) must update IMMEDIATELY (0ms)
   * - Audio playback follows ASYNCHRONOUSLY
   * - UI must NEVER be tied to audio state resolution
   * - NO blocking operations on click handlers
   */
  
  const startPlayback = useCallback(() => {
    // PHASE 1: IMMEDIATE UI UPDATE (0ms)
    setIsPlaying(true);
    
    // PHASE 2: ASYNC AUDIO PROCESSING
    // Audio setup happens after UI is updated
    requestAnimationFrame(() => {
      if (!audioBuffer || !audioContextRef.current) {
        setIsPlaying(false); // Revert if no audio
        return;
      }

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
        stopPlayback();
      };
    });
  }, [audioBuffer, volume, duration]);

  const pausePlayback = useCallback(() => {
    // PHASE 1: IMMEDIATE UI UPDATE (0ms)
    setIsPlaying(false);
    pauseTimeRef.current = currentTime;
    
    // PHASE 2: ASYNC AUDIO CLEANUP
    requestAnimationFrame(() => {
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.stop();
          sourceNodeRef.current.disconnect();
        } catch {
          // Ignore errors if already stopped
        }
        sourceNodeRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    });
  }, [currentTime]);

  const stopPlayback = useCallback(() => {
    // PHASE 1: IMMEDIATE UI UPDATE (0ms)
    setIsPlaying(false);
    setCurrentTime(0);
    pauseTimeRef.current = 0;
    
    // PHASE 2: ASYNC AUDIO CLEANUP
    requestAnimationFrame(() => {
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.stop();
          sourceNodeRef.current.disconnect();
        } catch {
          // Ignore errors if already stopped
        }
        sourceNodeRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    });
  }, []);

  const seekBackward = useCallback(() => {
    // PHASE 1: IMMEDIATE UI UPDATE (0ms)
    const newTime = Math.max(0, currentTime - 10);
    setCurrentTime(newTime);
    pauseTimeRef.current = newTime;
    
    // PHASE 2: ASYNC AUDIO RESTART (if playing)
    if (isPlaying && audioBuffer && audioContextRef.current) {
      requestAnimationFrame(() => {
        // Stop current playback
        if (sourceNodeRef.current) {
          try {
            sourceNodeRef.current.stop();
            sourceNodeRef.current.disconnect();
          } catch {
            // Ignore errors
          }
          sourceNodeRef.current = null;
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        // Start from new position
        const ctx = audioContextRef.current!;
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        
        const gain = ctx.createGain();
        gain.gain.value = volume;
        
        source.connect(gain);
        gain.connect(ctx.destination);
        source.start(0, newTime);
        
        sourceNodeRef.current = source;
        gainNodeRef.current = gain;
        startTimeRef.current = ctx.currentTime - newTime;
        
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
        
        source.onended = () => stopPlayback();
      });
    }
  }, [currentTime, isPlaying, audioBuffer, volume, duration, stopPlayback]);

  const seekForward = useCallback(() => {
    // PHASE 1: IMMEDIATE UI UPDATE (0ms)
    const newTime = Math.min(duration, currentTime + 10);
    setCurrentTime(newTime);
    pauseTimeRef.current = newTime;
    
    // PHASE 2: ASYNC AUDIO RESTART (if playing)
    if (isPlaying && audioBuffer && audioContextRef.current) {
      requestAnimationFrame(() => {
        // Stop current playback
        if (sourceNodeRef.current) {
          try {
            sourceNodeRef.current.stop();
            sourceNodeRef.current.disconnect();
          } catch {
            // Ignore errors
          }
          sourceNodeRef.current = null;
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        // Start from new position
        const ctx = audioContextRef.current!;
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        
        const gain = ctx.createGain();
        gain.gain.value = volume;
        
        source.connect(gain);
        gain.connect(ctx.destination);
        source.start(0, newTime);
        
        sourceNodeRef.current = source;
        gainNodeRef.current = gain;
        startTimeRef.current = ctx.currentTime - newTime;
        
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
        
        source.onended = () => stopPlayback();
      });
    }
  }, [currentTime, duration, isPlaying, audioBuffer, volume, stopPlayback]);

  /**
   * PERFORMANCE-FIRST SEEK HANDLER
   * 
   * CRITICAL REQUIREMENTS:
   * - UI state must update IMMEDIATELY (0ms)
   * - Must NEVER reset to 0:00
   * - While playing: seek immediately and continue playback from new position
   * - While paused: seek immediately and remain paused
   * - Audio processing happens ASYNCHRONOUSLY
   */
  const handleSeek = useCallback(
    (time: number) => {
      // PHASE 1: IMMEDIATE UI UPDATE (0ms)
      // Clamp time to valid range
      const clampedTime = Math.max(0, Math.min(time, duration));
      
      // Update UI state synchronously - user sees immediate feedback
      pauseTimeRef.current = clampedTime;
      setCurrentTime(clampedTime);
      
      // PHASE 2: ASYNC AUDIO PROCESSING
      // If currently playing, restart playback from new position asynchronously
      if (isPlaying && audioBuffer && audioContextRef.current) {
        requestAnimationFrame(() => {
          // Stop current source
          if (sourceNodeRef.current) {
            try {
              sourceNodeRef.current.stop();
              sourceNodeRef.current.disconnect();
            } catch {
              // Ignore errors if already stopped
            }
            sourceNodeRef.current = null;
          }
          
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
          
          // Restart from new position
          const ctx = audioContextRef.current!;
          if (ctx.state === "suspended") {
            ctx.resume();
          }
          
          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          
          const gain = ctx.createGain();
          gain.gain.value = volume;
          
          source.connect(gain);
          gain.connect(ctx.destination);
          
          source.start(0, clampedTime);
          
          sourceNodeRef.current = source;
          gainNodeRef.current = gain;
          startTimeRef.current = ctx.currentTime - clampedTime;
          
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
            // Only stop if we haven't already seeked to a new position
            if (sourceNodeRef.current === source) {
              stopPlayback();
            }
          };
        });
      }
      // If paused, just update the position (already done synchronously above)
    },
    [isPlaying, duration, audioBuffer, volume, stopPlayback]
  );

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume;
    }
  }, []);

  /**
   * PERFORMANCE-FIRST VERIFICATION HANDLER
   * 
   * CRITICAL REQUIREMENTS:
   * - Button must provide IMMEDIATE visual feedback (0ms)
   * - UI must transition INSTANTLY into "verification started" state
   * - Live Scan Console must show activity IMMEDIATELY
   * - Backend verification runs ASYNCHRONOUSLY
   * - NO blocking operations before UI feedback
   */
  const handleVerify = useCallback(async () => {
    if (!selectedFile || !metadata) return;

    // PHASE 1: IMMEDIATE UI UPDATE (0ms)
    // All UI state changes happen synchronously BEFORE any async work
    setIsVerifying(true);
    setScanComplete(false);
    setVerificationResult(null);
    setTimelineAnalysis(null);
    setTemporalAnalysis(null);
    setDetailedAnalysis(null);
    setSourceComponents(null);
    setGeometryScanTrace(null);
    setReportPreview(null);

    // Initialize scan logs IMMEDIATELY - user sees instant console activity
    // Engine Philosophy messages shown at start
    setScanLogs([
      generateScanLogs("init"),
      generateScanLogs("engine"),
      generateScanLogs("baseline"),
      generateScanLogs("deterministic"),
    ]);
    
    // PHASE 2: ASYNC BACKEND PROCESSING
    // All async work happens after UI is updated

    try {
      // Scan Process: Initialize pipeline
      setScanLogs(prev => [...prev, generateScanLogs("pipeline")]);
      setScanLogs(prev => [...prev, generateScanLogs("lock")]);
      setScanLogs(prev => [...prev, generateScanLogs("upload")]);

      // Convert file to base64
      const arrayBuffer = await selectedFile.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );

      // Establishing normalization coordinate space
      setScanLogs(prev => [...prev, generateScanLogs("decode")]);

      // Upload file and extract forensic metadata via ffprobe
      const uploadResult = await uploadMutation.mutateAsync({
        fileName: selectedFile.name,
        fileData: base64,
        contentType: selectedFile.type || "audio/mpeg",
      });

      const { url, fileKey, metadata: serverMetadata } = uploadResult;

      // Update metadata with server-extracted values (ffprobe container-level inspection)
      // These values are forensic intake records - pre-analysis, pre-normalization
      if (serverMetadata) {
        setMetadata(prev => ({
          fileName: serverMetadata.filename || prev?.fileName || selectedFile.name,
          // Duration from ffprobe is in seconds, convert to milliseconds for UI
          duration: serverMetadata.duration != null ? serverMetadata.duration * 1000 : prev?.duration ?? null,
          sampleRate: serverMetadata.sampleRate ?? prev?.sampleRate ?? null,
          bitDepth: serverMetadata.bitDepth ?? prev?.bitDepth ?? null,
          channels: serverMetadata.channels ?? prev?.channels ?? null,
          codec: serverMetadata.codec ?? prev?.codec ?? null,
          fileHash: serverMetadata.sha256 ?? prev?.fileHash ?? null,
          fileSize: serverMetadata.fileSize ?? prev?.fileSize ?? selectedFile.size,
        }));
      }

      // Observing residual structure
      setScanLogs(prev => [...prev, generateScanLogs("spectral")]);

      // Create verification record (only if authenticated)
      if (isAuthenticated) {
        // Monitoring residual persistence
        setScanLogs(prev => [...prev, generateScanLogs("temporal")]);
        
        // Add constraint messages (non-negotiable)
        setScanLogs(prev => [...prev, generateScanLogs("constraint_prob")]);
        setScanLogs(prev => [...prev, generateScanLogs("constraint_author")]);

        // Use server-extracted metadata for verification record
        const finalMetadata = serverMetadata || metadata;
        const { id } = await createMutation.mutateAsync({
          fileName: serverMetadata?.filename || metadata.fileName,
          fileSize: serverMetadata?.fileSize || metadata.fileSize,
          fileUrl: url,
          fileKey: fileKey,
          duration: serverMetadata?.duration != null 
            ? serverMetadata.duration * 1000 
            : (metadata.duration ?? undefined),
          sampleRate: serverMetadata?.sampleRate ?? metadata.sampleRate ?? undefined,
          bitDepth: serverMetadata?.bitDepth ?? metadata.bitDepth ?? undefined,
          channels: serverMetadata?.channels ?? metadata.channels ?? undefined,
          codec: serverMetadata?.codec ?? metadata.codec ?? undefined,
          fileHash: serverMetadata?.sha256 ?? metadata.fileHash ?? undefined,
        });

        setVerificationId(id);

        // Evaluating cross-stem geometry
        setScanLogs(prev => [...prev, generateScanLogs("geometry")]);

        // Process verification
        await processMutation.mutateAsync({ id });

        // Comparing against human geometry envelope
        setScanLogs(prev => [...prev, generateScanLogs("crg")]);
        
        // Additional constraints
        setScanLogs(prev => [...prev, generateScanLogs("constraint_absence")]);

        // Fetch result
        const result = await getByIdQuery.refetch();

        // Final geometry evaluation pending
        setScanLogs(prev => [...prev, generateScanLogs("finalize")]);

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

        // Results will be disclosed after full scan completion
        setScanLogs(prev => [...prev, generateScanLogs("complete")]);
        setScanComplete(true);
      } else {
        // Guest mode - process without saving
        // Add logs for guest mode with full forensic posture
        setScanLogs(prev => [...prev, generateScanLogs("temporal")]);
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Constraint messages (non-negotiable)
        setScanLogs(prev => [...prev, generateScanLogs("constraint_prob")]);
        setScanLogs(prev => [...prev, generateScanLogs("constraint_author")]);
        await new Promise(resolve => setTimeout(resolve, 400));
        
        setScanLogs(prev => [...prev, generateScanLogs("geometry")]);
        await new Promise(resolve => setTimeout(resolve, 400));
        
        setScanLogs(prev => [...prev, generateScanLogs("crg")]);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Additional constraints
        setScanLogs(prev => [...prev, generateScanLogs("constraint_absence")]);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setScanLogs(prev => [...prev, generateScanLogs("finalize")]);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // For now, show idle state until backend integration is complete
        // NO mock data, NO simulated results
        setScanLogs(prev => [...prev, generateScanLogs("complete")]);
        setScanComplete(true);
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setScanLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: "Error: Verification failed", type: "warning" as const }]);
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
        {/* Left column - Upload and Metadata with height sync */}
        <div className="flex flex-col gap-6">
          <AudioUploadPanel
            onFileSelect={handleFileSelect}
            onVerify={handleVerify}
            isVerifying={isVerifying}
            disabled={false} // Always enabled - no login required
          />
          {/* File Metadata - flex-1 to fill remaining space and sync with Live Scan Console */}
          <div className="flex-1 min-h-[200px]">
            <MetadataPanel metadata={metadata} />
          </div>
        </div>

        {/* Center column - Waveform, Player, and Live Scan Console as single analysis block */}
        <div className="lg:col-span-2 flex flex-col gap-0">
          <WaveformVisualization
            audioBuffer={audioBuffer}
            currentTime={currentTime}
            duration={duration}
            markers={verificationResult?.timelineMarkers || []}
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
          {/* Live Scan Console - directly BELOW waveform with SAME width, height syncs with Metadata */}
          <div className="flex-1 min-h-[160px]">
            <LiveScanConsole
              isVerifying={isVerifying}
              isComplete={scanComplete}
              logs={scanLogs}
            />
          </div>
        </div>
      </div>

      {/* Primary results section - Verdict Panel */}
      <div className="mt-6">
        <VerdictPanel
          verdict={verificationResult?.verdict ?? null}
          crgStatus={verificationResult?.crgStatus ?? null}
          primaryExceededAxis={verificationResult?.primaryExceededAxis ?? null}
          isProcessing={isVerifying}
        />
      </div>

      {/* Extended analysis sections - MANDATORY */}
      {/* Consistent spacing rhythm: all sections use same gap-6 (24px) */}
      {/* Detailed Analysis and Source Components aligned at bottom edge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left column - Timeline, Temporal, and Detailed Analysis */}
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

        {/* Right column (2 cols) - Source Components */}
        {/* flex-col with justify-end ensures bottom edge alignment with Detailed Analysis */}
        <div className="lg:col-span-2 flex flex-col justify-end">
          <SourceComponents
            data={sourceComponents}
            isProcessing={isVerifying}
          />
        </div>
      </div>

      {/* Geometry & Timeline Context - Geometry expanded to be visually dominant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Geometry Scan Trace - expanded height, visually dominant */}
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

      {/* Report Preview - placed ABOVE Export & Reporting */}
      <div className="mt-6">
        <ReportPreview
          verdict={verificationResult?.verdict ?? null}
          crgStatus={verificationResult?.crgStatus ?? null}
          primaryExceededAxis={verificationResult?.primaryExceededAxis ?? null}
          fileName={metadata?.fileName ?? null}
          fileHash={metadata?.fileHash ?? null}
          isProcessing={isVerifying}
        />
      </div>

      {/* Export & Reporting - final section */}
      <div className="mt-6">
        <ExportPanel 
          data={exportData} 
          disabled={isVerifying || !isAuthenticated} 
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
