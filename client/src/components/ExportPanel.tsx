/**
 * Export Panel — Forensic Evidence Documentation
 *
 * Enhanced Mode v3 (2026-05-31 — Forensic mode enabled):
 *  - DetectX Engine v3 (Primary CNN classifier)
 *  - Reconstruction Engine (RECON 7-metric stem-based analysis)
 *  - 4-tier verdict display (CNN x Backend verdict combination)
 *  - RECON 7-metric raw values + thresholds disclosed for legal evidence
 *
 * Forensic evidence policy (sees memory/feedback_evidence_report_secrets.md):
 *  - Patent-disclosed measurements may be exported with precise values.
 *  - Marketing claims (e.g. "<1% FP") are removed; legal evidence tone only.
 *  - "DetectX does not determine authorship, intent, or ownership."
 *
 * EXPORT FORMAT REQUIREMENTS:
 *  - CSV / XLS headers horizontal (column-based)
 *  - CSV UTF-8 with BOM
 *  - Korean / Japanese / Chinese filenames preserved
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileJson, FileSpreadsheet, FileText, FileType, Download } from "lucide-react";
import JSZip from "jszip";
import { ReportTypeModal } from "@/components/ReportTypeModal";
import {
  formatMarginPct,
  strengthLabel,
  strengthColor,
  formatStrengthSummary,
  type Strength,
  type ReconMetricEnriched,
  type StrengthSummary,
} from "@/lib/recon_strength";

const ENGINE_MODE = "Enhanced Mode";
const REPORT_VERSION = "3.1.0";

/**
 * Server-derived summary used only for the RECON section (count chip,
 * v2 confidence). The bundle no longer contains the raw key names or
 * the threshold values.
 */
export interface ReconMetricsData {
  ai_signals?: number | null;
  v2_confidence?: number | null;
}

interface VerdictResult {
  verdict: "AI signal evidence was observed." | "AI signal evidence was not observed." | null;
  exceeded_axes: string[];
  cnn_score?: number;
  recon_metrics?: ReconMetricsData | null;
}

interface ExportData {
  fileName: string;
  fileSize: number;
  duration: number | null;
  sampleRate: number | null;
  bitDepth: number | null;
  channels: number | null;
  codec: string | null;
  fileHash: string | null;
  artist: string | null;
  title: string | null;
  album: string | null;
  isrc: string | null;
  verdict: VerdictResult | null;
  /** Primary engine confidence (0-1), display only. */
  cnnScore: number | null;
  /** Final AI probability (0-1) from the server. */
  finalScore?: number | null;
  /** "cnn" or "recon" — source of finalScore */
  finalScoreSource?: string | null;
  /** Optional aggregate fields (count chip + secondary engine confidence). */
  reconMetrics: ReconMetricsData | null;
  /** Server-computed enriched RECON rows. UI renders these verbatim. */
  reconMetricsEnriched?: ReconMetricEnriched[] | null;
  /** Server-computed strength bucket counts. */
  strengthSummary?: StrengthSummary | null;
  /** Server-computed tier label. */
  tier?: string | null;
  timelineMarkers: { timestamp: number; type: string }[];
  analysisTimestamp: string;
}

interface ExportPanelProps {
  data: ExportData | null;
  disabled?: boolean;
  /** Optional record/request id used by the "Professional Forensic" CTA
   *  to prefill the /forensic/request form with a related scan reference. */
  recordId?: string | null;
}

// -----------------------------------------------------------------------
// Verdict tier derivation (mirrors VerdictPanel.tsx 4-tier semantics)
// -----------------------------------------------------------------------

type VerdictTier = "human" | "mixed-human" | "mixed-ai" | "ai" | "unknown";

function deriveTier(data: ExportData): VerdictTier {
  // Tier is server-authoritative. The bundle does not compare cnn_score
  // against the band boundary values.
  const t = data.tier;
  if (t === "human" || t === "mixed-human" || t === "mixed-ai" || t === "ai") return t;
  // Fallback: if no tier was sent, use the binary verdict to render
  // something stable rather than leaking a boundary comparison.
  const v = data.verdict?.verdict ?? null;
  if (v == null) return "unknown";
  return v === "AI signal evidence was observed." ? "ai" : "human";
}

function deriveTierLabel(tier: VerdictTier): string {
  switch (tier) {
    case "human":       return "AI Signal Not Observed";
    case "mixed-human": return "AI Signal Not Observed — Recovered by Deep Scan Analysis";
    case "mixed-ai":    return "AI Signal Observed — Confirmed by Deep Scan Analysis";
    case "ai":          return "AI Signal Observed";
    case "unknown":     return "Pending";
  }
}

