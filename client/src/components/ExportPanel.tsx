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

import { Button } from "@/components/ui/button";
import { FileJson, FileSpreadsheet, FileText, FileType, Download } from "lucide-react";
import JSZip from "jszip";

const ENGINE_VERSION = "v3";
const ENGINE_MODE = "Enhanced Mode";
const REPORT_VERSION = "3.1.0";

/**
 * RECON 7-metric thresholds (patent-disclosed structural measurements).
 * Source: server/app/crg_runner.py RECON_DECISION_TABLE.
 * Direction: ">=" means AI when >= threshold; "<" means AI when < threshold.
 */
const RECON_THRESHOLDS: Array<{
  key: keyof ReconMetricsData;
  label: string;
  threshold: number;
  direction: "<" | ">=";
  format: (v: number) => string;
}> = [
  { key: "band_bass_diff",    label: "Bass Diff",       threshold: 0.3991, direction: "<",  format: (v) => v.toFixed(4) },
  { key: "band_low_mid_diff", label: "Low-Mid Diff",    threshold: 0.2967, direction: "<",  format: (v) => v.toFixed(4) },
  { key: "l1_diff",           label: "L1 Diff",         threshold: 0.0029, direction: "<",  format: (v) => v.toFixed(6) },
  { key: "snr",               label: "SNR (dB)",        threshold: 30.84,  direction: ">=", format: (v) => v.toFixed(2) },
  { key: "energy_ratio",      label: "Energy Ratio",    threshold: 0.9690, direction: ">=", format: (v) => v.toFixed(4) },
  { key: "phase_coherence",   label: "Phase Coherence", threshold: 0.7231, direction: ">=", format: (v) => v.toFixed(4) },
  { key: "band_high_ratio",   label: "High Ratio",      threshold: 0.9471, direction: ">=", format: (v) => v.toFixed(4) },
];

/** RECON metrics from backend (subset of schemas.ReconMetrics). */
export interface ReconMetricsData {
  band_bass_diff?: number | null;
  band_low_mid_diff?: number | null;
  l1_diff?: number | null;
  snr?: number | null;
  energy_ratio?: number | null;
  phase_coherence?: number | null;
  band_high_ratio?: number | null;
  ai_signals?: number | null;
  recon_version?: string | null;
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
  cnnScore: number | null;
  reconMetrics: ReconMetricsData | null;
  timelineMarkers: { timestamp: number; type: string }[];
  analysisTimestamp: string;
}

interface ExportPanelProps {
  data: ExportData | null;
  disabled?: boolean;
}

// -----------------------------------------------------------------------
// Verdict tier derivation (mirrors VerdictPanel.tsx 4-tier semantics)
// -----------------------------------------------------------------------

type VerdictTier = "human" | "mixed-human" | "mixed-ai" | "ai" | "unknown";

