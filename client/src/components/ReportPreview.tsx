/**
 * Report Preview Section
 * 
 * Displays a preview of the verification report from backend.
 * This component remains IDLE until backend data is received.
 * NO mock data, NO simulated results, NO placeholder judgments.
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface ReportPreviewData {
  summary: string;
  sections: {
    title: string;
    content: string;
  }[];
  generatedAt: string;
  fileHash: string;
}

interface ReportPreviewProps {
  data: ReportPreviewData | null;
  isProcessing?: boolean;
  onExport?: () => void;
}

export function ReportPreview({ data, isProcessing = false, onExport }: ReportPreviewProps) {
  const { isAuthenticated } = useAuth();

  if (isProcessing) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header">Report Preview</div>
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
  if (!data) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header">Report Preview</div>
        <div className="forensic-panel-content">
          <p className="text-sm text-muted-foreground text-center py-6">
            Awaiting verification data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header flex items-center justify-between">
        <span>Report Preview</span>
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
        {/* Summary */}
        <div className="p-3 bg-muted/20 rounded border-l-2 border-forensic-cyan">
          <p className="text-xs text-foreground leading-relaxed">{data.summary}</p>
        </div>

        {/* Sections */}
        {data.sections.length > 0 && (
          <div className="space-y-3 max-h-40 overflow-y-auto">
            {data.sections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </div>
                <p className="text-xs text-muted-foreground">{section.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-border/50 space-y-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-muted-foreground">Generated</span>
            <span className="font-mono text-muted-foreground">{data.generatedAt}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-muted-foreground">File Hash</span>
            <span className="font-mono text-muted-foreground truncate max-w-[150px]">
              {data.fileHash}
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
