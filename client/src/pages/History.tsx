/**
 * History Page - DISABLED for Anonymous Stateless Verification Flow
 * 
 * NON-NEGOTIABLE CONSTRAINTS:
 * 1) No upload history
 * 2) No file retention
 * 3) No session-based access control
 * 
 * This page displays a message explaining that verification history
 * is not available in the anonymous stateless verification mode.
 */

import { ForensicLayout } from "@/components/ForensicLayout";
import { FileAudio, Info } from "lucide-react";

export default function History() {
  return (
    <ForensicLayout>
      <div className="forensic-panel">
        <div className="forensic-panel-header flex items-center gap-2">
          <FileAudio className="w-4 h-4" />
          Verification History
        </div>
        <div className="forensic-panel-content">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Info className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">History Not Available</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              DetectX Audio operates in anonymous stateless verification mode.
              Verification records are not stored or retained.
            </p>
            <div className="mt-6 p-4 bg-muted/30 rounded-lg max-w-md">
              <p className="text-xs text-muted-foreground">
                <strong>Privacy Notice:</strong> Your uploaded files are processed
                in-memory and immediately discarded after verification. No data
                is stored on Manus servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ForensicLayout>
  );
}
