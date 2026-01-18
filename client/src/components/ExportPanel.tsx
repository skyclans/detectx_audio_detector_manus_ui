/**
 * Export Panel Component
 *
 * Enhanced Mode v2.0:
 * - Classifier Engine (Primary): CNN trained on 30M+ verified human samples
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

const ENGINE_VERSION = "v2.0";
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

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function generatePDFContent(data: ExportData): string {
  const verdictText = getVerdictText(data.verdict) || "Pending";
  const isHuman = data.verdict?.verdict === "AI signal evidence was not observed.";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>DetectX Audio Verification Report</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
    h1 { color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 10px; }
    h2 { color: #555; margin-top: 30px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f5f5f5; width: 200px; }
    .verdict { font-size: 18px; padding: 20px; background: #f0fdf4; border-left: 4px solid #22c55e; margin: 20px 0; }
    .verdict.observed { background: #fef3c7; border-left-color: #f59e0b; }
    .engine-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .engine-item { margin: 8px 0; }
    .footer { margin-top: 40px; font-size: 12px; color: #888; border-top: 1px solid #ddd; padding-top: 20px; }
    .disclaimer { background: #fefce8; border: 1px solid #fef08a; border-radius: 4px; padding: 12px; margin-top: 20px; font-size: 13px; }
  </style>
</head>
<body>
  <h1>DetectX Audio Verification Report</h1>
  <p><strong>Generated:</strong> ${data.analysisTimestamp}</p>
  <p><strong>Detection Mode:</strong> ${ENGINE_MODE}</p>
  <p><strong>Engine Version:</strong> ${ENGINE_VERSION}</p>

  <h2>File Information</h2>
  <table>
    <tr><th>Filename</th><td>${data.fileName}</td></tr>
    <tr><th>File Size</th><td>${(data.fileSize / 1024 / 1024).toFixed(2)} MB</td></tr>
    <tr><th>Duration</th><td>${data.duration ? formatDuration(data.duration) : "N/A"}</td></tr>
    <tr><th>Sample Rate</th><td>${data.sampleRate ? `${data.sampleRate} Hz` : "N/A"}</td></tr>
    <tr><th>Bit Depth</th><td>${data.bitDepth ? `${data.bitDepth}-bit` : "N/A"}</td></tr>
    <tr><th>Channels</th><td>${data.channels || "N/A"}</td></tr>
    <tr><th>Codec</th><td>${data.codec || "N/A"}</td></tr>
    <tr><th>SHA-256</th><td style="font-family: monospace; font-size: 12px;">${data.fileHash || "N/A"}</td></tr>
  </table>

  <h2>Verification Result</h2>
  <div class="verdict ${!isHuman ? "observed" : ""}">
    <strong>${verdictText}</strong>
  </div>

  ${isHuman ? `
  <p>This audio file has been analyzed using DetectX Enhanced Mode, a dual-engine verification system.
  The Classifier Engine (trained on 30,000,000+ verified human music samples) determined that no AI signal evidence was observed.
  This result indicates that the signal is consistent with human musical creation.</p>
  ` : `
  <p>This audio file has been analyzed using DetectX Enhanced Mode, a dual-engine verification system.
  AI signal evidence was observed in the audio signal.</p>
  `}

  <h2>Verification Engine Details</h2>
  <div class="engine-box">
    <div class="engine-item"><strong>Classifier Engine (Primary):</strong> Deep learning classifier optimized for human protection</div>
    <div class="engine-item"><strong>Reconstruction Engine (Secondary):</strong> Stem separation and reconstruction differential analysis</div>
    <div class="engine-item"><strong>Human False Positive Rate:</strong> Less than 1%</div>
  </div>

  ${data.timelineMarkers.length > 0 ? `
  <h2>Timeline Events</h2>
  <table>
    <tr><th>#</th><th>Type</th><th>Timestamp</th></tr>
    ${data.timelineMarkers.map((m, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${m.type}</td>
        <td>${formatDuration(m.timestamp)}</td>
      </tr>
    `).join("")}
  </table>
  ` : ""}

  <div class="disclaimer">
    <strong>Disclaimer:</strong> DetectX does not determine authorship, intent, or ownership.
    This verification is based solely on structural signal observations.
    Some genres with heavy processing (Electronic/EDM, Hip-hop, Dance/House, Lo-fi)
    may exhibit signal characteristics similar to AI-generated music.
  </div>

  <div class="footer">
    <p>DetectX Audio AI Detector — Engine ${ENGINE_VERSION} (${ENGINE_MODE})</p>
  </div>
</body>
</html>
  `;
}

function generateJSON(data: ExportData): string {
  const isHuman = data.verdict?.verdict === "AI signal evidence was not observed.";
  const report = {
    reportVersion: "2.0.0",
    generatedAt: data.analysisTimestamp,
    engine: {
      version: ENGINE_VERSION,
      mode: ENGINE_MODE,
      classifierEngine: {
        name: "Classifier Engine",
        role: "Primary",
        description: "CNN trained on 30,000,000+ verified human samples",
      },
      reconstructionEngine: {
        name: "Reconstruction Engine",
        role: "Secondary",
        description: "Stem separation and reconstruction differential analysis",
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
      hash: data.fileHash,
    },
    verification: {
      verdict: getVerdictText(data.verdict),
      verdictCode: isHuman ? "AI_NOT_OBSERVED" : "AI_OBSERVED",
    },
    timelineEvents: data.timelineMarkers,
    disclaimer: "DetectX does not determine authorship, intent, or ownership. Some genres with heavy processing may exhibit signal characteristics similar to AI-generated music.",
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
    "Duration (ms)",
    "Sample Rate (Hz)",
    "Bit Depth",
    "Channels",
    "Codec",
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
| SHA-256 | \`${data.fileHash || "N/A"}\` |

## Verification Result

> ${verdictEmoji} **${verdictText}**

${isHuman ? `
This audio file has been analyzed using DetectX Enhanced Mode, a dual-engine verification system.
The Classifier Engine (trained on 30,000,000+ verified human music samples) determined that no AI signal evidence was observed.
This result indicates that the signal is consistent with human musical creation.
` : `
This audio file has been analyzed using DetectX Enhanced Mode, a dual-engine verification system.
AI signal evidence was observed in the audio signal.
`}

## Engine Details

- **Classifier Engine (Primary):** Deep learning classifier optimized for human protection
- **Reconstruction Engine (Secondary):** Stem separation and reconstruction differential analysis
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
> Some genres with heavy processing (Electronic/EDM, Hip-hop, Dance/House, Lo-fi)
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
    const content = generatePDFContent(data);
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleExportJSON = () => {
    if (!data) return;
    const content = generateJSON(data);
    const baseName = sanitizeFileName(getBaseFileName(data.fileName));
    downloadFile(content, `${baseName}_report.json`, "application/json");
  };

  const handleExportCSV = () => {
    if (!data) return;
    const content = generateCSV(data);
    const baseName = sanitizeFileName(getBaseFileName(data.fileName));
    // Add UTF-8 BOM for CSV to ensure proper encoding in Excel
    downloadFile(content, `${baseName}_report.csv`, "text/csv", true);
  };

  const handleExportMarkdown = () => {
    if (!data) return;
    const content = generateMarkdown(data);
    const baseName = sanitizeFileName(getBaseFileName(data.fileName));
    downloadFile(content, `${baseName}_report.md`, "text/markdown");
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
    zip.file(`${baseName}_report.html`, htmlContent);

    const jsonContent = generateJSON(data);
    zip.file(`${baseName}_report.json`, jsonContent);

    // CSV with UTF-8 BOM
    const csvContent = "\uFEFF" + generateCSV(data);
    zip.file(`${baseName}_report.csv`, csvContent);

    const mdContent = generateMarkdown(data);
    zip.file(`${baseName}_report.md`, mdContent);

    // Generate and download ZIP
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${baseName}_detectx_reports.zip`;
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
