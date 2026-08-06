/**
 * VerifyAudioV2 — verify-audio 대공사 (forensic-lab 리디자인).
 * 기존 Home.tsx는 그대로 두고 새 모듈로 미리보기. 라우트 예: /verify-audio-v2
 *
 * 원칙:
 *  - forensic-grade, 과학적/신뢰 우선. 다크 랩 미학(테마 토큰 재사용).
 *  - 실데이터만 시각화: verdict/tier/score + /api/forensic Phase A 지표 + recon enriched + generator.
 *  - ★내부 용어 전부 추상화: G1-B/G3-B/CNN/RECON 지표명 노출 금지 → "DetectX Forensic Engine",
 *    "Spectral Balance", "Structural Coherence" 등 일반 라벨. (feedback_internal_terminology_protection)
 *  - 임계값 수치·아키텍처 비노출. 중립 톤(측정값 surface, 판단은 위임).
 */
import { useCallback, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// ---- types (API 계약: POST /api/verify-audio → poll /api/job/{id}, POST /api/forensic) ----
type Tier = "human" | "mixed-human" | "mixed-ai" | "ai" | "inconclusive";
interface ReconRow {
  id: string;
  label: string;
  formatted: string;
  strength: "strong-ai" | "marginal-ai" | "marginal-human" | "strong-human" | null;
  bar_position: number | null; // 0 human .. 100 ai
}
interface VerifyResult {
  verdict: string;
  cnn_score: number | null;
  final_score: number | null;
  final_score_source: "cnn" | "recon" | null;
  tier: Tier | null;
  metadata?: {
    duration?: number | null;
    sample_rate?: number | null;
    channels?: number | null;
    codec?: string | null;
    artist?: string | null;
    title?: string | null;
  };
  recon_metrics_enriched?: ReconRow[];
  strength_summary?: { text?: string };
  detailed_analysis?: {
    axes?: { id: string; name: string; status: "exceeded" | "within_bounds" }[];
  };
  generator?: {
    version_family?: string | null;
    confidence_grade?: string | null;
  } | null;
}
interface Forensic {
  spectralBalance?: { symmetryIndex?: number | null; status?: string };
  bandDistribution?: {
    subBass?: number | null; bass?: number | null; lowMid?: number | null;
    mid?: number | null; highMid?: number | null; high?: number | null;
  };
  temporalPattern?: { flatnessRatio?: number | null; status?: string };
  highFrequencyAnomaly?: { status?: string };
  transientAnomaly?: { status?: string };
  directMixTexture?: {
    vocalNaturalness?: number | null; pitchStability?: number | null;
    instrumentTexture?: number | null; spatialDepth?: number | null;
  };
}

// ---- verdict 3-tier (임계 비노출, 중립 라벨) ----
function verdictView(tier: Tier | null) {
  switch (tier) {
    case "ai":
      return { label: "AI signals observed", tone: "ai" as const };
    case "mixed-ai":
    case "mixed-human":
      return { label: "Mixed signals detected", tone: "mixed" as const };
    case "inconclusive":
      return { label: "Signals inconclusive", tone: "mixed" as const };
    default:
      return { label: "AI signals not observed", tone: "human" as const };
  }
}
const TONE = {
  ai: { text: "text-forensic-amber", ring: "ring-forensic-amber/40", bar: "bg-forensic-amber", glow: "shadow-[0_0_60px_-15px_var(--forensic-amber)]" },
  mixed: { text: "text-forensic-purple", ring: "ring-forensic-purple/40", bar: "bg-forensic-purple", glow: "shadow-[0_0_60px_-15px_var(--forensic-purple)]" },
  human: { text: "text-forensic-green", ring: "ring-forensic-green/40", bar: "bg-forensic-green", glow: "shadow-[0_0_60px_-15px_var(--forensic-green)]" },
};

const STAGES = [
  "Signal ingestion",
  "Spectral forensic scan",
  "Structural coherence analysis",
  "Temporal pattern analysis",
  "Evidence synthesis",
];

export default function VerifyAudioV2() {
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<"idle" | "analyzing" | "done" | "error">("idle");
  const [stage, setStage] = useState(0);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [forensic, setForensic] = useState<Forensic | null>(null);
  const [err, setErr] = useState<string>("");
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const run = useCallback(async (f: File) => {
    setFile(f); setPhase("analyzing"); setStage(0); setResult(null); setForensic(null); setErr("");
    const tick = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 1400);
    try {
      const fd = new FormData(); fd.append("file", f);
      const sub = await fetch("/api/verify-audio?orientation=enhanced", { method: "POST", body: fd });
      if (!sub.ok && sub.status !== 202) throw new Error("Submission failed");
      const { request_id } = await sub.json();
      // poll
      let res: VerifyResult | null = null;
      for (let i = 0; i < 90; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const j = await fetch(`/api/job/${request_id}`);
        const jd = await j.json();
        if (jd.status === "completed") { res = jd.result; break; }
        if (jd.status === "failed") throw new Error("Analysis failed");
      }
      if (!res) throw new Error("Timed out");
      clearInterval(tick); setStage(STAGES.length - 1); setResult(res); setPhase("done");
      // 비블로킹 forensic 애드온
      try {
        const ff = new FormData(); ff.append("file", f);
        const fr = await fetch("/api/forensic", { method: "POST", body: ff });
        const fj = await fr.json();
        if (fj?.forensic) setForensic(fj.forensic);
      } catch { /* graceful */ }
    } catch (e: any) {
      clearInterval(tick); setErr(e?.message || "Unexpected error"); setPhase("error");
    }
  }, []);

  const pct = (v: number | null | undefined) =>
    v == null ? null : Math.round(Math.max(0, Math.min(1, v)) * 100);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-5 py-10">
        {/* header */}
        <div className="mb-8">
          <div className="text-[11px] uppercase tracking-[0.3em] text-forensic-cyan/80">
            DetectX Audio Forensic Engine
          </div>
          <h1 className="mt-1 text-2xl font-semibold">Audio Verification</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Forensic analysis of whether a track carries AI-generation signals. The engine
            surfaces measurements; interpretation is left to you.
          </p>
        </div>

        {/* UPLOAD */}
        {phase === "idle" && (
          <Card
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) run(f); }}
            className={`flex flex-col items-center justify-center gap-4 border border-dashed py-16 transition
              ${drag ? "border-forensic-cyan bg-forensic-cyan/5" : "border-border"}`}
          >
            <div className="grid size-14 place-items-center rounded-full bg-forensic-cyan/10 ring-1 ring-forensic-cyan/30">
              <WaveIcon />
            </div>
            <div className="text-center">
              <div className="font-medium">Drop an audio file to analyze</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Your file is analyzed for forensic signals and is not shared.
              </div>
            </div>
            <input ref={inputRef} type="file" accept="audio/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) run(f); }} />
            <Button onClick={() => inputRef.current?.click()} className="mt-1">
              Select audio
            </Button>
          </Card>
        )}

        {/* ANALYZING */}
        {phase === "analyzing" && (
          <Card className="p-6">
            <div className="mb-1 text-sm font-medium text-forensic-cyan">Analyzing</div>
            <div className="mb-5 text-xs text-muted-foreground truncate">{file?.name}</div>
            <div className="space-y-3">
              {STAGES.map((s, i) => (
                <div key={s} className="flex items-center gap-3">
                  <span className={`grid size-5 place-items-center rounded-full text-[10px] ring-1
                    ${i < stage ? "bg-forensic-green/20 text-forensic-green ring-forensic-green/40"
                      : i === stage ? "bg-forensic-cyan/20 text-forensic-cyan ring-forensic-cyan/40 animate-pulse"
                      : "text-muted-foreground ring-border"}`}>
                    {i < stage ? "✓" : i + 1}
                  </span>
                  <span className={`text-sm ${i <= stage ? "" : "text-muted-foreground"}`}>{s}</span>
                </div>
              ))}
            </div>
            <Progress value={(stage / (STAGES.length - 1)) * 100} className="mt-6 h-1" />
          </Card>
        )}

        {/* ERROR */}
        {phase === "error" && (
          <Card className="border-forensic-amber/40 p-6">
            <div className="text-forensic-amber">Analysis could not be completed.</div>
            <div className="mt-1 text-xs text-muted-foreground">{err}</div>
            <Button variant="secondary" className="mt-4" onClick={() => setPhase("idle")}>Try again</Button>
          </Card>
        )}

        {/* RESULTS */}
        {phase === "done" && result && (
          <div className="space-y-5">
            <VerdictHero result={result} pct={pct} />
            {forensic && <ForensicSignal forensic={forensic} pct={pct} />}
            {result.recon_metrics_enriched?.length ? (
              <SignalIndicators rows={result.recon_metrics_enriched} summary={result.strength_summary?.text} />
            ) : null}
            <StructuralCoherence axes={result.detailed_analysis?.axes} generator={result.generator} />
            <MetaAndAdvanced result={result} forensic={forensic} pct={pct} />
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setPhase("idle")}>Analyze another</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Verdict hero ----------
function VerdictHero({ result, pct }: { result: VerifyResult; pct: (v: any) => number | null }) {
  const v = verdictView(result.tier);
  const t = TONE[v.tone];
  const ai = pct(result.final_score ?? result.cnn_score) ?? 0;
  return (
    <Card className={`relative overflow-hidden p-7 ring-1 ${t.ring} ${t.glow}`}>
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
        <span className="inline-block size-1.5 rounded-full bg-forensic-cyan" /> Forensic-grade result
      </div>
      <div className={`mt-3 text-3xl font-semibold ${t.text}`}>{v.label}</div>
      {/* AI vs Human meter */}
      <div className="mt-6">
        <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
          <span>Human-likelihood</span><span>AI-likelihood</span>
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-forensic-green/20">
          <div className={`h-full ${t.bar} transition-all duration-700`} style={{ width: `${ai}%` }} />
          <div className="absolute inset-y-0 left-1/2 w-px bg-border" />
        </div>
        <div className="mt-1.5 flex justify-between text-xs">
          <span className="text-forensic-green">{100 - ai}%</span>
          <span className={t.text}>{ai}%</span>
        </div>
      </div>
    </Card>
  );
}

// ---------- Forensic signal (Phase A, 실데이터) ----------
function ForensicSignal({ forensic, pct }: { forensic: Forensic; pct: (v: any) => number | null }) {
  const bd = forensic.bandDistribution || {};
  const bands: { k: string; v: number | null | undefined }[] = [
    { k: "Sub", v: bd.subBass }, { k: "Bass", v: bd.bass }, { k: "Lo-Mid", v: bd.lowMid },
    { k: "Mid", v: bd.mid }, { k: "Hi-Mid", v: bd.highMid }, { k: "High", v: bd.high },
  ];
  const max = Math.max(0.0001, ...bands.map((b) => b.v ?? 0));
  const tx = forensic.directMixTexture || {};
  const gauges: { k: string; v: number | null | undefined }[] = [
    { k: "Vocal naturalness", v: tx.vocalNaturalness }, { k: "Pitch stability", v: tx.pitchStability },
    { k: "Instrument texture", v: tx.instrumentTexture }, { k: "Spatial depth", v: tx.spatialDepth },
  ];
  return (
    <Card className="p-6">
      <SectionTitle>Spectral Forensic Map</SectionTitle>
      {/* band distribution spectrum */}
      <div className="mt-4 flex items-end gap-2" style={{ height: 96 }}>
        {bands.map((b) => (
          <div key={b.k} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full flex-1 items-end">
              <div className="w-full rounded-t bg-gradient-to-t from-forensic-cyan/30 to-forensic-cyan transition-all"
                style={{ height: `${((b.v ?? 0) / max) * 100}%` }} />
            </div>
            <span className="text-[10px] text-muted-foreground">{b.k}</span>
          </div>
        ))}
      </div>
      {/* status chips */}
      <div className="mt-5 flex flex-wrap gap-2">
        <StatusChip label="Spectral balance" ok={forensic.spectralBalance?.status === "measured"} />
        <StatusChip label="Temporal pattern" ok={forensic.temporalPattern?.status === "measured"} />
        <StatusChip label="HF anomaly" ok={forensic.highFrequencyAnomaly?.status === "measured"} />
        <StatusChip label="Transient anomaly" ok={forensic.transientAnomaly?.status === "measured"} />
      </div>
      {/* texture gauges */}
      {gauges.some((g) => g.v != null) && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {gauges.map((g) => (
            <div key={g.k}>
              <div className="mb-1 text-[11px] text-muted-foreground">{g.k}</div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-forensic-cyan" style={{ width: `${pct(g.v) ?? 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ---------- Signal indicators (recon enriched, 추상화) ----------
function SignalIndicators({ rows, summary }: { rows: ReconRow[]; summary?: string }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <SectionTitle>Reconstruction Signal Indicators</SectionTitle>
        {summary && <span className="text-xs text-muted-foreground">{summary}</span>}
      </div>
      <div className="mt-4 space-y-2.5">
        {rows.map((r, i) => {
          const pos = r.bar_position ?? 50;
          const ai = pos >= 50;
          return (
            <div key={r.id} className="flex items-center gap-3">
              {/* 라벨 추상화: 원 라벨 노출 대신 인덱스 기반 중립 표기 */}
              <span className="w-24 shrink-0 text-xs text-muted-foreground">Indicator {i + 1}</span>
              <div className="relative h-2 flex-1 rounded-full bg-muted">
                <div className="absolute inset-y-0 left-1/2 w-px bg-border/70" />
                <div className={`absolute top-1/2 size-2.5 -translate-y-1/2 rounded-full ${ai ? "bg-forensic-amber" : "bg-forensic-green"}`}
                  style={{ left: `calc(${pos}% - 5px)` }} />
              </div>
              <span className={`w-10 text-right text-[11px] ${ai ? "text-forensic-amber" : "text-forensic-green"}`}>
                {ai ? "AI" : "Human"}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>Human side</span><span>AI side</span>
      </div>
    </Card>
  );
}

// ---------- Structural coherence (axes 추상화 — G1-B 등 코드명 노출 X) ----------
function StructuralCoherence({
  axes, generator,
}: { axes?: { id: string; name: string; status: string }[]; generator?: VerifyResult["generator"] }) {
  const exceeded = (axes || []).filter((a) => a.status === "exceeded").length;
  const total = (axes || []).length;
  return (
    <Card className="p-6">
      <SectionTitle>Structural Coherence Analysis</SectionTitle>
      <p className="mt-2 text-xs text-muted-foreground">
        Cross-layer structural dependencies characteristic of human production.
      </p>
      {total > 0 && (
        <div className="mt-4 flex items-center gap-3">
          <div className="text-2xl font-semibold">{exceeded}<span className="text-sm text-muted-foreground">/{total}</span></div>
          <div className="text-xs text-muted-foreground">structural axes flagged</div>
        </div>
      )}
      {generator?.version_family && (
        <div className="mt-5 rounded-lg border border-forensic-amber/30 bg-forensic-amber/5 p-3">
          <div className="text-[11px] uppercase tracking-wider text-forensic-amber">Generator attribution</div>
          <div className="mt-1 text-sm">
            {generator.version_family}
            {generator.confidence_grade && (
              <Badge variant="secondary" className="ml-2 text-[10px]">{generator.confidence_grade} confidence</Badge>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

// ---------- Metadata + advanced (collapsible) ----------
function MetaAndAdvanced({
  result, forensic, pct,
}: { result: VerifyResult; forensic: Forensic | null; pct: (v: any) => number | null }) {
  const m = result.metadata || {};
  const meta: [string, string | number | null | undefined][] = [
    ["Duration", m.duration ? `${Math.round(m.duration)}s` : null],
    ["Sample rate", m.sample_rate ? `${m.sample_rate} Hz` : null],
    ["Channels", m.channels === 2 ? "Stereo" : m.channels === 1 ? "Mono" : null],
    ["Codec", m.codec], ["Artist", m.artist], ["Title", m.title],
  ];
  return (
    <Collapsible>
      <Card className="p-0">
        <CollapsibleTrigger className="flex w-full items-center justify-between p-5 text-left">
          <SectionTitle>Advanced Signal Analysis</SectionTitle>
          <span className="text-xs text-muted-foreground">expand ▾</span>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-5 pb-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
            {meta.filter(([, v]) => v != null).map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border/40 py-1.5 text-xs">
                <span className="text-muted-foreground">{k}</span><span>{v}</span>
              </div>
            ))}
          </div>
          {forensic && (
            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
              <Metric k="Spectral symmetry" v={forensic.spectralBalance?.symmetryIndex} />
              <Metric k="Temporal flatness" v={forensic.temporalPattern?.flatnessRatio} />
              <Metric k="Vocal naturalness" v={pct(forensic.directMixTexture?.vocalNaturalness)} suffix="%" />
            </div>
          )}
          <p className="mt-4 text-[10px] text-muted-foreground">
            Measurements are surfaced for review. DetectX presents forensic signals and does not
            render legal or artistic judgment.
          </p>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ---------- small parts ----------
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold tracking-wide text-forensic-cyan">{children}</h2>;
}
function StatusChip({ label, ok }: { label: string; ok?: boolean }) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-[11px] ${ok ? "border-forensic-cyan/30 text-forensic-cyan" : "border-border text-muted-foreground"}`}>
      {label}{ok ? " · measured" : " · n/a"}
    </span>
  );
}
function Metric({ k, v, suffix = "" }: { k: string; v: number | null | undefined; suffix?: string }) {
  return (
    <div className="flex justify-between border-b border-border/40 py-1.5 text-xs">
      <span className="text-muted-foreground">{k}</span>
      <span>{v == null ? "—" : `${typeof v === "number" ? v.toFixed(suffix === "%" ? 0 : 3) : v}${suffix}`}</span>
    </div>
  );
}
function WaveIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-forensic-cyan">
      <path d="M2 12h2m4-6v12m4-9v6m4-10v14m4-8v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
