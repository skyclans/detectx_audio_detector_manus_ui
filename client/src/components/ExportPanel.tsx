/**
 * Export Panel Component
 *
 * Enhanced Mode v3:
 * - DetectX Engine v3 (Primary): trained on millions of verified human samples
 * - Reconstruction Engine (Secondary): Stem separation analysis
 * - Human False Positive Rate: <1%
 *
 * EXPORT FORMAT REQUIREMENTS (MANDATORY):
 * - CSV/XLS headers must be horizontal (column-based)
 * - One analysis = one row of metadata values
 * - Timeline events may be appended as additional rows if needed
 * - CSV must be encoded as UTF-8 with BOM
 * - XLS/XLSX must preserve full Unicode support
 * - Filenames in Korean, Japanese, Chinese, and all non-Latin scripts must not break
 */

import { Button } from "@/components/ui/button";
import { FileJson, FileSpreadsheet, FileText, FileType, Download } from "lucide-react";
import JSZip from "jszip";

const ENGINE_VERSION = "v3";
const ENGINE_MODE = "Enhanced Mode";

interface VerdictResult {
  verdict: "AI signal evidence was observed." | "AI signal evidence was not observed." | null;
  exceeded_axes: string[];
  cnn_score?: number;
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
  timelineMarkers: { timestamp: number; type: string }[];
  analysisTimestamp: string;
}

interface ExportPanelProps {
  data: ExportData | null;
  disabled?: boolean;
}

// Helper to get verdict text from VerdictResult
function getVerdictText(verdict: VerdictResult | null): string {
  return verdict?.verdict || "";
}

