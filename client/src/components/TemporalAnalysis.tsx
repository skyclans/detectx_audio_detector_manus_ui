/**
 * Temporal Analysis Section
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

interface TemporalSeriesPoint {
  time: number; // milliseconds
  value: number;
  axis: string;
}

interface TemporalAnalysisData {
  series: TemporalSeriesPoint[];
}

interface TemporalAnalysisProps {
  data: TemporalAnalysisData | null;
  isProcessing?: boolean;
}

export function TemporalAnalysis({ data, isProcessing = false }: TemporalAnalysisProps) {
  // During Verification state
  if (isProcessing) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header flex items-center justify-between">
          <span>Temporal Analysis</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">
                  Temporal analysis is displayed only when time-series geometry data is explicitly provided by the server.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Time-structured geometry series (if provided by the server)
        </p>
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
      <div className="forensic-panel">
        <div className="forensic-panel-header flex items-center justify-between">
          <span>Temporal Analysis</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">
                  Temporal analysis is displayed only when time-series geometry data is explicitly provided by the server.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Time-structured geometry series (if provided by the server)
        </p>
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

  // Empty State (no temporal series)
  if (!data.series || data.series.length === 0) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header flex items-center justify-between">
          <span>Temporal Analysis</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">
                  Temporal analysis is displayed only when time-series geometry data is explicitly provided by the server.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Time-structured geometry series (if provided by the server)
        </p>
        <div className="forensic-panel-content">
          <p className="text-sm text-muted-foreground text-center py-4">
            No temporal series available
          </p>
          <p className="text-xs text-muted-foreground text-center">
            This analysis requires time-series data which was not provided for this scan.
          </p>
        </div>
      </div>
    );
  }

  // Data available state
  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header flex items-center justify-between">
        <span>Temporal Analysis</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-xs">
                Temporal analysis is displayed only when time-series geometry data is explicitly provided by the server.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Time-structured geometry series (if provided by the server)
      </p>
      <div className="forensic-panel-content">
        {/* Temporal series visualization placeholder */}
        <div className="h-24 bg-muted/20 rounded flex items-center justify-center">
          <p className="text-xs text-muted-foreground">
            {data.series.length} data points
          </p>
        </div>
      </div>
    </div>
  );
}

export type { TemporalAnalysisData, TemporalSeriesPoint };
