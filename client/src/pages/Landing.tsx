import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Sun, Moon, User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * DetectX Landing Page (HOME)
 * 
 * Design Principles:
 * - Calm, restrained, factual, technical tone
 * - Alternating image-text layout for clarity
 * - Light mode default, dark mode calm/forensic/low-contrast
 * - No hype, buzzwords, slogans
 * - Forensic system entry point, not marketing site
 * - All copy used verbatim from specification
 */

export default function Landing() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, loading, isAuthenticated, logout } = useAuth();

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

            {/* Right side: Theme toggle + Login/User + Verify Audio */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              {/* Login/User Button */}
              {!loading && (
                isAuthenticated && user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">{user.name || 'Account'}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link href="/verify-audio" className="flex items-center gap-2 cursor-pointer">
                          History
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/plan" className="flex items-center gap-2 cursor-pointer">
                          Plan
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="flex items-center gap-2 cursor-pointer text-red-500">
                        <LogOut className="h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link href="/login">
                    <Button variant="ghost" className="text-sm font-medium">
                      Login
                    </Button>
                  </Link>
                )
              )}

              {/* Verify Audio Button */}
              <Link href="/verify-audio">
                <Button variant="outline" className="text-sm font-medium">
                  Verify Audio
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main>
        {/* 1. Hero Section - Text Left, Image Right */}
        <section className="py-20 md:py-28 px-6">
          <div className="mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              {/* Text - Left */}
              <div>
                <h1 className="text-3xl md:text-4xl font-medium leading-tight text-foreground mb-8">
                  A forensic verification engine for structural AI signal analysis.
                </h1>
                <div className="space-y-3 mb-10">
                  <p className="text-lg text-muted-foreground">
                    DetectX Audio analyzes residual signal geometry after normalization.
                  </p>
                  <p className="text-lg text-muted-foreground">
                    It does not determine authorship or probability.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Link href="/verify-audio">
                    <Button className="px-8 py-3 text-base font-medium w-fit">
                      Verify Audio
                    </Button>
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    Analyze audio using a deterministic, human-safe verification baseline.
                  </p>
                </div>
              </div>
              {/* Image - Right */}
              <div className="order-first md:order-last">
                <img
                  src="/images/herosection.png"
                  alt="Audio forensic analysis workstation"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2. Core Section — DetectX Audio - Image Left, Text Right */}
        <section className="py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              {/* Image - Left */}
              <div>
                <img
                  src="/images/coresection.png"
                  alt="DetectX Audio verification system"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
              {/* Text - Right */}
              <div>
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
            </div>
          </div>
        </section>

        {/* 3. How DetectX Audio Works - Text Left, Image Right */}
        <section className="py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              {/* Text - Left */}
              <div>
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
              {/* Image - Right */}
              <div>
                <img
                  src="/images/howitworkssection.png"
                  alt="Forensic signal analysis workflow"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 4. Clear Verdict Semantics - Image Left, Text Right */}
        <section className="py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              {/* Image - Left */}
              <div>
                <img
                  src="/images/ClearVerdictSemanticssection.png"
                  alt="Clear verdict semantics diagram"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
              {/* Text - Right */}
              <div>
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
            </div>
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

        {/* 6. Protecting Human Creativity - Text Left, Image Right */}
        <section className="py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              {/* Text - Left */}
              <div>
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
              {/* Image - Right */}
              <div>
                <img
                  src="/images/ProtectingHumanCreativitysection.png"
                  alt="Music producer at mixing console"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 7. Who Uses DetectX Audio - Image Left, Text Right */}
        <section className="py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              {/* Image - Left */}
              <div>
                <img
                  src="/images/WhoUsesDetectXAudiosection.png"
                  alt="Professional audio studio environment"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
              {/* Text - Right */}
              <div>
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
            </div>
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
          
          {/* Legal Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground/60 mt-4">
            <Link href="/terms" className="hover:text-muted-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-muted-foreground transition-colors">
              Privacy Policy
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
