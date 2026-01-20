import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Sun, Moon, User, LogOut, Menu, X } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Right side: Theme toggle + Login/User + Verify Audio */}
            <div className="flex items-center gap-2 md:gap-4">
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
                      <DropdownMenuItem onClick={() => logout(true)} className="flex items-center gap-2 cursor-pointer text-red-500">
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

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border py-4">
              <div className="flex flex-col gap-4">
                <Link 
                  href="/technology" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Technology
                </Link>
                <Link 
                  href="/research" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Research
                </Link>
                <Link 
                  href="/updates" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Updates
                </Link>
                <Link 
                  href="/blog" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Blog
                </Link>
                <Link 
                  href="/about" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  href="/contact" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              </div>
            </div>
          )}
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
                  A forensic verification engine for AI-generated music detection.
                </h1>
                <div className="space-y-3 mb-10">
                  <p className="text-lg text-muted-foreground">
                    DetectX Audio uses dual-engine analysis to detect AI-generated music
                    with strong AI detection while protecting human artists at 98.89% accuracy.
                  </p>
                  <p className="text-lg text-muted-foreground">
                    It does not determine authorship or probability.
                  </p>
                </div>
                {/* Performance Stats */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-10">
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">Strong</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">AI Detection</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">98.89%</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Human Accuracy</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">30M+</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Training Samples</div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Link href="/verify-audio">
                    <Button className="px-8 py-3 text-base font-medium w-fit">
                      Verify Audio
                    </Button>
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    Verify your audio with our Classifier Engine trained on 30,000,000+ human music samples.
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
                    DetectX Audio is a dual-engine forensic verification system
                    designed to detect AI-generated music while protecting human artists.
                  </p>
                  <p>
                    The system uses Enhanced Mode by default: Classifier Engine (primary)
                    trained on 30,000,000+ verified human music samples, combined with
                    Reconstruction Engine (secondary) for additional AI signal analysis.
                  </p>
                  <p>
                    By analyzing structural patterns unique to AI-generated audio,
                    DetectX Audio reports whether AI signal evidence is present
                    while maintaining near-zero false positives on human music.
                  </p>
                </div>
                <div className="mt-10">
                  <h3 className="text-sm font-medium text-foreground uppercase tracking-wide mb-4">
                    Key Principles
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Dual-engine verification (Classifier + Reconstruction)</li>
                    <li>• Human-safe by design (98.89% accuracy on human music)</li>
                    <li>• Strong AI detection</li>
                    <li>• Clear binary verdict, no probability scores</li>
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
                    <span>Audio is processed through the Classifier Engine (CNN).</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-foreground font-medium">2.</span>
                    <span>If classifier score exceeds 90%, Reconstruction Engine activates.</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-foreground font-medium">3.</span>
                    <span>Audio is separated into stems and reconstructed for comparison.</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-foreground font-medium">4.</span>
                    <span>Dual-engine consensus determines the final verdict.</span>
                  </li>
                </ol>
                <p className="mt-8 text-sm text-muted-foreground/80">
                  Enhanced Mode prioritizes human protection: if the Classifier Engine
                  says "Human," it is trusted. Additional analysis only runs when
                  AI signals are initially detected.
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
              Verify your music
            </h2>
            <p className="text-muted-foreground mb-8">
              Upload your audio file and get instant AI detection results.
              Enhanced Mode provides dual-engine verification with strong AI detection
              and 98.89% human accuracy.
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
                    DetectX Audio was developed to protect human artists
                    from being falsely flagged as AI-generated.
                  </p>
                  <p>
                    With 98.89% accuracy on human music, our Classifier Engine
                    is trained on over 30 million verified human music samples
                    to understand the full spectrum of human musical expression.
                  </p>
                  <p>
                    DetectX does not determine authorship.
                    It provides a reliable verification reference that prioritizes
                    human artist protection while maintaining strong AI detection.
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
                  DetectX Audio is designed for creators and institutions
                  who need reliable AI music detection.
                </p>
                <ul className="space-y-2 text-muted-foreground mb-8">
                  <li>• Composers protecting their original work</li>
                  <li>• Music producers verifying submissions</li>
                  <li>• Record labels screening releases</li>
                  <li>• Music associations and copyright organizations</li>
                  <li>• Streaming platforms and distributors</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  Trusted by professionals who need accurate verification
                  without false positives on human-created music.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Other Detection Modalities */}
        <section className="py-16 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              {/* Text - Left */}
              <div>
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
              {/* Image - Right */}
              <div>
                <img
                  src="/images/othermodalities.png"
                  alt="Future detection modalities under development"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            </div>
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
