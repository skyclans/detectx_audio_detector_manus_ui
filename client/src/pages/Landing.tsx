import { Link } from "wouter";
import { useState } from "react";
import SEO from "@/components/SEO";
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
import LanguageSelector, { useLanguageRedirect } from "@/components/LanguageSelector";

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
  const [subscribing, setSubscribing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, loading, isAuthenticated, logout } = useAuth();

  useLanguageRedirect();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || subscribing) return;
    setSubscribing(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubscribed(true);
        setEmail("");
      }
    } catch {
      // silent fail
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="DetectX | Free AI Music Detector | Detect Suno & Udio AI-Generated Songs"
        description="Free AI music detector. Detect AI-generated songs from Suno, Udio, and other AI music generators. Patent-pending multi-engine detection technology plus voice deepfake detection."
        path="/"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How does DetectX detect AI-generated music?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectX uses proprietary multi-layer deep learning analysis. Audio is analyzed through multiple independent engines that examine structural signal patterns. The system cross-validates results across engines to minimize false positives on human content while maintaining strong AI detection capability."
            }
          },
          {
            "@type": "Question",
            "name": "Can DetectX detect Suno AI songs?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. DetectX detects Suno AI-generated music with 96.8% detection rate. The system analyzes structural patterns unique to Suno's generation process, identifying AI artifacts that persist even after format conversion or pitch shifting."
            }
          },
          {
            "@type": "Question",
            "name": "Can DetectX detect Udio AI music?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. DetectX detects Udio AI-generated tracks through deep audio analysis. The detection system identifies structural artifacts specific to Udio's AI generation model, providing reliable identification even after post-processing."
            }
          },
          {
            "@type": "Question",
            "name": "Is DetectX free to use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, DetectX offers a free tier that allows you to verify audio files for AI-generated content. Free users can scan tracks with our full analysis. Professional plans are available for batch processing, API access, and higher volume needs."
            }
          },
          {
            "@type": "Question",
            "name": "How accurate is AI music detection?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectX achieves 96.8% detection rate on Suno v5.5 AI-generated tracks and 58% on Udio tracks. The multi-engine system is designed to minimize false positives on human-created music. The system prioritizes protecting human artists over maximizing AI detection rate."
            }
          },
          {
            "@type": "Question",
            "name": "Can DetectX detect AI-generated voice and deepfakes?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. DetectX Voice detects AI-generated speech and deepfake voices with 97.8% accuracy across major commercial TTS engines including ElevenLabs, Google TTS, and OpenAI. It works under real phone call conditions (G.711 codec, 8kHz) with just 2 seconds of audio."
            }
          },
          {
            "@type": "Question",
            "name": "Can AI music still be detected after MP3 conversion or pitch shifting?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. DetectX analyzes structural properties that survive post-processing including MP3/AAC codec conversion, pitch shifting, tempo changes, and noise addition. Unlike surface-level detectors, DetectX examines deep signal patterns that persist through any standard audio transformation."
            }
          },
          {
            "@type": "Question",
            "name": "What audio formats does DetectX support?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectX supports WAV, MP3, FLAC, AAC, and OGG formats. Maximum file size is 100MB per analysis. The system works with any audio quality from low-bitrate MP3 to lossless studio masters."
            }
          },
          {
            "@type": "Question",
            "name": "How is DetectX different from other AI music detectors?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectX is the only AI music detector using a proprietary multi-stage verification architecture with patent-pending technology. Unlike single-model detectors, DetectX cross-validates across multiple independent engines and reports binary verdicts (AI signal observed or not) rather than ambiguous confidence percentages. The system also combines music and voice deepfake detection in one platform."
            }
          },
          {
            "@type": "Question",
            "name": "Does DetectX work for detecting AI-generated audio in podcasts or audiobooks?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectX Audio is optimized for music detection. For speech content like podcasts or audiobooks, use DetectX Voice which is specifically designed to detect AI-generated speech and deepfake voices with 97.8% accuracy, including content from ElevenLabs, Google TTS, OpenAI, and other commercial TTS engines."
            }
          }
        ]
      }) }} />
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <img
                src="/detectx-logo.png"
                alt="DetectX"
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-semibold tracking-tight text-foreground">DetectX</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/technology" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Technology
              </Link>
              <Link href="/research" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
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

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Right side: Language + Theme toggle + Login/User + Verify Audio */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Language Selector */}
              <LanguageSelector />

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
                      <DropdownMenuItem onClick={() => logout()} className="flex items-center gap-2 cursor-pointer text-red-500">
                        <LogOut className="h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link href="/login">
                    <Button variant="ghost" className="text-sm font-medium">
                      Sign In
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
                  href="/plan"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="/updates"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Updates
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
                  Instantly Detect AI-Generated Music from Suno, Udio & More
                </h1>
                <div className="space-y-3 mb-10">
                  <p className="text-lg text-muted-foreground">
                    DetectX uses proprietary multi-stage verification to detect AI-generated
                    content while protecting human creators.
                  </p>
                  <p className="text-lg text-muted-foreground">
                    Robust against codec conversion, pitch shifting, and other evasion
                    techniques that defeat single-layer detection systems.
                  </p>
                </div>
                {/* Performance Stats */}
                <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-10">
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">96.8%</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Suno Detection</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">97.8%</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Voice Deepfake</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">2 sec</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Min Detection</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">Patent</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Pending</div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Link href="/verify-audio">
                    <Button className="px-8 py-3 text-base font-medium w-fit">
                      Verify Audio
                    </Button>
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    Verify your audio with our proprietary detection engine. Patent pending.
                  </p>
                </div>
              </div>
              {/* Image - Right */}
              <div className="order-first md:order-last">
                <img
                  src="/images/herosection_new.png"
                  alt="DetectX AI music detector dashboard — detecting AI-generated songs from Suno and Udio"
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
                  src="/images/detectx_audio_section.png"
                  alt="AI music detection engine analyzing audio waveform — detect AI-generated music with multi-engine verification"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
              {/* Text - Right */}
              <div>
                <h2 className="text-2xl font-medium text-foreground mb-8">
                  Multi-Engine AI Music Detection for Suno, Udio & All Generators
                </h2>
                <div className="space-y-6 text-muted-foreground leading-relaxed">
                  <p>
                    DetectX Audio is a proprietary multi-stage verification system
                    designed to detect AI-generated music while protecting human artists.
                  </p>
                  <p>
                    The system uses multiple independent analysis stages, each producing
                    separate evidence signals. This multi-layered approach minimizes false
                    positives while maintaining strong AI detection capability.
                  </p>
                  <p>
                    Unlike surface-level detectors vulnerable to codec conversion or pitch shifting,
                    DetectX analyzes structural properties that survive any post-processing.
                  </p>
                </div>
                <div className="mt-10">
                  <h3 className="text-sm font-medium text-foreground uppercase tracking-wide mb-4">
                    Key Principles
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Proprietary multi-stage verification pipeline</li>
                    <li>• Human-safe by design (minimal false positives on human content)</li>
                    <li>• Evasion-resistant structural analysis</li>
                    <li>• Multiple independent metrics for evidence-grade results</li>
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
                  How AI Music Detection Works
                </h2>
                <ol className="space-y-4 text-muted-foreground">
                  <li className="flex gap-4">
                    <span className="text-foreground font-medium">1.</span>
                    <span>Audio is ingested and preprocessed through our proprietary pipeline.</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-foreground font-medium">2.</span>
                    <span>Multiple independent analysis engines evaluate structural signals.</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-foreground font-medium">3.</span>
                    <span>Cross-validation across engines eliminates false positives.</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-foreground font-medium">4.</span>
                    <span>Multi-stage consensus determines the final verdict.</span>
                  </li>
                </ol>
                <p className="mt-8 text-sm text-muted-foreground/80">
                  The system prioritizes human protection as a hard constraint.
                  When no AI signal evidence is found, the verdict is trusted immediately.
                  Additional analysis layers activate only when warranted.
                </p>
              </div>
              {/* Image - Right */}
              <div>
                <img
                  src="/images/how_it_works_section.png"
                  alt="How AI music detection works — multi-stage verification pipeline for detecting AI-generated audio"
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
                  alt="AI music detector verdict system — binary classification showing AI-generated vs human-created music results"
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

        {/* 5. Why DetectX */}
        <section className="py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-medium text-foreground mb-12 text-center">
              Why Choose DetectX AI Audio Detector
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 bg-muted/30 rounded-lg">
                <h3 className="text-sm font-medium text-foreground uppercase tracking-wide mb-3">
                  Evasion-Resistant
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Structural analysis survives codec conversion, pitch shifting,
                  and noise addition that defeat surface-level detectors.
                </p>
              </div>
              <div className="p-6 bg-muted/30 rounded-lg">
                <h3 className="text-sm font-medium text-foreground uppercase tracking-wide mb-3">
                  Independent
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Third-party verification with no platform interests.
                  Neutral analysis for rights management organizations.
                </p>
              </div>
              <div className="p-6 bg-muted/30 rounded-lg">
                <h3 className="text-sm font-medium text-foreground uppercase tracking-wide mb-3">
                  Evidence-Grade
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Multiple independent metrics provide quantitative evidence
                  for professional verification and dispute resolution.
                </p>
              </div>
              <div className="p-6 bg-muted/30 rounded-lg">
                <h3 className="text-sm font-medium text-foreground uppercase tracking-wide mb-3">
                  Patent Pending
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Proprietary detection architecture protected by pending patents.
                  Expert-curated training data verified by industry professionals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Mid-Page Action */}
        <section className="py-20 px-6 border-t border-border bg-muted/30">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-medium text-foreground mb-6">
              Check If Your Music Is AI-Generated
            </h2>
            <p className="text-muted-foreground mb-8">
              Upload your audio file and get instant AI detection results.
              Our proprietary multi-stage verification ensures strong AI detection
              while protecting human creators.
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
                    Our proprietary engine is trained on millions of verified human samples
                    to understand the full spectrum of human creative expression,
                    minimizing false positives on human-created music.
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
                  alt="Human music producer protected by AI audio detector — 98.89% accuracy preventing false positives on real music"
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
                  alt="Record labels and music distributors using AI music detection for catalog verification and AI song screening"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
              {/* Text - Right */}
              <div>
                <h2 className="text-2xl font-medium text-foreground mb-8">
                  Who Uses AI Music Detection
                </h2>
                <p className="text-muted-foreground mb-6">
                  DetectX Audio is designed for creators and institutions
                  who need reliable AI music detection.
                </p>
                <ul className="space-y-2 text-muted-foreground mb-8">
                  <li>• Composers and artists protecting their original work</li>
                  <li>• Music producers and record labels screening releases</li>
                  <li>• Financial institutions detecting voice phishing</li>
                  <li>• Law enforcement verifying voice evidence</li>
                  <li>• Streaming platforms and distributors</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  Designed for professionals who need accurate verification
                  across music and voice content.
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
                  AI Voice Detector & Expanding Modalities
                </h2>
                <p className="text-sm text-muted-foreground/70 leading-relaxed">
                  DetectX Voice for deepfake voice detection is now available,
                  with 97.8% detection rate across commercial TTS engines.
                </p>
                <p className="text-sm text-muted-foreground/70 leading-relaxed mt-4">
                  Additional modalities for text, image, and video content
                  are under development and will launch when they meet our
                  reliability standards.
                </p>
              </div>
              {/* Image - Right */}
              <div>
                <img
                  src="/images/othermodalities.png"
                  alt="AI voice deepfake detector and expanding content detection — voice phishing prevention and AI audio checker"
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
              system changes, and design decisions.
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
                <Button type="submit" variant="outline" disabled={subscribing}>
                  {subscribing ? "Subscribing..." : "Subscribe"}
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
