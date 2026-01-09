import { useEffect, useRef, useState, useCallback } from "react";

interface TimelineMarker {
  timestamp: number;
  type: string;
}

interface WaveformVisualizationProps {
  audioBuffer: AudioBuffer | null;
  currentTime: number;
  duration: number;
  markers?: TimelineMarker[];
  onSeek?: (time: number) => void;
  isPlaying?: boolean;
}

/**
 * Forensic Waveform Visualization Component
 * 
 * WAVEFORM INTERACTION (CRITICAL - MANDATORY):
 * - Clicking on waveform ALWAYS seeks to the clicked timestamp
 * - Click must NEVER reset playback to 0:00
 * - While playing: seek immediately and continue playback from that position
 * - While paused: seek immediately and remain paused
 * - Waveform is bidirectionally linked to audio currentTime
 * 
 * INITIAL LOAD STATE:
 * - Displays neutral placeholder waveform before file upload
 * - Non-inferential visual representation
 */
export function WaveformVisualization({
  audioBuffer,
  currentTime,
  duration,
  markers = [],
  onSeek,
  isPlaying = false,
}: WaveformVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Draw placeholder waveform (neutral, non-inferential)
  const drawPlaceholderWaveform = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Clear canvas with dark background
    ctx.fillStyle = "oklch(0.16 0.01 260)";
    ctx.fillRect(0, 0, width, height);

    const centerY = height / 2;

    // Draw subtle grid lines
    ctx.strokeStyle = "oklch(0.22 0.01 260)";
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    
    // Horizontal grid lines
    for (let y = height * 0.25; y < height; y += height * 0.25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Vertical grid lines
    for (let x = width * 0.1; x < width; x += width * 0.1) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw placeholder waveform pattern (neutral sine-like pattern)
    ctx.strokeStyle = "oklch(0.35 0.05 195 / 40%)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    for (let x = 0; x < width; x++) {
      const normalizedX = x / width;
      // Create a neutral, non-inferential pattern
      const amplitude = height * 0.15 * (0.3 + 0.7 * Math.sin(normalizedX * Math.PI));
      const y = centerY + Math.sin(normalizedX * 20) * amplitude;
      
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw center line
    ctx.strokeStyle = "oklch(0.30 0.01 260)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Draw "Awaiting audio file" text
    ctx.fillStyle = "oklch(0.45 0.01 260)";
    ctx.font = "12px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Awaiting audio file", width / 2, centerY);
  }, []);

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = dimensions;
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size with DPR
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // If no audio buffer, draw placeholder
    if (!audioBuffer) {
      drawPlaceholderWaveform(ctx, width, height);
      return;
    }

    // Clear canvas
    ctx.fillStyle = "oklch(0.16 0.01 260)";
    ctx.fillRect(0, 0, width, height);

    // Get audio data
    const channelData = audioBuffer.getChannelData(0);
    const samplesPerPixel = Math.floor(channelData.length / width);

    // Draw waveform
    ctx.beginPath();
    ctx.strokeStyle = "oklch(0.55 0.10 195)"; // Forensic cyan dim
    ctx.lineWidth = 1;

    const centerY = height / 2;
    const amplitude = height * 0.4;

    for (let x = 0; x < width; x++) {
      const startSample = x * samplesPerPixel;
      const endSample = Math.min(startSample + samplesPerPixel, channelData.length);

      let min = 0;
      let max = 0;

      for (let i = startSample; i < endSample; i++) {
        const sample = channelData[i];
        if (sample < min) min = sample;
        if (sample > max) max = sample;
      }

      const minY = centerY - min * amplitude;
      const maxY = centerY - max * amplitude;

      ctx.moveTo(x, minY);
      ctx.lineTo(x, maxY);
    }

    ctx.stroke();

    // Draw filled waveform
    ctx.fillStyle = "oklch(0.75 0.15 195 / 20%)"; // Forensic cyan with transparency
    ctx.beginPath();
    ctx.moveTo(0, centerY);

    for (let x = 0; x < width; x++) {
      const startSample = x * samplesPerPixel;
      const endSample = Math.min(startSample + samplesPerPixel, channelData.length);

      let max = 0;
      for (let i = startSample; i < endSample; i++) {
        const sample = Math.abs(channelData[i]);
        if (sample > max) max = sample;
      }

      const y = centerY - max * amplitude;
      ctx.lineTo(x, y);
    }

    for (let x = width - 1; x >= 0; x--) {
      const startSample = x * samplesPerPixel;
      const endSample = Math.min(startSample + samplesPerPixel, channelData.length);

      let max = 0;
      for (let i = startSample; i < endSample; i++) {
        const sample = Math.abs(channelData[i]);
        if (sample > max) max = sample;
      }

      const y = centerY + max * amplitude;
      ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.fill();

    // Draw timeline markers
    markers.forEach((marker) => {
      const x = (marker.timestamp / (duration * 1000)) * width;
      ctx.strokeStyle = "oklch(0.75 0.15 85 / 60%)"; // Amber
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Draw playhead - bidirectionally linked to currentTime
    if (duration > 0) {
      const playheadX = (currentTime / duration) * width;
      ctx.strokeStyle = "oklch(0.75 0.15 195)"; // Forensic cyan
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();

      // Draw playhead handle
      ctx.fillStyle = "oklch(0.75 0.15 195)";
      ctx.beginPath();
      ctx.arc(playheadX, 8, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw center line
    ctx.strokeStyle = "oklch(0.30 0.01 260)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
  }, [audioBuffer, dimensions, currentTime, duration, markers, drawPlaceholderWaveform]);

  /**
   * Handle waveform click for seeking
   * 
   * CRITICAL BUG FIX:
   * - Clicking waveform must ALWAYS seek to clicked timestamp
   * - Must NEVER reset to 0:00
   * - While playing: seek immediately and continue playback
   * - While paused: seek immediately and remain paused
   */
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      // Only allow seeking if we have audio loaded
      if (!onSeek || !audioBuffer || duration <= 0) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      
      // Calculate seek time based on click position
      // Formula: targetTime = (clickX / waveformWidth) * audioDuration
      const clickRatio = Math.max(0, Math.min(1, clickX / rect.width));
      const targetTime = clickRatio * duration;
      
      // Call onSeek with the target time
      // The parent component handles whether to continue playing or stay paused
      onSeek(targetTime);
    },
    [onSeek, duration, audioBuffer]
  );

  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header">Waveform Analysis</div>
      <div className="p-0">
        <div
          ref={containerRef}
          className="w-full h-32 bg-card"
        >
          <canvas
            ref={canvasRef}
            className={`w-full h-full ${audioBuffer ? 'cursor-pointer' : 'cursor-default'}`}
            onClick={handleClick}
            title={audioBuffer ? "Click to seek" : "Upload audio file to begin"}
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

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