function deriveTier(cnnScore: number | null, backendVerdict: string | null): VerdictTier {
  if (backendVerdict == null) return "unknown";
  if (cnnScore == null) {
    return backendVerdict === "AI signal evidence was observed." ? "ai" : "human";
  }
  if (cnnScore < 0.5) return "human";
  if (cnnScore < 0.8) {
    return backendVerdict === "AI signal evidence was observed." ? "mixed-ai" : "mixed-human";
  }
  return "ai";
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

// -----------------------------------------------------------------------
// RECON metric helpers
// -----------------------------------------------------------------------

interface ReconRow {
  label: string;
  value: number | null;
  formatted: string;
  threshold: number;
  direction: "<" | ">=";
  thresholdText: string;
  exceededAi: boolean;
}

function buildReconRows(metrics: ReconMetricsData | null): ReconRow[] {
  if (!metrics) return [];
  return RECON_THRESHOLDS.map(({ key, label, threshold, direction, format }) => {
    const raw = (metrics as Record<string, unknown>)[key];
    const value = typeof raw === "number" ? raw : null;
    const formatted = value == null ? "—" : format(value);
    const thresholdText = `${direction} ${threshold}`;
    let exceededAi = false;
    if (value != null) {
      exceededAi = direction === "<" ? value < threshold : value >= threshold;
    }
    return { label, value, formatted, threshold, direction, thresholdText, exceededAi };
  });
}

function getAiSignalsCount(metrics: ReconMetricsData | null): { count: number; total: number } | null {
  if (!metrics) return null;
  if (typeof metrics.ai_signals === "number") {
    return { count: metrics.ai_signals, total: 7 };
  }
  const rows = buildReconRows(metrics);
  const measured = rows.filter((r) => r.value != null);
  if (measured.length === 0) return null;
  return { count: measured.filter((r) => r.exceededAi).length, total: measured.length };
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
      return "The DetectX dual-engine verification system did not record structural signal evidence of AI synthesis. The primary CNN classifier reported a confidence below the lower decision threshold; the reconstruction engine was not triggered.";
    case "mixed-human":
      return "The primary CNN classifier reported confidence within the intermediate decision range (50%-80%). The reconstruction engine was invoked and its 7-metric stem-reconstruction analysis recovered the result as Human signal (insufficient AI signal count). Expert review is recommended for legal and forensic adjudication.";
    case "mixed-ai":
      return "The primary CNN classifier reported confidence within the intermediate decision range (50%-80%). The reconstruction engine was invoked and its 7-metric stem-reconstruction analysis confirmed AI signal (sufficient AI signal count). Expert review is recommended for legal and forensic adjudication.";
    case "ai":
      return "The primary CNN classifier reported confidence at or above the upper decision threshold. Structural signal evidence consistent with AI-generated audio was recorded. The reconstruction engine was not required for verdict determination.";
    case "unknown":
      return "Verification pending. No result available.";
  }
}

const DISCLAIMER = "DetectX does not determine authorship, intent, or ownership. This verification is based solely on structural signal observations of the submitted audio file. Audio with extensive post-processing, synthesis, or heavy digital manipulation may exhibit signal characteristics similar to AI-generated music. Final adjudication is subject to the policies of the receiving institution, court, or authority.";

// -----------------------------------------------------------------------
// PDF (HTML for browser print)
// -----------------------------------------------------------------------

