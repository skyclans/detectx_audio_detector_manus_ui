import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

/**
 * About Page
 * 
 * Purpose: Define identity, boundaries, and neutrality
 * Tone: Calm, technical, institutional
 */

export default function About() {
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
              <Link href="/technology" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
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
              <Link href="/about" className="text-sm text-foreground font-medium">
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
              About
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Identity, boundaries, and principles of the DetectX verification platform.
            </p>
          </div>

          {/* What DetectX Is */}
          <section className="mb-16">
            <h2 className="text-2xl font-medium text-foreground mb-6">
              What DetectX Is
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-4">
                DetectX is a forensic verification platform that analyzes structural signal evidence in media content. The system provides deterministic, reproducible analysis that can be independently verified.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                DetectX is not a content moderation tool, a copyright enforcement system, or an authorship certification service. It is a technical verification reference designed to support professional decision-making.
              </p>
            </div>
          </section>

          {/* Why DetectX Exists */}
          <section className="mb-16">
            <h2 className="text-2xl font-medium text-foreground mb-6">
              Why DetectX Exists
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-4">
                As AI-generated content becomes more prevalent, human creators face increasing risk of having their work misidentified or unfairly challenged. Existing detection systems often produce probabilistic outputs that create ambiguity and enable misuse.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                DetectX was created to provide a forensic reference that protects human creators. The system is designed to ensure that human creative work is not unfairly flagged by opaque or unreliable detection methods.
              </p>
            </div>
          </section>

          {/* What DetectX Does — and Does Not Do */}
          <section className="mb-16">
            <h2 className="text-2xl font-medium text-foreground mb-6">
              What DetectX Does — and Does Not Do
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-border rounded-lg p-6 bg-card">
                <h3 className="text-lg font-medium text-foreground mb-4">DetectX Does</h3>
                <ul className="space-y-3 text-muted-foreground text-sm">
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-500 mt-1">✓</span>
                    <span>Report structural signal observations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-500 mt-1">✓</span>
                    <span>Provide deterministic, reproducible results</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-500 mt-1">✓</span>
                    <span>Compare against human-normalized baselines</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-500 mt-1">✓</span>
                    <span>Support professional verification workflows</span>
                  </li>
                </ul>
              </div>
              <div className="border border-border rounded-lg p-6 bg-card">
                <h3 className="text-lg font-medium text-foreground mb-4">DetectX Does Not</h3>
                <ul className="space-y-3 text-muted-foreground text-sm">
                  <li className="flex items-start gap-3">
                    <span className="text-muted-foreground mt-1">✗</span>
                    <span>Determine authorship or ownership</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-muted-foreground mt-1">✗</span>
                    <span>Output probability scores or confidence levels</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-muted-foreground mt-1">✗</span>
                    <span>Identify which AI system generated content</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-muted-foreground mt-1">✗</span>
                    <span>Provide legal certifications or opinions</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Human Safety as a Design Constraint */}
          <section className="mb-16">
            <h2 className="text-2xl font-medium text-foreground mb-6">
              Human Safety as a Design Constraint
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-4">
                Human safety is not an optimization target—it is a hard constraint. Every design decision in the DetectX system prioritizes the protection of human creators.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The Classifier Engine is trained on over 30,000,000 verified human-created audio samples, ensuring the system recognizes the full breadth of human creative expression. This extensive training prioritizes near-zero false positives for human content.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                This means:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span>The Classifier Engine is optimized to protect human creators with approximately 0% false positive rate</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span>Detection sensitivity is sacrificed before human safety is compromised</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span>Ambiguous results are reported as "no evidence observed" rather than flagged</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span>System updates undergo human safety validation before deployment</span>
                </li>
              </ul>
            </div>
          </section>

          {/* How DetectX Is Used */}
          <section className="mb-16">
            <h2 className="text-2xl font-medium text-foreground mb-6">
              How DetectX Is Used
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-4">
                DetectX is designed for professional and institutional contexts where forensic verification is required:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span><strong className="text-foreground">Creators and artists</strong> verifying their own work against AI detection claims</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span><strong className="text-foreground">Studios and producers</strong> establishing verification records for releases</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span><strong className="text-foreground">Labels and distributors</strong> screening submissions for structural anomalies</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span><strong className="text-foreground">Institutions and associations</strong> establishing shared verification standards</span>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                The system provides a shared, deterministic reference that all parties can independently verify.
              </p>
            </div>
          </section>

          {/* Independence and Neutrality */}
          <section className="mb-16">
            <h2 className="text-2xl font-medium text-foreground mb-6">
              Independence and Neutrality
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-4">
                DetectX operates as an independent verification reference. The system does not advocate for or against AI-generated content. It reports structural observations without judgment.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Neutrality is maintained through transparent methodology, documented baselines, and reproducible analysis. Any party can verify DetectX results independently using the same inputs and procedures.
              </p>
            </div>
          </section>

          {/* Closing Statement */}
          <section className="mb-16 border-t border-border pt-12">
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed italic">
                DetectX exists to be trusted, not to impress. The platform is designed to provide a forensic reference that protects human creativity while acknowledging the legitimate presence of AI-generated content in the creative landscape.
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
