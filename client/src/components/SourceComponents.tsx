/**
 * Source Components Section
 *
 * Professional audio analyzer style visualization with waveform playback.
 * UI displays data only. No interpretation.
 * All text is verbatim from DetectX specification.
 */

import { Layers, Music } from "lucide-react";
import { cn } from "@/lib/utils";
import { StemWaveformPlayer } from "./StemWaveformPlayer";

interface StemComponent {
  id: string;
  name: string;
  available: boolean;
  downloadUrl?: string;
}

interface SourceComponentsData {
  components: StemComponent[];
}

interface SourceComponentsProps {
  data: SourceComponentsData | null;
  isProcessing?: boolean;
  stemVolumes?: Record<string, number>;
  onVolumeChange?: (stemId: string, volume: number) => void;
  onDownload?: (stemId: string) => void;
  /** API base URL for building full download URLs */
  apiBaseUrl?: string;
}

// Stem colors with waveform color
const STEM_COLORS: Record<string, { bg: string; text: string; border: string; waveform: string }> = {
  vocals: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30", waveform: "oklch(0.65 0.25 300)" },
  drums: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30", waveform: "oklch(0.70 0.20 50)" },
  bass: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30", waveform: "oklch(0.65 0.20 250)" },
  other: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", waveform: "oklch(0.70 0.20 160)" },
  piano: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30", waveform: "oklch(0.75 0.15 80)" },
  guitar: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30", waveform: "oklch(0.65 0.25 25)" },
};

const DEFAULT_COLOR = { bg: "bg-muted/20", text: "text-muted-foreground", border: "border-border/30", waveform: "oklch(0.60 0.01 260)" };

export function SourceComponents({
  data,
  isProcessing = false,
  stemVolumes = {},
  onVolumeChange,
  onDownload,
  apiBaseUrl = "https://emjvw2an6oynf9-8000.proxy.runpod.net",
}: SourceComponentsProps) {
  // Always show waveform view (no compact mode)
  // During Verification state
  if (isProcessing) {
    return (
      <div className="forensic-panel h-full">
        <div className="forensic-panel-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-forensic-cyan" />
            <span>Source Components</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-forensic-cyan animate-pulse" />
            <span className="text-xs text-forensic-cyan">SEPARATING</span>
          </div>
        </div>
        <div className="forensic-panel-content">
          {/* Stem separation animation */}
          <div className="space-y-2">
            {["Vocals", "Drums", "Bass", "Other"].map((name, idx) => (
              <div key={name} className="relative h-16 bg-muted/20 rounded overflow-hidden">
                <div className="absolute inset-0 flex items-center px-3 gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center">
                    <div 
                      className="w-5 h-5 border-2 border-forensic-cyan/30 border-t-forensic-cyan rounded-full animate-spin"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="h-2 w-20 bg-muted/30 rounded mb-1.5" />
                    <div className="h-1.5 w-full bg-muted/20 rounded" />
                  </div>
                </div>
                <div 
                  className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-forensic-cyan/50 to-transparent animate-scan-line"
                  style={{ animationDelay: `${idx * 200}ms` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Before Verification state
  if (!data) {
    return (
      <div className="forensic-panel h-full">
        <div className="forensic-panel-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-muted-foreground" />
            <span>Source Components</span>
          </div>
        </div>
        <div className="forensic-panel-content">
          {/* Empty state with stem placeholders */}
          <div className="space-y-2">
            {["Vocals", "Drums", "Bass", "Other"].map((name) => (
              <div key={name} className="h-14 bg-muted/10 rounded-lg border border-dashed border-border/30 flex items-center px-3 gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted/20 flex items-center justify-center">
                  <Music className="w-4 h-4 text-muted-foreground/30" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground/50">{name}</p>
                  <div className="h-1 w-full bg-muted/20 rounded mt-1.5" />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Awaiting verification
          </p>
        </div>
      </div>
    );
  }

  // Empty State (no components)
  if (!data.components || data.components.length === 0) {
    return (
      <div className="forensic-panel h-full">
        <div className="forensic-panel-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-muted-foreground" />
            <span>Source Components</span>
          </div>
          <span className="text-xs text-muted-foreground">NONE</span>
        </div>
        <div className="forensic-panel-content">
          <div className="h-32 bg-muted/10 rounded-lg border border-dashed border-border/30 flex flex-col items-center justify-center">
            <Layers className="w-8 h-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">No stem components available</p>
            <p className="text-[10px] text-muted-foreground/50 mt-1">
              Separation was not performed for this audio
            </p>
          </div>
        </div>
      </div>
    );
  }

  const availableCount = data.components.filter(c => c.available).length;

  // Build full download URL from relative path
  const buildFullUrl = (downloadUrl: string | undefined) => {
    if (!downloadUrl) return null;
    // If already absolute, return as-is
    if (downloadUrl.startsWith('http')) return downloadUrl;
    // Build full URL from API base
    return `${apiBaseUrl}${downloadUrl}`;
  };

  // Data available state
  return (
    <div className="forensic-panel h-full">
      <div className="forensic-panel-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-forensic-cyan" />
          <span>Source Components</span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-forensic-cyan/20 text-forensic-cyan">
          {availableCount}/{data.components.length} available
        </span>
      </div>
      <p className="text-xs text-muted-foreground px-4 pb-2">
        Click waveform to seek
      </p>
      <div className="forensic-panel-content space-y-2">
        {data.components.map((stem) => {
          const stemKey = stem.id.toLowerCase();
          const colors = STEM_COLORS[stemKey] || DEFAULT_COLOR;
          return (
            <StemWaveformPlayer
              key={stem.id}
              stemId={stem.id}
              name={stem.name}
              downloadUrl={buildFullUrl(stem.downloadUrl)}
              color={colors}
              available={stem.available}
              onDownload={() => onDownload?.(stem.id)}
              autoLoad={true}
            />
          );
        })}
      </div>
    </div>
  );
}

export type { SourceComponentsData, StemComponent };