function deriveTierCode(tier: VerdictTier): string {
  switch (tier) {
    case "human":       return "AI_NOT_OBSERVED";
    case "mixed-human": return "AI_NOT_OBSERVED_RECOVERED";
    case "mixed-ai":    return "AI_OBSERVED_CONFIRMED";
    case "ai":          return "AI_OBSERVED";
    case "unknown":     return "PENDING";
  }
}

// Display score = finalScore when provided (RECON-based in 50-80% Mixed range),
// else falls back to cnnScore (CNN-based outside Mixed range or pre-final_score backends).
function getDisplayScore(data: ExportData): number | null {
  return data.finalScore != null ? data.finalScore : data.cnnScore;
}

function getDisplayScoreSourceLabel(data: ExportData): string {
  if (data.finalScore == null) return "Primary Engine";
  return data.finalScoreSource === "recon"
    ? "Deep Scan (DetectX Deep Forensic Engine)"
    : "Primary Engine";
}

// -----------------------------------------------------------------------
// RECON metric helpers
// -----------------------------------------------------------------------

interface ReconRow {
  label: string;
  value: number | null;
  formatted: string;
  exceededAi: boolean;
  /** Signed margin (AI-positive). Null when measurement is missing. */
  margin: number | null;
  /** Strength bucket. Null when measurement is missing. */
  strength: Strength | null;
  /** Formatted margin string ("+34.6%"). Empty when missing. */
  marginText: string;
  /** Bar position 0-100 (Human=0, AI=100). Null when missing. */
  barPosition: number | null;
}

function buildReconRows(data: ExportData): ReconRow[] {
  const enriched = data.reconMetricsEnriched;
  if (!enriched || enriched.length === 0) return [];
  return enriched.map((row) => ({
    label: row.label,
    value: row.value ?? null,
    formatted: row.formatted,
    exceededAi: row.exceeded_ai ?? false,
    margin: row.margin ?? null,
    strength: (row.strength as Strength | null) ?? null,
    marginText: row.margin != null ? formatMarginPct(row.margin) : "",
    barPosition: row.bar_position ?? null,
  }));
}

function getAiSignalsCount(data: ExportData): { count: number; total: number } | null {
  const enriched = data.reconMetricsEnriched ?? [];
  if (data.reconMetrics?.ai_signals != null) {
    return { count: data.reconMetrics.ai_signals, total: enriched.length || 7 };
  }
  if (enriched.length === 0) return null;
  const measured = enriched.filter((r) => r.value != null);
  if (measured.length === 0) return null;
  return { count: measured.filter((r) => r.exceeded_ai).length, total: measured.length };
}

// -----------------------------------------------------------------------
// Common formatting helpers
// -----------------------------------------------------------------------

function getVerdictText(verdict: VerdictResult | null): string {
  return verdict?.verdict || "";
}

