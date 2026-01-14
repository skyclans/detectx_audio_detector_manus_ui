/**
 * LiveScanConsole - Stateless Presentation Component
 * 
 * INTEGRATION RULES (MANDATORY):
 * - Renders injected logs only
 * - No stage generation or timing logic
 * - No internal log generation
 * - All scan logs provided externally by DetectX
 * 
 * CANONICAL INTENT:
 * The Live Scan Console exists to communicate process, restraint, and forensic posture,
 * not to persuade, predict, or accuse.
 * 
 * It reflects:
 * - Geometry-only detection authority
 * - Human-safe boundaries
 * - Deterministic, reproducible execution
 * - Explicit support for negative (no-evidence) outcomes
 * 
 * IMPLEMENTATION RULES (AUTHORITATIVE):
 * - All text is informational only
 * - No intermediate verdicts are implied
 * - Console output must not change verdict logic
 * - Messages may be displayed as static blocks or sequential logs
 * - No probability, likelihood, or confidence language is permitted
 */

import { useEffect, useRef } from "react";
import { Terminal } from "lucide-react";

/**
 * Scan log entry type (exported for external use)
 */
export interface ScanLogEntry {
  timestamp: string;
  message: string;
  type: "info" | "process" | "complete" | "warning" | "constraint" | "philosophy";
}

interface LiveScanConsoleProps {
  /** Whether verification is in progress (injected) */
  isVerifying: boolean;
  /** Whether verification is complete (injected) */
  isComplete: boolean;
  /** Scan logs to display (injected) */
  logs: ScanLogEntry[];
}

/**
 * LiveScanConsole Component
 * 
 * Stateless presentation component that renders scan logs.
 * No internal log generation, timing logic, or stage management.
 * All logs are provided externally by DetectX.
 */
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
      case "constraint":
        return "text-muted-foreground/80";
      case "philosophy":
        return "text-forensic-cyan/70";
      default:
        return "text-muted-foreground";
    }
  };

  const getLogPrefix = (type: ScanLogEntry["type"]) => {
    switch (type) {
      case "constraint":
        return "⊘";
      case "philosophy":
        return "◈";
      default:
        return "$";
    }
  };

  return (
    <div className="forensic-panel w-full mt-0 flex flex-col">
      <div className="forensic-panel-header flex items-center gap-2">
        <Terminal className="w-4 h-4" />
        <span>Live Scan Console</span>
        {isVerifying && (
          <span className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 bg-forensic-cyan rounded-full animate-pulse" />
            <span className="text-[10px] text-forensic-cyan uppercase tracking-wider">
              Forensic Signal Observation in Progress
            </span>
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
          className="h-[120px] lg:h-[160px] max-h-[120px] lg:max-h-[160px] overflow-y-auto bg-[oklch(0.12_0.01_260)] font-mono text-[10px] lg:text-xs p-2 lg:p-3 space-y-1 scrollbar-thin scrollbar-thumb-forensic-cyan/30 scrollbar-track-transparent"
        >
          {logs.length === 0 && !isVerifying ? (
            <div className="text-muted-foreground">
              <span className="text-forensic-cyan">$</span> Waiting for VERIFY AUDIO…
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className={`${getLogColor(log.type)} leading-relaxed`}>
                <span className="text-muted-foreground/60">[{log.timestamp}]</span>{" "}
                <span className={log.type === "constraint" ? "text-muted-foreground/60" : "text-forensic-cyan"}>
                  {getLogPrefix(log.type)}
                </span>{" "}
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
 * DEPRECATED: These functions are kept for backward compatibility only.
 * In stateless integration, all log generation should be handled externally by DetectX.
 * 
 * @deprecated Use externally provided logs instead
 */
export function generateScanLogs(stage: string): ScanLogEntry {
  const timestamp = new Date().toLocaleTimeString();
  
  const stageMessages: Record<string, { message: string; type: ScanLogEntry["type"] }> = {
    // Core Status / Engine Philosophy
    init: { message: "Real-time structural signal observation", type: "philosophy" },
    engine: { message: "Geometry-primary verification engine active", type: "philosophy" },
    baseline: { message: "Human baseline geometry enforced", type: "philosophy" },
    deterministic: { message: "Deterministic execution under fixed conditions", type: "philosophy" },
    
    // Scan Process (Observation Log)
    pipeline: { message: "Initializing forensic scan pipeline", type: "process" },
    lock: { message: "Locking analysis parameters", type: "process" },
    upload: { message: "Uploading audio file to secure storage", type: "process" },
    decode: { message: "Establishing normalization coordinate space", type: "process" },
    spectral: { message: "Observing residual structure", type: "process" },
    temporal: { message: "Monitoring residual persistence", type: "process" },
    geometry: { message: "Evaluating cross-stem geometry", type: "process" },
    crg: { message: "Comparing against human geometry envelope", type: "process" },
    
    // Constraints & Ethics (Non-Negotiable)
    constraint_prob: { message: "No probabilistic inference is performed", type: "constraint" },
    constraint_author: { message: "No authorship or intent is inferred", type: "constraint" },
    constraint_style: { message: "No similarity or style comparison is used", type: "constraint" },
    constraint_classify: { message: "This system does not classify or predict", type: "constraint" },
    constraint_absence: { message: "Absence of evidence is a valid outcome", type: "constraint" },
    
    // Pre-Verdict State (Completion Gate)
    finalize: { message: "Final geometry evaluation pending", type: "process" },
    complete: { message: "Results will be disclosed after full scan completion", type: "complete" },
  };

  const entry = stageMessages[stage] || { message: stage, type: "info" as const };
  return { timestamp, ...entry };
}

/**
 * DEPRECATED: Use externally provided logs instead.
 * 
 * @deprecated All log generation should be handled externally by DetectX
 */
export function getFullScanSequence(): string[] {
  return [
    "init", "engine", "baseline", "deterministic",
    "pipeline", "lock", "upload", "decode",
    "spectral", "temporal", "geometry", "crg",
    "constraint_prob", "constraint_author",
    "finalize", "complete",
  ];
}
