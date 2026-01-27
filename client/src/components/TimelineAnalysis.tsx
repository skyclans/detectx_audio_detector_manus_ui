/**
 * Timeline Analysis Section
 * 
 * Professional audio analyzer style visualization.
 * UI displays data only. No interpretation.
 * All text is verbatim from DetectX specification.
 */

import { Info, Clock, Activity, Zap, Radio } from "lucide-react";
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

// Event type icons and colors
const EVENT_STYLES: Record<EventType, { icon: typeof Activity; color: string; bgColor: string }> = {
  "Structural Event": { icon: Activity, color: "text-forensic-cyan", bgColor: "bg-forensic-cyan/10" },
  "Signal Anomaly": { icon: Zap, color: "text-amber-400", bgColor: "bg-amber-400/10" },
  "Pattern Break": { icon: Radio, color: "text-purple-400", bgColor: "bg-purple-400/10" },
  "Spectral Shift": { icon: Activity, color: "text-emerald-400", bgColor: "bg-emerald-400/10" },
};

// Format time as MM:SS.mmm (specification requirement)
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const millis = ms % 1000;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${millis.toString().padStart(3, "0")}`;
}

// Format time short for compact display
function formatTimeShort(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function TimelineAnalysis({ events, isProcessing = false, onSeek }: TimelineAnalysisProps) {
  // During Verification state
  if (isProcessing) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-forensic-cyan" />
            <span>Timeline Analysis</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-forensic-cyan animate-pulse" />
            <span className="text-xs text-forensic-cyan">SCANNING</span>
          </div>
        </div>
        <div className="forensic-panel-content">
          {/* Scanning animation */}
          <div className="relative h-32 bg-muted/20 rounded overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-forensic-cyan/30 border-t-forensic-cyan rounded-full animate-spin" />
                <p className="text-xs text-muted-foreground">Analyzing timeline structure...</p>
              </div>
            </div>
            {/* Scan line effect */}
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-forensic-cyan to-transparent animate-scan-line" />
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
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>Timeline Analysis</span>
          </div>
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
          {/* Empty state with visual placeholder */}
          <div className="relative h-32 bg-muted/10 rounded border border-dashed border-border/50 overflow-hidden">
            {/* Grid lines */}
            <div className="absolute inset-0 grid grid-cols-8 gap-0">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="border-r border-border/20 last:border-r-0" />
              ))}
            </div>
            <div className="absolute inset-0 grid grid-rows-4 gap-0">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="border-b border-border/20 last:border-b-0" />
              ))}
            </div>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Clock className="w-6 h-6 text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">Awaiting verification</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty events state (no markers)
  if (events.length === 0) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-forensic-green" />
            <span>Timeline Analysis</span>
          </div>
          <span className="text-xs text-forensic-green">CLEAR</span>
        </div>
        <div className="forensic-panel-content">
          <div className="relative h-32 bg-muted/10 rounded overflow-hidden">
            {/* Clean timeline visualization */}
            <div className="absolute inset-x-4 top-1/2 h-0.5 bg-forensic-green/30 transform -translate-y-1/2" />
            <div className="absolute left-4 top-1/2 w-2 h-2 rounded-full bg-forensic-green transform -translate-y-1/2" />
            <div className="absolute right-4 top-1/2 w-2 h-2 rounded-full bg-forensic-green transform -translate-y-1/2" />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-xs text-muted-foreground bg-card px-2">No structural events detected</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate timeline range
  const maxTime = Math.max(...events.map(e => e.time));
  const minTime = Math.min(...events.map(e => e.time));
  const timeRange = maxTime - minTime || 1;

  // Data available state - Professional audio analyzer style
  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-forensic-cyan" />
          <span>Timeline Analysis</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{events.length} events</span>
          <span className="w-1.5 h-1.5 rounded-full bg-forensic-cyan" />
        </div>
      </div>
      
      <div className="forensic-panel-content space-y-3">
        {/* Visual Timeline Bar */}
        <div className="relative h-12 bg-muted/20 rounded overflow-hidden">
          {/* Background grid */}
          <div className="absolute inset-0 grid grid-cols-10 gap-0">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="border-r border-border/10 last:border-r-0" />
            ))}
          </div>
          
          {/* Timeline track */}
          <div className="absolute inset-x-2 top-1/2 h-0.5 bg-border/50 transform -translate-y-1/2" />
          
          {/* Event markers on timeline */}
          {events.map((event, idx) => {
            const position = ((event.time - minTime) / timeRange) * 100;
            const style = EVENT_STYLES[event.eventType];
            return (
              <TooltipProvider key={idx}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onSeek?.(event.time)}
                      className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full ${style.bgColor} border-2 border-current ${style.color} hover:scale-125 transition-transform cursor-pointer z-10`}
                      style={{ left: `calc(${Math.min(Math.max(position, 5), 95)}% )` }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      <p className="font-medium">{event.eventType}</p>
                      <p className="text-muted-foreground">{formatTime(event.time)} • {event.axis}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
          
          {/* Time labels */}
          <div className="absolute bottom-0.5 left-2 text-[10px] font-mono text-muted-foreground">
            {formatTimeShort(minTime)}
          </div>
          <div className="absolute bottom-0.5 right-2 text-[10px] font-mono text-muted-foreground">
            {formatTimeShort(maxTime)}
          </div>
        </div>

        {/* Event List - Pro analyzer style */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {events.map((event, idx) => {
            const style = EVENT_STYLES[event.eventType];
            const Icon = style.icon;
            return (
              <div
                key={idx}
                className={`group flex items-center gap-3 p-2 rounded cursor-pointer transition-all ${style.bgColor} hover:ring-1 hover:ring-current ${style.color}`}
                onClick={() => onSeek?.(event.time)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onSeek?.(event.time)}
              >
                {/* Icon */}
                <div className={`w-7 h-7 rounded flex items-center justify-center ${style.bgColor}`}>
                  <Icon className={`w-4 h-4 ${style.color}`} />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${style.color}`}>{event.eventType}</span>
                    <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 bg-muted/30 rounded">
                      {event.axis}
                    </span>
                  </div>
                  {event.note && (
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">{event.note}</p>
                  )}
                </div>
                
                {/* Timestamp */}
                <div className="text-right">
                  <span className="font-mono text-xs text-foreground group-hover:text-forensic-cyan transition-colors">
                    {formatTime(event.time)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export type { TimelineEvent, EventType };
