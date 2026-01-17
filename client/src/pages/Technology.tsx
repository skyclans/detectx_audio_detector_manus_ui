import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

/**
 * Technology Page
 * 
 * Purpose: Explain how the system works (implementation & structure)
 * Tone: Calm, technical, institutional
 */

export default function Technology() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-xl font-semibold tracking-tight text-foreground">
              DetectX
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/technology" className="text-sm text-foreground font-medium">
                Technology
              </Link>
              <Link href="/research" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Research
              </Link>
              <Link href="/updates" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Updates
              </Link>
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Blog
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
              Technology
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Technical architecture and implementation details of the DetectX verification system.
            </p>
          </div>

          {/* What DetectX Builds */}
          <section className="mb-16">
            <h2 className="text-2xl font-medium text-foreground mb-6">
              What DetectX Builds
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-4">
                DetectX develops forensic verification systems for detecting structural AI signal evidence in media content. The platform is designed to provide deterministic, reproducible analysis that can be independently verified.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Unlike probabilistic detection systems that output confidence scores, DetectX systems report binary structural observations: either AI signal evidence was observed, or it was not. This approach eliminates the ambiguity inherent in percentage-based classifications.
              </p>
            </div>
          </section>

          {/* DetectX Audio — Engine Overview */}
          <section className="mb-16">
            <h2 className="text-2xl font-medium text-foreground mb-6">
              DetectX Audio — Engine Overview
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-4">
                DetectX Audio is the first production verification engine in the DetectX platform. It analyzes mix-level audio signals to detect structural evidence of AI generation.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The engine operates on a fixed normalization pipeline that transforms input audio into a standardized measurement space. This normalization ensures that all analyses are conducted under identical conditions, regardless of source format, encoding, or loudness.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                After normalization, the system extracts residual signal geometry and compares it against human-normalized baselines. The comparison is purely structural—no model attribution, no similarity scoring, no probabilistic inference.
              </p>
            </div>
          </section>

          {/* Core Technical Principles */}
          <section className="mb-16">
            <h2 className="text-2xl font-medium text-foreground mb-6">
              Core Technical Principles
            </h2>
            <div className="space-y-6">
              <div className="border border-border rounded-lg p-6 bg-card">
                <h3 className="text-lg font-medium text-foreground mb-3">Deterministic Processing</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every step in the verification pipeline produces identical output for identical input. There are no random seeds, no stochastic sampling, and no model inference variability. The same audio file will always produce the same verdict.
                </p>
              </div>
              <div className="border border-border rounded-lg p-6 bg-card">
                <h3 className="text-lg font-medium text-foreground mb-3">Human-Safe Baseline Construction</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Baselines are constructed exclusively from verified human-created content. The system is calibrated to ensure that human creative work does not trigger false positives. Human safety is a design constraint, not an optimization target.
                </p>
              </div>
              <div className="border border-border rounded-lg p-6 bg-card">
                <h3 className="text-lg font-medium text-foreground mb-3">Geometry-First Analysis</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The system analyzes structural signal geometry rather than learned feature representations. This approach avoids the opacity of neural network classifiers and provides explainable, auditable results.
                </p>
              </div>
              <div className="border border-border rounded-lg p-6 bg-card">
                <h3 className="text-lg font-medium text-foreground mb-3">No Probability Scores</h3>
                <p className="text-muted-foreground leading-relaxed">
                  DetectX does not output confidence percentages or likelihood ratios. The system reports structural observations only: evidence was observed, or evidence was not observed. This eliminates the misinterpretation risks associated with probabilistic outputs.
                </p>
              </div>
            </div>
          </section>

          {/* Verdict Model */}
          <section className="mb-16">
            <h2 className="text-2xl font-medium text-foreground mb-6">
              Verdict Model
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none mb-6">
              <p className="text-muted-foreground leading-relaxed">
                The DetectX verdict model is intentionally constrained to two possible outcomes:
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-border rounded-lg p-6 bg-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                  <span className="font-medium text-foreground">AI signal evidence was observed</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Structural signal behavior exceeded what can be explained by human creation alone.
                </p>
              </div>
              <div className="border border-border rounded-lg p-6 bg-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
                  <span className="font-medium text-foreground">AI signal evidence was not observed</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Structural signal behavior falls within human-normalized baseline parameters.
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              These verdicts describe structural observations only. They do not imply authorship, creative intent, or legal attribution.
            </p>
          </section>

          {/* System Boundaries */}
          <section className="mb-16">
            <h2 className="text-2xl font-medium text-foreground mb-6">
              System Boundaries
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-4">
                DetectX Audio operates within clearly defined boundaries:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span>Mix-level audio only (no stem separation or source isolation)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span>Minimum duration requirements for reliable analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span>Supported formats: WAV, MP3, FLAC, AAC, OGG</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span>Maximum file size: 50MB per analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span>No real-time streaming analysis</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Deployment Contexts */}
          <section className="mb-16">
            <h2 className="text-2xl font-medium text-foreground mb-6">
              Deployment Contexts
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-4">
                DetectX Audio is designed for integration into professional workflows where forensic verification is required:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span>Content submission pipelines for labels and distributors</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span>Pre-release verification for studios and producers</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span>Catalog auditing for rights holders</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span>Independent verification for creators and artists</span>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-6">
                The system provides a shared, deterministic reference that all parties can independently verify.
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
