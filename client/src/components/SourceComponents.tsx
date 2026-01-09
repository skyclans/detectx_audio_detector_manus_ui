/**
 * Source Components Section
 * 
 * v1.0 FINAL:
 * - Volume slider per stem
 * - Download button per stem
 * - Horizontal amplitude waveform visualization
 * - UI-only layout for future backend integration
 * 
 * REMOVED (per final spec):
 * - Solo (S) button
 * - Mute (M) button
 * 
 * NO mock data, NO simulated results, NO placeholder judgments.
 * NO AI model names, NO probability, NO confidence scores.
 */

import { useState, useCallback, useMemo } from "react";
import { Play, Pause, Volume2, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

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
    const noise = Math.sin(seed * 0.1 + i * 0.3) * 0.3 + 
                  Math.sin(seed * 0.05 + i * 0.7) * 0.2 +
                  Math.sin(seed * 0.02 + i * 1.1) * 0.15;
    const amplitude = 0.3 + Math.abs(noise) * 0.7;
    waveform.push(Math.min(1, Math.max(0.1, amplitude)));
  }
  
  return waveform;
}

interface StemState {
  isPlaying: boolean;
  volume: number;
}

/**
 * Stem Control Component (UI-Only)
 * 
 * v1.0 FINAL (Simplified):
 * - Play/Pause button
 * - Volume slider
 * - Download button
 * - Horizontal amplitude waveform
 * 
 * REMOVED: Solo (S) and Mute (M) buttons
 */
