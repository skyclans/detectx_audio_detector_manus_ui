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
 */

import { useState, useCallback } from "react";
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
  { id: "vocals", name: "Vocals", color: "bg-forensic-cyan" },
  { id: "drums", name: "Drums", color: "bg-forensic-amber" },
  { id: "bass", name: "Bass", color: "bg-forensic-green" },
  { id: "others", name: "Others", color: "bg-forensic-purple" },
] as const;

/**
 * Stem Control Component (UI-Only)
 * 
 * This is a UI-only layout component for future backend integration.
 * NO real stem separation is performed.
 * NO Demucs or audio processing.
 */
function StemControl({ 
  stem, 
  isPlaying, 
  onToggle 
}: { 
  stem: typeof STEMS[number]; 
  isPlaying: boolean;
  onToggle: () => void;
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
      
      {/* Placeholder waveform bar */}
      <div className="flex-1 h-6 bg-muted/20 rounded overflow-hidden relative">
        {/* Waveform placeholder bars */}
        <div className="absolute inset-0 flex items-center justify-around px-1">
          {Array.from({ length: 32 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-0.5 rounded-full opacity-40",
                stem.color
              )}
              style={{
                height: `${20 + Math.random() * 60}%`,
              }}
            />
          ))}
        </div>
        
        {/* Playback position indicator (UI-only) */}
        {isPlaying && (
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-white/80 animate-pulse"
            style={{ left: "30%" }}
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
