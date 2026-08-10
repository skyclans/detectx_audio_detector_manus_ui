import { Link } from "wouter";
import { useState } from "react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { Sun, Moon, User, LogOut, Menu, X, Upload, Cpu, Shield, Zap, BarChart3, Music, Mic, Building2, CheckCircle2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LanguageSelector from "@/components/LanguageSelector";

export default function LandingEN() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, loading, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Free AI Music Detector | Detect Suno & Udio Instantly"
        description="Free AI music detector with 96.8% accuracy on Suno v5.5. Instantly detect AI-generated songs from Suno, Udio, and other AI music generators. Patent-pending multi-engine detection technology."
        path="/en/"
      />
      {/* SoftwareApplication Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "DetectX AI Music Detector",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Web",
        "url": "https://detectx.app",
        "description": "AI music detection tool that identifies AI-generated songs from Suno, Udio, and other generators with 96.8% accuracy. Patent-pending technology designed for labels worldwide.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "description": "Free tier available"
        }
      }) }} />
      {/* FAQPage Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How does DetectX detect AI-generated music?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectX uses proprietary multi-layer deep learning analysis. Our AI models detect subtle patterns and artifacts unique to AI-generated audio that are invisible to the human ear. Cross-validation between multiple analysis engines achieves 96.8% detection on Suno v5.5 with minimal false positives on human music."
            }
          },
          {
            "@type": "Question",
            "name": "What is the accuracy of DetectX AI music detector?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectX achieves 96.8% detection rate on Suno v5.5 AI-generated music (battle-tested on tens of thousands of tracks across all genres). The system is designed to minimize false positives on human-created music. This makes DetectX one of the most accurate AI music detectors available."
            }
          },
          {
            "@type": "Question",
            "name": "Can DetectX detect Suno and Udio AI tracks?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. DetectX detects Suno v5.5 with 96.8% accuracy across all genres including pop, jazz, classical, hip-hop, and electronic. Udio detection rate is 58%. The system identifies structural artifacts unique to each AI generator's synthesis process."
            }
          },
          {
            "@type": "Question",
            "name": "Is DetectX free to use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, DetectX offers a free tier with full analysis. Upload any audio file (WAV, MP3, FLAC, AAC, OGG up to 100MB) and get instant AI detection results. Professional plans are available for batch processing (up to 1M tracks/week) and API access."
            }
          },
          {
            "@type": "Question",
            "name": "Does DetectX support batch AI music scanning?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. DetectX offers batch processing for record labels, streaming platforms, and distributors. Scan hundreds to millions of tracks automatically. Enterprise plans support up to 1 million tracks per week with priority processing and dedicated API access."
            }
          },
          {
            "@type": "Question",
            "name": "How is DetectX different from other AI music detectors?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectX is unique in three ways: (1) Multi-engine architecture for higher accuracy than single-model detectors, (2) Combined music AND voice deepfake detection in one platform, (3) Enterprise-grade batch processing up to 1M tracks/week. Patent-pending technology with the lowest false positive rate in the industry."
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
              <a href="/blog.html" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</a>
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
                <a href="/blog.html" className="text-sm text-muted-foreground hover:text-foreground px-2 py-2">Blog</a>
                <Link href="/plan" className="text-sm text-muted-foreground hover:text-foreground px-2 py-2" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground px-2 py-2" onClick={() => setMobileMenuOpen(false)}>About</Link>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground px-2 py-2" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-28 px-6">
          <div className="mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div>
                <h1 className="text-3xl md:text-4xl font-medium leading-tight text-foreground mb-6">
                  Instantly Detect AI-Generated Music from Suno, Udio & More
                </h1>
                <p className="text-lg text-muted-foreground mb-4">
                  Upload any audio file and get AI detection results with 96.8% accuracy on Suno v5.5. Designed for record labels, streaming platforms, and copyright societies worldwide.
                </p>
                <p className="text-base text-muted-foreground mb-8">
                  Free tier available. Supports WAV, MP3, FLAC, AAC, OGG up to 100MB.
                </p>

                {/* Stats */}
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
                    <div className="text-lg sm:text-2xl font-bold text-foreground">Fast</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Scan Speed</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">All</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Genres</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/verify-audio">
                    <Button className="px-8 py-3 text-base font-medium">
                      Scan Your Track Free
                    </Button>
                  </Link>
                  <Link href="/batch-verify">
                    <Button variant="outline" className="px-8 py-3 text-base font-medium">
                      Batch Scan for Labels
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="order-first md:order-last">
                <img
                  src="/images/herosection_new.png"
                  alt="DetectX AI music detector analyzing audio file — detecting AI-generated music from Suno and Udio with 96.8% accuracy"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground text-center mb-4">
              How to Detect AI-Generated Music
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Three simple steps to check if a song is AI-generated. Works with any audio file format.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-lg bg-muted/20">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">1. Upload Audio</h3>
                <p className="text-sm text-muted-foreground">
                  Drag and drop or select any audio file. Supports WAV, MP3, FLAC, AAC, OGG. Up to 100MB.
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-muted/20">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Cpu className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">2. AI Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Multiple proprietary AI models analyze audio patterns across different dimensions simultaneously. High-speed parallel analysis.
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-muted/20">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">3. Get Verdict</h3>
                <p className="text-sm text-muted-foreground">
                  Clear result: AI signal detected or not. No ambiguous percentages. Evidence-grade results you can trust.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features / Why DetectX */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground text-center mb-4">
              Why DetectX Is the Most Accurate AI Music Detector
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Patent-pending multi-engine detection technology. Battle-tested on tens of thousands of AI-generated tracks across all genres.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 rounded-lg border border-border">
                <Zap className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Deep Learning Engine</h3>
                <p className="text-muted-foreground text-sm">
                  Proprietary neural networks trained on massive volumes of AI-generated tracks across all genres. Identifies structural patterns unique to AI music generators like Suno, Udio, and ElevenLabs Music.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border">
                <BarChart3 className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Multi-Layer Verification</h3>
                <p className="text-muted-foreground text-sm">
                  Secondary analysis engine that cross-validates primary detection results. Catches AI artifacts that single-model detectors miss, ensuring maximum accuracy with minimal false positives.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border">
                <Shield className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Batch Processing at Scale</h3>
                <p className="text-muted-foreground text-sm">
                  Scan thousands of tracks at once. Designed for record labels and platforms that need to process large catalogs efficiently. Enterprise plans support up to 1M tracks per week.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border">
                <Music className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Evasion Resistant</h3>
                <p className="text-muted-foreground text-sm">
                  Robust against MP3 conversion, pitch shifting, tempo changes, noise addition, and codec re-encoding. Analyzes deep structural properties that survive any post-processing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground text-center mb-4">
              AI Music Detector Comparison
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              How DetectX compares to other AI music detection tools on the market.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-foreground">Feature</th>
                    <th className="text-center p-3 font-medium text-cyan-500">DetectX</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">ACRCloud</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Resemble AI</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">SubmitHub</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="p-3">Suno Detection Accuracy</td>
                    <td className="p-3 text-center font-medium text-foreground">96.8%</td>
                    <td className="p-3 text-center">Unknown</td>
                    <td className="p-3 text-center">94%</td>
                    <td className="p-3 text-center">90%+</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3">Multi-Engine Analysis</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3">Batch Processing</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3">Voice Deepfake Detection</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3">Free Tier</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3">API Access</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="text-center mt-8">
              <Link href="/verify-audio">
                <Button className="px-8 py-3 text-base font-medium">
                  Try DetectX Free
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground text-center mb-4">
              Who Uses AI Music Detection
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              From individual musicians to major labels processing millions of tracks.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-lg border border-border">
                <Building2 className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">Record Labels</h3>
                <p className="text-xs text-muted-foreground">
                  Process large volumes of tracks. Protect catalogs from AI-generated content. Batch scan thousands of tracks at once.
                </p>
              </div>
              <div className="p-5 rounded-lg border border-border">
                <Music className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">Streaming Platforms</h3>
                <p className="text-xs text-muted-foreground">
                  Filter AI uploads automatically. 60,000+ AI tracks uploaded daily. API integration for real-time detection.
                </p>
              </div>
              <div className="p-5 rounded-lg border border-border">
                <Shield className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">Copyright Societies</h3>
                <p className="text-xs text-muted-foreground">
                  Protect royalty pools from fraudulent AI registrations. Evidence-grade analysis reports for copyright disputes.
                </p>
              </div>
              <div className="p-5 rounded-lg border border-border">
                <Mic className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">Musicians & Producers</h3>
                <p className="text-xs text-muted-foreground">
                  Verify your own work. Prove human origin. Check if collaborators used AI generation. Free for individual use.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Supported AI Generators */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4">
              Detects All Major AI Music Generators
            </h2>
            <p className="text-muted-foreground mb-10 max-w-2xl mx-auto">
              DetectX identifies audio from any AI music generation platform, regardless of post-processing or format conversion.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {["Suno v5.5", "Udio", "ElevenLabs Music", "Seed Music", "MiniMax", "Mureka", "Riffusion", "Sonauto", "AIVA", "Boomy"].map((name) => (
                <span key={name} className="px-4 py-2 bg-muted/30 rounded-full text-sm text-foreground border border-border/50">
                  {name}
                </span>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              Detection works regardless of MP3 conversion, pitch shifting, tempo changes, or other evasion attempts.
            </p>
          </div>
        </section>

        {/* Voice Deepfake Section */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div>
                <img
                  src="/images/othermodalities.png"
                  alt="DetectX Voice deepfake detection — AI voice clone and synthetic speech detector"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
              <div>
                <h2 className="text-2xl font-medium text-foreground mb-4">
                  Voice Deepfake Detection — AI Voice Clone Detector
                </h2>
                <p className="text-muted-foreground mb-4">
                  DetectX also detects AI-generated speech and deepfake voices with 97.8% accuracy. Works with just 2 seconds of audio under real phone conditions.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> ElevenLabs, Google TTS, OpenAI detected</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> Works on phone codec (G.711, 8kHz)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> 2-second minimum audio required</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> Real-time detection for call centers</li>
                </ul>
                <Link href="/verify-voice">
                  <Button variant="outline" className="text-sm">
                    Try Voice Detection
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Explore DetectX */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground text-center mb-4">
              Explore DetectX
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Verify a song now, read how the detector works, or compare it with other tools.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/verify-audio/" className="block p-6 rounded-lg border border-border hover:border-cyan-500/50 transition-colors">
                <h3 className="text-lg font-medium text-foreground mb-2">Verify a song now</h3>
                <p className="text-sm text-muted-foreground">
                  Upload a WAV, MP3, or FLAC file and get instant AI detection results. Free tier available.
                </p>
              </Link>
              <Link href="/blog/how-to-detect-ai-generated-music/" className="block p-6 rounded-lg border border-border hover:border-cyan-500/50 transition-colors">
                <h3 className="text-lg font-medium text-foreground mb-2">How to detect AI music — guide</h3>
                <p className="text-sm text-muted-foreground">
                  A practical guide to identifying AI-generated music, key signals to look for, and workflow best practices.
                </p>
              </Link>
              <Link href="/vs/acrcloud/" className="block p-6 rounded-lg border border-border hover:border-cyan-500/50 transition-colors">
                <h3 className="text-lg font-medium text-foreground mb-2">Compare: DetectX vs ACRCloud</h3>
                <p className="text-sm text-muted-foreground">
                  Feature-by-feature comparison of DetectX and ACRCloud for AI music detection.
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 px-6 border-t border-border">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4">
              Start Detecting AI-Generated Music Today
            </h2>
            <p className="text-muted-foreground mb-8">
              Upload your first track and get AI detection results in seconds. Free tier available.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/verify-audio">
                <Button className="px-10 py-4 text-base font-medium">
                  Scan Your Track Free
                </Button>
              </Link>
              <Link href="/plan">
                <Button variant="outline" className="px-10 py-4 text-base font-medium">
                  View Enterprise Plans
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Supports WAV, MP3, FLAC, AAC, OGG up to 100MB.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">Product</h4>
              <div className="space-y-2">
                <Link href="/verify-audio" className="block text-sm text-muted-foreground hover:text-foreground">AI Music Detector</Link>
                <Link href="/verify-voice" className="block text-sm text-muted-foreground hover:text-foreground">Voice Deepfake Detector</Link>
                <Link href="/batch-verify" className="block text-sm text-muted-foreground hover:text-foreground">Batch Scanning</Link>
                <Link href="/plan" className="block text-sm text-muted-foreground hover:text-foreground">Pricing</Link>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">Resources</h4>
              <div className="space-y-2">
                <Link href="/technology" className="block text-sm text-muted-foreground hover:text-foreground">Technology</Link>
                <Link href="/research" className="block text-sm text-muted-foreground hover:text-foreground">Research</Link>
                <a href="/blog.html" className="block text-sm text-muted-foreground hover:text-foreground">Blog</a>
                <Link href="/updates" className="block text-sm text-muted-foreground hover:text-foreground">Updates</Link>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">Company</h4>
              <div className="space-y-2">
                <Link href="/about" className="block text-sm text-muted-foreground hover:text-foreground">About</Link>
                <Link href="/contact" className="block text-sm text-muted-foreground hover:text-foreground">Contact</Link>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">Languages</h4>
              <div className="space-y-2">
                <Link href="/en/" className="block text-sm text-cyan-500 font-medium">English</Link>
                <Link href="/ko/" className="block text-sm text-muted-foreground hover:text-foreground">한국어</Link>
                <Link href="/ja/" className="block text-sm text-muted-foreground hover:text-foreground">日本語</Link>
                <Link href="/es/" className="block text-sm text-muted-foreground hover:text-foreground">Español</Link>
                <Link href="/de/" className="block text-sm text-muted-foreground hover:text-foreground">Deutsch</Link>
                <Link href="/fr/" className="block text-sm text-muted-foreground hover:text-foreground">Français</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; 2026 DetectX, Inc. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground">Terms</Link>
              <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground">Privacy</Link>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/50 mt-4 text-center">
            Suno, Udio, and other product names are trademarks of their respective owners. DetectX is not affiliated with or endorsed by Suno or Udio.
          </p>
        </div>
      </footer>
    </div>
  );
}
