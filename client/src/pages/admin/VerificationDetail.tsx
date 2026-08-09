/**
 * Admin Verification Detail Page
 *
 * Full investigation view for a single verification record.
 *   Route: /admin/verifications/:id
 *
 * Layout:
 *   Header           — filename, user, created_at, original verdict
 *   Left column      — AdminVerdictPanel (forensic metrics)
 *   Right column     — AudioPlayer + DisputePanel
 *   Bottom strip     — 5 export buttons (PDF / Markdown / JSON / XLSX / CSV)
 *
 * Backend contract:
 *   GET  /api/admin/verifications/:id         (or fall back to ?id= filter)
 *   GET  /api/admin/audio/{id}                — audio binary
 *   GET  /api/admin/audio/{id}/info           — audio + dispute meta
 *   GET  /api/admin/export/{id}?format=...    — file download
 *   GET  /api/admin/recon-thresholds          — used inside AdminVerdictPanel
 *   GET  /api/admin/audit/{id}                — used inside DisputePanel
 */

import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminVerdictPanel } from "@/components/AdminVerdictPanel";
import { AudioPlayer } from "@/components/AudioPlayer";
import { DisputePanel, type AudioInfo } from "@/components/admin/DisputePanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  Download,
  FileAudio,
  FileJson,
  FileSpreadsheet,
  FileText,
  Loader2,
  Mail,
  RefreshCw,
} from "lucide-react";
import { fetchWithAuth, getApiUrl, getToken } from "@/lib/api";

interface VerificationRecord {
  id: number | string;
  fileName?: string;
  filename?: string;
  userId?: string | null;
  user_email?: string | null;
  verdict?: string | null;
  status?: string;
  duration?: number | null;
  fileSize?: number | null;
  createdAt?: string;
  cnn_score?: number | null;
  cnnScore?: number | null;
  final_score?: number | null;
  finalScore?: number | null;
  final_score_source?: string | null;
  finalScoreSource?: string | null;
  tier?: string | null;
  exceeded_axes?: string[];
  primary_exceeded_axis?: string | null;
  recon_metrics_enriched?: any;
  reconMetricsEnriched?: any;
  strength_summary?: any;
  strengthSummary?: any;
  [k: string]: any;
}

type ExportFormat = "pdf" | "markdown" | "json" | "xlsx" | "csv";

const EXPORT_OPTIONS: { format: ExportFormat; label: string; Icon: any }[] = [
  { format: "pdf", label: "PDF", Icon: FileText },
  { format: "markdown", label: "Markdown", Icon: FileText },
  { format: "json", label: "JSON", Icon: FileJson },
  { format: "xlsx", label: "XLSX", Icon: FileSpreadsheet },
  { format: "csv", label: "CSV", Icon: FileSpreadsheet },
];

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toISOString().replace("T", " ").substring(0, 19) + " UTC";
  } catch {
    return d;
  }
}

