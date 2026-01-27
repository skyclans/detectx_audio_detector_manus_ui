/**
 * StemWaveformPlayer - Individual stem audio player with waveform visualization
 *
 * Features:
 * - Load audio from URL and decode
 * - Waveform visualization
 * - Playback controls (play/pause/stop)
 * - Click to seek
 * - Volume control
 */

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Download,
  Loader2,
} from "lucide-react";

interface StemWaveformPlayerProps {
  /** Stem identifier (vocals, drums, bass, other) */
  stemId: string;
  /** Display name */
  name: string;
  /** Download URL for the stem audio */
  downloadUrl: string | null;
  /** Color theme for this stem */
  color: {
    bg: string;
    text: string;
    border: string;
    waveform: string;
  };
  /** Callback when download button is clicked */
  onDownload?: () => void;
  /** Whether this stem is available */
  available: boolean;
  /** Auto-load audio on mount (no click required) */
  autoLoad?: boolean;
}

/**
 * Format time in MM:SS.ms format
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins}:${secs.toString().padStart(2, "0")}.${ms}`;
}

/**
 * Format time in short MM:SS format
 */
function formatTimeShort(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function StemWaveformPlayer({
  stemId,
  name,
  downloadUrl,
  color,
  onDownload,
  available,
  autoLoad = false,
}: StemWaveformPlayerProps) {
  // Audio state
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const startTimeRef = useRef(0);
  const offsetRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Initialize audio context
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (sourceRef.current) {
        try {
          sourceRef.current.stop();
          sourceRef.current.disconnect();
        } catch {}
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Observe container size changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Auto-load audio on mount if autoLoad is true
  useEffect(() => {
    if (autoLoad && available && downloadUrl && !audioBuffer && !isLoading) {
      loadAudio();
    }
  }, [autoLoad, available, downloadUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load audio from URL
  const loadAudio = useCallback(async () => {
    if (!downloadUrl || !available) return;

    setIsLoading(true);
    setLoadError(null);

    try {
      // Create audio context if needed
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
        gainRef.current = audioContextRef.current.createGain();
        gainRef.current.connect(audioContextRef.current.destination);
        gainRef.current.gain.value = volume;
      }

      // Fetch audio file
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Failed to load audio: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

      setAudioBuffer(buffer);
      setLoadError(null);
    } catch (error) {
      console.error('Failed to load stem audio:', error);
      setLoadError(error instanceof Error ? error.message : 'Failed to load audio');
    } finally {
      setIsLoading(false);
    }
  }, [downloadUrl, available, volume]);

  // Memoized waveform data extraction
  const waveformData = useMemo(() => {
    if (!audioBuffer) return null;

    const channelData = audioBuffer.getChannelData(0);
    const samples = channelData.length;
    const targetPoints = Math.min(1000, dimensions.width * 2);

    if (targetPoints <= 0) return null;

    const blockSize = Math.floor(samples / targetPoints);
    const peaks: number[] = [];

    for (let i = 0; i < targetPoints; i++) {
      const start = i * blockSize;
      const end = Math.min(start + blockSize, samples);
      let max = 0;

      for (let j = start; j < end; j++) {
        const abs = Math.abs(channelData[j]);
        if (abs > max) max = abs;
      }

      peaks.push(max);
    }

    return peaks;
  }, [audioBuffer, dimensions.width]);

  // Draw waveform
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = dimensions;
    if (width === 0 || height === 0) return;

    // Set canvas resolution
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (!waveformData || waveformData.length === 0) {
      // Draw placeholder
      ctx.fillStyle = "oklch(0.40 0.01 260)";
      ctx.font = "11px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (isLoading) {
        ctx.fillText("Loading audio...", width / 2, height / 2);
      } else if (loadError) {
        ctx.fillText(loadError, width / 2, height / 2);
      } else if (!available) {
        ctx.fillText("Not available", width / 2, height / 2);
      } else {
        ctx.fillText("Click to load audio", width / 2, height / 2);
      }
      return;
    }

    const centerY = height / 2;
    const maxAmplitude = (height / 2) * 0.85;

    // Draw center line
    ctx.strokeStyle = "oklch(0.30 0.01 260)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Draw waveform
    ctx.fillStyle = color.waveform + "33"; // 20% opacity
    ctx.strokeStyle = color.waveform;
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(0, centerY);

    const pointWidth = width / waveformData.length;

    for (let i = 0; i < waveformData.length; i++) {
      const x = i * pointWidth;
      const scaledAmplitude = Math.min(waveformData[i], 1);
      const y = centerY - scaledAmplitude * maxAmplitude;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(width, centerY);

    for (let i = waveformData.length - 1; i >= 0; i--) {
      const x = i * pointWidth;
      const scaledAmplitude = Math.min(waveformData[i], 1);
      const y = centerY + scaledAmplitude * maxAmplitude;
      ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }, [waveformData, dimensions, isLoading, loadError, available, color.waveform]);

  // Draw overlay (playhead only)
  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = dimensions;
    if (width === 0 || height === 0) return;

    const duration = audioBuffer?.duration || 0;

    // Set canvas resolution
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (duration <= 0) return;

    // Draw playhead
    const playheadX = (currentTime / duration) * width;

    ctx.strokeStyle = color.waveform;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();
  }, [currentTime, dimensions, audioBuffer, color.waveform]);

  // Animation loop for playhead
  const updatePlayhead = useCallback(() => {
    if (!audioContextRef.current || !isPlayingRef.current || !audioBuffer) return;

    const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
    const duration = audioBuffer.duration;
    const newTime = Math.min(offsetRef.current + elapsed, duration);

    setCurrentTime(newTime);

    if (isPlayingRef.current) {
      animationRef.current = requestAnimationFrame(updatePlayhead);
    }
  }, [audioBuffer]);

  // Play audio from current offset
  const playAudio = useCallback(() => {
    if (!audioBuffer || !audioContextRef.current || !gainRef.current) return;

    // Resume context if suspended
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    // Stop existing source
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
      } catch {}
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(gainRef.current);

    // Start from current offset
    const startOffset = offsetRef.current;

    startTimeRef.current = audioContextRef.current.currentTime;

    source.start(0, startOffset);
    sourceRef.current = source;
    isPlayingRef.current = true;
    setIsPlaying(true);

    // Start animation loop
    animationRef.current = requestAnimationFrame(updatePlayhead);

    // Handle natural end
    source.onended = () => {
      if (isPlayingRef.current) {
        stopPlayback();
        offsetRef.current = 0;
        setCurrentTime(0);
      }
    };
  }, [audioBuffer, updatePlayhead]);

  // Stop playback
  const stopPlayback = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
      } catch {}
      sourceRef.current = null;
    }
  }, []);

  // Pause playback
  const pausePlayback = useCallback(() => {
    if (!audioContextRef.current || !isPlayingRef.current) return;

    const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
    offsetRef.current = offsetRef.current + elapsed;

    stopPlayback();
  }, [stopPlayback]);

  // Reset playback
  const resetPlayback = useCallback(() => {
    stopPlayback();
    offsetRef.current = 0;
    setCurrentTime(0);
  }, [stopPlayback]);

  // Handle volume change
  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.setTargetAtTime(volume, audioContextRef.current?.currentTime || 0, 0.01);
    }
  }, [volume]);

  // Handle waveform click - seek to position
  const handleWaveformClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || !audioBuffer) return;

    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickRatio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = clickRatio * audioBuffer.duration;

    // Seek to clicked position
    const wasPlaying = isPlayingRef.current;

    if (wasPlaying) {
      stopPlayback();
    }

    offsetRef.current = targetTime;
    setCurrentTime(targetTime);

    if (wasPlaying) {
      playAudio();
    }
  }, [audioBuffer, stopPlayback, playAudio]);

  // Handle initial load click
  const handleLoadClick = useCallback(() => {
    if (!audioBuffer && available && !isLoading) {
      loadAudio();
    }
  }, [audioBuffer, available, isLoading, loadAudio]);

  const duration = audioBuffer?.duration || 0;

  return (
    <div className={cn(
      "rounded-lg border overflow-hidden transition-all",
      available ? `${color.bg} ${color.border}` : "bg-muted/10 border-border/20 opacity-60"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-3 py-2 border-b",
        available ? color.border : "border-border/20"
      )}>
        <span className={cn(
          "text-sm font-medium",
          available ? "text-foreground" : "text-muted-foreground"
        )}>
          {name}
        </span>

        {/* Download button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onDownload}
          disabled={!available}
          title="Download stem"
        >
          <Download className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Waveform */}
      <div
        ref={containerRef}
        className={cn(
          "relative h-20 cursor-pointer",
          !audioBuffer && available && !isLoading && "hover:bg-muted/10"
        )}
        onClick={audioBuffer ? handleWaveformClick : handleLoadClick}
        title={
          audioBuffer
            ? "Click to seek"
            : available
              ? "Click to load and view waveform"
              : "Stem not available"
        }
      >
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <Loader2 className={cn("w-6 h-6 animate-spin", color.text)} />
          </div>
        )}

        {/* Waveform canvas */}
        <canvas
          ref={waveformCanvasRef}
          className="absolute inset-0 w-full h-full"
        />

        {/* Overlay canvas (playhead) */}
        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      </div>

      {/* Controls */}
      {audioBuffer && (
        <div className={cn(
          "flex items-center justify-between px-3 py-2 border-t",
          color.border
        )}>
          {/* Playback controls */}
          <div className="flex items-center gap-1">
            {isPlaying ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={pausePlayback}
                title="Pause"
              >
                <Pause className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={playAudio}
                title="Play"
              >
                <Play className="w-4 h-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={resetPlayback}
              title="Stop and reset"
            >
              <Square className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Time display */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className={color.text}>{formatTime(currentTime)}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">{formatTimeShort(duration)}</span>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
            >
              {volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </Button>
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              className="w-16"
              onValueChange={([v]) => setVolume(v / 100)}
            />
          </div>
        </div>
      )}

      {/* Timeline labels (only when loaded) */}
      {audioBuffer && (
        <div className="flex justify-between px-2 py-1 text-[9px] font-mono text-muted-foreground bg-muted/20">
          <span>0:00</span>
          <span>{formatTimeShort(duration * 0.5)}</span>
          <span>{formatTimeShort(duration)}</span>
        </div>
      )}
    </div>
  );
}

export type { StemWaveformPlayerProps };
