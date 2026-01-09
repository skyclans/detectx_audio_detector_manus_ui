/**
 * Live Scan Console ("Hacker Terminal") Component
 * 
 * REQUIREMENTS (MANDATORY):
 * - Visible as part of the workflow (not removed)
 * - Placed directly BELOW waveform visualization
 * - Must have EXACTLY same width as waveform container
 * - Treat waveform + console as single continuous analysis block
 * - Console log must be append-only and auto-scroll to newest line
 * - While idle: show "Waiting for VERIFY AUDIO…"
 * - Must NOT claim verdict unless from backend
 * 
 * DESIGN CONSTRAINTS:
 * - Keep existing colors, card styles, buttons, typography
 * - Keep DetectX evidence-only rules
 */

import { useEffect, useRef } from "react";
import { Terminal } from "lucide-react";

interface ScanLogEntry {
  timestamp: string;
  message: string;
  type: "info" | "process" | "complete" | "warning";
}

interface LiveScanConsoleProps {
  isVerifying: boolean;
  isComplete: boolean;
  logs: ScanLogEntry[];
}

export function LiveScanConsole({
  isVerifying,
  isComplete,
  logs,
}: LiveScanConsoleProps) {
  const consoleRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to newest line
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (type: ScanLogEntry["type"]) => {
    switch (type) {
      case "info":
        return "text-muted-foreground";
      case "process":
        return "text-forensic-cyan";
      case "complete":
        return "text-forensic-green";
      case "warning":
        return "text-forensic-amber";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="forensic-panel w-full mt-0">
      <div className="forensic-panel-header flex items-center gap-2">
        <Terminal className="w-4 h-4" />
        <span>Live Scan Console</span>
        {isVerifying && (
          <span className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 bg-forensic-cyan rounded-full animate-pulse" />
            <span className="text-[10px] text-forensic-cyan">SCANNING</span>
          </span>
        )}
        {isComplete && !isVerifying && (
          <span className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 bg-forensic-green rounded-full" />
            <span className="text-[10px] text-forensic-green">COMPLETE</span>
          </span>
        )}
      </div>
      <div className="forensic-panel-content p-0">
        <div
          ref={consoleRef}
          className="h-40 overflow-y-auto bg-[oklch(0.12_0.01_260)] font-mono text-xs p-3 space-y-1"
        >
          {logs.length === 0 && !isVerifying ? (
            <div className="text-muted-foreground">
              <span className="text-forensic-cyan">$</span> Waiting for VERIFY AUDIO…
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className={`${getLogColor(log.type)} leading-relaxed`}>
                <span className="text-muted-foreground/60">[{log.timestamp}]</span>{" "}
                <span className="text-forensic-cyan">$</span>{" "}
                {log.message}
              </div>
            ))
          )}
          {isVerifying && (
            <div className="text-forensic-cyan animate-pulse">
              <span className="text-muted-foreground/60">[{new Date().toLocaleTimeString()}]</span>{" "}
              <span className="text-forensic-cyan">$</span>{" "}
              Processing...
              <span className="inline-block w-2 h-3 bg-forensic-cyan ml-1 animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Generate scan log entries for verification process
 * These are UI-only status messages, NOT verdicts
 */
export function generateScanLogs(stage: string): ScanLogEntry {
  const timestamp = new Date().toLocaleTimeString();
  
  const stageMessages: Record<string, { message: string; type: ScanLogEntry["type"] }> = {
    init: { message: "Initializing forensic scan engine...", type: "info" },
    upload: { message: "Uploading audio file to secure storage...", type: "process" },
    decode: { message: "Decoding audio stream...", type: "process" },
    spectral: { message: "Analyzing spectral characteristics...", type: "process" },
    temporal: { message: "Processing temporal patterns...", type: "process" },
    geometry: { message: "Running geometry scan trace...", type: "process" },
    crg: { message: "Evaluating CR-G status...", type: "process" },
    finalize: { message: "Finalizing analysis results...", type: "process" },
    complete: { message: "Scan complete. Results ready.", type: "complete" },
  };

  const entry = stageMessages[stage] || { message: stage, type: "info" as const };
  return { timestamp, ...entry };
}