export default function AdminVerificationDetail() {
  const params = useParams<{ id: string }>();
  const requestId = params.id || "";

  const [record, setRecord] = useState<VerificationRecord | null>(null);
  const [audioInfo, setAudioInfo] = useState<AudioInfo | null>(null);
  const [loadingRecord, setLoadingRecord] = useState(true);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Per-format export-in-progress flag.
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);

  // Fetch the verification record. We try a few endpoint shapes — backend
  // contract should clarify, but this keeps the UI resilient.
  const fetchRecord = useCallback(async () => {
    if (!requestId) return;
    setLoadingRecord(true);
    setError(null);
    try {
      // Try detail endpoint first; fall back to filtered list.
      let resp = await fetchWithAuth(`/api/admin/verifications/${requestId}`);
      if (!resp.ok && resp.status === 404) {
        resp = await fetchWithAuth(
          `/api/admin/verifications?search=${encodeURIComponent(requestId)}&limit=1`,
        );
      }
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${resp.status}`);
      }
      const data = await resp.json();
      const rec: VerificationRecord = Array.isArray(data?.verifications)
        ? data.verifications[0]
        : data;
      setRecord(rec || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingRecord(false);
    }
  }, [requestId]);

  const fetchAudioInfo = useCallback(async () => {
    if (!requestId) return;
    setLoadingInfo(true);
    try {
      const resp = await fetchWithAuth(`/api/admin/audio/${requestId}/info`);
      if (resp.ok) {
        const data: AudioInfo = await resp.json();
        setAudioInfo(data);
      } else {
        // Non-fatal — we still render the rest of the page.
        setAudioInfo({ has_audio: false });
      }
    } catch {
      setAudioInfo({ has_audio: false });
    } finally {
      setLoadingInfo(false);
    }
  }, [requestId]);

  useEffect(() => {
    fetchRecord();
    fetchAudioInfo();
  }, [fetchRecord, fetchAudioInfo]);

  // Build the verdict contract expected by AdminVerdictPanel from the record.
  const verdictText: string | null = (() => {
    if (!record) return null;
    if (record.verdict === "observed") return "AI signal evidence was observed.";
    if (record.verdict === "not_observed")
      return "AI signal evidence was not observed.";
    if (record.verdict === "inconclusive")
      return "AI signal evidence was inconclusive.";
    return record.verdict ?? null;
  })();

  const verdict = verdictText
    ? {
        verdict: verdictText,
        authority: "DetectX Forensic",
        exceeded_axes:
          record?.exceeded_axes ||
          (record?.primary_exceeded_axis ? [record.primary_exceeded_axis] : []),
      }
    : null;

  const cnnScore = record?.cnn_score ?? record?.cnnScore ?? null;
  const finalScore = record?.final_score ?? record?.finalScore ?? null;
  const finalScoreSource =
    record?.final_score_source ?? record?.finalScoreSource ?? null;

  const audioSrc = requestId ? getApiUrl(`/api/admin/audio/${requestId}`) : "";
  const displayFilename =
    audioInfo?.filename ||
    record?.fileName ||
    record?.filename ||
    `verification_${requestId}`;

  // Export — fetch with auth then trigger save dialog.
  const handleExport = useCallback(
    async (format: ExportFormat) => {
      if (!requestId) return;
      try {
        setExportingFormat(format);
        const token = getToken();
        const headers: HeadersInit = token
          ? { Authorization: `Bearer ${token}` }
          : {};
        const resp = await fetch(
          getApiUrl(`/api/admin/export/${requestId}?format=${format}`),
          { headers },
        );
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.detail || `HTTP ${resp.status}`);
        }
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const ext = format === "markdown" ? "md" : format;
        a.download = `DetectX_verification_${requestId}.${ext}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch (err) {
        alert(
          `${format.toUpperCase()} 내보내기 실패: ${
            err instanceof Error ? err.message : "Unknown error"
          }`,
        );
      } finally {
        setExportingFormat(null);
      }
    },
    [requestId],
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/verifications">
              <a className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Verifications
              </a>
            </Link>
          </div>
          <Button variant="outline" size="sm" onClick={() => { fetchRecord(); fetchAudioInfo(); }}>
            <RefreshCw className="h-4 w-4 mr-1" />
            새로고침
          </Button>
        </div>

        {/* Header card */}
        <Card>
          <CardContent className="pt-6 space-y-2">
            {loadingRecord ? (
              <div className="h-20 bg-muted/30 rounded animate-pulse" />
            ) : error ? (
              <div className="text-red-500 text-sm">
                레코드 로딩 실패: {error}
              </div>
            ) : record ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <FileAudio className="h-5 w-5 text-forensic-cyan" />
                  <span className="truncate" title={displayFilename}>
                    {displayFilename}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono ml-2">
                    #{record.id}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {audioInfo?.user_email || record.userId || "—"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(record.createdAt)}
                  </span>
                  <span>
                    Original Verdict:{" "}
                    <span className="font-mono text-foreground">
                      {record.verdict || "—"}
                    </span>
                  </span>
                  <span>
                    Status:{" "}
                    <span className="font-mono text-foreground">{record.status || "—"}</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">레코드를 찾을 수 없습니다.</div>
            )}
          </CardContent>
        </Card>

        {/* Two-column body */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <AdminVerdictPanel
              verdict={verdict}
              cnnScore={cnnScore}
              finalScore={finalScore}
              finalScoreSource={finalScoreSource}
              tier={record?.tier ?? null}
              verificationRecord={record}
            />
          </div>
          <div className="space-y-6">
            {loadingInfo ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="h-20 bg-muted/30 rounded animate-pulse" />
                </CardContent>
              </Card>
            ) : audioInfo?.has_audio ? (
              <AudioPlayer src={audioSrc} filename={displayFilename} />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground italic">
                    원본 오디오가 더 이상 사용 불가합니다 (만료 또는 삭제됨).
                  </div>
                </CardContent>
              </Card>
            )}

            <DisputePanel
              requestId={requestId}
              info={audioInfo}
              onChanged={fetchAudioInfo}
            />
          </div>
        </div>

        {/* Export bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Download className="h-3 w-3" />
                내보내기 (Export)
              </span>
              {EXPORT_OPTIONS.map(({ format, label, Icon }) => (
                <Button
                  key={format}
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport(format)}
                  disabled={exportingFormat !== null}
                >
                  {exportingFormat === format ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4 mr-1" />
                  )}
                  {label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
