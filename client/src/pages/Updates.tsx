import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

/**
 * Updates Page
 * 
 * Purpose: Record design decisions and system changes
 * Tone: Calm, technical, institutional
 */

export default function Updates() {
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
              <Link href="/updates" className="text-sm text-foreground font-medium">
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
              Updates
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Design decisions, system changes, and development notes.
            </p>
          </div>

          {/* Update Entry: DAY 35 */}
          <article className="mb-16 border border-border rounded-lg overflow-hidden">
            <div className="bg-muted/30 px-6 py-4 border-b border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono text-muted-foreground">DAY 35</span>
                <time className="text-sm text-muted-foreground">2026-01-12</time>
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-medium text-foreground mb-6">
                Human Baseline Minimal Strategy Locked
              </h2>
              
              <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  After extensive testing across multiple baseline construction approaches, the minimal strategy has been locked for production deployment.
                </p>

                <h3 className="text-lg font-medium text-foreground mt-8 mb-4">Decision Summary</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The human baseline will be constructed using a minimal, high-confidence corpus rather than an expansive, diverse corpus. This decision prioritizes false positive prevention over detection sensitivity.
                </p>

                <h3 className="text-lg font-medium text-foreground mt-8 mb-4">Rationale</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-1">•</span>
                    <span>Larger baselines increase the risk of including edge-case human content that resembles AI patterns, leading to baseline contamination.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-1">•</span>
                    <span>Minimal baselines with strict provenance verification provide cleaner separation between human and AI signal geometry.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-1">•</span>
                    <span>False positives (human work flagged as AI) cause more harm than false negatives (AI work not detected). The minimal strategy optimizes for human safety.</span>
                  </li>
                </ul>

                <h3 className="text-lg font-medium text-foreground mt-8 mb-4">Implementation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The baseline corpus consists of approximately 2,400 verified human-created audio samples spanning 12 genre categories. Each sample has documented provenance including recording session metadata, artist verification, and production chain attestation.
                </p>

                <h3 className="text-lg font-medium text-foreground mt-8 mb-4">Validation Results</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Testing against a held-out validation set of 800 verified human samples showed zero false positives. Testing against a corpus of 1,200 AI-generated samples showed 94.2% detection rate.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  The 5.8% of AI samples not detected exhibited signal geometry within human baseline parameters. These samples are being analyzed to determine whether baseline expansion is warranted or whether they represent legitimate edge cases.
                </p>

                <h3 className="text-lg font-medium text-foreground mt-8 mb-4">Next Steps</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-1">•</span>
                    <span>Deploy minimal baseline to production verification pipeline</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-1">•</span>
                    <span>Monitor false positive reports and baseline performance metrics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-1">•</span>
                    <span>Continue analysis of undetected AI samples for potential baseline refinement</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-1">•</span>
                    <span>Document baseline versioning and update procedures</span>
                  </li>
                </ul>

                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground italic">
                    This update documents a design decision. It does not constitute a guarantee of system performance or accuracy.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Archive Notice */}
          <div className="text-center py-12 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Previous updates will be archived here as the system evolves.
            </p>
          </div>
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
