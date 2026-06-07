/**
 * PreviewTier4 — Standalone visual preview for the new VerdictPanel
 * and AdvancedSignalAnalysis (Tier 4) components.
 *
 * NO auth required. Mock data only. Designer / association demo / IR preview use.
 *
 * Route: /preview
 */

import { useState } from "react";
import { VerdictPanel } from "@/components/VerdictPanel";
import {
  AdvancedSignalAnalysis,
  getMockForensicData,
  type MockMixScenario,
} from "@/components/AdvancedSignalAnalysis";

type VerdictBucket = "human" | "mixed" | "ai";

const VERDICT_SCORES: Record<VerdictBucket, number> = {
  human: 0.027,
  mixed: 0.76,
  ai: 0.945,
};

const VERDICT_TEXTS: Record<VerdictBucket, string> = {
  human: "AI signal evidence was not observed.",
  mixed: "AI signal evidence was not observed.", // backend stays binary; display layer overrides
  ai: "AI signal evidence was observed.",
};

const SCENARIO_OPTIONS: { value: MockMixScenario; label: string }[] = [
  { value: "full", label: "Full Mix (vocal + drums + bass + other)" },
  { value: "instrumental", label: "Instrumental (no vocal)" },
  { value: "drumless", label: "Drumless (acoustic ballad)" },
  { value: "no_bass", label: "No Bass (treble-focused)" },
  { value: "piano_solo", label: "Piano Solo (other only)" },
  { value: "vocal_acoustic", label: "Vocal + Acoustic (no drums)" },
];

const VERDICT_OPTIONS: { value: VerdictBucket; label: string }[] = [
  { value: "human", label: "Human (Primary Engine 2.7%)" },
  { value: "mixed", label: "Mixed (Primary Engine 76%)" },
  { value: "ai", label: "AI (Primary Engine 94.5%)" },
];

export default function PreviewTier4() {
  const [scenario, setScenario] = useState<MockMixScenario>("full");
  const [verdictBucket, setVerdictBucket] = useState<VerdictBucket>("mixed");

  const cnnScore = VERDICT_SCORES[verdictBucket];
  const verdictText = VERDICT_TEXTS[verdictBucket];

  const mockVerdict = {
    verdict: verdictText as
      | "AI signal evidence was observed."
      | "AI signal evidence was not observed.",
    authority: "DetectX Forensic" as const,
    exceeded_axes:
      verdictBucket === "ai" ? ["DETECTX_V3"] : verdictBucket === "mixed" ? ["DETECTX_V3"] : [],
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">DetectX UI Preview — Tier 4</h1>
          <p className="text-sm text-muted-foreground">
            Standalone visual preview. No authentication required. Mock data only.
          </p>
        </div>

        {/* Controls */}
        <div className="rounded-lg border border-border bg-muted/10 p-4 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Preview Controls
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label
                htmlFor="verdict-select"
                className="text-xs text-muted-foreground"
              >
                Verdict scenario (Primary Engine score)
              </label>
              <select
                id="verdict-select"
                value={verdictBucket}
                onChange={(e) => setVerdictBucket(e.target.value as VerdictBucket)}
                className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm"
              >
                {VERDICT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="scenario-select"
                className="text-xs text-muted-foreground"
              >
                Mix scenario (stem presence)
              </label>
              <select
                id="scenario-select"
                value={scenario}
                onChange={(e) => setScenario(e.target.value as MockMixScenario)}
                className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm"
              >
                {SCENARIO_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* VerdictPanel preview */}
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tier 1 — Verdict Panel
          </div>
          <VerdictPanel
            verdict={mockVerdict}
            cnnScore={cnnScore}
            isProcessing={false}
            progress={100}
          />
        </div>

        {/* AdvancedSignalAnalysis preview */}
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tier 4 — Advanced Signal Analysis
          </div>
          <AdvancedSignalAnalysis
            data={getMockForensicData(scenario)}
            isProcessing={false}
          />
        </div>

        {/* Notes */}
        <div className="rounded-lg border border-border bg-muted/5 p-4 text-xs text-muted-foreground space-y-1">
          <p>
            <strong>Notes:</strong>
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Backend verdict text remains binary. Display label is derived from Primary Engine score (50-80% → Mixed).</li>
            <li>Stereo Imager bands dim when their source stems are absent in the mix scenario.</li>
            <li>Naturalness axis label adapts (Naturalness ↔ Instr. Texture) based on vocal presence.</li>
            <li>This page is for visual review only. No production data is used.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
