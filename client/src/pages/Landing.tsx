import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * DetectX Landing Page (HOME)
 * 
 * Design Principles:
 * - Calm, restrained, factual, technical tone
 * - Text-first, clarity-first
 * - No hype, buzzwords, slogans, or illustrations
 * - Forensic system entry point, not marketing site
 * - All copy used verbatim from specification
 */

export default function Landing() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="text-xl font-semibold tracking-tight text-foreground">
              DetectX
            </Link>

            {/* Navigation Links */}
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
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>

            {/* Verify Audio Button */}
            <Link href="/verify-audio">
              <Button variant="outline" className="text-sm font-medium">
                Verify Audio
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* 1. Hero Section */}
        <section className="py-24 px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl md:text-4xl font-medium leading-tight text-foreground mb-8">
              A forensic verification engine for structural AI signal analysis.
            </h1>
            <div className="space-y-2 mb-10">
              <p className="text-lg text-muted-foreground">
                DetectX Audio analyzes residual signal geometry after normalization.
              </p>
              <p className="text-lg text-muted-foreground">
                It does not determine authorship or probability.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Link href="/verify-audio">
                <Button className="px-8 py-3 text-base font-medium">
                  Verify Audio
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">
                Analyze audio using a deterministic, human-safe verification baseline.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Core Section — DetectX Audio */}
        <section className="py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-medium text-foreground mb-8">
              DetectX Audio
            </h2>
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>
                DetectX Audio is a geometry-based forensic verification system
                designed to analyze structural signal behavior in audio.
              </p>
              <p>
                The system operates on mix-level audio only and applies a fixed,
                deterministic normalization process to establish a shared measurement space.
              </p>
              <p>
                By comparing residual signal geometry against human-normalized baselines,
                DetectX Audio reports whether structural signal evidence exceeds
                what can be explained by human creation alone.
              </p>
            </div>
            <div className="mt-10">
              <h3 className="text-sm font-medium text-foreground uppercase tracking-wide mb-4">
                Key Principles
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Deterministic and reproducible by design</li>
                <li>• Human-safe baseline construction</li>
                <li>• Geometry-first analysis, not model attribution</li>
                <li>• No probability scores or similarity judgments</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. How DetectX Audio Works */}
        <section className="py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-medium text-foreground mb-10">
              How It Works
            </h2>
            <ol className="space-y-4 text-muted-foreground">
              <li className="flex gap-4">
                <span className="text-foreground font-medium">1.</span>
                <span>Audio is normalized into a fixed measurement space.</span>
              </li>
              <li className="flex gap-4">
                <span className="text-foreground font-medium">2.</span>
                <span>Residual signal geometry is extracted and analyzed.</span>
              </li>
              <li className="flex gap-4">
                <span className="text-foreground font-medium">3.</span>
                <span>Structural behavior is evaluated against human baselines.</span>
              </li>
              <li className="flex gap-4">
                <span className="text-foreground font-medium">4.</span>
                <span>Structural exceedance is reported as signal evidence.</span>
              </li>
            </ol>
            <p className="mt-8 text-sm text-muted-foreground/80">
              This process is fully deterministic and does not rely on
              probabilistic classification or model attribution.
            </p>
          </div>
        </section>

        {/* 4. Clear Verdict Semantics */}
        <section className="py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-medium text-foreground mb-8">
              Clear Verdict Semantics
            </h2>
            <p className="text-muted-foreground mb-6">
              DetectX Audio reports only two possible outcomes:
            </p>
            <ul className="space-y-2 text-muted-foreground mb-8">
              <li>• AI signal evidence was observed.</li>
              <li>• AI signal evidence was not observed.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              These statements describe structural signal behavior only.
              They do not imply authorship, probability, creative intent,
              or legal attribution.
            </p>
          </div>
        </section>

        {/* 5. Mid-Page Action */}
        <section className="py-20 px-6 border-t border-border bg-muted/30">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-medium text-foreground mb-6">
              Verify an audio signal
            </h2>
            <p className="text-muted-foreground mb-8">
              Analyze an audio signal against human-normalized baselines
              to determine whether structural signal evidence is present.
            </p>
            <Link href="/verify-audio">
              <Button className="px-8 py-3 text-base font-medium">
                Verify Audio
              </Button>
            </Link>
          </div>
        </section>

        {/* 6. Protecting Human Creativity */}
        <section className="py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-medium text-foreground mb-8">
              Protecting Human Creativity
            </h2>
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>
                DetectX Audio was developed to help protect human creativity
                by providing a neutral, explainable verification reference.
              </p>
              <p>
                As AI-generated content becomes more prevalent,
                human-created works are increasingly at risk of being
                misinterpreted or unfairly challenged.
              </p>
              <p>
                DetectX does not determine authorship.
                It helps ensure that human creative work is not unfairly flagged
                by opaque or probabilistic detection systems.
              </p>
            </div>
          </div>
        </section>

        {/* 7. Who Uses DetectX Audio */}
        <section className="py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-medium text-foreground mb-8">
              Who Uses DetectX Audio
            </h2>
            <p className="text-muted-foreground mb-6">
              DetectX Audio is designed for use across a wide range of
              professional and institutional contexts.
            </p>
            <ul className="space-y-2 text-muted-foreground mb-8">
              <li>• Composers and creators</li>
              <li>• Music producers and studios</li>
              <li>• Record labels and distributors</li>
              <li>• Music associations and institutions</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              The system provides a shared, deterministic reference
              for evaluating structural signal behavior in audio,
              without asserting authorship or creative intent.
            </p>
          </div>
        </section>

        {/* 8. Other Detection Modalities */}
        <section className="py-16 px-6 border-t border-border">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-medium text-muted-foreground mb-6">
              Other Detection Modalities
            </h2>
            <p className="text-sm text-muted-foreground/70 leading-relaxed">
              Verification systems for text, image, and video content
              are currently under research and development.
            </p>
            <p className="text-sm text-muted-foreground/70 leading-relaxed mt-4">
              These modalities will be introduced only after they meet
              the same forensic reliability and human-safety standards.
            </p>
          </div>
        </section>

        {/* 9. Newsletter Signup */}
        <section className="py-16 px-6 border-t border-border">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-medium text-foreground mb-4">
              Join the DetectX Newsletter
            </h2>
            <p className="text-muted-foreground mb-6">
              Receive updates on verification research,
              system changes, and forensic design decisions.
            </p>
            {subscribed ? (
              <p className="text-sm text-forensic-green">
                Thank you for subscribing.
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-3 max-w-md">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button type="submit" variant="outline">
                  Subscribe
                </Button>
              </form>
            )}
            <p className="text-xs text-muted-foreground/60 mt-4">
              No marketing emails. Research and system updates only.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="mx-auto max-w-3xl">
          {/* Footer Principle */}
          <p className="text-center text-muted-foreground mb-8">
            DetectX does not determine authorship.
            It reports structural signal evidence only.
          </p>
          
          {/* Footer Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground/60">
            <Link href="/technology" className="hover:text-muted-foreground transition-colors">
              Technology
            </Link>
            <Link href="/research" className="hover:text-muted-foreground transition-colors">
              Research
            </Link>
            <Link href="/updates" className="hover:text-muted-foreground transition-colors">
              Updates
            </Link>
            <Link href="/blog" className="hover:text-muted-foreground transition-colors">
              Blog
            </Link>
            <Link href="/about" className="hover:text-muted-foreground transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-muted-foreground transition-colors">
              Contact
            </Link>
          </div>
          
          <p className="text-center text-xs text-muted-foreground/40 mt-8">
            © {new Date().getFullYear()} DetectX. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
