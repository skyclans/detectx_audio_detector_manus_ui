/**
 * DisputePanel
 *
 * Per-record dispute management UI. Lets an admin:
 *   - Open / resolve / move-to-training a dispute on this record
 *   - Edit admin notes
 *   - See audio expiry (retention) info
 *   - Re-verify the audio (server runs full pipeline again, returns delta)
 *   - Browse audit history for this record
 *
 * Backend contract (see CLAUDE description):
 *   GET  /api/admin/audio/{request_id}/info
 *   POST /api/admin/dispute/{request_id}    body: { status, notes }
 *   POST /api/admin/reverify/{request_id}
 *   GET  /api/admin/audit/{request_id}
 */

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  History,
  Loader2,
  PlayCircle,
  RotateCw,
  Save,
  ShieldAlert,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchWithAuth } from "@/lib/api";

type DisputeStatus = "open" | "resolved" | "training_data" | null;

export interface AudioInfo {
  has_audio: boolean;
  audio_expiry?: string | null;     // ISO timestamp
  dispute_status?: DisputeStatus;
  admin_notes?: string | null;
  filename?: string | null;
  file_size?: number | null;
  user_email?: string | null;
}

interface AuditEntry {
  id?: number | string;
  timestamp?: string;
  admin_email?: string;
  action?: string;
  details?: string | Record<string, any> | null;
}

interface ReverifyResult {
  original?: any;
  reverified?: any;
  delta?: Record<string, any> | null;
}

interface DisputePanelProps {
  requestId: string | number;
  info: AudioInfo | null;
  /** Refresh callback - parent should re-fetch /info after dispute mutations. */
  onChanged?: () => void;
}

function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toISOString().replace("T", " ").substring(0, 19) + " UTC";
  } catch {
    return iso;
  }
}

function statusBadge(status: DisputeStatus) {
  switch (status) {
    case "open":
      return {
        label: "분쟁 조사중 (Open)",
        cls: "bg-amber-500/20 text-amber-400 border-amber-500/40",
      };
    case "resolved":
      return {
        label: "해결됨 (Resolved)",
        cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
      };
    case "training_data":
      return {
        label: "학습 데이터 (Training Data)",
        cls: "bg-blue-500/20 text-blue-400 border-blue-500/40",
      };
    default:
      return {
        label: "분쟁 없음 (Not Disputed)",
        cls: "bg-muted/30 text-muted-foreground border-border",
      };
  }
}

