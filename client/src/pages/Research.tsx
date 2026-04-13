import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";
import SEO from "@/components/SEO";

/**
 * Research Page
 * 
 * Purpose: Explain why DetectX is designed this way (philosophy & decisions)
 * Tone: Calm, technical, institutional
 */

export default function Research() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Research"
        description="DetectX research: design philosophy, accuracy benchmarks, and technical decisions behind our AI music detection system. Evidence-based forensic analysis approach."
        path="/research"
      />
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/detectx-logo.png" alt="DetectX" className="w-8 h-8 object-contain" />
              <span className="text-xl font-semibold tracking-tight text-foreground">DetectX</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/technology" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Technology
              </Link>
              <Link href="/research" className="text-sm text-foreground font-medium">
                Research
              </Link>
              <Link href="/plan" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/updates" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Updates
              </Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <Link href="/verify-audio">
                <Button variant="outline" className="text-sm font-medium">
                  Verify Audio
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-6">
          {/* Page Title */}
          <div className="mb-16">
            <h1 className="text-3xl md:text-4xl font-medium text-foreground mb-6">
              Research
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Design philosophy and research foundations behind DetectX verification systems.
            </p>
          </div>

          {/* Research Philosophy */}
          <section className="mb-16">
            <h2 className="text-2xl font-medium text-foreground mb-6">
              Research Philosophy
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-4">
                DetectX is built on the principle that forensic verification must be deterministic, explainable, and human-safe. These are not optimization targets—they are hard constraints that shape every design decision.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The research program prioritizes reliability over sensitivity. A system that occasionally misclassifies human work as AI-generated causes more harm than a system that occasionally fails to detect AI content. Human safety is non-negotiable.
              </p>
            </div>
            {/* Philosophy Diagram */}
            <div className="mt-8">
              <img
                src="/images/research-philosophy.png"
                alt="Research philosophy: deterministic, explainable, human-safe"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </section>

          {/* Why Probability-Based Detection Fails */}
          <section className="mb-16">
            <h2 className="text-2xl font-medium text-foreground mb-6">
              Why Probability-Based Detection Fails
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-4">
                Most AI detection systems output probability scores: "87% likely AI-generated." These scores create several fundamental problems:
              </p>
              <ul className="space-y-3 text-muted-foreground mb-4">
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span><strong className="text-foreground">Threshold ambiguity:</strong> What does 87% mean? Is 60% enough to act on? Different users apply different thresholds, leading to inconsistent outcomes.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span><strong className="text-foreground">False precision:</strong> Probability scores imply a level of certainty that the underlying models cannot support. The number feels authoritative but is often arbitrary.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span><strong className="text-foreground">Reproducibility failures:</strong> Many probabilistic systems produce different scores on repeated analysis of the same content, undermining forensic credibility.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span><strong className="text-foreground">Human harm:</strong> When human-created work receives a high AI probability score, the creator faces an impossible burden of proof. The score becomes an accusation without recourse.</span>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                DetectX rejects probability-based outputs entirely. The system reports structural observations, not statistical inferences.
              </p>
            </div>
          </section>

          {/* Human-Normalized Baselines */}
          <section className="mb-16">
            <h2 className="text-2xl font-medium text-foreground mb-6">
              Human-Normalized Baselines
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-4">
                The foundation of DetectX verification is the human-normalized baseline: a reference model constructed exclusively from verified human-created content.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Baselines are constructed from verified human-created content spanning diverse genres, languages, production styles, and recording conditions. The calibration process prioritizes minimizing false positive risk above all other metrics.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Content that falls within baseline parameters is reported as showing no AI signal evidence. Baseline updates follow strict versioning and validation procedures.
              </p>
            </div>
            {/* Baseline Visualization */}
            <div className="mt-8">
              <img
                src="/images/research-baseline.png"
                alt="Human-normalized baseline trained on millions of verified samples"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </section>

          {/* Multi-Stage Verification */}
          <section className="mb-16">
            <h2 className="text-2xl font-medium text-foreground mb-6">
              Multi-Stage Verification Approach
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-4">
                DetectX uses a proprietary multi-stage architecture that prioritizes human protection while maintaining effective AI detection. The specific engine design is protected under pending patent applications.
              </p>
              <div className="grid md:grid-cols-2 gap-6 my-6">
                <div className="border border-border rounded-lg p-6 bg-card">
                  <h3 className="text-lg font-medium text-foreground mb-3">DetectX Audio</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-generated music detection with 98.89% human protection accuracy. Multiple independent analysis stages cross-validate to minimize false positives.
                  </p>
                </div>
                <div className="border border-border rounded-lg p-6 bg-card">
                  <h3 className="text-lg font-medium text-foreground mb-3">DetectX Voice</h3>
                  <p className="text-sm text-muted-foreground">
                    Deepfake voice detection with 97.8% accuracy. Optimized for telephony conditions including G.711 codec and background noise. 2-second minimum for detection.
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Both products share the same research philosophy: human safety as a hard constraint, deterministic analysis, and binary verdict outputs. Each uses proprietary detection technology developed in-house.
              </p>
            </div>
          </section>

          {/* Determinism as a Forensic Requirement */}
          <section className="mb-16">
            <h2 className="text-2xl font-medium text-foreground mb-6">
              Determinism as a Forensic Requirement
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-4">
                Forensic systems must be deterministic. The same input must always produce the same output. This is not a preference—it is a requirement for any system whose results may inform consequential decisions.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                DetectX achieves determinism through:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span>Versioned models and baseline references</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span>Reproducible analysis workflows that can be independently verified</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span>Binary verdict outputs without probabilistic ambiguity</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Failure Cases and Corrections */}
          <section className="mb-16">
            <h2 className="text-2xl font-medium text-foreground mb-6">
              Failure Cases and Corrections
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-4">
                No verification system is perfect. DetectX acknowledges known limitations and maintains documented correction procedures:
              </p>
              <ul className="space-y-3 text-muted-foreground mb-4">
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span><strong className="text-foreground">Edge cases:</strong> Unusual production techniques may produce signal geometry outside baseline parameters. These cases are documented and baselines are updated accordingly.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span><strong className="text-foreground">Hybrid content:</strong> Content that combines human and AI elements may produce ambiguous results. The system reports what it observes without inferring intent.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span><strong className="text-foreground">Format artifacts:</strong> Extreme compression or format conversion may introduce signal artifacts. Minimum quality thresholds are enforced.</span>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                When errors are identified, baseline parameters are reviewed and updated through documented versioning procedures. All corrections are logged and traceable.
              </p>
            </div>
          </section>

          {/* What DetectX Refuses to Do */}
          <section className="mb-16">
            <h2 className="text-2xl font-medium text-foreground mb-6">
              What DetectX Refuses to Do
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-4">
                Certain capabilities are intentionally excluded from the DetectX system:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span><strong className="text-foreground">Authorship determination:</strong> DetectX does not identify who created content. It reports structural observations only.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span><strong className="text-foreground">Model attribution:</strong> DetectX does not identify which AI system generated content. It detects structural anomalies, not model signatures.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span><strong className="text-foreground">Intent inference:</strong> DetectX does not infer creative intent, deception, or purpose. It reports signal geometry.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span><strong className="text-foreground">Legal conclusions:</strong> DetectX does not provide legal opinions or certifications. Results are technical observations for professional interpretation.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Ongoing Research Areas */}
          <section className="mb-16">
            <h2 className="text-2xl font-medium text-foreground mb-6">
              Ongoing Research Areas
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-4">
                Active research programs include:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span>Voice deepfake detection across telephony conditions and languages</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span>Baseline expansion for additional audio genres and production contexts</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span>Robustness testing against adversarial manipulation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span>Verification systems for image, text, and video content</span>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                New modalities will be introduced only after they meet the same forensic reliability and human-safety standards as DetectX Audio and DetectX Voice.
              </p>
            </div>
          </section>

          {/* Closing Statement */}
          <section className="mb-16 border-t border-border pt-12">
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed italic">
                DetectX exists to provide a forensic reference that can be trusted. The research program is guided by a single principle: verification systems must protect human creators, not endanger them.
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="border-t border-border pt-12">
            <div className="text-center">
              <h3 className="text-xl font-medium text-foreground mb-4">
                Verify an audio signal
              </h3>
              <p className="text-muted-foreground mb-6">
                Analyze audio using a deterministic, human-safe verification baseline.
              </p>
              <Link href="/verify-audio">
                <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                  Verify Audio
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 mt-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <p className="text-sm text-muted-foreground">
                DetectX does not determine authorship. It reports structural signal observations only.
              </p>
              <p className="text-xs text-muted-foreground/50 mt-2">
                © {new Date().getFullYear()} DetectX Inc. All rights reserved. Patent pending.
              </p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <Link href="/technology" className="hover:text-foreground transition-colors">Technology</Link>
              <Link href="/research" className="hover:text-foreground transition-colors">Research</Link>
              <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
              <span className="text-muted-foreground/30">|</span>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
