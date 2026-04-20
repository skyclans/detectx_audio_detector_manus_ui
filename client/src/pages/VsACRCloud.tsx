import { Link } from "wouter";
import { useState } from "react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { Sun, Moon, User, LogOut, Menu, X, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LanguageSelector from "@/components/LanguageSelector";

export default function VsACRCloud() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, loading, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="DetectX vs ACRCloud — AI Music Detection Comparison 2026"
        description="Compare DetectX and ACRCloud for AI music detection. Side-by-side comparison of accuracy, features, pricing, batch processing, and voice deepfake detection capabilities."
        path="/vs/acrcloud"
      />
      {/* FAQPage Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Is DetectX more accurate than ACRCloud for AI music detection?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectX publishes verified benchmarks showing 96.8% detection rate on Suno v5.5 (995 tracks, 16 genres). ACRCloud does not publicly disclose accuracy metrics for their AI music detection capability, making direct comparison difficult. DetectX also publishes its human false positive rate of 1.11%."
            }
          },
          {
            "@type": "Question",
            "name": "Does ACRCloud have a free tier for AI music detection?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. ACRCloud requires enterprise contact for AI music detection access. DetectX offers a free tier with unlimited single-file scans using full multi-engine analysis, with no signup required for basic detection."
            }
          },
          {
            "@type": "Question",
            "name": "Can DetectX detect voice deepfakes in addition to AI music?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. DetectX offers voice deepfake detection with 97.8% accuracy, capable of identifying AI-generated speech from services like ElevenLabs, Google TTS, and OpenAI. ACRCloud does not offer voice deepfake detection capabilities."
            }
          }
        ]
      }) }} />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/detectx-logo.png" alt="DetectX" className="w-8 h-8 object-contain" />
              <span className="text-xl font-semibold tracking-tight text-foreground">DetectX</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="/technology" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Technology</Link>
              <Link href="/research" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Research</Link>
              <Link href="/plan" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="flex items-center gap-2 md:gap-4">
              <LanguageSelector />
              <button onClick={toggleTheme} className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="Toggle theme">
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
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
                      <DropdownMenuItem asChild><Link href="/verify-audio" className="cursor-pointer">Dashboard</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link href="/settings" className="cursor-pointer">Settings</Link></DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => logout()} className="text-red-500 cursor-pointer"><LogOut className="h-4 w-4 mr-2" />Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link href="/login"><Button variant="ghost" className="text-sm font-medium">Sign In</Button></Link>
                )
              )}
              <Link href="/verify-audio"><Button className="text-sm font-medium">Scan Free</Button></Link>
            </div>
          </nav>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border py-4">
              <div className="flex flex-col gap-4">
                <Link href="/technology" className="text-sm text-muted-foreground hover:text-foreground px-2 py-2" onClick={() => setMobileMenuOpen(false)}>Technology</Link>
                <Link href="/research" className="text-sm text-muted-foreground hover:text-foreground px-2 py-2" onClick={() => setMobileMenuOpen(false)}>Research</Link>
                <Link href="/plan" className="text-sm text-muted-foreground hover:text-foreground px-2 py-2" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground px-2 py-2" onClick={() => setMobileMenuOpen(false)}>About</Link>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground px-2 py-2" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16">
        {/* Hero */}
        <section className="mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            DetectX vs ACRCloud: Which AI Music Detector Is Better?
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Both DetectX and ACRCloud offer AI-generated music detection, but they come from different backgrounds and serve different needs. DetectX is a purpose-built AI music detection platform with published benchmarks, while ACRCloud is an audio fingerprinting company that added AI detection as an additional feature. Here is a detailed comparison to help you decide.
          </p>
        </section>

        {/* Quick Summary */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border-2 border-cyan-500/50 bg-cyan-500/5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-cyan-500" />
                <h3 className="font-semibold text-foreground">DetectX</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>96.8% Suno v5.5 detection (verified, 995 tracks)</li>
                <li>Multi-engine AI analysis</li>
                <li>Free tier with unlimited single scans</li>
                <li>Music + voice deepfake detection</li>
                <li>Self-service signup, instant access</li>
              </ul>
            </div>
            <div className="p-6 rounded-xl border border-border bg-muted/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-5 w-5 rounded-full bg-muted-foreground/20 flex items-center justify-center text-xs font-bold text-muted-foreground">A</div>
                <h3 className="font-semibold text-foreground">ACRCloud</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Audio fingerprinting heritage (content ID)</li>
                <li>B2B API-first approach</li>
                <li>No free tier for AI detection</li>
                <li>Enterprise contact required</li>
                <li>No voice deepfake detection</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">Feature-by-Feature Comparison</h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 font-semibold text-foreground">Feature</th>
                  <th className="text-left p-4 font-semibold text-foreground">DetectX</th>
                  <th className="text-left p-4 font-semibold text-foreground">ACRCloud</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border bg-cyan-500/10">
                  <td className="p-4 font-medium text-foreground">Suno v5.5 Detection</td>
                  <td className="p-4 text-foreground font-semibold">96.8%</td>
                  <td className="p-4 text-muted-foreground">Not published</td>
                </tr>
                <tr className="border-b border-border bg-cyan-500/10">
                  <td className="p-4 font-medium text-foreground">Human False Positive Rate</td>
                  <td className="p-4 text-foreground font-semibold">1.11%</td>
                  <td className="p-4 text-muted-foreground">Not published</td>
                </tr>
                <tr className="border-b border-border bg-cyan-500/10">
                  <td className="p-4 font-medium text-foreground">Detection Method</td>
                  <td className="p-4 text-foreground">Multi-engine AI</td>
                  <td className="p-4 text-muted-foreground">Single model</td>
                </tr>
                <tr className="border-b border-border bg-cyan-500/10">
                  <td className="p-4 font-medium text-foreground">Batch Processing</td>
                  <td className="p-4 text-foreground">Up to 1M tracks/week</td>
                  <td className="p-4 text-muted-foreground">Available (API)</td>
                </tr>
                <tr className="border-b border-border bg-cyan-500/10">
                  <td className="p-4 font-medium text-foreground">Free Tier</td>
                  <td className="p-4"><CheckCircle2 className="h-4 w-4 text-green-500" /></td>
                  <td className="p-4"><XCircle className="h-4 w-4 text-muted-foreground/50" /></td>
                </tr>
                <tr className="border-b border-border bg-cyan-500/10">
                  <td className="p-4 font-medium text-foreground">Voice Deepfake Detection</td>
                  <td className="p-4"><span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> 97.8%</span></td>
                  <td className="p-4"><XCircle className="h-4 w-4 text-muted-foreground/50" /></td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4 font-medium text-foreground">API Access</td>
                  <td className="p-4"><CheckCircle2 className="h-4 w-4 text-green-500" /></td>
                  <td className="p-4"><CheckCircle2 className="h-4 w-4 text-green-500" /></td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4 font-medium text-foreground">Real-time Detection</td>
                  <td className="p-4 text-foreground">&lt;1 second</td>
                  <td className="p-4 text-muted-foreground">Yes</td>
                </tr>
                <tr className="border-b border-border bg-cyan-500/10">
                  <td className="p-4 font-medium text-foreground">Evasion Resistance</td>
                  <td className="p-4 text-foreground">MP3, pitch, tempo, noise</td>
                  <td className="p-4 text-muted-foreground">Unknown</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4 font-medium text-foreground">Supported Formats</td>
                  <td className="p-4 text-foreground">WAV, MP3, FLAC, AAC, OGG</td>
                  <td className="p-4 text-muted-foreground">Multiple</td>
                </tr>
                <tr className="border-b border-border bg-cyan-500/10">
                  <td className="p-4 font-medium text-foreground">Multilingual Support</td>
                  <td className="p-4 text-foreground">8 languages</td>
                  <td className="p-4 text-muted-foreground">Limited</td>
                </tr>
                <tr className="bg-cyan-500/10">
                  <td className="p-4 font-medium text-foreground">Pricing (Entry)</td>
                  <td className="p-4 text-foreground font-semibold">Free / $39.99 Pro</td>
                  <td className="p-4 text-muted-foreground">Enterprise only</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Detailed Breakdown */}
        <section className="mb-16 space-y-12">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Detection Accuracy</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              DetectX publishes verified benchmark results based on 995 Suno v5.5 tracks spanning 16 genres including pop, jazz, classical, hip-hop, electronic, and more. The overall detection rate is 96.8%, with 9 genres achieving 100% detection. The human false positive rate is verified at 1.11%, meaning human-created music is almost never incorrectly flagged.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              ACRCloud does not publicly disclose accuracy metrics for their AI music detection feature. Without published benchmarks, it is not possible to verify their detection performance or false positive rates. For organizations making critical copyright decisions, independently verifiable accuracy data is essential.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Technology Approach</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              DetectX uses a proprietary multi-engine architecture where multiple AI models analyze audio patterns from different dimensions. This cross-validation approach reduces false positives and catches different types of AI artifacts that single-model detectors miss.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              ACRCloud was originally built as an audio fingerprinting and content recognition platform. Their AI detection capability was added as an extension to their existing ecosystem. While fingerprinting technology is mature and well-proven for content identification, AI music detection requires fundamentally different techniques focused on generative artifacts rather than matching known audio.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Pricing and Accessibility</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              DetectX offers a free tier with unlimited single-file scans using the full multi-engine pipeline. No signup is required for basic detection. Professional plans start at $39.99/month with batch processing capabilities. Enterprise plans scale to 1M+ tracks per week with dedicated API access.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              ACRCloud requires enterprise contact for access to their AI music detection features. There is no self-service signup or free tier available. This makes it difficult for independent artists, small labels, or researchers to evaluate the tool before committing to a contract.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Voice Deepfake Detection</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              DetectX includes voice deepfake detection with 97.8% accuracy, capable of identifying AI-generated speech from major providers including ElevenLabs, Google TTS, and OpenAI. This makes DetectX a comprehensive audio authenticity platform covering both music and voice.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              ACRCloud does not offer voice deepfake detection. Organizations needing both music and voice verification would require a separate vendor for voice authentication when using ACRCloud.
            </p>
          </div>
        </section>

        {/* Who Should Use What */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">Who Should Use What</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-cyan-500/30 bg-cyan-500/5">
              <h3 className="font-semibold text-foreground mb-4">Choose DetectX if you need:</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />Verified accuracy with published benchmarks</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />A free tier to evaluate before purchasing</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />Voice deepfake detection alongside music</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />Self-service signup with instant access</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />Batch processing for large catalogs</li>
              </ul>
            </div>
            <div className="p-6 rounded-xl border border-border bg-muted/20">
              <h3 className="font-semibold text-foreground mb-4">Choose ACRCloud if you need:</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />Audio fingerprinting (content ID) alongside AI detection</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />You already use their content recognition ecosystem</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />A single vendor for fingerprint matching + AI detection</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Final Verdict + CTA */}
        <section className="mb-16">
          <div className="p-8 rounded-xl border border-cyan-500/30 bg-cyan-500/5 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Verdict</h2>
            <p className="text-muted-foreground leading-relaxed mb-6 max-w-2xl mx-auto">
              For AI music detection specifically, DetectX offers superior transparency with published benchmarks, a free tier for evaluation, multi-engine accuracy, and the addition of voice deepfake detection. ACRCloud is a strong choice if you need content fingerprinting as a primary feature and AI detection as a secondary capability within the same platform.
            </p>
            <Link href="/verify-audio">
              <Button size="lg" className="text-base font-medium">
                Try DetectX Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-border">
              <h3 className="font-semibold text-foreground mb-2">Is DetectX more accurate than ACRCloud for AI music detection?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                DetectX publishes verified benchmarks showing 96.8% detection rate on Suno v5.5 across 995 tracks and 16 genres. ACRCloud does not publicly disclose their detection accuracy, making direct numerical comparison impossible. For organizations requiring transparent, verifiable performance data, DetectX provides the documentation needed for informed decision-making.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-border">
              <h3 className="font-semibold text-foreground mb-2">Does ACRCloud have a free tier for AI music detection?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                No. ACRCloud requires enterprise contact to access their AI music detection features. There is no self-service option or free evaluation tier. DetectX offers unlimited free single-file scans with full multi-engine analysis, allowing users to evaluate detection quality before committing to a paid plan.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-border">
              <h3 className="font-semibold text-foreground mb-2">Can DetectX detect voice deepfakes in addition to AI music?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Yes. DetectX offers voice deepfake detection with 97.8% accuracy, covering major AI voice providers including ElevenLabs, Google TTS, and OpenAI. This combined capability makes DetectX a comprehensive audio authenticity platform. ACRCloud focuses on music fingerprinting and AI music detection and does not offer voice deepfake verification.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">&copy; 2026 DetectX, Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
