import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import { drawPlayhead, initPlayheadCanvas, clearPlayhead } from "@/lib/waveformPlayhead";

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
  isDecoding?: boolean;
}

export interface WaveformVisualizationRef {
  updatePlayhead: (time: number) => void;
}

/**
 * Forensic Waveform Visualization Component
 * 
 * PERFORMANCE-OPTIMIZED ARCHITECTURE:
 * - Separate canvas layers: waveform (static) + playhead (animated)
 * - Waveform canvas only re-renders on audioBuffer/amplitudeScale change
 * - Playhead canvas updates via ref (no React re-render)
 * - No React state updates on animation frames
 * 
 * FILENAME INDEPENDENCE (CRITICAL - MANDATORY):
 * - Waveform rendering must NEVER depend on filename content
 * - All bindings use AudioBuffer reference directly
 * 
 * WAVEFORM INTERACTION (CRITICAL - MANDATORY):
 * - Clicking on waveform ALWAYS seeks to the clicked timestamp
 * - Click must NEVER reset playback to 0:00
 */
export const WaveformVisualization = forwardRef<WaveformVisualizationRef, WaveformVisualizationProps>(
  function WaveformVisualization({
    audioBuffer,
    currentTime,
    duration,
    markers = [],
    onSeek,
    isPlaying = false,
    isDecoding = false,
  }, ref) {
    // Canvas refs - separate layers for performance
    const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
    const playheadCanvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Dimensions state
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    
    // Amplitude scale control (1x to 4x)
    const [amplitudeScale, setAmplitudeScale] = useState(1);
    
    // Cached values for playhead updates
    const dprRef = useRef(1);
    const currentTimeRef = useRef(currentTime);

    // Expose updatePlayhead method via ref for external animation loop
    useImperativeHandle(ref, () => ({
      updatePlayhead: (time: number) => {
        currentTimeRef.current = time;
        const canvas = playheadCanvasRef.current;
        if (!canvas || dimensions.width === 0 || duration <= 0) return;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        
        drawPlayhead(ctx, dimensions.width, dimensions.height, time, duration, dprRef.current);
      }
    }), [dimensions, duration]);

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

    // Initialize playhead canvas on dimension change
    useEffect(() => {
      const canvas = playheadCanvasRef.current;
      if (!canvas || dimensions.width === 0) return;
      
      dprRef.current = initPlayheadCanvas(canvas, dimensions.width, dimensions.height);
    }, [dimensions]);

    // Draw placeholder waveform (neutral, non-inferential)
    const drawPlaceholderWaveform = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.fillStyle = "oklch(0.16 0.01 260)";
      ctx.fillRect(0, 0, width, height);

      const centerY = height / 2;

      // Draw subtle grid lines
      ctx.strokeStyle = "oklch(0.22 0.01 260)";
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      
      for (let y = height * 0.25; y < height; y += height * 0.25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      for (let x = width * 0.1; x < width; x += width * 0.1) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Draw placeholder waveform pattern
      ctx.strokeStyle = "oklch(0.35 0.05 195 / 40%)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      for (let x = 0; x < width; x++) {
        const normalizedX = x / width;
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

    // Draw decoding placeholder
    const drawDecodingPlaceholder = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.fillStyle = "oklch(0.16 0.01 260)";
      ctx.fillRect(0, 0, width, height);

      const centerY = height / 2;

      ctx.strokeStyle = "oklch(0.22 0.01 260)";
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      
      for (let y = height * 0.25; y < height; y += height * 0.25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      for (let x = width * 0.1; x < width; x += width * 0.1) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Animated loading pattern
      ctx.strokeStyle = "oklch(0.55 0.10 195 / 60%)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      
      const time = Date.now() / 1000;
      for (let x = 0; x < width; x++) {
        const normalizedX = x / width;
        const amplitude = height * 0.2 * (0.4 + 0.6 * Math.sin(normalizedX * Math.PI));
        const y = centerY + Math.sin(normalizedX * 15 + time * 2) * amplitude;
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      ctx.strokeStyle = "oklch(0.30 0.01 260)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      ctx.fillStyle = "oklch(0.65 0.10 195)";
      ctx.font = "12px 'Inter', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Decoding audio...", width / 2, centerY);
    }, []);

    // Draw waveform (static layer - only on audioBuffer/amplitudeScale change)
    useEffect(() => {
      const canvas = waveformCanvasRef.current;
      if (!canvas || dimensions.width === 0) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { width, height } = dimensions;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      // Show decoding placeholder
      if (isDecoding && !audioBuffer) {
        drawDecodingPlaceholder(ctx, width, height);
        return;
      }

      // Show placeholder if no audio
      if (!audioBuffer) {
        drawPlaceholderWaveform(ctx, width, height);
        return;
      }

      // Clear and draw waveform
      ctx.fillStyle = "oklch(0.16 0.01 260)";
      ctx.fillRect(0, 0, width, height);

      const channelData = audioBuffer.getChannelData(0);
      const samplesPerPixel = Math.floor(channelData.length / width);
      const centerY = height / 2;
      const amplitude = height * 0.4 * amplitudeScale;

      // Draw waveform outline
      ctx.beginPath();
      ctx.strokeStyle = "oklch(0.55 0.10 195)";
      ctx.lineWidth = 1;

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
      ctx.fillStyle = "oklch(0.75 0.15 195 / 20%)";
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
        ctx.strokeStyle = "oklch(0.75 0.15 85 / 60%)";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw center line
      ctx.strokeStyle = "oklch(0.30 0.01 260)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();
    }, [audioBuffer, dimensions, markers, isDecoding, amplitudeScale, duration, drawPlaceholderWaveform, drawDecodingPlaceholder]);

    // Update playhead when currentTime prop changes (for non-playing state)
    useEffect(() => {
      if (isPlaying) return; // During playback, use ref-based updates
      
      const canvas = playheadCanvasRef.current;
      if (!canvas || dimensions.width === 0 || duration <= 0) return;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      if (audioBuffer) {
        drawPlayhead(ctx, dimensions.width, dimensions.height, currentTime, duration, dprRef.current);
      } else {
        clearPlayhead(ctx, dimensions.width, dimensions.height, dprRef.current);
      }
    }, [currentTime, duration, dimensions, audioBuffer, isPlaying]);

    // Animation loop for decoding placeholder
    useEffect(() => {
      if (!isDecoding || audioBuffer) return;
      
      let animationId: number;
      const animate = () => {
        const canvas = waveformCanvasRef.current;
        if (!canvas || dimensions.width === 0) return;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        
        const { width, height } = dimensions;
        const dpr = window.devicePixelRatio || 1;
        
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        
        drawDecodingPlaceholder(ctx, width, height);
        animationId = requestAnimationFrame(animate);
      };
      
      animationId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationId);
    }, [isDecoding, audioBuffer, dimensions, drawDecodingPlaceholder]);

    // Handle waveform click for seeking
    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!onSeek || !audioBuffer || duration <= 0) return;

        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        
        const clickRatio = Math.max(0, Math.min(1, clickX / rect.width));
        const targetTime = clickRatio * duration;
        
        onSeek(targetTime);
      },
      [onSeek, duration, audioBuffer]
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
            className={`w-full h-32 bg-card relative ${audioBuffer ? 'cursor-pointer' : 'cursor-default'}`}
            onClick={handleClick}
            title={audioBuffer ? "Click to seek" : isDecoding ? "Decoding audio..." : "Upload audio file to begin"}
          >
            {/* Waveform layer (static) */}
            <canvas
              ref={waveformCanvasRef}
              className="absolute inset-0 w-full h-full"
            />
            {/* Playhead layer (animated) */}
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
);

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
