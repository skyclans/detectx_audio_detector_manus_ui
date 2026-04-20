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

export default function LandingDE() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, loading, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="KI-generierte Musik von Suno, Udio & Co. sofort erkennen | DetectX"
        description="Kostenloser KI-Musik-Detektor mit 96,8% Genauigkeit bei Suno v5.5. Multi-Engine-Deep-Learning-Analyse zur Erkennung von KI-generierter Musik. Entwickelt für Plattenfirmen und Verwertungsgesellschaften."
        path="/de/"
      />
      {/* SoftwareApplication Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "DetectX KI-Musik-Detektor",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Web",
        "url": "https://detectx.app/de/",
        "description": "KI-Musik-Erkennungstool, das KI-generierte Songs von Suno, Udio und anderen Generatoren mit 96,8% Genauigkeit durch Multi-Engine-Deep-Learning-Analyse identifiziert.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "description": "Kostenlose Nutzung verfügbar"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "156"
        }
      }) }} />
      {/* FAQPage Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Wie erkennt DetectX KI-generierte Musik?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectX verwendet proprietäre Multi-Layer-Deep-Learning-Analyse. Unsere KI-Modelle erkennen subtile Muster und Artefakte, die einzigartig für KI-generiertes Audio sind und für das menschliche Ohr nicht wahrnehmbar bleiben. Die Kreuzvalidierung zwischen mehreren Analyse-Engines erreicht 96,8% Erkennung bei Suno v5.5 und minimiert Fehlalarme bei menschlich erstellter Musik."
            }
          },
          {
            "@type": "Question",
            "name": "Wie genau ist der DetectX KI-Musik-Detektor?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectX erreicht eine Erkennungsrate von 96,8% bei Suno v5.5 KI-generierter Musik (getestet an 995 Tracks in 16 Genres). Das System minimiert Fehlalarme bei menschlich erstellter Musik durch Multi-Engine-Kreuzvalidierung. Dies macht DetectX zu einem der genauesten KI-Musik-Detektoren auf dem Markt."
            }
          },
          {
            "@type": "Question",
            "name": "Kann DetectX Suno- und Udio-KI-Tracks erkennen?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Ja. DetectX erkennt Suno v5.5 mit 96,8% Genauigkeit über alle Genres hinweg, einschließlich Pop, Jazz, Klassik, Hip-Hop und Elektronik. Die Udio-Erkennungsrate beträgt 58%. Das System identifiziert strukturelle Artefakte, die einzigartig für den Syntheseprozess jedes KI-Generators sind."
            }
          },
          {
            "@type": "Question",
            "name": "Ist DetectX kostenlos nutzbar?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Ja, DetectX bietet eine kostenlose Stufe mit vollständiger Multi-Engine-Analyse. Laden Sie Ihre Audiodatei hoch (WAV, MP3, FLAC, AAC, OGG bis 100MB) und erhalten Sie sofortige KI-Erkennungsergebnisse. Professionelle Pläne sind für Massenanalyse (bis zu 1M Tracks/Woche) und API-Zugang verfügbar."
            }
          },
          {
            "@type": "Question",
            "name": "Unterstützt DetectX Massen-Scanning von KI-Musik?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Ja. DetectX bietet Massenanalyse für Plattenfirmen, Streaming-Plattformen und Vertriebe. Analysieren Sie automatisch Hunderte bis Millionen von Tracks. Enterprise-Pläne unterstützen bis zu 1 Million Tracks pro Woche mit Prioritätsverarbeitung und dediziertem API-Zugang."
            }
          },
          {
            "@type": "Question",
            "name": "Was unterscheidet DetectX von anderen KI-Musik-Detektoren?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectX ist in drei Punkten einzigartig: (1) Multi-Engine-Architektur für höhere Genauigkeit als Einzelmodell-Detektoren, (2) Kombinierte Musik- UND Sprach-Deepfake-Erkennung in einer Plattform, (3) Enterprise-Massenanalyse von bis zu 1M Tracks/Woche. Patentangemeldete Technologie, die Fehlalarme bei menschlich erstellter Musik minimiert."
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
              <Link href="/verify-audio"><Button className="text-sm font-medium">Kostenlos analysieren</Button></Link>
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

      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-28 px-6">
          <div className="mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-medium leading-tight text-foreground mb-6">
                  KI-Musik von Suno & Udio sofort erkennen
                </h1>
                <p className="text-lg text-muted-foreground mb-4">
                  Laden Sie Ihre Audiodatei hoch und erhalten Sie in Sekunden ein klares Ergebnis. 96,8% Erkennungsrate bei Suno v5.5 — entwickelt für Plattenfirmen, Streaming-Plattformen und Verwertungsgesellschaften.
                </p>
                <p className="text-base text-muted-foreground mb-8">
                  Kostenlos nutzbar. Unterstützt WAV, MP3, FLAC, AAC, OGG bis 100 MB.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-10">
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">96,8%</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Suno-Erkennung</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">97,8%</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Voice Deepfake</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">Fast</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Analyse</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">Alle</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Genres</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/verify-audio">
                    <Button className="px-8 py-3 text-base font-medium">
                      Kostenlos analysieren
                    </Button>
                  </Link>
                  <Link href="/batch-verify">
                    <Button variant="outline" className="px-8 py-3 text-base font-medium">
                      Massenanalyse für Labels
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="order-first md:order-last">
                <img
                  src="/images/herosection_new.png"
                  alt="DetectX KI-Musik-Detektor analysiert Audiodatei — erkennt KI-generierte Musik von Suno und Udio mit 96,8% Genauigkeit"
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
              So erkennen Sie KI-generierte Musik
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Drei einfache Schritte, um zu prüfen, ob ein Song KI-generiert ist. Funktioniert mit jedem Audiodateiformat.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-lg bg-muted/20">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">1. Audio hochladen</h3>
                <p className="text-sm text-muted-foreground">
                  Per Drag & Drop oder Dateiauswahl. Unterstützt WAV, MP3, FLAC, AAC, OGG bis 100 MB.
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-muted/20">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Cpu className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">2. Multi-Engine-Analyse</h3>
                <p className="text-sm text-muted-foreground">
                  Mehrere proprietäre KI-Modelle analysieren das Audio parallel auf verschiedenen Ebenen — schnell und zuverlässig.
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-muted/20">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">3. Ergebnis erhalten</h3>
                <p className="text-sm text-muted-foreground">
                  Eindeutiges Ergebnis: KI-Signal erkannt oder nicht. Keine mehrdeutigen Prozentsätze — professionelle Beweiskraft, auf die Sie sich verlassen können.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features / Why DetectX */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground text-center mb-4">
              Warum DetectX der genaueste KI-Musik-Detektor ist
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Multi-Engine-Deep-Learning-Analyse mit patentangemeldeter Technologie. Getestet an 995 Suno v5.5 Tracks in 16 Genres.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 rounded-lg border border-border">
                <Zap className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Deep Learning Engine</h3>
                <p className="text-muted-foreground text-sm">
                  Proprietäre neuronale Netzwerke, trainiert auf umfangreichen KI-generierten Tracks aller Genres. Erkennt strukturelle Muster, die für KI-Generatoren wie Suno, Udio und ElevenLabs Music charakteristisch sind.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border">
                <BarChart3 className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Multi-Layer-Verifizierung</h3>
                <p className="text-muted-foreground text-sm">
                  Eine sekundäre Analyse-Engine validiert die Primärergebnisse. Erkennt Artefakte, die Einzelmodell-Detektoren entgehen — maximale Genauigkeit bei minimalen Fehlalarmen.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border">
                <Shield className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Massenanalyse im Enterprise-Maßstab</h3>
                <p className="text-muted-foreground text-sm">
                  Bis zu 1 Million Tracks pro Woche. Automatisierte Batch-Scans für Labels, Vertriebe und Streaming-Plattformen mit Prioritäts-Warteschlange und API-Zugang.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border">
                <Music className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Manipulationsresistent</h3>
                <p className="text-muted-foreground text-sm">
                  Robust gegen MP3-Konvertierung, Pitch-Shifting, Tempoänderungen, Rauschzugabe und Re-Encoding. Die Analyse erfasst tiefe strukturelle Merkmale, die jede Nachbearbeitung überdauern.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground text-center mb-4">
              KI-Musik-Detektor Vergleich
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              So schneidet DetectX im Vergleich zu anderen KI-Musik-Erkennungstools ab.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-foreground">Funktion</th>
                    <th className="text-center p-3 font-medium text-cyan-500">DetectX</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">ACRCloud</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Resemble AI</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">SubmitHub</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="p-3">Suno-Erkennung</td>
                    <td className="p-3 text-center font-medium text-foreground">96,8%</td>
                    <td className="p-3 text-center">Unbekannt</td>
                    <td className="p-3 text-center">94%</td>
                    <td className="p-3 text-center">90%+</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3">Multi-Engine-Analyse</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3">Massenanalyse</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3">Sprach-Deepfake-Erkennung</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3">Kostenloser Plan</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3">API-Zugang</td>
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
                  DetectX kostenlos testen
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground text-center mb-4">
              Wer KI-Musik-Erkennung nutzt
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Von einzelnen Musikern bis zu Major-Labels, die Millionen von Tracks verarbeiten.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-lg border border-border">
                <Building2 className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">Plattenfirmen</h3>
                <p className="text-xs text-muted-foreground">
                  Kataloge per Batch-Scan schützen. Tausende Tracks automatisiert analysieren und KI-Inhalte zuverlässig identifizieren.
                </p>
              </div>
              <div className="p-5 rounded-lg border border-border">
                <Music className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">Streaming-Plattformen</h3>
                <p className="text-xs text-muted-foreground">
                  KI-Uploads automatisch filtern — täglich werden über 60.000 KI-Tracks hochgeladen. API-Integration für Echtzeit-Erkennung.
                </p>
              </div>
              <div className="p-5 rounded-lg border border-border">
                <Shield className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">Verwertungsgesellschaften</h3>
                <p className="text-xs text-muted-foreground">
                  Tantiemen-Pools vor betrügerischen KI-Registrierungen schützen. Beweistaugliche Analyseberichte für Streitfälle erstellen.
                </p>
              </div>
              <div className="p-5 rounded-lg border border-border">
                <Mic className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">Musiker & Produzenten</h3>
                <p className="text-xs text-muted-foreground">
                  Eigene Arbeit verifizieren und menschlichen Ursprung nachweisen. Prüfen, ob Kollaborationspartner KI eingesetzt haben. Kostenlos nutzbar.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Supported AI Generators */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4">
              Erkennt alle großen KI-Musikgeneratoren
            </h2>
            <p className="text-muted-foreground mb-10 max-w-2xl mx-auto">
              DetectX identifiziert Audio aller gängigen KI-Musikplattformen — unabhängig von Nachbearbeitung oder Formatkonvertierung.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {["Suno v5.5", "Udio", "ElevenLabs Music", "Seed Music", "MiniMax", "Mureka", "Riffusion", "Sonauto", "AIVA", "Boomy"].map((name) => (
                <span key={name} className="px-4 py-2 bg-muted/30 rounded-full text-sm text-foreground border border-border/50">
                  {name}
                </span>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              Zuverlässige Erkennung auch nach MP3-Konvertierung, Pitch-Shifting, Tempoänderungen oder anderen Manipulationsversuchen.
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
                  alt="DetectX Sprach-Deepfake-Erkennung — KI-Stimmklon- und synthetische Sprach-Detektor"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
              <div>
                <h2 className="text-2xl font-medium text-foreground mb-4">
                  Sprach-Deepfake-Erkennung — KI-Stimmklon-Detektor
                </h2>
                <p className="text-muted-foreground mb-4">
                  Neben Musik erkennt DetectX auch KI-generierte Sprache und Deepfake-Stimmen — mit 97,8% Genauigkeit, ab nur 2 Sekunden Audio, auch unter realen Telefonbedingungen.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> Erkennt ElevenLabs, Google TTS, OpenAI u. a.</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> Kompatibel mit Telefon-Codecs (G.711, 8 kHz)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> Ab 2 Sekunden Audio analysierbar</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> Echtzeit-Erkennung für Callcenter und Banken</li>
                </ul>
                <Link href="/verify-voice">
                  <Button variant="outline" className="text-sm">
                    Stimmerkennung testen
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 px-6 border-t border-border">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4">
              Jetzt KI-Musik erkennen
            </h2>
            <p className="text-muted-foreground mb-8">
              Kostenlos starten. Laden Sie Ihren ersten Track hoch und erhalten Sie das Ergebnis in Sekunden.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/verify-audio">
                <Button className="px-10 py-4 text-base font-medium">
                  Jetzt kostenlos testen
                </Button>
              </Link>
              <Link href="/plan">
                <Button variant="outline" className="px-10 py-4 text-base font-medium">
                  Enterprise-Pläne ansehen
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Unterstützt WAV, MP3, FLAC, AAC, OGG bis 100 MB. Schnelle parallele Analyse.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">Produkt</h4>
              <div className="space-y-2">
                <Link href="/verify-audio" className="block text-sm text-muted-foreground hover:text-foreground">KI-Musik-Detektor</Link>
                <Link href="/verify-voice" className="block text-sm text-muted-foreground hover:text-foreground">Sprach-Deepfake-Detektor</Link>
                <Link href="/batch-verify" className="block text-sm text-muted-foreground hover:text-foreground">Massenanalyse</Link>
                <Link href="/plan" className="block text-sm text-muted-foreground hover:text-foreground">Preise</Link>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">Ressourcen</h4>
              <div className="space-y-2">
                <Link href="/technology" className="block text-sm text-muted-foreground hover:text-foreground">Technologie</Link>
                <Link href="/research" className="block text-sm text-muted-foreground hover:text-foreground">Forschung</Link>
                <Link href="/updates" className="block text-sm text-muted-foreground hover:text-foreground">Aktualisierungen</Link>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">Unternehmen</h4>
              <div className="space-y-2">
                <Link href="/about" className="block text-sm text-muted-foreground hover:text-foreground">Über uns</Link>
                <Link href="/contact" className="block text-sm text-muted-foreground hover:text-foreground">Kontakt</Link>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">Sprachen</h4>
              <div className="space-y-2">
                <Link href="/en/" className="block text-sm text-muted-foreground hover:text-foreground">English</Link>
                <Link href="/ko/" className="block text-sm text-muted-foreground hover:text-foreground">한국어</Link>
                <Link href="/ja/" className="block text-sm text-muted-foreground hover:text-foreground">日本語</Link>
                <Link href="/es/" className="block text-sm text-muted-foreground hover:text-foreground">Español</Link>
                <Link href="/de/" className="block text-sm text-cyan-500 font-medium">Deutsch</Link>
                <Link href="/fr/" className="block text-sm text-muted-foreground hover:text-foreground">Français</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; 2026 DetectX, Inc. Alle Rechte vorbehalten.
            </p>
            <div className="flex gap-4">
              <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground">AGB</Link>
              <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground">Datenschutz</Link>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/50 mt-4 text-center">
            Suno, Udio und andere Produktnamen sind Marken ihrer jeweiligen Eigentümer. DetectX steht in keiner Verbindung zu Suno oder Udio.
          </p>
        </div>
      </footer>
    </div>
  );
}
