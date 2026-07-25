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

export default function VsResemble() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, loading, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="DetectX vs Resemble AI — AI Music & Audio Detection Comparison 2026"
        description="Compare DetectX and Resemble AI for AI-generated audio detection. Accuracy benchmarks, music vs voice focus, pricing, and feature comparison."
        path="/vs/resemble-ai/"
      />
      {/* FAQPage Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Which is more accurate for AI music detection, DetectX or Resemble AI?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectX achieves 96.8% detection on Suno v5.5, verified across 995 tracks and 16 genres with a 1.11% false positive rate. Resemble AI claims 94% with their DETECT-2B model, but the testing methodology and dataset details are not publicly available for independent verification."
            }
          },
          {
            "@type": "Question",
            "name": "Does Resemble AI have a conflict of interest in AI audio detection?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Resemble AI's primary product is voice synthesis and voice cloning. They both create AI-generated audio and sell tools to detect it. DetectX is a detection-only platform with no generative AI products, eliminating any potential conflict of interest in detection accuracy."
            }
          },
          {
            "@type": "Question",
            "name": "Can Resemble AI do batch music detection at enterprise scale?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. Resemble AI does not offer batch music scanning for large catalogs. DetectX provides batch processing for record labels and streaming platforms, handling up to 1 million tracks per week with priority processing and dedicated API access on enterprise plans."
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
            DetectX vs Resemble AI: AI Audio Detection Compared
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            DetectX and Resemble AI both offer AI-generated audio detection, but from fundamentally different positions. DetectX is a detection-only platform built specifically for identifying AI-generated music and voice. Resemble AI is primarily a voice synthesis company that added detection as a secondary product. This distinction matters when evaluating their detection capabilities.
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
                <li>96.8% Suno v5.5 detection (995 tracks verified)</li>
                <li>Multi-engine AI analysis</li>
                <li>Music-first platform with voice added</li>
                <li>No conflict of interest (detection only)</li>
                <li>Batch processing up to 1M tracks/week</li>
              </ul>
            </div>
            <div className="p-6 rounded-xl border border-border bg-muted/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-5 w-5 rounded-full bg-muted-foreground/20 flex items-center justify-center text-xs font-bold text-muted-foreground">R</div>
                <h3 className="font-semibold text-foreground">Resemble AI</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>94% claimed accuracy (DETECT-2B)</li>
                <li>Voice synthesis company (detection secondary)</li>
                <li>Single detection model</li>
                <li>Conflict of interest: makes and detects AI audio</li>
                <li>No batch music scanning</li>
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
                  <th className="text-left p-4 font-semibold text-foreground">Resemble AI</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border bg-cyan-500/10">
                  <td className="p-4 font-medium text-foreground">Suno v5.5 Detection</td>
                  <td className="p-4 text-foreground font-semibold">96.8% (995 tracks tested)</td>
                  <td className="p-4 text-muted-foreground">94% (claimed)</td>
                </tr>
                <tr className="border-b border-border bg-cyan-500/10">
                  <td className="p-4 font-medium text-foreground">Human False Positive Rate</td>
                  <td className="p-4 text-foreground font-semibold">1.11%</td>
                  <td className="p-4 text-muted-foreground">Not published</td>
                </tr>
                <tr className="border-b border-border bg-cyan-500/10">
                  <td className="p-4 font-medium text-foreground">Primary Focus</td>
                  <td className="p-4 text-foreground">Detection (music + voice)</td>
                  <td className="p-4 text-muted-foreground">Voice synthesis (detection secondary)</td>
                </tr>
                <tr className="border-b border-border bg-cyan-500/10">
                  <td className="p-4 font-medium text-foreground">Detection Method</td>
                  <td className="p-4 text-foreground">Multi-engine AI</td>
                  <td className="p-4 text-muted-foreground">Single model (DETECT-2B)</td>
                </tr>
                <tr className="border-b border-border bg-cyan-500/10">
                  <td className="p-4 font-medium text-foreground">Music Detection</td>
                  <td className="p-4 text-foreground">Primary product</td>
                  <td className="p-4 text-muted-foreground">Added later</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4 font-medium text-foreground">Voice Detection</td>
                  <td className="p-4"><span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> 97.8%</span></td>
                  <td className="p-4"><CheckCircle2 className="h-4 w-4 text-green-500" /></td>
                </tr>
                <tr className="border-b border-border bg-cyan-500/10">
                  <td className="p-4 font-medium text-foreground">Batch Processing</td>
                  <td className="p-4 text-foreground">Up to 1M tracks/week</td>
                  <td className="p-4"><XCircle className="h-4 w-4 text-muted-foreground/50" /></td>
                </tr>
                <tr className="border-b border-border bg-cyan-500/10">
                  <td className="p-4 font-medium text-foreground">Free Tier</td>
                  <td className="p-4"><CheckCircle2 className="h-4 w-4 text-green-500" /></td>
                  <td className="p-4 text-muted-foreground">Limited free demo</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4 font-medium text-foreground">API Access</td>
                  <td className="p-4"><CheckCircle2 className="h-4 w-4 text-green-500" /></td>
                  <td className="p-4"><CheckCircle2 className="h-4 w-4 text-green-500" /></td>
                </tr>
                <tr className="border-b border-border bg-cyan-500/10">
                  <td className="p-4 font-medium text-foreground">Enterprise Scale</td>
                  <td className="p-4 text-foreground font-semibold">1M+ tracks/week</td>
                  <td className="p-4 text-muted-foreground">Unknown</td>
                </tr>
                <tr className="border-b border-border bg-cyan-500/10">
                  <td className="p-4 font-medium text-foreground">Evasion Resistance</td>
                  <td className="p-4 text-foreground">Verified (MP3, pitch, tempo, noise)</td>
                  <td className="p-4 text-muted-foreground">Unknown</td>
                </tr>
                <tr className="border-b border-border bg-cyan-500/10">
                  <td className="p-4 font-medium text-foreground">Open Benchmarks</td>
                  <td className="p-4 text-foreground">Published (995 tracks, 16 genres)</td>
                  <td className="p-4 text-muted-foreground">Claims only</td>
                </tr>
                <tr className="bg-cyan-500/10">
                  <td className="p-4 font-medium text-foreground">Conflict of Interest</td>
                  <td className="p-4"><span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> None (detection only)</span></td>
                  <td className="p-4"><span className="flex items-center gap-2"><XCircle className="h-4 w-4 text-red-500" /> Makes and detects AI audio</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Detailed Breakdown */}
        <section className="mb-16 space-y-12">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Accuracy and Benchmarks</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              DetectX has been tested on 995 Suno v5.5 tracks across 16 genres, achieving 96.8% overall detection. Nine genres reached 100% detection including jazz, classical, pop, folk, and gospel. The human false positive rate is 1.11%, verified independently. All benchmark data is published and available for review.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Resemble AI claims 94% accuracy with their DETECT-2B model. However, the testing methodology, dataset composition, and false positive rates are not publicly documented. Without verifiable benchmarks, it is difficult for organizations to assess whether these numbers hold up in real-world conditions across different AI generators and music genres.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Conflict of Interest</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              This is a fundamental structural difference between the two platforms. Resemble AI's primary business is voice synthesis and voice cloning -- they generate AI audio commercially. Their detection product (DETECT-2B) is a secondary offering. This creates an inherent tension: their core revenue comes from creating AI audio, while their detection product is meant to flag it.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              DetectX is exclusively a detection platform. It does not create, generate, or synthesize any AI audio. Every engineering decision and model improvement is focused solely on making detection more accurate. There is no competing business interest that could influence detection thresholds or reporting. For copyright societies, labels, and platforms making enforcement decisions, this independence matters.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Music Detection vs Voice Focus</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              DetectX was built from the ground up for AI music detection. Its proprietary multi-engine architecture was specifically designed to catch the artifacts left by music generators like Suno and Udio. Voice deepfake detection was added as a complementary capability, extending the platform into a comprehensive audio authenticity solution.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Resemble AI comes from the voice domain. Their expertise is in voice synthesis, and their detection capabilities evolved from that context. Music detection was added later to expand their offering. If your primary use case is detecting AI-generated music at scale for a label, distributor, or copyright society, a purpose-built music detection platform is the more appropriate tool.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Enterprise Scale and Batch Processing</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              DetectX offers enterprise-grade batch processing designed for the music industry. Record labels, streaming platforms, and distributors can scan large catalogs automatically, with enterprise plans supporting up to 1 million tracks per week. The system uses GPU-accelerated processing with queue management to handle high throughput without sacrificing accuracy.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Resemble AI does not offer batch music scanning at enterprise scale. Their detection offering is primarily API-based for individual audio files. Organizations needing to scan hundreds of thousands or millions of tracks would need to build their own batch infrastructure on top of Resemble's API, adding significant engineering overhead and cost.
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
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />Music detection at scale with verified benchmarks</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />Batch processing for labels or platforms</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />A detection-only vendor with no conflict of interest</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />Published, independently verifiable accuracy data</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />Free tier to evaluate before purchasing</li>
              </ul>
            </div>
            <div className="p-6 rounded-xl border border-border bg-muted/20">
              <h3 className="font-semibold text-foreground mb-4">Choose Resemble AI if you need:</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />Voice synthesis tools alongside detection</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />A single vendor for AI voice generation and detection</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />Detection is a secondary, not primary, requirement</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Final Verdict + CTA */}
        <section className="mb-16">
          <div className="p-8 rounded-xl border border-cyan-500/30 bg-cyan-500/5 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Verdict</h2>
            <p className="text-muted-foreground leading-relaxed mb-6 max-w-2xl mx-auto">
              For organizations that need reliable AI music detection -- labels, distributors, copyright societies, streaming platforms -- DetectX is the purpose-built solution with higher verified accuracy (96.8% vs 94% claimed), no conflict of interest, enterprise batch processing, and transparent benchmarks. Resemble AI is better suited for teams that primarily need voice synthesis tools and want basic detection as an add-on within the same vendor.
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
              <h3 className="font-semibold text-foreground mb-2">Which is more accurate for AI music detection, DetectX or Resemble AI?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                DetectX achieves 96.8% detection on Suno v5.5, independently verified across 995 tracks and 16 genres with a published false positive rate of 1.11%. Resemble AI claims 94% with DETECT-2B, but the testing methodology, dataset size, and false positive data are not publicly available. Based on published data, DetectX has the higher verified detection rate.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-border">
              <h3 className="font-semibold text-foreground mb-2">Does Resemble AI have a conflict of interest in AI audio detection?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Yes. Resemble AI's primary business is voice synthesis and voice cloning -- they commercially generate AI audio. Their detection product is a secondary offering. This creates a structural tension where their core revenue depends on AI audio creation while their detection product is meant to identify it. DetectX is exclusively a detection platform with no generative AI products, ensuring alignment between business incentives and detection accuracy.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-border">
              <h3 className="font-semibold text-foreground mb-2">Can Resemble AI do batch music detection at enterprise scale?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                No. Resemble AI does not offer built-in batch music scanning for large catalogs. DetectX provides enterprise batch processing that can handle up to 1 million tracks per week, designed specifically for record labels, streaming platforms, and distributors who need to scan large volumes of music automatically with priority processing and dedicated API access.
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
