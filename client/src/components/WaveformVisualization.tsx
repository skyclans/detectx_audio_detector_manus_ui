/**
 * WaveformVisualization - Stateless Presentation Component
 * 
 * INTEGRATION RULES (MANDATORY):
 * - Must NOT calculate time or run its own RAF loop
 * - Only renders from props
 * - Receives seek callbacks only
 * - All runtime behavior provided externally by DetectX
 */

import { useCallback, useEffect, useRef, useState, useMemo } from "react";

interface WaveformVisualizationProps {
  /** Decoded audio buffer for waveform rendering (injected) */
  audioBuffer: AudioBuffer | null;
  /** Current playback position in seconds (injected) */
  currentTime: number;
  /** Total audio duration in seconds (injected) */
  duration: number;
  /** Whether audio is being decoded (injected) */
  isDecoding: boolean;
  /** Callback when user seeks via waveform click */
  onSeek?: (time: number) => void;
}

/**
 * Format time in MM:SS format
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * WaveformVisualization Component
 * 
 * Stateless presentation component that renders waveform visualization
 * from externally provided state. No internal RAF loops, time calculations,
 * or audio logic.
 */
export function WaveformVisualization({
  audioBuffer,
  currentTime,
  duration,
  isDecoding,
  onSeek,
}: WaveformVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const playheadCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [amplitudeScale, setAmplitudeScale] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

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

  // Memoized waveform data extraction
  const waveformData = useMemo(() => {
    if (!audioBuffer) return null;
    
    const channelData = audioBuffer.getChannelData(0);
    const samples = channelData.length;
    const targetPoints = Math.min(2000, dimensions.width * 2);
    
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

  // Draw waveform (static, only on audioBuffer or dimensions change)
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
      ctx.font = "12px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        isDecoding ? "Decoding audio..." : "Awaiting audio file",
        width / 2,
        height / 2
      );
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
    ctx.fillStyle = "oklch(0.75 0.15 195 / 20%)";
    ctx.strokeStyle = "oklch(0.75 0.15 195)";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(0, centerY);

    const pointWidth = width / waveformData.length;
    
    for (let i = 0; i < waveformData.length; i++) {
      const x = i * pointWidth;
      const scaledAmplitude = Math.min(waveformData[i] * amplitudeScale, 1);
      const y = centerY - scaledAmplitude * maxAmplitude;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(width, centerY);

    for (let i = waveformData.length - 1; i >= 0; i--) {
      const x = i * pointWidth;
      const scaledAmplitude = Math.min(waveformData[i] * amplitudeScale, 1);
      const y = centerY + scaledAmplitude * maxAmplitude;
      ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }, [waveformData, dimensions, amplitudeScale, isDecoding]);

  // Draw playhead (updates on currentTime change)
  useEffect(() => {
    const canvas = playheadCanvasRef.current;
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

    // Draw playhead if we have duration
    if (duration > 0) {
      const playheadX = (currentTime / duration) * width;
      
      ctx.strokeStyle = "oklch(0.75 0.15 195)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();
    }
  }, [currentTime, duration, dimensions]);

  // Handle waveform click for seeking
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onSeek || duration <= 0) return;

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickRatio = Math.max(0, Math.min(1, clickX / rect.width));
      const targetTime = clickRatio * duration;

      onSeek(targetTime);
    },
    [onSeek, duration]
  );

  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header flex items-center justify-between">
        <span>Waveform Analysis</span>
        <div className="flex items-center gap-3">
          {/* Amplitude Scale Control */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground uppercase">Amp</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map((scale) => (
                <button
                  key={scale}
                  onClick={() => setAmplitudeScale(scale)}
                  className={`w-5 h-5 text-[10px] font-mono rounded transition-colors ${
                    amplitudeScale === scale
                      ? "bg-forensic-cyan/30 text-forensic-cyan border border-forensic-cyan/50"
                      : "bg-muted/30 text-muted-foreground border border-border/30 hover:bg-muted/50"
                  }`}
                  title={`${scale}x amplitude scale`}
                >
                  {scale}x
                </button>
              ))}
            </div>
          </div>
          {isDecoding && (
            <span className="text-[10px] text-forensic-cyan flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-forensic-cyan rounded-full animate-pulse" />
              DECODING
            </span>
          )}
        </div>
      </div>
      <div className="p-0">
        <div
          ref={containerRef}
          className={`w-full h-32 bg-card relative ${duration > 0 ? "cursor-pointer" : "cursor-default"}`}
          onClick={handleClick}
          title={duration > 0 ? "Click to seek" : isDecoding ? "Decoding audio..." : "Upload audio file to begin"}
        >
          {/* Waveform layer (static) */}
          <canvas
            ref={waveformCanvasRef}
            className="absolute inset-0 w-full h-full"
          />
          {/* Playhead layer */}
          <canvas
            ref={playheadCanvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />
        </div>
        {/* Timeline labels */}
        <div className="flex justify-between px-2 py-1 text-[10px] font-mono text-muted-foreground bg-muted/30">
          <span>0:00</span>
          {duration > 0 ? (
            <>
              <span>{formatTime(duration * 0.25)}</span>
              <span>{formatTime(duration * 0.5)}</span>
              <span>{formatTime(duration * 0.75)}</span>
              <span>{formatTime(duration)}</span>
            </>
          ) : (
            <>
              <span>--:--</span>
              <span>--:--</span>
              <span>--:--</span>
              <span>--:--</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
