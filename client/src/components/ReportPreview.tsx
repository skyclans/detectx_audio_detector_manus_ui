/**
 * Report Preview Section (MANDATORY)
 * 
 * REQUIREMENTS:
 * - Display current verdict text (if available)
 * - Show CR-G status and structural findings summary
 * - Clearly labeled as preview
 * - NO probabilities, confidence scores, or AI attribution
 * 
 * This component remains IDLE until backend data is received.
 * NO mock data, NO simulated results, NO placeholder judgments.
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { FileText, AlertCircle, CheckCircle } from "lucide-react";

interface ReportPreviewProps {
  verdict: "observed" | "not_observed" | null;
  crgStatus: string | null;
  primaryExceededAxis: string | null;
  fileName: string | null;
  fileHash: string | null;
  isProcessing?: boolean;
  onExport?: () => void;
}

/**
 * Get verdict text based on CR-G status
 * CR-G is the SOLE verdict authority
 */
function getVerdictText(verdict: "observed" | "not_observed" | null): string {
  if (verdict === "observed") {
    return "AI signal evidence was observed.";
  }
  if (verdict === "not_observed") {
    return "AI signal evidence was not observed.";
  }
  return "";
}

export function ReportPreview({
  verdict,
  crgStatus,
  primaryExceededAxis,
  fileName,
  fileHash,
  isProcessing = false,
  onExport,
}: ReportPreviewProps) {
  const { isAuthenticated } = useAuth();

  if (isProcessing) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header">
          <span>Report Preview</span>
          <span className="text-[10px] text-muted-foreground ml-2">(Preview)</span>
        </div>
        <div className="forensic-panel-content">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-muted-foreground">Generating report preview...</p>
          </div>
        </div>
      </div>
    );
  }

  // IDLE state - waiting for backend data
  if (!verdict) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header">
          <span>Report Preview</span>
          <span className="text-[10px] text-muted-foreground ml-2">(Preview)</span>
        </div>
        <div className="forensic-panel-content">
          <p className="text-sm text-muted-foreground text-center py-6">
            Awaiting verification data
          </p>
        </div>
      </div>
    );
  }

  const verdictText = getVerdictText(verdict);
  const isAIDetected = verdict === "observed";

  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>Report Preview</span>
          <span className="text-[10px] text-muted-foreground">(Preview)</span>
        </div>
        {isAuthenticated && onExport && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={onExport}
          >
            <FileText className="w-3 h-3 mr-1" />
            Export
          </Button>
        )}
      </div>
      <div className="forensic-panel-content space-y-4">
        {/* Verdict Summary */}
        <div className={`p-3 rounded border-l-2 ${
          isAIDetected 
            ? "bg-forensic-amber/10 border-forensic-amber" 
            : "bg-forensic-green/10 border-forensic-green"
        }`}>
          <div className="flex items-start gap-2">
            {isAIDetected ? (
              <AlertCircle className="w-4 h-4 text-forensic-amber flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="w-4 h-4 text-forensic-green flex-shrink-0 mt-0.5" />
            )}
            <p className="text-xs text-foreground leading-relaxed font-medium">
              {verdictText}
            </p>
          </div>
        </div>

        {/* CR-G Status */}
        <div className="space-y-2">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
            CR-G Status
          </div>
          <div className="py-2 px-3 bg-muted/20 rounded">
            <span className="text-xs font-mono text-foreground">
              {crgStatus || "Pending"}
            </span>
          </div>
        </div>

        {/* Structural Findings Summary */}
        <div className="space-y-2">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Structural Findings
          </div>
          <div className="py-2 px-3 bg-muted/20 rounded space-y-1">
            {primaryExceededAxis ? (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Primary Exceeded Axis</span>
                <span className="font-mono text-foreground">{primaryExceededAxis}</span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No exceeded axes detected
              </p>
            )}
          </div>
        </div>

        {/* File Information */}
        <div className="pt-3 border-t border-border/50 space-y-1">
          {fileName && (
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">File</span>
              <span className="font-mono text-muted-foreground truncate max-w-[150px]">
                {fileName}
              </span>
            </div>
          )}
          {fileHash && (
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">Hash</span>
              <span className="font-mono text-muted-foreground truncate max-w-[150px]">
                {fileHash.substring(0, 16)}...
              </span>
            </div>
          )}
          <div className="flex justify-between text-[10px]">
            <span className="text-muted-foreground">Generated</span>
            <span className="font-mono text-muted-foreground">
              {new Date().toISOString().split("T")[0]}
            </span>
          </div>
        </div>

        {/* Auth notice */}
        {!isAuthenticated && (
          <p className="text-[10px] text-muted-foreground text-center">
            Sign in to export full report
          </p>
        )}
      </div>
    </div>
  );
}
