import { useAuth } from "@/_core/hooks/useAuth";
import { AudioPlayerBar } from "@/components/AudioPlayerBar";
import { AudioUploadPanel } from "@/components/AudioUploadPanel";
import { ExportPanel } from "@/components/ExportPanel";
import { ForensicLayout } from "@/components/ForensicLayout";
import { MetadataPanel } from "@/components/MetadataPanel";
import { TimelineContext } from "@/components/TimelineContext";
import { VerdictPanel } from "@/components/VerdictPanel";
import { WaveformVisualization } from "@/components/WaveformVisualization";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

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

// SHA-256 hash function
async function computeFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function Home() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();

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
    // Reset state
    stopPlayback();
    setVerificationResult(null);
    setVerificationId(null);

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
        duration: buffer.duration * 1000, // Convert to ms
        sampleRate: buffer.sampleRate,
        bitDepth: 16, // Default assumption
        channels: buffer.numberOfChannels,
        codec: getCodecFromType(fileInfo.type),
        fileHash: hash,
        fileSize: fileInfo.size,
      });

      audioContextRef.current = audioContext;
    } catch {
      // If decoding fails
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

    // Create nodes
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;

    const gain = ctx.createGain();
    gain.gain.value = volume;

    source.connect(gain);
    gain.connect(ctx.destination);

    // Start from pause position
    const offset = pauseTimeRef.current;
    source.start(0, offset);

    sourceNodeRef.current = source;
    gainNodeRef.current = gain;
    startTimeRef.current = ctx.currentTime - offset;

    setIsPlaying(true);

    // Update time
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

  // Verification
  const handleVerify = useCallback(async () => {
    if (!selectedFile || !metadata) return;

    setIsVerifying(true);
    setVerificationResult(null);

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

      // Create verification record
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
      }
    } catch (error) {
      console.error("Verification failed:", error);
    } finally {
      setIsVerifying(false);
    }
  }, [selectedFile, metadata, uploadMutation, createMutation, processMutation, getByIdQuery]);

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

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <ForensicLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <LogIn className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Authentication Required
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Sign in to access the audio verification workspace and analyze your files.
          </p>
          <Button
            size="lg"
            onClick={() => (window.location.href = getLoginUrl())}
          >
            Sign In to Continue
          </Button>
        </div>
      </ForensicLayout>
    );
  }

  return (
    <ForensicLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Upload and Metadata */}
        <div className="space-y-6">
          <AudioUploadPanel
            onFileSelect={handleFileSelect}
            onVerify={handleVerify}
            isVerifying={isVerifying}
            disabled={!isAuthenticated}
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

      {/* Results section */}
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
        <ExportPanel data={exportData} disabled={isVerifying} />
      </div>
    </ForensicLayout>
  );
}
