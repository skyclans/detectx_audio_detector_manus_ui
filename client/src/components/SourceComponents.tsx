/**
 * Source Components Section
 * 
 * UI displays data only. No interpretation.
 * All text is verbatim from DetectX specification.
 */

import { Info, Download, Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

// Column labels from specification
const COLUMN_LABELS = {
  component: "Component",
  level: "Level",
  download: "Download",
};

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
  return (
    <div className="grid grid-cols-3 gap-3 items-center py-2 px-2 bg-muted/20 rounded">
      {/* Component name */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-foreground">{stem.name}</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
          stem.available 
            ? "bg-green-500/20 text-green-400" 
            : "bg-muted/30 text-muted-foreground"
        }`}>
          {stem.available ? "Available" : "Not available"}
        </span>
      </div>

      {/* Level (Volume) */}
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Volume2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-xs">
                Adjusts playback level for inspection only. Does not affect analysis or verdict.
              </p>
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
        <span className="text-xs font-mono text-muted-foreground w-8 text-right">
          {volume}%
        </span>
      </div>

      {/* Download */}
      <div className="flex justify-end">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onDownload}
                disabled={!stem.available}
                className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
                  stem.available
                    ? "bg-muted/30 hover:bg-muted/50 border border-border/30 hover:border-forensic-cyan/50 hover:text-forensic-cyan"
                    : "bg-muted/10 border border-border/10 text-muted-foreground/50 cursor-not-allowed"
                }`}
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-xs">
                Downloads the analytical stem component provided by the server.
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
        <div className="forensic-panel-header">Source Components</div>
        <div className="forensic-panel-content">
          <div className="flex flex-col items-center justify-center py-6">
            <p className="text-sm text-muted-foreground">Inspecting structural signals…</p>
            <p className="text-xs text-muted-foreground mt-1">Verification is in progress.</p>
          </div>
        </div>
      </div>
    );
  }

  // Before Verification state
  if (!data) {
    return (
      <div className="forensic-panel h-full">
        <div className="forensic-panel-header">Source Components</div>
        <div className="forensic-panel-content">
          <p className="text-sm text-muted-foreground text-center py-6">
            Awaiting verification
          </p>
          <p className="text-xs text-muted-foreground text-center">
            Upload an audio file and start verification to view results.
          </p>
        </div>
      </div>
    );
  }

  // Empty State (no components)
  if (!data.components || data.components.length === 0) {
    return (
      <div className="forensic-panel h-full">
        <div className="forensic-panel-header">Source Components</div>
        <div className="forensic-panel-content">
          <p className="text-sm text-muted-foreground text-center py-4">
            No source components available
          </p>
          <p className="text-xs text-muted-foreground text-center">
            Stem components were not provided for this verification.
          </p>
        </div>
      </div>
    );
  }

  // Data available state
  return (
    <div className="forensic-panel h-full">
      <div className="forensic-panel-header">Source Components</div>
      <p className="text-xs text-muted-foreground mb-3">
        Analytical stem components derived during verification
      </p>
      <div className="forensic-panel-content">
        {/* Column headers */}
        <div className="grid grid-cols-3 gap-3 text-xs font-medium text-muted-foreground border-b border-border pb-2 mb-2 px-2">
          <span>{COLUMN_LABELS.component}</span>
          <span>{COLUMN_LABELS.level}</span>
          <span className="text-right">{COLUMN_LABELS.download}</span>
        </div>

        {/* Stem rows */}
        <div className="space-y-2">
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
    </div>
  );
}

export type { SourceComponentsData, StemComponent };
