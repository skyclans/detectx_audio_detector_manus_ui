/**
 * Source Components Section
 * 
 * Displays identified source component analysis from backend.
 * This component remains IDLE until backend data is received.
 * NO mock data, NO simulated results, NO placeholder judgments.
 * NO AI model names, NO probability, NO confidence scores.
 * 
 * LAYOUT OVERRIDE:
 * - Positioned directly BELOW Live Scan Console
 * - Same width as Live Scan Console (waveform block)
 * - Includes stem playback controls (UI-only, no real stem separation)
 * - Stems: Vocals, Drums, Bass, Others
 * - Waveform style: horizontal amplitude bars (NOT vertical bars)
 */

import { useState, useCallback, useMemo } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SourceComponentData {
  components: {
    id: string;
    type: string;
    description: string;
  }[];
  layerCount: number;
  compositionType: string;
}

interface SourceComponentsProps {
  data: SourceComponentData | null;
  isProcessing?: boolean;
}

// Stem types for UI-only playback controls
const STEMS = [
  { id: "vocals", name: "Vocals", color: "forensic-cyan", bgColor: "bg-forensic-cyan" },
  { id: "drums", name: "Drums", color: "forensic-amber", bgColor: "bg-forensic-amber" },
  { id: "bass", name: "Bass", color: "forensic-green", bgColor: "bg-forensic-green" },
  { id: "others", name: "Others", color: "forensic-purple", bgColor: "bg-forensic-purple" },
] as const;

/**
 * Generate deterministic waveform data for stem visualization
 * Uses seed-based pseudo-random for consistent display
 */
function generateStemWaveform(stemId: string, pointCount: number = 100): number[] {
  const seed = stemId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const waveform: number[] = [];
  
  for (let i = 0; i < pointCount; i++) {
    // Generate pseudo-random amplitude based on seed and position
    const noise = Math.sin(seed * 0.1 + i * 0.3) * 0.3 + 
                  Math.sin(seed * 0.05 + i * 0.7) * 0.2 +
                  Math.sin(seed * 0.02 + i * 1.1) * 0.15;
    const amplitude = 0.3 + Math.abs(noise) * 0.7;
    waveform.push(Math.min(1, Math.max(0.1, amplitude)));
  }
  
  return waveform;
}

/**
 * Stem Control Component (UI-Only)
 * 
 * This is a UI-only layout component for future backend integration.
 * NO real stem separation is performed.
 * NO Demucs or audio processing.
 * 
 * WAVEFORM STYLE: Horizontal amplitude bars (mirrored top/bottom)
 */
function StemControl({ 
  stem, 
  isPlaying, 
  onToggle,
  waveformData,
}: { 
  stem: typeof STEMS[number]; 
  isPlaying: boolean;
  onToggle: () => void;
  waveformData: number[];
}) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 bg-muted/10 rounded border border-border/20 shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]">
      {/* Play/Pause button */}
      <button
        onClick={onToggle}
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-0",
          "bg-muted/30 hover:bg-muted/50 border border-border/30",
          isPlaying && "bg-primary/20 border-primary/50"
        )}
        title={isPlaying ? `Pause ${stem.name}` : `Play ${stem.name}`}
      >
        {isPlaying ? (
          <Pause className="w-3.5 h-3.5 text-foreground" />
        ) : (
          <Play className="w-3.5 h-3.5 text-foreground ml-0.5" />
        )}
      </button>
      
      {/* Stem name */}
      <div className="flex-shrink-0 w-16">
        <span className="text-xs font-medium text-foreground">{stem.name}</span>
      </div>
      
      {/* Horizontal amplitude waveform (mirrored style like main waveform) */}
      <div className="flex-1 h-10 bg-muted/20 rounded overflow-hidden relative">
        <svg
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          className="absolute inset-0"
        >
          {/* Upper half waveform */}
          <path
            d={(() => {
              const height = 20; // Half of container height (40px / 2)
              const width = 100; // Percentage width
              const points = waveformData.map((amp, i) => {
                const x = (i / (waveformData.length - 1)) * width;
                const y = height - (amp * height * 0.9);
                return `${x},${y}`;
              });
              return `M0,${height} L${points.join(' L')} L${width},${height} Z`;
            })()}
            fill={`var(--${stem.color})`}
            fillOpacity={isPlaying ? 0.6 : 0.35}
            className="transition-opacity duration-150"
          />
          {/* Lower half waveform (mirrored) */}
          <path
            d={(() => {
              const height = 20;
              const width = 100;
              const points = waveformData.map((amp, i) => {
                const x = (i / (waveformData.length - 1)) * width;
                const y = height + (amp * height * 0.9);
                return `${x},${y}`;
              });
              return `M0,${height} L${points.join(' L')} L${width},${height} Z`;
            })()}
            fill={`var(--${stem.color})`}
            fillOpacity={isPlaying ? 0.6 : 0.35}
            className="transition-opacity duration-150"
          />
          {/* Center line */}
          <line
            x1="0"
            y1="20"
            x2="100"
            y2="20"
            stroke={`var(--${stem.color})`}
            strokeOpacity={0.3}
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        
        {/* Playback position indicator (UI-only) */}
        {isPlaying && (
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-white/80"
            style={{ 
              left: "30%",
              animation: "none" // No animation - deterministic
            }}
          />
        )}
      </div>
      
      {/* Volume indicator */}
      <Volume2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
    </div>
  );
}