function formatDuration(seconds: number): string {
  const totalSeconds = Math.floor(seconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const DETECTX_LOGO_BASE64 = "data:image/png;base64,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";

/** Print HTML via hidden iframe (no new tab) */
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

function generatePDFContent(data: ExportData): string {
  const verdictText = getVerdictText(data.verdict) || "Pending";
  const isHuman = data.verdict?.verdict === "AI signal evidence was not observed.";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>DetectX_${data.fileName.replace(/\.[^/.]+$/, "")}</title>
  <style>
    @page { size: A4; margin: 15mm 20mm; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: #333; font-size: 11px; line-height: 1.4; padding: 0; }
    .header { display: flex; align-items: center; gap: 12px; border-bottom: 2px solid #0d9488; padding-bottom: 8px; margin-bottom: 12px; }
    .header img { width: 36px; height: 36px; }
    .header h1 { font-size: 18px; color: #0d9488; margin: 0; }
    .meta { display: flex; flex-wrap: wrap; gap: 4px 24px; margin-bottom: 10px; font-size: 10px; color: #666; }
    h2 { font-size: 12px; color: #555; margin: 10px 0 6px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    th, td { padding: 5px 8px; text-align: left; border-bottom: 1px solid #e5e5e5; font-size: 11px; }
    th { background: #f5f5f5; width: 140px; font-weight: 600; }
    .verdict { font-size: 14px; padding: 10px 14px; background: #f0fdf4; border-left: 4px solid #22c55e; margin: 8px 0; }
    .verdict.observed { background: #fef3c7; border-left-color: #f59e0b; }
    .verdict strong { font-size: 13px; }
    .desc { font-size: 10px; color: #555; margin-bottom: 10px; }
    .engine-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; margin-bottom: 10px; }
    .engine-item { margin: 3px 0; font-size: 10px; }
    .disclaimer { background: #fefce8; border: 1px solid #fef08a; border-radius: 4px; padding: 8px 10px; font-size: 9px; color: #666; margin-bottom: 8px; }
    .footer { font-size: 9px; color: #999; border-top: 1px solid #e5e5e5; padding-top: 6px; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <img src="${DETECTX_LOGO_BASE64}" alt="DetectX" />
    <h1>DetectX Audio Verification Report</h1>
  </div>

  <div class="meta">
    <span><strong>Generated:</strong> ${data.analysisTimestamp}</span>
    <span><strong>Mode:</strong> ${ENGINE_MODE}</span>
    <span><strong>Engine:</strong> ${ENGINE_VERSION}</span>
  </div>

  <h2>File Information</h2>
  <table>
    <tr><th>Filename</th><td>${data.fileName}</td></tr>
    <tr><th>File Size</th><td>${(data.fileSize / 1024 / 1024).toFixed(2)} MB</td></tr>
    <tr><th>Duration</th><td>${data.duration ? formatDuration(data.duration) : "N/A"}</td></tr>
    <tr><th>Sample Rate</th><td>${data.sampleRate ? `${data.sampleRate} Hz` : "N/A"}</td></tr>
    <tr><th>Bit Depth</th><td>${data.bitDepth ? `${data.bitDepth}-bit` : "N/A"}</td></tr>
    <tr><th>Channels</th><td>${data.channels || "N/A"}</td></tr>
    <tr><th>Codec</th><td>${data.codec || "N/A"}</td></tr>
    ${data.artist ? `<tr><th>Artist</th><td>${data.artist}</td></tr>` : ""}
    ${data.title ? `<tr><th>Title</th><td>${data.title}</td></tr>` : ""}
    ${data.album ? `<tr><th>Album</th><td>${data.album}</td></tr>` : ""}
    ${data.isrc ? `<tr><th>ISRC</th><td style="font-family: monospace;">${data.isrc}</td></tr>` : ""}
    <tr><th>SHA-256</th><td style="font-family: monospace; font-size: 10px;">${data.fileHash || "N/A"}</td></tr>
  </table>

  <h2>Verification Result</h2>
  <div class="verdict ${!isHuman ? "observed" : ""}">
    <strong>${verdictText}</strong>
  </div>
  <p class="desc">${isHuman
    ? "This audio file has been analyzed using DetectX Enhanced Mode, a dual-engine verification system. DetectX Engine v3 (trained on millions of verified human music samples) determined that no AI signal evidence was observed."
    : "This audio file has been analyzed using DetectX Enhanced Mode, a dual-engine verification system. AI signal evidence was observed in the audio signal."
  }</p>

  <h2>Verification Engine Details</h2>
  <div class="engine-box">
    <div class="engine-item"><strong>DetectX Engine v3 (Primary):</strong> Deep learning classifier optimized for human protection</div>
    <div class="engine-item"><strong>Reconstruction Engine (Secondary):</strong> Stem separation and reconstruction analysis</div>
    <div class="engine-item"><strong>Human False Positive Rate:</strong> Less than 1%</div>
  </div>

  <div class="disclaimer">
    <strong>Disclaimer:</strong> DetectX does not determine authorship, intent, or ownership.
    This verification is based solely on structural signal observations.
    Audio with extensive post-processing, synthesis, or heavy digital manipulation
    may exhibit signal characteristics similar to AI-generated music.
  </div>

  <div class="footer">
    DetectX Audio AI Detector &mdash; Engine ${ENGINE_VERSION} (${ENGINE_MODE}) &bull; detectx.app
  </div>
</body>
</html>`;
}

function generateJSON(data: ExportData): string {
  const isHuman = data.verdict?.verdict === "AI signal evidence was not observed.";
  const report = {
    reportVersion: "3.0.0",
    generatedAt: data.analysisTimestamp,
    engine: {
      version: ENGINE_VERSION,
      mode: ENGINE_MODE,
      classifierEngine: {
        name: "DetectX Engine v3",
        role: "Primary",
        description: "Trained on millions of verified human samples",
      },
      reconstructionEngine: {
        name: "Reconstruction Engine",
        role: "Secondary",
        description: "Stem separation and reconstruction analysis",
      },
      humanFpRate: "<1%",
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
      verdict: getVerdictText(data.verdict),
      verdictCode: isHuman ? "AI_NOT_OBSERVED" : "AI_OBSERVED",
    },
    timelineEvents: data.timelineMarkers,
    disclaimer: "DetectX does not determine authorship, intent, or ownership. Audio with extensive post-processing, synthesis, or heavy digital manipulation may exhibit signal characteristics similar to AI-generated music.",
  };
  return JSON.stringify(report, null, 2);
}

/**
 * Generate CSV with horizontal headers (column-based)
 * MANDATORY: UTF-8 with BOM encoding
 * One analysis = one row of metadata values
 */
function generateCSV(data: ExportData): string {
  // Escape CSV values properly for Unicode support
  const escapeCSV = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    // Always quote strings that might contain special characters
    if (str.includes(",") || str.includes('"') || str.includes("\n") || /[^\x00-\x7F]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Horizontal headers (column-based) - Enhanced Mode format
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
    "Verdict",
    "Detection Mode",
    "Engine Version",
    "Analysis Timestamp",
  ];

  // One row of metadata values
  const values = [
    escapeCSV(data.fileName),
    data.fileSize,
    data.duration || "",
    data.sampleRate || "",
    data.bitDepth || "",
    data.channels || "",
    escapeCSV(data.codec),
    escapeCSV(data.artist),
    escapeCSV(data.title),
    escapeCSV(data.album),
    escapeCSV(data.isrc),
    escapeCSV(data.fileHash),
    escapeCSV(getVerdictText(data.verdict)),
    escapeCSV(ENGINE_MODE),
    escapeCSV(ENGINE_VERSION),
    escapeCSV(data.analysisTimestamp),
  ];

  let csv = headers.join(",") + "\n" + values.join(",");

  // Append timeline events as additional rows if present
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

function generateMarkdown(data: ExportData): string {
  const verdictText = getVerdictText(data.verdict) || "Pending";
  const isHuman = data.verdict?.verdict === "AI signal evidence was not observed.";
  const verdictEmoji = isHuman ? "🟢" : "🔴";

  let md = `# DetectX Audio Verification Report

**Generated:** ${data.analysisTimestamp}
**Detection Mode:** ${ENGINE_MODE}
**Engine Version:** ${ENGINE_VERSION}

## File Information

| Field | Value |
|-------|-------|
| Filename | ${data.fileName} |
| File Size | ${(data.fileSize / 1024 / 1024).toFixed(2)} MB |
| Duration | ${data.duration ? formatDuration(data.duration) : "N/A"} |
| Sample Rate | ${data.sampleRate ? `${data.sampleRate} Hz` : "N/A"} |
| Bit Depth | ${data.bitDepth ? `${data.bitDepth}-bit` : "N/A"} |
| Channels | ${data.channels || "N/A"} |
| Codec | ${data.codec || "N/A"} |
${data.artist ? `| Artist | ${data.artist} |\n` : ""}${data.title ? `| Title | ${data.title} |\n` : ""}${data.album ? `| Album | ${data.album} |\n` : ""}${data.isrc ? `| ISRC | \`${data.isrc}\` |\n` : ""}| SHA-256 | \`${data.fileHash || "N/A"}\` |

## Verification Result

> ${verdictEmoji} **${verdictText}**

${isHuman ? `
This audio file has been analyzed using DetectX Enhanced Mode, a dual-engine verification system.
DetectX Engine v3 (trained on millions of verified human music samples) determined that no AI signal evidence was observed.
This result indicates that the signal is consistent with human musical creation.
` : `
This audio file has been analyzed using DetectX Enhanced Mode, a dual-engine verification system.
AI signal evidence was observed in the audio signal.
`}

## Engine Details

- **DetectX Engine v3 (Primary):** Deep learning classifier optimized for human protection
- **Reconstruction Engine (Secondary):** Stem separation and reconstruction analysis
- **Human False Positive Rate:** < 1%

`;

  if (data.timelineMarkers.length > 0) {
    md += `## Timeline Events

| # | Type | Timestamp |
|---|------|-----------|
${data.timelineMarkers.map((m, i) => `| ${i + 1} | ${m.type} | ${formatDuration(m.timestamp)} |`).join("\n")}

`;
  }

  md += `## Disclaimer

> DetectX does not determine authorship, intent, or ownership.
> This verification is based solely on structural signal observations.
> Audio with extensive post-processing, synthesis, or heavy digital manipulation
> may exhibit signal characteristics similar to AI-generated music.

---

*DetectX Audio AI Detector — Engine ${ENGINE_VERSION} (${ENGINE_MODE})*
`;

  return md;
}

/**
 * Download file with proper encoding
 * CSV uses UTF-8 with BOM for Excel compatibility
 */
function downloadFile(content: string, filename: string, mimeType: string, addBOM: boolean = false) {
  let finalContent = content;

  // Add UTF-8 BOM for CSV files to ensure Excel opens with correct encoding
  if (addBOM) {
    finalContent = "\uFEFF" + content;
  }

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

export function ExportPanel({ data, disabled = false }: ExportPanelProps) {
  /**
   * Safely extract base filename for export
   * Handles Unicode filenames (Korean, Japanese, Chinese, etc.)
   */
  const getBaseFileName = (fileName: string): string => {
    // Remove extension while preserving Unicode characters
    const lastDotIndex = fileName.lastIndexOf(".");
    if (lastDotIndex > 0) {
      return fileName.substring(0, lastDotIndex);
    }
    return fileName;
  };

  /**
   * Sanitize filename for safe download
   * Preserves Unicode but removes potentially problematic characters
   */
  const sanitizeFileName = (fileName: string): string => {
    // Remove characters that might cause issues in filenames
    // but preserve Unicode letters and numbers
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
    // Add UTF-8 BOM for CSV to ensure proper encoding in Excel
    downloadFile(content, `DetectX_${baseName}.csv`, "text/csv", true);
  };

  const handleExportMarkdown = () => {
    if (!data) return;
    const content = generateMarkdown(data);
    const baseName = sanitizeFileName(getBaseFileName(data.fileName));
    downloadFile(content, `DetectX_${baseName}.md`, "text/markdown");
  };

  /**
   * Download All - Bundle all reports as single ZIP archive
   */
  const handleDownloadAll = async () => {
    if (!data) return;

    const baseName = sanitizeFileName(getBaseFileName(data.fileName));
    const zip = new JSZip();

    // Add all report formats to ZIP
    const htmlContent = generatePDFContent(data);
    zip.file(`DetectX_${baseName}.html`, htmlContent);

    const jsonContent = generateJSON(data);
    zip.file(`DetectX_${baseName}.json`, jsonContent);

    // CSV with UTF-8 BOM
    const csvContent = "\uFEFF" + generateCSV(data);
    zip.file(`DetectX_${baseName}.csv`, csvContent);

    const mdContent = generateMarkdown(data);
    zip.file(`DetectX_${baseName}.md`, mdContent);

    // Generate and download ZIP
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
        {/* Download All Button - Prominent placement */}
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
          <Button
            variant="outline"
            className="h-auto py-3 flex flex-col items-center gap-2"
            onClick={handleExportPDF}
            disabled={isDisabled}
          >
            <FileType className="w-5 h-5" />
            <span className="text-xs">PDF</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-3 flex flex-col items-center gap-2"
            onClick={handleExportJSON}
            disabled={isDisabled}
          >
            <FileJson className="w-5 h-5" />
            <span className="text-xs">JSON</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-3 flex flex-col items-center gap-2"
            onClick={handleExportCSV}
            disabled={isDisabled}
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span className="text-xs">CSV</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-3 flex flex-col items-center gap-2"
            onClick={handleExportMarkdown}
            disabled={isDisabled}
          >
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
