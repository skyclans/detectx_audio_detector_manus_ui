/**
 * Source Components Section
 * 
 * Professional audio analyzer style visualization.
 * UI displays data only. No interpretation.
 * All text is verbatim from DetectX specification.
 */

import { Layers, Download, Volume2, Music, Mic2, Drum, Guitar, Waves } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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
}

// Stem icons mapping
const STEM_ICONS: Record<string, typeof Music> = {
  vocals: Mic2,
  drums: Drum,
  bass: Guitar,
  other: Waves,
  piano: Music,
  guitar: Guitar,
};

// Stem colors
const STEM_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  vocals: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
  drums: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30" },
  bass: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
  other: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
  piano: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
  guitar: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" },
};

const DEFAULT_COLOR = { bg: "bg-muted/20", text: "text-muted-foreground", border: "border-border/30" };

function StemRow({
  stem,
  volume,
  onVolumeChange,
  onDownload,
}: {
  stem: StemComponent;
  volume: number;
  onVolumeChange: (volume: number) => void;
  onDownload: () => void;
}) {
  const stemKey = stem.id.toLowerCase();
  const Icon = STEM_ICONS[stemKey] || Music;
  const colors = STEM_COLORS[stemKey] || DEFAULT_COLOR;
  
  return (
    <div className={cn(
      "group relative rounded-lg border overflow-hidden transition-all",
      stem.available 
        ? `${colors.bg} ${colors.border} hover:ring-1 hover:ring-current ${colors.text}`
        : "bg-muted/10 border-border/20 opacity-60"
    )}>
      {/* Status indicator */}
      <div className={cn(
        "absolute top-0 left-0 w-1 h-full",
        stem.available ? colors.text.replace("text-", "bg-") : "bg-muted-foreground/30"
      )} />
      
      <div className="flex items-center gap-3 p-3 pl-4">
        {/* Icon */}
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          stem.available ? colors.bg : "bg-muted/20"
        )}>
          <Icon className={cn(
            "w-5 h-5",
            stem.available ? colors.text : "text-muted-foreground/50"
          )} />
        </div>
        
        {/* Name and status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-sm font-medium",
              stem.available ? "text-foreground" : "text-muted-foreground"
            )}>
              {stem.name}
            </span>
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded",
              stem.available 
                ? `${colors.bg} ${colors.text}` 
                : "bg-muted/20 text-muted-foreground/50"
            )}>
              {stem.available ? "READY" : "N/A"}
            </span>
          </div>
          
          {/* Volume slider */}
          <div className="flex items-center gap-2 mt-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Volume2 className={cn(
                    "w-3.5 h-3.5 flex-shrink-0",
                    stem.available ? "text-muted-foreground" : "text-muted-foreground/30"
                  )} />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Playback level (inspection only)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Slider
              value={[volume]}
              min={0}
              max={100}
              step={1}
              onValueChange={([v]) => onVolumeChange(v)}
              className="flex-1"
              disabled={!stem.available}
            />
            <span className={cn(
              "text-xs font-mono w-10 text-right",
              stem.available ? "text-foreground" : "text-muted-foreground/50"
            )}>
              {volume}%
            </span>
          </div>
        </div>
        
        {/* Download button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onDownload}
                disabled={!stem.available}
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                  stem.available
                    ? `${colors.bg} ${colors.border} border hover:scale-105 ${colors.text}`
                    : "bg-muted/10 border border-border/10 text-muted-foreground/30 cursor-not-allowed"
                )}
              >
                <Download className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                {stem.available ? "Download stem component" : "Not available"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

export function SourceComponents({ 
  data, 
  isProcessing = false,
  stemVolumes = {},
  onVolumeChange,
  onDownload,
}: SourceComponentsProps) {
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

  // Data available state
  return (
    <div className="forensic-panel h-full">
      <div className="forensic-panel-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-forensic-cyan" />
          <span>Source Components</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-forensic-cyan/20 text-forensic-cyan">
            {availableCount}/{data.components.length} available
          </span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground px-4 pb-2">
        Analytical stem components from verification engine
      </p>
      <div className="forensic-panel-content space-y-2">
        {data.components.map((stem) => (
          <StemRow
            key={stem.id}
            stem={stem}
            volume={stemVolumes[stem.id] ?? 80}
            onVolumeChange={(v) => onVolumeChange?.(stem.id, v)}
            onDownload={() => onDownload?.(stem.id)}
          />
        ))}
      </div>
    </div>
  );
}

export type { SourceComponentsData, StemComponent };
