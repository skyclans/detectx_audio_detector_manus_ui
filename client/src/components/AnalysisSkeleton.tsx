/**
 * Analysis Panel Skeleton Placeholder
 * 
 * INITIAL LOAD STATE (UX REQUIREMENT):
 * - Display skeleton placeholders for all analysis panels
 * - Clearly indicate "Awaiting verification data"
 * - Do NOT display any verdicts, events, or analysis results
 * - Non-inferential visual representation
 */

import { Skeleton } from "@/components/ui/skeleton";

interface AnalysisSkeletonProps {
  title: string;
  rows?: number;
}

export function AnalysisSkeleton({ title, rows = 3 }: AnalysisSkeletonProps) {
  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header">{title}</div>
      <div className="forensic-panel-content space-y-3">
        {/* Skeleton rows */}
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="space-y-2">
            <Skeleton className="h-3 w-24 bg-muted/30" />
            <Skeleton className="h-4 w-full bg-muted/20" />
          </div>
        ))}
        
        {/* Awaiting data indicator */}
        <div className="pt-2 text-center">
          <p className="text-xs text-muted-foreground">
            Awaiting verification data
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Verdict Skeleton - for Verification Result panel
 */
export function VerdictSkeleton() {
  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header">Verification Result</div>
      <div className="forensic-panel-content">
        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          {/* Status indicator placeholder */}
          <Skeleton className="w-16 h-16 rounded-full bg-muted/30" />
          
          {/* Verdict text placeholder */}
          <div className="space-y-2 w-full max-w-xs">
            <Skeleton className="h-4 w-full bg-muted/20" />
            <Skeleton className="h-3 w-3/4 mx-auto bg-muted/20" />
          </div>
          
          {/* Awaiting data indicator */}
          <p className="text-xs text-muted-foreground">
            Upload and verify an audio file to see results
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Timeline Skeleton - for Geometry & Timeline Context panel
 */
export function TimelineSkeleton() {
  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header">Geometry & Timeline Context</div>
      <div className="forensic-panel-content">
        <div className="space-y-3">
          {/* Timeline bar placeholder */}
          <Skeleton className="h-8 w-full bg-muted/20 rounded" />
          
          {/* Event markers placeholder */}
          <div className="flex justify-between">
            <Skeleton className="h-2 w-2 rounded-full bg-muted/30" />
            <Skeleton className="h-2 w-2 rounded-full bg-muted/30" />
            <Skeleton className="h-2 w-2 rounded-full bg-muted/30" />
            <Skeleton className="h-2 w-2 rounded-full bg-muted/30" />
          </div>
          
          {/* Awaiting data indicator */}
          <p className="text-xs text-muted-foreground text-center pt-2">
            No structural events detected
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Export Skeleton - for Export Report panel
 */
export function ExportSkeleton() {
  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header">Export Report</div>
      <div className="forensic-panel-content">
        <div className="grid grid-cols-2 gap-3">
          {["PDF", "JSON", "CSV", "Markdown"].map((format) => (
            <div
              key={format}
              className="flex flex-col items-center justify-center py-4 px-3 bg-muted/10 rounded border border-border/30 opacity-50"
            >
              <Skeleton className="w-6 h-6 mb-2 bg-muted/30" />
              <span className="text-xs text-muted-foreground">{format}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3">
          Complete verification to enable export
        </p>
      </div>
    </div>
  );
}

/**
 * Waveform Skeleton - for initial load state
 */
export function WaveformSkeleton() {
  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header">Waveform Analysis</div>
      <div className="p-0">
        <div className="w-full h-32 bg-card flex items-center justify-center">
          <div className="text-center">
            <Skeleton className="h-16 w-full bg-muted/10 mb-2" />
            <p className="text-xs text-muted-foreground">
              Awaiting audio file
            </p>
          </div>
        </div>
        <div className="flex justify-between px-2 py-1 text-[10px] font-mono text-muted-foreground bg-muted/30">
          <span>0:00</span>
          <span>--:--</span>
          <span>--:--</span>
          <span>--:--</span>
          <span>--:--</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Metadata Skeleton - for File Metadata panel
 */
export function MetadataSkeleton() {
  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header">File Metadata</div>
      <div className="forensic-panel-content">
        <div className="space-y-2">
          {["File Name", "Duration", "Sample Rate", "Bit Depth", "Channels", "Codec", "Hash"].map((label) => (
            <div key={label} className="flex justify-between items-center py-1">
              <span className="text-xs text-muted-foreground">{label}</span>
              <Skeleton className="h-3 w-24 bg-muted/20" />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3">
          No file selected
        </p>
      </div>
    </div>
  );
}