export function DisputePanel({ requestId, info, onChanged }: DisputePanelProps) {
  const [adminNotes, setAdminNotes] = useState(info?.admin_notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);

  // Status change modal
  const [modalAction, setModalAction] = useState<DisputeStatus | null>(null);
  const [modalNotes, setModalNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Re-verify
  const [reverifying, setReverifying] = useState(false);
  const [reverifyResult, setReverifyResult] = useState<ReverifyResult | null>(null);
  const [reverifyError, setReverifyError] = useState<string | null>(null);

  // Audit history
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  // Sync local notes editor when info changes (e.g. after parent refresh).
  useEffect(() => {
    setAdminNotes(info?.admin_notes ?? "");
  }, [info?.admin_notes]);

  const currentStatus: DisputeStatus = info?.dispute_status ?? null;
  const badge = statusBadge(currentStatus);

  // ---- Status mutation ---------------------------------------------------
  const openStatusModal = (next: Exclude<DisputeStatus, null>) => {
    setModalAction(next);
    setModalNotes("");
  };

  const submitStatusChange = useCallback(async () => {
    if (!modalAction) return;
    try {
      setSubmitting(true);
      const resp = await fetchWithAuth(`/api/admin/dispute/${requestId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: modalAction, notes: modalNotes }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${resp.status}`);
      }
      setModalAction(null);
      onChanged?.();
    } catch (err) {
      alert(
        `분쟁 상태 변경 실패: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setSubmitting(false);
    }
  }, [modalAction, modalNotes, requestId, onChanged]);

  // ---- Notes save (keeps current status) --------------------------------
  const saveNotes = useCallback(async () => {
    try {
      setSavingNotes(true);
      const resp = await fetchWithAuth(`/api/admin/dispute/${requestId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: currentStatus ?? "open",
          notes: adminNotes,
        }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${resp.status}`);
      }
      onChanged?.();
    } catch (err) {
      alert(
        `노트 저장 실패: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setSavingNotes(false);
    }
  }, [adminNotes, currentStatus, requestId, onChanged]);

  // ---- Re-verify --------------------------------------------------------
  const runReverify = useCallback(async () => {
    try {
      setReverifying(true);
      setReverifyError(null);
      setReverifyResult(null);
      const resp = await fetchWithAuth(`/api/admin/reverify/${requestId}`, {
        method: "POST",
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${resp.status}`);
      }
      const data: ReverifyResult = await resp.json();
      setReverifyResult(data);
    } catch (err) {
      setReverifyError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setReverifying(false);
    }
  }, [requestId]);

  // ---- Audit history ----------------------------------------------------
  const fetchAudit = useCallback(async () => {
    try {
      setAuditLoading(true);
      setAuditError(null);
      const resp = await fetchWithAuth(`/api/admin/audit/${requestId}`);
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${resp.status}`);
      }
      const data = await resp.json();
      const list: AuditEntry[] = Array.isArray(data) ? data : data?.entries || [];
      setAuditEntries(list);
    } catch (err) {
      setAuditError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setAuditLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    if (auditOpen && auditEntries.length === 0 && !auditError) {
      fetchAudit();
    }
  }, [auditOpen, auditEntries.length, auditError, fetchAudit]);

  // ---- UI ---------------------------------------------------------------
  const canOpen = currentStatus !== "open";
  const canResolve = currentStatus === "open";
  const canMoveToTraining =
    currentStatus === "open" || currentStatus === "resolved";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-400" />
            분쟁 관리 (Dispute Management)
          </span>
          <span
            className={cn(
              "text-[11px] uppercase tracking-wider px-2 py-1 rounded border",
              badge.cls,
            )}
          >
            {badge.label}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Retention info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            Audio retained until:{" "}
            <span className="font-mono text-foreground">
              {formatDate(info?.audio_expiry)}
            </span>
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={!canOpen}
            onClick={() => openStatusModal("open")}
          >
            <ShieldAlert className="h-4 w-4 mr-1 text-amber-400" />
            분쟁 시작 (Open Dispute)
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!canResolve}
            onClick={() => openStatusModal("resolved")}
          >
            <ShieldCheck className="h-4 w-4 mr-1 text-emerald-400" />
            해결 표시 (Mark Resolved)
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!canMoveToTraining}
            onClick={() => {
              if (
                confirm(
                  "이 레코드를 학습 데이터로 이동하시겠습니까?\n" +
                    "Move this record to training data?",
                )
              ) {
                openStatusModal("training_data");
              }
            }}
          >
            <GraduationCap className="h-4 w-4 mr-1 text-blue-400" />
            학습 데이터로 이동 (Training Data)
          </Button>
        </div>

        {/* Admin notes editor */}
        <div className="space-y-2">
          <Label htmlFor={`admin-notes-${requestId}`} className="text-xs uppercase tracking-wider text-muted-foreground">
            관리자 메모 (Admin Notes)
          </Label>
          <Textarea
            id={`admin-notes-${requestId}`}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="조사 메모, 후속 조치, 참고 사항 등..."
            rows={4}
            className="font-mono text-xs"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={saveNotes}
              disabled={savingNotes || adminNotes === (info?.admin_notes ?? "")}
            >
              {savingNotes ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              메모 저장
            </Button>
          </div>
        </div>

        {/* Re-verify */}
        <div className="space-y-2 p-3 rounded border border-border/40 bg-muted/10">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <RotateCw className="h-3 w-3" />
              재검증 (Re-verify)
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={runReverify}
              disabled={reverifying || !info?.has_audio}
            >
              {reverifying ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <PlayCircle className="h-4 w-4 mr-1" />
              )}
              재실행
            </Button>
          </div>
          {!info?.has_audio && (
            <p className="text-[11px] text-muted-foreground italic">
              원본 오디오가 없거나 만료되어 재검증할 수 없습니다.
            </p>
          )}
          {reverifyError && (
            <p className="text-xs text-red-400">재검증 실패: {reverifyError}</p>
          )}
          {reverifyResult && (
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2 rounded bg-background/50 border border-border/40">
                  <div className="text-muted-foreground uppercase text-[10px] tracking-wider mb-1">
                    Original
                  </div>
                  <pre className="font-mono text-[11px] whitespace-pre-wrap break-words text-foreground/90">
                    {JSON.stringify(reverifyResult.original, null, 2)}
                  </pre>
                </div>
                <div className="p-2 rounded bg-background/50 border border-border/40">
                  <div className="text-muted-foreground uppercase text-[10px] tracking-wider mb-1">
                    Re-verified
                  </div>
                  <pre className="font-mono text-[11px] whitespace-pre-wrap break-words text-foreground/90">
                    {JSON.stringify(reverifyResult.reverified, null, 2)}
                  </pre>
                </div>
              </div>
              {reverifyResult.delta && (
                <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30">
                  <div className="text-amber-400 uppercase text-[10px] tracking-wider mb-1">
                    Delta
                  </div>
                  <pre className="font-mono text-[11px] whitespace-pre-wrap break-words text-amber-200/90">
                    {JSON.stringify(reverifyResult.delta, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Audit history (collapsible) */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setAuditOpen((o) => !o)}
            className="w-full flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-1">
              <History className="h-3 w-3" />
              감사 로그 (Audit History)
            </span>
            {auditOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {auditOpen && (
            <div className="rounded border border-border/40 overflow-x-auto">
              {auditLoading ? (
                <div className="p-4 text-xs text-muted-foreground text-center">
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                  Loading…
                </div>
              ) : auditError ? (
                <div className="p-3 text-xs text-red-400">감사 로그 로딩 실패: {auditError}</div>
              ) : auditEntries.length === 0 ? (
                <div className="p-3 text-xs text-muted-foreground italic">
                  이 레코드에 대한 감사 기록이 없습니다.
                </div>
              ) : (
                <table className="w-full text-xs">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="text-left py-2 px-2 font-medium text-muted-foreground">Time (UTC)</th>
                      <th className="text-left py-2 px-2 font-medium text-muted-foreground">Admin</th>
                      <th className="text-left py-2 px-2 font-medium text-muted-foreground">Action</th>
                      <th className="text-left py-2 px-2 font-medium text-muted-foreground">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditEntries.map((e, idx) => (
                      <tr key={e.id ?? idx} className="border-t border-border/40">
                        <td className="py-1.5 px-2 font-mono text-[11px]">{formatDate(e.timestamp)}</td>
                        <td className="py-1.5 px-2">{e.admin_email || "—"}</td>
                        <td className="py-1.5 px-2 font-medium">{e.action || "—"}</td>
                        <td className="py-1.5 px-2 font-mono text-[11px] text-muted-foreground">
                          {typeof e.details === "string"
                            ? e.details
                            : e.details
                              ? JSON.stringify(e.details)
                              : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </CardContent>

      {/* Status change modal */}
      <Dialog
        open={modalAction !== null}
        onOpenChange={(open) => {
          if (!open) setModalAction(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalAction === "open" && "분쟁 시작"}
              {modalAction === "resolved" && "분쟁 해결 표시"}
              {modalAction === "training_data" && "학습 데이터로 이동"}
            </DialogTitle>
            <DialogDescription>
              {modalAction === "open" &&
                "이 검증 결과에 대한 분쟁 조사를 시작합니다. 사유나 메모를 입력하세요."}
              {modalAction === "resolved" &&
                "분쟁이 해결되었음을 표시합니다. 해결 내용을 메모로 남겨주세요."}
              {modalAction === "training_data" &&
                "이 오디오를 학습 데이터셋으로 이관합니다. 사유를 남겨주세요."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="modal-dispute-notes">메모 (Notes)</Label>
            <Textarea
              id="modal-dispute-notes"
              value={modalNotes}
              onChange={(e) => setModalNotes(e.target.value)}
              rows={4}
              placeholder="예: 사용자가 본인 작곡곡 주장, 원본 stem 파일 확보 후 검토 예정..."
              className="font-mono text-xs"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAction(null)} disabled={submitting}>
              취소
            </Button>
            <Button onClick={submitStatusChange} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