function formatDuration(seconds: number): string {
  const totalSeconds = Math.floor(seconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Forensic-tone description text per tier.
 * No marketing claims ("<1% FP" etc.).
 */
function describeTier(tier: VerdictTier): string {
  switch (tier) {
    case "human":
      return "The DetectX dual-engine verification system did not record structural signal evidence of AI synthesis. The DetectX Engine reported a confidence below the lower decision threshold; the DetectX Deep Forensic Engine was not triggered.";
    case "mixed-human":
      return "The DetectX Engine reported confidence within the intermediate decision range (50%-80%). The DetectX Deep Forensic Engine was invoked and its 7-metric stem-reconstruction analysis recovered the result as Human signal (insufficient AI signal count). Expert review is recommended for legal and forensic adjudication.";
    case "mixed-ai":
      return "The DetectX Engine reported confidence within the intermediate decision range (50%-80%). The DetectX Deep Forensic Engine was invoked and its 7-metric stem-reconstruction analysis confirmed AI signal (sufficient AI signal count). Expert review is recommended for legal and forensic adjudication.";
    case "ai":
      return "The DetectX Engine reported confidence at or above the upper decision threshold. Structural signal evidence consistent with AI-generated audio was recorded. The DetectX Deep Forensic Engine was not required for verdict determination.";
    case "unknown":
      return "Verification pending. No result available.";
  }
}

const DISCLAIMER = "DetectX does not determine authorship, intent, or ownership. This verification is based solely on structural signal observations of the submitted audio file. Audio with extensive post-processing, synthesis, or heavy digital manipulation may exhibit signal characteristics similar to AI-generated music. Final adjudication is subject to the policies of the receiving institution, court, or authority.";

// -----------------------------------------------------------------------
// PDF (HTML for browser print)
// -----------------------------------------------------------------------

function generatePDFContent(data: ExportData): string {
  const tier = deriveTier(data);
  const tierLabel = deriveTierLabel(tier);
  const description = describeTier(tier);
  const reconRows = buildReconRows(data);
  const signals = getAiSignalsCount(data);
  const verdictColor =
    tier === "human" || tier === "mixed-human" ? "#22c55e" :
    tier === "mixed-ai" ? "#f59e0b" :
    tier === "ai" ? "#ef4444" :
    "#94a3b8";
  const verdictBg =
    tier === "human" || tier === "mixed-human" ? "#f0fdf4" :
    tier === "mixed-ai" ? "#fef3c7" :
    tier === "ai" ? "#fee2e2" :
    "#f1f5f9";

  const strengthSummary: StrengthSummary = data.strengthSummary ?? { strong_ai: 0, ai: 0, human: 0, strong_human: 0, text: "" };
  const strengthSummaryText = formatStrengthSummary(strengthSummary);
  const reconTable = reconRows.length > 0 ? `
  <h2>Deep Forensic 7-Metric Structural Measurements</h2>
  <p class="desc">
    The DetectX Deep Forensic Engine separates the input audio into source-component stems and
    reconstructs the signal by recombining them. The seven structural measurements below
    quantify residual differences between the original and reconstructed signals. Each
    measurement is reported with its <strong>signed margin</strong> from the threshold
    (positive = AI-side, negative = Human-side) and a <strong>strength bucket</strong>
    derived from that margin. The continuous DetectX classifier weighs each metric by
    its margin, not by a binary yes/no &mdash; so a "6/7" count of border-crossings can
    still yield a Human-leaning final confidence when most crossings are marginal.
  </p>
  <table class="recon-table">
    <tr>
      <th style="width: 130px;">Metric</th>
      <th style="width: 90px;">Measured</th>
      <th style="width: 70px;">Margin</th>
      <th style="width: 110px;">Strength</th>
      <th>Human &larr;&nbsp;|&nbsp;&rarr; AI</th>
    </tr>
    ${reconRows.map((r) => {
      if (r.value == null || r.strength == null || r.barPosition == null) {
        return `
        <tr>
          <td>${r.label}</td>
          <td class="small-mono">&mdash;</td>
          <td class="small-mono">&mdash;</td>
          <td>&mdash;</td>
          <td>&mdash;</td>
        </tr>`;
      }
      const color = strengthColor(r.strength).hex;
      return `
      <tr>
        <td>${r.label}</td>
        <td class="small-mono">${r.formatted}</td>
        <td class="small-mono" style="color: ${color}; font-weight: 600;">${r.marginText}</td>
        <td><span class="strength-badge" style="background: ${color}22; color: ${color}; border: 1px solid ${color}55;">${strengthLabel(r.strength)}</span></td>
        <td>
          <div class="bar-track">
            <div class="bar-mid"></div>
            <div class="bar-marker" style="left: ${r.barPosition.toFixed(1)}%; background: ${color};"></div>
          </div>
        </td>
      </tr>`;
    }).join("")}
    ${signals ? `
      <tr style="background:#f8fafc;">
        <td colspan="3"><strong>AI Signal Count</strong></td>
        <td colspan="3" class="small-mono"><strong>${signals.count} / ${signals.total}</strong>${strengthSummaryText ? ` &mdash; ${strengthSummaryText}` : ""}</td>
      </tr>` : ""}
  </table>
  ` : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>DetectX Forensic Report - ${data.fileName.replace(/\.[^/.]+$/, "")}</title>
  <style>
    @page { size: A4; margin: 15mm 20mm; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: #1f2937; font-size: 10.5px; line-height: 1.5; padding: 0; }
    .header { border-bottom: 2px solid #0d9488; padding-bottom: 8px; margin-bottom: 12px; }
    .header h1 { font-size: 18px; color: #0d9488; margin: 0; }
    .meta { display: flex; flex-wrap: wrap; gap: 4px 24px; margin-bottom: 10px; font-size: 9.5px; color: #6b7280; }
    h2 { font-size: 12px; color: #374151; margin: 14px 0 6px; border-left: 3px solid #0d9488; padding-left: 6px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    th, td { padding: 5px 8px; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 10px; vertical-align: top; }
    th { background: #f3f4f6; font-weight: 600; }
    .verdict { font-size: 13px; padding: 10px 14px; background: ${verdictBg}; border-left: 4px solid ${verdictColor}; margin: 8px 0; color: ${verdictColor}; font-weight: 600; }
    .desc { font-size: 10px; color: #4b5563; margin-bottom: 10px; }
    .engine-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 8px 12px; margin-bottom: 10px; }
    .engine-item { margin: 3px 0; font-size: 10px; }
    .disclaimer { background: #fefce8; border: 1px solid #fde68a; border-radius: 4px; padding: 8px 10px; font-size: 9px; color: #4b5563; margin-bottom: 8px; line-height: 1.45; }
    .footer { font-size: 8.5px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 6px; text-align: center; margin-top: 14px; }
    .small-mono { font-family: monospace; font-size: 9.5px; }
    .recon-table th, .recon-table td { padding: 4px 6px; }
    .strength-badge { display: inline-block; font-size: 9px; padding: 1px 6px; border-radius: 8px; font-weight: 600; letter-spacing: 0.2px; white-space: nowrap; }
    .bar-track { position: relative; width: 100%; min-width: 120px; height: 10px; background: linear-gradient(to right, #ecfdf5 0%, #f3f4f6 50%, #fef2f2 100%); border: 1px solid #e5e7eb; border-radius: 5px; }
    .bar-mid { position: absolute; left: 50%; top: -2px; bottom: -2px; width: 1px; background: #9ca3af; }
    .bar-marker { position: absolute; top: -2px; width: 4px; height: 14px; border-radius: 2px; transform: translateX(-2px); box-shadow: 0 0 0 1px rgba(255,255,255,0.6); }
  </style>
</head>
<body>
  <div class="header">
    <h1>DetectX Forensic Verification Report</h1>
  </div>

  <div class="meta">
    <span><strong>Generated:</strong> ${data.analysisTimestamp}</span>
    <span><strong>Mode:</strong> ${ENGINE_MODE}</span>
    
    <span><strong>Report:</strong> ${REPORT_VERSION}</span>
  </div>

  <h2>File Information</h2>
  <table>
    <tr><th style="width: 140px;">Filename</th><td>${data.fileName}</td></tr>
    <tr><th>File Size</th><td>${(data.fileSize / 1024 / 1024).toFixed(2)} MB (${data.fileSize} bytes)</td></tr>
    <tr><th>Duration</th><td>${data.duration ? formatDuration(data.duration) : "N/A"}${data.duration ? ` (${data.duration.toFixed(2)} s)` : ""}</td></tr>
    <tr><th>Sample Rate</th><td>${data.sampleRate ? `${data.sampleRate} Hz` : "N/A"}</td></tr>
    <tr><th>Bit Depth</th><td>${data.bitDepth ? `${data.bitDepth}-bit` : "N/A"}</td></tr>
    <tr><th>Channels</th><td>${data.channels || "N/A"}</td></tr>
    <tr><th>Codec</th><td>${data.codec || "N/A"}</td></tr>
    ${data.artist ? `<tr><th>Artist</th><td>${data.artist}</td></tr>` : ""}
    ${data.title ? `<tr><th>Title</th><td>${data.title}</td></tr>` : ""}
    ${data.album ? `<tr><th>Album</th><td>${data.album}</td></tr>` : ""}
    ${data.isrc ? `<tr><th>ISRC</th><td class="small-mono">${data.isrc}</td></tr>` : ""}
    <tr><th>SHA-256</th><td class="small-mono">${data.fileHash || "N/A"}</td></tr>
  </table>

  <h2>Verification Result</h2>
  <div class="verdict">
    ${tierLabel}
  </div>
  <p class="desc">${description}</p>
  ${(() => {
    const displayScore = getDisplayScore(data);
    if (displayScore == null) return "";
    const sourceLabel = getDisplayScoreSourceLabel(data);
    const isRecon = data.finalScoreSource === "recon" && data.finalScore != null;
    return `
    <table>
      <tr>
        <th style="width: 200px;">Verification Confidence (AI)</th>
        <td class="small-mono">${(displayScore * 100).toFixed(2)}%</td>
      </tr>
      <tr>
        <th>Verification Confidence (Human)</th>
        <td class="small-mono">${((1 - displayScore) * 100).toFixed(2)}%</td>
      </tr>
      <tr>
        <th>Score Source</th>
        <td>${sourceLabel}</td>
      </tr>
      ${isRecon && data.cnnScore != null ? `
      <tr>
        <th>Primary Engine Score</th>
        <td class="small-mono">${(data.cnnScore * 100).toFixed(2)}% &mdash; flagged for Deep Scan</td>
      </tr>` : ""}
      <tr>
        <th>Backend Verdict (Binary)</th>
        <td>${getVerdictText(data.verdict) || "Pending"}</td>
      </tr>
      <tr>
        <th>Verdict Code</th>
        <td class="small-mono">${deriveTierCode(tier)}</td>
      </tr>
    </table>`;
  })()}

  ${reconTable}

  <h2>Verification Engine Details</h2>
  <div class="engine-box">
    <div class="engine-item"><strong>Primary Engine:</strong> DetectX Engine (deep neural network) trained for structural AI-signal observation.</div>
    <div class="engine-item"><strong>Secondary Engine:</strong> DetectX Deep Forensic Engine — source-component separation followed by 7-metric residual analysis. Invoked when primary confidence falls within the intermediate decision range (50%-80%).</div>
    <div class="engine-item"><strong>Verdict Determination:</strong> Backend produces a binary verdict (Observed / Not Observed). The display layer renders a 4-tier label indicating Deep Scan recovery or confirmation in the intermediate range.</div>
  </div>

  <div class="disclaimer">
    <strong>Disclaimer:</strong> ${DISCLAIMER}
  </div>

  <div class="footer">
    DetectX Audio AI Detector &mdash; ${ENGINE_MODE} &bull; Report ${REPORT_VERSION} &bull; detectx.app
  </div>
</body>
</html>`;
}

// -----------------------------------------------------------------------
// JSON
// -----------------------------------------------------------------------

function generateJSON(data: ExportData): string {
  const tier = deriveTier(data);
  const reconRows = buildReconRows(data);
  const signals = getAiSignalsCount(data);

  const report = {
    reportVersion: REPORT_VERSION,
    generatedAt: data.analysisTimestamp,
    engine: {
      mode: ENGINE_MODE,
      primary: {
        name: "DetectX Primary Classifier",
        role: "Primary",
        description: "Structural AI signal observation.",
      },
      secondary: {
        name: "DetectX Deep Forensic Engine",
        role: "Secondary",
        description: "Source-component separation + 7-metric residual analysis. Invoked at intermediate confidence range.",
      },
    },
    file: {
      name: data.fileName,
      size: data.fileSize,
      duration: data.duration,
      sampleRate: data.sampleRate,
      bitDepth: data.bitDepth,
      channels: data.channels,
      codec: data.codec,
      artist: data.artist,
      title: data.title,
      album: data.album,
      isrc: data.isrc,
      hash: data.fileHash,
    },
    verification: {
      tier,
      tierLabel: deriveTierLabel(tier),
      tierCode: deriveTierCode(tier),
      tierDescription: describeTier(tier),
      backendVerdict: getVerdictText(data.verdict),
      cnnConfidenceAi: data.cnnScore,
      cnnConfidenceHuman: data.cnnScore != null ? 1 - data.cnnScore : null,
      finalConfidenceAi: getDisplayScore(data),
      finalConfidenceHuman: getDisplayScore(data) != null ? 1 - (getDisplayScore(data) as number) : null,
      finalScoreSource: data.finalScoreSource ?? (data.cnnScore != null ? "cnn" : null),
      exceededAxes: data.verdict?.exceeded_axes ?? [],
    },
    reconMetrics: reconRows.length > 0 ? (() => {
      const strengthSum: StrengthSummary = data.strengthSummary ?? { strong_ai: 0, ai: 0, human: 0, strong_human: 0, text: "" };
      return {
        values: reconRows.map((r) => ({
          metric: r.label,
          measuredValue: r.value,
          formattedValue: r.formatted,
          aiConsistent: r.value == null ? null : r.exceededAi,
          margin: r.margin,
          marginPercent: r.margin != null ? r.margin * 100 : null,
          strength: r.strength,
          strengthLabel: r.strength ? strengthLabel(r.strength) : null,
        })),
        aiSignalCount: signals?.count ?? null,
        aiSignalTotal: signals?.total ?? null,
        strengthSummary: {
          strongAi: strengthSum.strong_ai,
          marginalAi: strengthSum.ai,
          marginalHuman: strengthSum.human,
          strongHuman: strengthSum.strong_human,
          text: formatStrengthSummary(strengthSum),
        },
        v2Confidence: data.reconMetrics?.v2_confidence ?? null,
      };
    })() : null,
    timelineEvents: data.timelineMarkers,
    disclaimer: DISCLAIMER,
  };
  return JSON.stringify(report, null, 2);
}

// -----------------------------------------------------------------------
// CSV
// -----------------------------------------------------------------------

function generateCSV(data: ExportData): string {
  const escapeCSV = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n") || /[^\x00-\x7F]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const tier = deriveTier(data);
  const reconRows = buildReconRows(data);
  const signals = getAiSignalsCount(data);

  // Horizontal headers - one analysis = one row
  const headers = [
    "Filename",
    "File Size (bytes)",
    "Duration (sec)",
    "Sample Rate (Hz)",
    "Bit Depth",
    "Channels",
    "Codec",
    "Artist",
    "Title",
    "Album",
    "ISRC",
    "SHA-256 Hash",
    "Verdict (Tier Label)",
    "Verdict Code",
    "Backend Verdict",
    "Primary Engine Confidence AI",
    "Primary Engine Confidence Human",
    "Final Confidence AI",
    "Final Confidence Human",
    "Final Score Source",
    "Deep Forensic AI Signal Count",
    "Deep Forensic Total Measured",
    ...reconRows.map((r) => `${r.label} (value)`),
    ...reconRows.map((r) => `${r.label} (AI-consistent)`),
    ...reconRows.map((r) => `${r.label} (margin %)`),
    ...reconRows.map((r) => `${r.label} (strength)`),
    "Strength Summary (Strong AI / AI / Human / Strong Human)",
    "Detection Mode",
    "Report Version",
    "Analysis Timestamp",
  ];

  const values: (string | number)[] = [
    escapeCSV(data.fileName),
    data.fileSize,
    data.duration ?? "",
    data.sampleRate ?? "",
    data.bitDepth ?? "",
    data.channels ?? "",
    escapeCSV(data.codec),
    escapeCSV(data.artist),
    escapeCSV(data.title),
    escapeCSV(data.album),
    escapeCSV(data.isrc),
    escapeCSV(data.fileHash),
    escapeCSV(deriveTierLabel(tier)),
    escapeCSV(deriveTierCode(tier)),
    escapeCSV(getVerdictText(data.verdict)),
    data.cnnScore != null ? data.cnnScore.toFixed(6) : "",
    data.cnnScore != null ? (1 - data.cnnScore).toFixed(6) : "",
    getDisplayScore(data) != null ? (getDisplayScore(data) as number).toFixed(6) : "",
    getDisplayScore(data) != null ? (1 - (getDisplayScore(data) as number)).toFixed(6) : "",
    escapeCSV(data.finalScoreSource ?? (data.cnnScore != null ? "cnn" : "")),
    signals ? signals.count : "",
    signals ? signals.total : "",
    ...reconRows.map((r) => (r.value != null ? r.value : "")),
    ...reconRows.map((r) => (r.value == null ? "" : r.exceededAi ? "Yes" : "No")),
    ...reconRows.map((r) => (r.margin != null ? (r.margin * 100).toFixed(2) : "")),
    ...reconRows.map((r) => (r.strength ? escapeCSV(strengthLabel(r.strength)) : "")),
    escapeCSV(formatStrengthSummary(data.strengthSummary ?? { strong_ai: 0, ai: 0, human: 0, strong_human: 0, text: "" })),
    escapeCSV(ENGINE_MODE),
    escapeCSV(REPORT_VERSION),
    escapeCSV(data.analysisTimestamp),
  ];

  let csv = headers.join(",") + "\n" + values.join(",");

  if (data.timelineMarkers.length > 0) {
    csv += "\n\n";
    csv += "Timeline Events\n";
    csv += "Index,Event Type,Timestamp (ms)\n";
    data.timelineMarkers.forEach((marker, idx) => {
      csv += `${idx + 1},${escapeCSV(marker.type)},${marker.timestamp}\n`;
    });
  }

  return csv;
}

// -----------------------------------------------------------------------
// Markdown
// -----------------------------------------------------------------------

function generateMarkdown(data: ExportData): string {
  const tier = deriveTier(data);
  const tierLabel = deriveTierLabel(tier);
  const description = describeTier(tier);
  const reconRows = buildReconRows(data);
  const signals = getAiSignalsCount(data);

  let md = `# DetectX Forensic Verification Report

**Generated:** ${data.analysisTimestamp}
**Detection Mode:** ${ENGINE_MODE}

**Report Version:** ${REPORT_VERSION}

## File Information

| Field | Value |
|-------|-------|
| Filename | ${data.fileName} |
| File Size | ${(data.fileSize / 1024 / 1024).toFixed(2)} MB (${data.fileSize} bytes) |
| Duration | ${data.duration ? `${formatDuration(data.duration)} (${data.duration.toFixed(2)} s)` : "N/A"} |
| Sample Rate | ${data.sampleRate ? `${data.sampleRate} Hz` : "N/A"} |
| Bit Depth | ${data.bitDepth ? `${data.bitDepth}-bit` : "N/A"} |
| Channels | ${data.channels || "N/A"} |
| Codec | ${data.codec || "N/A"} |
${data.artist ? `| Artist | ${data.artist} |\n` : ""}${data.title ? `| Title | ${data.title} |\n` : ""}${data.album ? `| Album | ${data.album} |\n` : ""}${data.isrc ? `| ISRC | \`${data.isrc}\` |\n` : ""}| SHA-256 | \`${data.fileHash || "N/A"}\` |

## Verification Result

> **${tierLabel}**

${description}
`;

  {
    const displayScore = getDisplayScore(data);
    if (displayScore != null) {
      const sourceLabel = getDisplayScoreSourceLabel(data);
      const isRecon = data.finalScoreSource === "recon" && data.finalScore != null;
      md += `
| Confidence Field | Value |
|------------------|-------|
| Verification Confidence — AI | \`${(displayScore * 100).toFixed(2)}%\` |
| Verification Confidence — Human | \`${((1 - displayScore) * 100).toFixed(2)}%\` |
| Score Source | ${sourceLabel} |
${isRecon && data.cnnScore != null ? `| Primary Engine Score | \`${(data.cnnScore * 100).toFixed(2)}%\` — flagged for Deep Scan |\n` : ""}| Backend Verdict (binary) | ${getVerdictText(data.verdict) || "Pending"} |
| Verdict Code | \`${deriveTierCode(tier)}\` |
`;
    }
  }

  if (reconRows.length > 0) {
    const strengthSum: StrengthSummary = data.strengthSummary ?? { strong_ai: 0, ai: 0, human: 0, strong_human: 0, text: "" };
    const summaryText = formatStrengthSummary(strengthSum);
    const asciiBar = (pos: number | null): string => {
      if (pos == null) return "—";
      const cells = 11;
      const idx = Math.min(cells - 1, Math.max(0, Math.round((pos / 100) * (cells - 1))));
      return Array.from({ length: cells }, (_, i) =>
        i === Math.floor(cells / 2) ? (i === idx ? "X" : "|") : (i === idx ? "X" : "-")
      ).join("");
    };
    md += `
## Deep Forensic Engine Structural Measurements

The DetectX Deep Forensic Engine separates the input audio into source-component stems and
reconstructs the signal by recombining them. The measurements below quantify residual
differences between the original and reconstructed signals. Each measurement is
reported with its **signed margin** from the decision line (positive = AI-side,
negative = Human-side) and a **strength bucket** derived from that margin. The
continuous DetectX classifier weighs each metric by its margin, not by a binary
yes/no — so a high count of border-crossings can still yield a Human-leaning final
confidence when most crossings are marginal.

| Metric | Measured | Margin | Strength | Human ← │ → AI |
|--------|----------|--------|----------|----------------|
${reconRows.map((r) => {
  if (r.value == null || r.strength == null) {
    return `| ${r.label} | \`—\` | — | — | — |`;
  }
  return `| ${r.label} | \`${r.formatted}\` | \`${r.marginText}\` | **${strengthLabel(r.strength)}** | \`${asciiBar(r.barPosition)}\` |`;
}).join("\n")}
${signals ? `\n**AI Signal Count: ${signals.count} / ${signals.total}** ${summaryText ? `— ${summaryText}` : ""}\n` : ""}`;
  }

  if (data.timelineMarkers.length > 0) {
    md += `

## Timeline Events

| # | Type | Timestamp |
|---|------|-----------|
${data.timelineMarkers.map((m, i) => `| ${i + 1} | ${m.type} | ${formatDuration(m.timestamp)} |`).join("\n")}
`;
  }

  md += `

## Engine Details

- **Primary Engine:** DetectX Engine (deep neural network) trained for structural AI-signal observation.
- **Secondary Engine:** DetectX Deep Forensic Engine — source-component separation followed by 7-metric residual analysis. Invoked when primary confidence falls within the intermediate decision range (50%-80%).
- **Verdict Determination:** Backend produces a binary verdict (Observed / Not Observed). The display layer renders a 4-tier label indicating Deep Scan recovery or confirmation in the intermediate range.

## Disclaimer

> ${DISCLAIMER}

---

*DetectX Audio AI Detector — ${ENGINE_MODE} — Report ${REPORT_VERSION}*
`;

  return md;
}

// -----------------------------------------------------------------------
// File download helpers
// -----------------------------------------------------------------------

function downloadFile(content: string, filename: string, mimeType: string, addBOM: boolean = false) {
  let finalContent = content;
  if (addBOM) finalContent = "﻿" + content;
  const blob = new Blob([finalContent], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function printViaIframe(html: string) {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) return;
  doc.open();
  doc.write(html);
  doc.close();

  iframe.onload = () => {
    iframe.contentWindow?.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };
}

// -----------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------

export function ExportPanel({ data, disabled = false, recordId = null }: ExportPanelProps) {
  const [showReportTypeModal, setShowReportTypeModal] = useState(false);

  const getBaseFileName = (fileName: string): string => {
    const lastDotIndex = fileName.lastIndexOf(".");
    if (lastDotIndex > 0) return fileName.substring(0, lastDotIndex);
    return fileName;
  };

  const sanitizeFileName = (fileName: string): string => {
    return fileName.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_");
  };

  // Phase 8: Standard PDF is now generated by the backend at
  // /api/export/single/{record_id}?format=pdf, which applies the tier-aware
  // REDACTION_MATRIX (Snapshot stems for Pro+, colored upgrade CTAs for
  // lower tiers, etc.). Client-side HTML→PDF is retained ONLY as a
  // fallback for the "Download All (ZIP)" bundle when no recordId is
  // available (anonymous / pre-save).
  const handleExportPDF = async () => {
    if (!data) return;
    if (!recordId) {
      // No record id yet — fall back to client-side print so the user
      // still gets something. (Anonymous scans never persist a record.)
      printViaIframe(generatePDFContent(data));
      return;
    }
    try {
      const token = localStorage.getItem("auth_token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(
        `/api/export/single/${encodeURIComponent(recordId)}?format=pdf`,
        { headers, credentials: "include" },
      );
      if (!res.ok) {
        // Surface the status code in the console so debugging in prod
        // does not require enabling verbose logging. We intentionally do
        // not alert() — the modal already closes and the user retains
        // the export buttons to retry.
        console.error(`[ExportPanel] PDF download failed: ${res.status}`);
        // Last-ditch fallback so the user is not stuck with nothing.
        printViaIframe(generatePDFContent(data));
        return;
      }
      const blob = await res.blob();
      const baseName = sanitizeFileName(getBaseFileName(data.fileName));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `DetectX_${baseName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[ExportPanel] PDF download error", err);
      printViaIframe(generatePDFContent(data));
    }
  };

  // Phase 5: PDF button now opens the Standard / Professional chooser
  // instead of jumping straight to the Standard PDF flow.
  const handleOpenReportTypeModal = () => {
    if (!data) return;
    setShowReportTypeModal(true);
  };

  const handleExportJSON = () => {
    if (!data) return;
    const content = generateJSON(data);
    const baseName = sanitizeFileName(getBaseFileName(data.fileName));
    downloadFile(content, `DetectX_${baseName}.json`, "application/json");
  };

  const handleExportCSV = () => {
    if (!data) return;
    const content = generateCSV(data);
    const baseName = sanitizeFileName(getBaseFileName(data.fileName));
    downloadFile(content, `DetectX_${baseName}.csv`, "text/csv", true);
  };

  const handleExportMarkdown = () => {
    if (!data) return;
    const content = generateMarkdown(data);
    const baseName = sanitizeFileName(getBaseFileName(data.fileName));
    downloadFile(content, `DetectX_${baseName}.md`, "text/markdown");
  };

  const handleDownloadAll = async () => {
    if (!data) return;
    const baseName = sanitizeFileName(getBaseFileName(data.fileName));
    const zip = new JSZip();

    zip.file(`DetectX_${baseName}.html`, generatePDFContent(data));
    zip.file(`DetectX_${baseName}.json`, generateJSON(data));
    zip.file(`DetectX_${baseName}.csv`, "﻿" + generateCSV(data));
    zip.file(`DetectX_${baseName}.md`, generateMarkdown(data));

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DetectX_${baseName}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isDisabled = disabled || !data || !data.verdict;

  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header">Export Report</div>
      <div className="forensic-panel-content">
        <Button
          variant="default"
          className="w-full mb-4 bg-forensic-cyan hover:bg-forensic-cyan/90 text-black font-medium"
          onClick={handleDownloadAll}
          disabled={isDisabled}
        >
          <Download className="w-4 h-4 mr-2" />
          Download All (ZIP)
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-2" onClick={handleOpenReportTypeModal} disabled={isDisabled}>
            <FileType className="w-5 h-5" />
            <span className="text-xs">PDF</span>
          </Button>
          <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-2" onClick={handleExportJSON} disabled={isDisabled}>
            <FileJson className="w-5 h-5" />
            <span className="text-xs">JSON</span>
          </Button>
          <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-2" onClick={handleExportCSV} disabled={isDisabled}>
            <FileSpreadsheet className="w-5 h-5" />
            <span className="text-xs">CSV</span>
          </Button>
          <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-2" onClick={handleExportMarkdown} disabled={isDisabled}>
            <FileText className="w-5 h-5" />
            <span className="text-xs">Markdown</span>
          </Button>
        </div>

        {!data?.verdict && (
          <p className="text-xs text-muted-foreground text-center mt-3">
            Complete verification to enable export
          </p>
        )}
      </div>

      <ReportTypeModal
        open={showReportTypeModal}
        onClose={() => setShowReportTypeModal(false)}
        recordId={recordId}
        onStandard={handleExportPDF}
      />
    </div>
  );
}