export function SourceComponents({ data, isProcessing = false }: SourceComponentsProps) {
  // UI-only stem playback state
  const [playingStems, setPlayingStems] = useState<Record<string, boolean>>({
    vocals: false,
    drums: false,
    bass: false,
    others: false,
  });

  // Generate deterministic waveform data for each stem
  const stemWaveforms = useMemo(() => ({
    vocals: generateStemWaveform("vocals", 80),
    drums: generateStemWaveform("drums", 80),
    bass: generateStemWaveform("bass", 80),
    others: generateStemWaveform("others", 80),
  }), []);

  const toggleStem = useCallback((stemId: string) => {
    setPlayingStems(prev => ({
      ...prev,
      [stemId]: !prev[stemId],
    }));
  }, []);

  if (isProcessing) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header">Source Components</div>
        <div className="forensic-panel-content">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs text-muted-foreground">Identifying source components...</p>
          </div>
        </div>
      </div>
    );
  }

  // IDLE state - show stem controls with placeholder waveforms
  if (!data) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header">Source Components</div>
        <div className="forensic-panel-content space-y-4">
          {/* Stem playback controls (UI-only) */}
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
              Stem Separation (UI Preview)
            </div>
            {STEMS.map((stem) => (
              <StemControl
                key={stem.id}
                stem={stem}
                isPlaying={playingStems[stem.id]}
                onToggle={() => toggleStem(stem.id)}
                waveformData={stemWaveforms[stem.id]}
              />
            ))}
          </div>
          
          {/* Idle notice */}
          <div className="pt-4 border-t border-border/30">
            <p className="text-xs text-muted-foreground text-center">
              Awaiting verification data for component analysis
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header">Source Components</div>
      <div className="forensic-panel-content space-y-4">
        {/* Stem playback controls (UI-only) */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Stem Separation
          </div>
          {STEMS.map((stem) => (
            <StemControl
              key={stem.id}
              stem={stem}
              isPlaying={playingStems[stem.id]}
              onToggle={() => toggleStem(stem.id)}
              waveformData={stemWaveforms[stem.id]}
            />
          ))}
        </div>
        
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/30">
          <div className="py-2 px-3 bg-muted/10 rounded border border-border/20 shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Layer Count
            </div>
            <div className="text-sm font-mono text-foreground">{data.layerCount}</div>
          </div>
          <div className="py-2 px-3 bg-muted/10 rounded border border-border/20 shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Composition
            </div>
            <div className="text-sm font-mono text-foreground">{data.compositionType}</div>
          </div>
        </div>

        {/* Components list */}
        {data.components.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Identified Components ({data.components.length})
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {data.components.map((component) => (
                <div
                  key={component.id}
                  className="py-2 px-3 bg-muted/10 rounded border border-border/20 shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-forensic-cyan">{component.id}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">
                      {component.type}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{component.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.components.length === 0 && (
          <p className="text-xs text-muted-foreground text-center">
            No distinct source components identified
          </p>
        )}
      </div>
    </div>
  );
}