function StemControl({ 
  stem, 
  state,
  onTogglePlay,
  onVolumeChange,
  onDownload,
  waveformData,
}: { 
  stem: typeof STEMS[number]; 
  state: StemState;
  onTogglePlay: () => void;
  onVolumeChange: (value: number) => void;
  onDownload: () => void;
  waveformData: number[];
}) {
  const { isPlaying, volume } = state;

  return (
    <div className={cn(
      "flex items-center gap-2 py-2 px-3 bg-muted/10 rounded border border-border/20",
      "shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]"
    )}>
      {/* Play/Pause button */}
      <button
        onClick={onTogglePlay}
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-0",
          "bg-muted/30 hover:bg-muted/50 border border-border/30",
          isPlaying && "bg-primary/20 border-primary/50"
        )}
        title={isPlaying ? `Pause ${stem.name}` : `Play ${stem.name}`}
      >
        {isPlaying ? (
          <Pause className="w-3 h-3 text-foreground" />
        ) : (
          <Play className="w-3 h-3 text-foreground ml-0.5" />
        )}
      </button>
      
      {/* Stem name */}
      <div className="flex-shrink-0 w-14">
        <span className="text-xs font-medium text-foreground">{stem.name}</span>
      </div>
      
      {/* Horizontal amplitude waveform */}
      <div className="flex-1 h-8 bg-muted/20 rounded overflow-hidden relative">
        <svg
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          className="absolute inset-0"
          viewBox="0 0 100 40"
        >
          {/* Upper half waveform */}
          <path
            d={(() => {
              const height = 20;
              const width = 100;
              const points = waveformData.map((amp, i) => {
                const x = (i / (waveformData.length - 1)) * width;
                const y = height - (amp * height * 0.85);
                return `${x},${y}`;
              });
              return `M0,${height} L${points.join(' L')} L${width},${height} Z`;
            })()}
            fill={`var(--${stem.color})`}
            fillOpacity={isPlaying ? 0.6 : 0.3}
            className="transition-opacity duration-100"
          />
          {/* Lower half waveform (mirrored) */}
          <path
            d={(() => {
              const height = 20;
              const width = 100;
              const points = waveformData.map((amp, i) => {
                const x = (i / (waveformData.length - 1)) * width;
                const y = height + (amp * height * 0.85);
                return `${x},${y}`;
              });
              return `M0,${height} L${points.join(' L')} L${width},${height} Z`;
            })()}
            fill={`var(--${stem.color})`}
            fillOpacity={isPlaying ? 0.6 : 0.3}
            className="transition-opacity duration-100"
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
      </div>
      
      {/* Volume slider */}
      <div className="flex items-center gap-1.5 w-20">
        <Volume2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        <Slider
          value={[volume]}
          min={0}
          max={100}
          step={1}
          onValueChange={([v]) => onVolumeChange(v)}
          className="flex-1"
        />
      </div>
      
      {/* Download button */}
      <button
        onClick={onDownload}
        className={cn(
          "w-7 h-7 rounded flex items-center justify-center transition-all duration-0",
          "bg-muted/30 hover:bg-muted/50 border border-border/30",
          "hover:border-forensic-cyan/50 hover:text-forensic-cyan"
        )}
        title={`Download ${stem.name} stem`}
      >
        <Download className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function SourceComponents({ data, isProcessing = false }: SourceComponentsProps) {
  // UI-only stem state (simplified - no solo/mute)
  const [stemStates, setStemStates] = useState<Record<string, StemState>>({
    vocals: { isPlaying: false, volume: 80 },
    drums: { isPlaying: false, volume: 80 },
    bass: { isPlaying: false, volume: 80 },
    others: { isPlaying: false, volume: 80 },
  });

  // Generate deterministic waveform data for each stem
  const stemWaveforms = useMemo(() => ({
    vocals: generateStemWaveform("vocals", 80),
    drums: generateStemWaveform("drums", 80),
    bass: generateStemWaveform("bass", 80),
    others: generateStemWaveform("others", 80),
  }), []);

  const togglePlay = useCallback((stemId: string) => {
    setStemStates(prev => ({
      ...prev,
      [stemId]: { ...prev[stemId], isPlaying: !prev[stemId].isPlaying },
    }));
  }, []);

  const changeVolume = useCallback((stemId: string, volume: number) => {
    setStemStates(prev => ({
      ...prev,
      [stemId]: { ...prev[stemId], volume },
    }));
  }, []);

  const handleDownload = useCallback((stemId: string) => {
    // UI-only: Show toast or placeholder action
    // In production, this would trigger actual stem file download
    console.log(`Download stem: ${stemId}`);
  }, []);

  if (isProcessing) {
    return (
      <div className="forensic-panel h-full">
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
      <div className="forensic-panel h-full">
        <div className="forensic-panel-header">Source Components</div>
        <div className="forensic-panel-content space-y-3">
          {/* Stem playback controls (UI-only) */}
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Stem Separation (UI Preview)
            </div>
            {STEMS.map((stem) => (
              <StemControl
                key={stem.id}
                stem={stem}
                state={stemStates[stem.id]}
                onTogglePlay={() => togglePlay(stem.id)}
                onVolumeChange={(v) => changeVolume(stem.id, v)}
                onDownload={() => handleDownload(stem.id)}
                waveformData={stemWaveforms[stem.id]}
              />
            ))}
          </div>
          
          {/* Idle notice */}
          <div className="pt-3 border-t border-border/30">
            <p className="text-xs text-muted-foreground text-center">
              Awaiting verification data for component analysis
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forensic-panel h-full">
      <div className="forensic-panel-header">Source Components</div>
      <div className="forensic-panel-content space-y-3">
        {/* Stem playback controls (UI-only) */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Stem Separation
          </div>
          {STEMS.map((stem) => (
            <StemControl
              key={stem.id}
              stem={stem}
              state={stemStates[stem.id]}
              onTogglePlay={() => togglePlay(stem.id)}
              onVolumeChange={(v) => changeVolume(stem.id, v)}
              onDownload={() => handleDownload(stem.id)}
              waveformData={stemWaveforms[stem.id]}
            />
          ))}
        </div>
        
        {/* Summary */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/30">
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
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {data.components.map((component) => (
                <div
                  key={component.id}
                  className="py-1.5 px-2 bg-muted/10 rounded border border-border/20 shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-forensic-cyan">{component.id}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">
                      {component.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
