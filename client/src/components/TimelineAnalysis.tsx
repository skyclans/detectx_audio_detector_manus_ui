/**
 * Timeline Analysis Section
 * 
 * UI displays data only. No interpretation.
 * All text is verbatim from DetectX specification.
 */

import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Event types (fixed mapping from specification)
type EventType = "Structural Event" | "Signal Anomaly" | "Pattern Break" | "Spectral Shift";

interface TimelineEvent {
  time: number; // milliseconds
  eventType: EventType;
  axis: string;
  note?: string;
}

interface TimelineAnalysisProps {
  events: TimelineEvent[] | null;
  isProcessing?: boolean;
  onSeek?: (time: number) => void;
}

// Format time as MM:SS.mmm (specification requirement)
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const millis = ms % 1000;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${millis.toString().padStart(3, "0")}`;
}

export function TimelineAnalysis({ events, isProcessing = false, onSeek }: TimelineAnalysisProps) {
  // During Verification state
  if (isProcessing) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header flex items-center justify-between">
          <span>Timeline Analysis</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">
                  Timeline markers indicate points of interest detected by the verification engine.
                  They do not represent conclusions or judgments.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="forensic-panel-content">
          <div className="flex flex-col items-center justify-center py-6">
            <p className="text-sm text-muted-foreground">Inspecting structural signals…</p>
            <p className="text-xs text-muted-foreground mt-1">Verification is in progress.</p>
          </div>
        </div>
      </div>
    );
  }

  // Before Verification / Empty state
  if (!events) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header flex items-center justify-between">
          <span>Timeline Analysis</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">
                  Timeline markers indicate points of interest detected by the verification engine.
                  They do not represent conclusions or judgments.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
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

  // Empty events state (no markers)
  if (events.length === 0) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header flex items-center justify-between">
          <span>Timeline Analysis</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">
                  Timeline markers indicate points of interest detected by the verification engine.
                  They do not represent conclusions or judgments.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="forensic-panel-content">
          <p className="text-sm text-muted-foreground text-center py-4">
            No timeline events detected
          </p>
          <p className="text-xs text-muted-foreground text-center">
            No structural events were reported for this audio.
          </p>
        </div>
      </div>
    );
  }

  // Data available state
  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header flex items-center justify-between">
        <span>Timeline Analysis</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-xs">
                Timeline markers indicate points of interest detected by the verification engine.
                They do not represent conclusions or judgments.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Detected structural events along the audio timeline
      </p>
      <div className="forensic-panel-content">
        {/* Table header */}
        <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground border-b border-border pb-2 mb-2">
          <span>Time</span>
          <span>Event Type</span>
          <span>Axis</span>
          <span>Note</span>
        </div>

        {/* Event rows */}
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {events.map((event, idx) => (
            <div
              key={idx}
              className="grid grid-cols-4 gap-2 text-xs py-1.5 px-1 bg-muted/20 rounded cursor-pointer hover:bg-muted/40 transition-colors"
              onClick={() => onSeek?.(event.time)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onSeek?.(event.time)}
            >
              <span className="font-mono text-forensic-cyan">{formatTime(event.time)}</span>
              <span className="text-foreground">{event.eventType}</span>
              <span className="text-muted-foreground">{event.axis}</span>
              <span className="text-muted-foreground truncate">{event.note || "—"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export type { TimelineEvent, EventType };
