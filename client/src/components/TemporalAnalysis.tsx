/**
 * Temporal Analysis Section
 * 
 * UI displays data only. No interpretation.
 * Uses timeline_events data from server for temporal visualization.
 */

import { Info, Activity, Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Timeline event from server
interface TimelineEvent {
  time: number;
  eventType: string;
  axis?: string;
  note?: string;
}

interface TemporalAnalysisProps {
  events: TimelineEvent[] | null;
  isProcessing?: boolean;
}

// Format time as MM:SS
function formatTime(timeValue: number): string {
  const ms = timeValue > 1000 ? timeValue : timeValue * 1000;
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function TemporalAnalysis({ events, isProcessing = false }: TemporalAnalysisProps) {
  // During Verification state
  if (isProcessing) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-forensic-cyan" />
            <span>Temporal Analysis</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-forensic-cyan animate-pulse" />
            <span className="text-xs text-forensic-cyan">ANALYZING</span>
          </div>
        </div>
        <div className="forensic-panel-content">
          <div className="relative h-24 bg-muted/20 rounded overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-forensic-cyan/30 border-t-forensic-cyan rounded-full animate-spin" />
                <p className="text-xs text-muted-foreground">Analyzing temporal patterns...</p>
              </div>
            </div>
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-forensic-cyan/50 to-transparent animate-scan-line" />
          </div>
        </div>
      </div>
    );
  }

  // Before Verification state
  if (!events) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <span>Temporal Analysis</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">
                  Temporal analysis shows event distribution over time.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="forensic-panel-content">
          <div className="h-24 bg-muted/10 rounded border border-dashed border-border/30 flex flex-col items-center justify-center">
            <Activity className="w-6 h-6 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">Awaiting verification</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty State (no events)
  if (events.length === 0) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-forensic-green" />
            <span>Temporal Analysis</span>
          </div>
          <span className="text-xs text-forensic-green">CLEAR</span>
        </div>
        <div className="forensic-panel-content">
          <div className="h-24 bg-muted/10 rounded flex items-center justify-center">
            <p className="text-xs text-muted-foreground">No temporal events detected</p>
          </div>
        </div>
      </div>
    );
  }

  // Normalize times
  const normalizedEvents = events.map(e => ({
    ...e,
    normalizedTime: e.time > 1000 ? e.time : e.time * 1000
  }));

  // Calculate time range
  const maxTime = Math.max(...normalizedEvents.map(e => e.normalizedTime));
  const minTime = Math.min(...normalizedEvents.map(e => e.normalizedTime));
  const timeRange = maxTime - minTime || 1;

  // Group events by type
  const eventsByType = normalizedEvents.reduce((acc, event) => {
    const type = event.eventType || "Unknown";
    if (!acc[type]) acc[type] = [];
    acc[type].push(event);
    return acc;
  }, {} as Record<string, typeof normalizedEvents>);

  // Data available state - Show temporal distribution
  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-forensic-cyan" />
          <span>Temporal Analysis</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{events.length} events</span>
          <Clock className="w-3.5 h-3.5 text-forensic-cyan" />
        </div>
      </div>
      
      <div className="forensic-panel-content space-y-3">
        {/* Time range bar */}
        <div className="relative h-8 bg-muted/20 rounded overflow-hidden">
          <div className="absolute inset-x-2 top-1/2 h-0.5 bg-border/50 transform -translate-y-1/2" />
          
          {/* Event dots on timeline */}
          {normalizedEvents.map((event, idx) => {
            const position = ((event.normalizedTime - minTime) / timeRange) * 100;
            return (
              <div
                key={idx}
                className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-forensic-cyan/60"
                style={{ left: `calc(${Math.min(Math.max(position, 5), 95)}%)` }}
              />
            );
          })}
          
          {/* Time labels */}
          <div className="absolute bottom-0.5 left-2 text-[10px] font-mono text-muted-foreground">
            {formatTime(minTime)}
          </div>
          <div className="absolute bottom-0.5 right-2 text-[10px] font-mono text-muted-foreground">
            {formatTime(maxTime)}
          </div>
        </div>

        {/* Event type summary */}
        <div className="space-y-1.5">
          {Object.entries(eventsByType).map(([type, typeEvents]) => (
            <div 
              key={type}
              className="flex items-center justify-between p-2 rounded bg-muted/10"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-forensic-cyan" />
                <span className="text-xs text-foreground">{type}</span>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {typeEvents.length} occurrence{typeEvents.length !== 1 ? "s" : ""}
              </span>
            </div>
          ))}
        </div>

        {/* Time span info */}
        <div className="pt-2 border-t border-border/30">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Time span</span>
            <span className="font-mono text-foreground">
              {formatTime(minTime)} — {formatTime(maxTime)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { TimelineEvent };