function generatePDFContent(data: ExportData): string {
  const tier = deriveTier(data.cnnScore, data.verdict?.verdict ?? null);
  const tierLabel = deriveTierLabel(tier);
  const description = describeTier(tier);
  const reconRows = buildReconRows(data.reconMetrics);
  const signals = getAiSignalsCount(data.reconMetrics);
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

  const reconTable = reconRows.length > 0 ? `
  <h2>RECON 7-Metric Structural Measurements</h2>
  <p class="desc">
    The reconstruction engine separates the input audio into source-component stems and
    reconstructs the signal by recombining them. The seven structural measurements below
    quantify residual differences between the original and reconstructed signals.
    A measurement that satisfies the inequality direction below indicates an AI-consistent
    signal on that metric. The decision rule requires the number of AI-consistent metrics
    to meet or exceed the predefined count for an AI determination.
  </p>
  <table>
    <tr>
      <th>Metric</th>
      <th>Measured Value</th>
      <th>Threshold</th>
      <th>AI-consistent</th>
    </tr>
    ${reconRows.map((r) => `
      <tr>
        <td>${r.label}</td>
        <td style="font-family: monospace;">${r.formatted}</td>
        <td style="font-family: monospace;">${r.thresholdText}</td>
        <td>${r.value == null ? "—" : r.exceededAi ? "Yes" : "No"}</td>
      </tr>
    `).join("")}
    ${signals ? `
      <tr style="background:#f8fafc;">
        <td colspan="3"><strong>AI Signal Count</strong></td>
        <td style="font-family: monospace;"><strong>${signals.count} / ${signals.total}</strong></td>
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
  </style>
</head>
<body>
  <div class="header">
    <h1>DetectX Forensic Verification Report</h1>
  </div>

  <div class="meta">
    <span><strong>Generated:</strong> ${data.analysisTimestamp}</span>
    <span><strong>Mode:</strong> ${ENGINE_MODE}</span>
    <span><strong>Engine:</strong> ${ENGINE_VERSION}</span>
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
  ${data.cnnScore != null ? `
    <table>
      <tr>
        <th style="width: 200px;">Primary Engine Confidence (AI)</th>
        <td class="small-mono">${(data.cnnScore * 100).toFixed(2)}%</td>
      </tr>
      <tr>
        <th>Primary Engine Confidence (Human)</th>
        <td class="small-mono">${((1 - data.cnnScore) * 100).toFixed(2)}%</td>
      </tr>
      <tr>
        <th>Backend Verdict (Binary)</th>
        <td>${getVerdictText(data.verdict) || "Pending"}</td>
      </tr>
      <tr>
        <th>Verdict Code</th>
        <td class="small-mono">${deriveTierCode(tier)}</td>
      </tr>
    </table>` : ""}

  ${reconTable}

  <h2>Verification Engine Details</h2>
  <div class="engine-box">
    <div class="engine-item"><strong>Primary Engine:</strong> CNN classifier (deep neural network) trained for structural AI-signal observation.</div>
    <div class="engine-item"><strong>Secondary Engine:</strong> Reconstruction (RECON) engine — source-component separation followed by 7-metric residual analysis. Invoked when primary confidence falls within the intermediate decision range (50%-80%).</div>
    <div class="engine-item"><strong>Verdict Determination:</strong> Backend produces a binary verdict (Observed / Not Observed). The display layer renders a 4-tier label indicating Deep Scan recovery or confirmation in the intermediate range.</div>
  </div>

  <div class="disclaimer">
    <strong>Disclaimer:</strong> ${DISCLAIMER}
  </div>

  <div class="footer">
    DetectX Audio AI Detector &mdash; Engine ${ENGINE_VERSION} (${ENGINE_MODE}) &bull; Report ${REPORT_VERSION} &bull; detectx.app
  </div>
</body>
</html>`;
}

// -----------------------------------------------------------------------
// JSON
// -----------------------------------------------------------------------

function generateJSON(data: ExportData): string {
  const tier = deriveTier(data.cnnScore, data.verdict?.verdict ?? null);
  const reconRows = buildReconRows(data.reconMetrics);
  const signals = getAiSignalsCount(data.reconMetrics);

  const report = {
    reportVersion: REPORT_VERSION,
    generatedAt: data.analysisTimestamp,
    engine: {
      version: ENGINE_VERSION,
      mode: ENGINE_MODE,
      primary: {
        name: "DetectX Primary CNN Classifier",
        role: "Primary",
        description: "Structural AI signal observation via deep neural network.",
      },
      secondary: {
        name: "DetectX Reconstruction Engine",
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
      exceededAxes: data.verdict?.exceeded_axes ?? [],
    },
    reconMetrics: reconRows.length > 0 ? {
      values: reconRows.map((r) => ({
        metric: r.label,
        measuredValue: r.value,
        formattedValue: r.formatted,
        threshold: r.threshold,
        direction: r.direction,
        thresholdText: r.thresholdText,
        aiConsistent: r.value == null ? null : r.exceededAi,
      })),
      aiSignalCount: signals?.count ?? null,
      aiSignalTotal: signals?.total ?? null,
      reconVersion: data.reconMetrics?.recon_version ?? null,
      v2Confidence: data.reconMetrics?.v2_confidence ?? null,
    } : null,
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

  const tier = deriveTier(data.cnnScore, data.verdict?.verdict ?? null);
  const reconRows = buildReconRows(data.reconMetrics);
  const signals = getAiSignalsCount(data.reconMetrics);

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
    "CNN Confidence AI",
    "CNN Confidence Human",
    "RECON AI Signal Count",
    "RECON Total Measured",
    ...reconRows.map((r) => `${r.label} (value)`),
    ...reconRows.map((r) => `${r.label} (threshold)`),
    ...reconRows.map((r) => `${r.label} (AI-consistent)`),
    "Detection Mode",
    "Engine Version",
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
    signals ? signals.count : "",
    signals ? signals.total : "",
    ...reconRows.map((r) => (r.value != null ? r.value : "")),
    ...reconRows.map((r) => `${r.direction} ${r.threshold}`),
    ...reconRows.map((r) => (r.value == null ? "" : r.exceededAi ? "Yes" : "No")),
    escapeCSV(ENGINE_MODE),
    escapeCSV(ENGINE_VERSION),
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

  csv += "\n\nDisclaimer\n" + escapeCSV(DISCLAIMER) + "\n";
  return csv;
}

// -----------------------------------------------------------------------
// Markdown
// -----------------------------------------------------------------------

function generateMarkdown(data: ExportData): string {
  const tier = deriveTier(data.cnnScore, data.verdict?.verdict ?? null);
  const tierLabel = deriveTierLabel(tier);
  const description = describeTier(tier);
  const reconRows = buildReconRows(data.reconMetrics);
  const signals = getAiSignalsCount(data.reconMetrics);

  let md = `# DetectX Forensic Verification Report

**Generated:** ${data.analysisTimestamp}
**Detection Mode:** ${ENGINE_MODE}
**Engine Version:** ${ENGINE_VERSION}
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

  if (data.cnnScore != null) {
    md += `
| Confidence Field | Value |
|------------------|-------|
| Primary Engine — AI confidence | \`${(data.cnnScore * 100).toFixed(2)}%\` |
| Primary Engine — Human confidence | \`${((1 - data.cnnScore) * 100).toFixed(2)}%\` |
| Backend Verdict (binary) | ${getVerdictText(data.verdict) || "Pending"} |
| Verdict Code | \`${deriveTierCode(tier)}\` |
`;
  }

  if (reconRows.length > 0) {
    md += `
## RECON 7-Metric Structural Measurements

The reconstruction engine separates the input audio into source-component stems and
reconstructs the signal by recombining them. The seven structural measurements below
quantify residual differences between the original and reconstructed signals. A
measurement that satisfies the inequality direction below indicates an AI-consistent
signal on that metric. The decision rule requires the number of AI-consistent metrics
to meet or exceed the predefined count for an AI determination.

| Metric | Measured Value | Threshold | AI-consistent |
|--------|----------------|-----------|---------------|
${reconRows.map((r) => `| ${r.label} | \`${r.formatted}\` | \`${r.thresholdText}\` | ${r.value == null ? "—" : r.exceededAi ? "Yes" : "No"} |`).join("\n")}
${signals ? `\n**AI Signal Count: ${signals.count} / ${signals.total}**\n` : ""}`;
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

- **Primary Engine:** CNN classifier (deep neural network) trained for structural AI-signal observation.
- **Secondary Engine:** Reconstruction (RECON) engine — source-component separation followed by 7-metric residual analysis. Invoked when primary confidence falls within the intermediate decision range (50%-80%).
- **Verdict Determination:** Backend produces a binary verdict (Observed / Not Observed). The display layer renders a 4-tier label indicating Deep Scan recovery or confirmation in the intermediate range.

## Disclaimer

> ${DISCLAIMER}

---

*DetectX Audio AI Detector — Engine ${ENGINE_VERSION} (${ENGINE_MODE}) — Report ${REPORT_VERSION}*
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

export function ExportPanel({ data, disabled = false }: ExportPanelProps) {
  const getBaseFileName = (fileName: string): string => {
    const lastDotIndex = fileName.lastIndexOf(".");
    if (lastDotIndex > 0) return fileName.substring(0, lastDotIndex);
    return fileName;
  };

  const sanitizeFileName = (fileName: string): string => {
    return fileName.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_");
  };

  const handleExportPDF = () => {
    if (!data) return;
    printViaIframe(generatePDFContent(data));
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
          <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-2" onClick={handleExportPDF} disabled={isDisabled}>
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
    </div>
  );
}
