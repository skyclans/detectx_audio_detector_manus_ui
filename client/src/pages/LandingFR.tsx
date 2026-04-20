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

export default function LandingFR() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, loading, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Détecteur de Musique IA : Détectez Suno, Udio et Musique Générée par IA | DetectX"
        description="Détecteur de musique IA gratuit avec 96,8% de précision sur Suno v5.5. Analyse multi-moteur par deep learning pour détecter la musique générée par intelligence artificielle. Conçu pour les labels, plateformes de streaming et sociétés de droits d'auteur."
        path="/fr/"
      />
      {/* SoftwareApplication Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "DetectX Détecteur de Musique IA",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Web",
        "url": "https://detectx.app/fr/",
        "description": "Outil de détection de musique IA qui identifie les morceaux générés par Suno, Udio et d'autres générateurs avec 96,8% de précision grâce à une analyse multi-moteur par deep learning.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "description": "Version gratuite disponible"
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
            "name": "Comment DetectX détecte-t-il la musique générée par IA ?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectX utilise une analyse propriétaire de deep learning multicouche. Nos modèles d'IA détectent des patterns subtils et artefacts propres à l'audio généré par IA, invisibles à l'oreille humaine. La validation croisée entre plusieurs moteurs d'analyse atteint 96,8% de détection sur Suno v5.5 tout en minimisant les faux positifs sur la musique créée par des humains."
            }
          },
          {
            "@type": "Question",
            "name": "Quelle est la précision du détecteur de musique IA DetectX ?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectX atteint un taux de détection de 96,8% sur la musique générée par Suno v5.5 (testé sur 995 morceaux couvrant 16 genres). Le système est conçu pour minimiser les faux positifs sur la musique créée par des humains, garantissant une fiabilité de niveau professionnel."
            }
          },
          {
            "@type": "Question",
            "name": "DetectX peut-il détecter les morceaux IA de Suno et Udio ?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Oui. DetectX détecte Suno v5.5 avec 96,8% de précision dans tous les genres, y compris la pop, le jazz, le classique, le hip-hop et l'électronique. Le taux de détection d'Udio est de 58%. Le système identifie les artefacts structurels propres au processus de synthèse de chaque générateur IA."
            }
          },
          {
            "@type": "Question",
            "name": "DetectX est-il gratuit ?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Oui, DetectX propose un niveau gratuit avec l'analyse complète multi-moteur. Importez votre fichier audio (WAV, MP3, FLAC, AAC, OGG jusqu'à 100 Mo) et obtenez des résultats instantanés. Des plans professionnels sont disponibles pour le traitement en lot (jusqu'à 1M de morceaux/semaine) et l'accès API."
            }
          },
          {
            "@type": "Question",
            "name": "DetectX prend-il en charge le scan en masse de musique IA ?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Oui. DetectX propose le traitement en lot pour les labels, plateformes de streaming et distributeurs. Analysez de quelques centaines à plusieurs millions de morceaux automatiquement. Les plans Enterprise supportent jusqu'à 1 million de morceaux par semaine avec traitement prioritaire et accès API dédié."
            }
          },
          {
            "@type": "Question",
            "name": "En quoi DetectX est-il différent des autres détecteurs de musique IA ?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectX se distingue sur trois axes : (1) Architecture Multi-Engine pour une précision supérieure aux détecteurs mono-modèle, (2) Détection combinée de musique IA et de deepfake vocal sur une seule plateforme, (3) Traitement en lot de niveau Enterprise jusqu'à 1M de morceaux/semaine. Technologie brevetée minimisant les faux positifs sur la musique créée par des humains."
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
              <Link href="/verify-audio"><Button className="text-sm font-medium">Analyser gratuitement</Button></Link>
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
                  Détectez la musique IA de Suno & Udio
                </h1>
                <p className="text-lg text-muted-foreground mb-4">
                  Importez votre fichier audio et obtenez un verdict instantané. 96,8% de précision sur Suno v5.5, validé sur 995 morceaux et 16 genres. Conçu pour les labels, plateformes de streaming et sociétés de droits d'auteur.
                </p>
                <p className="text-base text-muted-foreground mb-8">
                  Gratuit. Compatible WAV, MP3, FLAC, AAC, OGG jusqu'à 100 Mo.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-10">
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">96,8%</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Détection Suno</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">97,8%</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Voice Deepfake</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">Fast</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Vitesse</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">Tous</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Genres</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/verify-audio">
                    <Button className="px-8 py-3 text-base font-medium">
                      Analyser gratuitement
                    </Button>
                  </Link>
                  <Link href="/batch-verify">
                    <Button variant="outline" className="px-8 py-3 text-base font-medium">
                      Analyse en lot pour labels
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="order-first md:order-last">
                <img
                  src="/images/herosection_new.png"
                  alt="DetectX détecteur de musique IA analysant un fichier audio — détection de musique générée par Suno et Udio avec 96,8% de précision"
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
              Comment Détecter la Musique Générée par IA
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Trois étapes simples pour vérifier si un morceau est généré par IA. Fonctionne avec tous les formats audio.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-lg bg-muted/20">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">1. Importez votre fichier</h3>
                <p className="text-sm text-muted-foreground">
                  Glissez-déposez ou sélectionnez votre fichier audio. Compatible WAV, MP3, FLAC, AAC, OGG jusqu'à 100 Mo.
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-muted/20">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Cpu className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">2. Analyse Multi-Engine</h3>
                <p className="text-sm text-muted-foreground">
                  Nos modèles Deep Learning propriétaires analysent les patterns audio sur plusieurs dimensions en parallèle. Résultats en quelques secondes.
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-muted/20">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">3. Recevez le verdict</h3>
                <p className="text-sm text-muted-foreground">
                  Résultat clair : signal IA détecté ou non. Pas de pourcentages ambigus. Rapport d'analyse de qualité professionnelle.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features / Why DetectX */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground text-center mb-4">
              Une précision inégalée, par conception
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Architecture Multi-Engine brevetée. Validé sur 995 morceaux Suno v5.5 couvrant 16 genres musicaux.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 rounded-lg border border-border">
                <Zap className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Moteur Deep Learning</h3>
                <p className="text-muted-foreground text-sm">
                  Réseaux neuronaux propriétaires entraînés sur un large corpus de musique IA couvrant tous les genres. Identifie les signatures structurelles propres aux générateurs comme Suno, Udio et ElevenLabs Music.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border">
                <BarChart3 className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Validation croisée</h3>
                <p className="text-muted-foreground text-sm">
                  Un second moteur d'analyse valide chaque résultat. Détecte les artefacts invisibles aux détecteurs mono-modèle, minimisant les faux positifs sur la musique créée par des humains.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border">
                <Shield className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Analyse en lot à grande échelle</h3>
                <p className="text-muted-foreground text-sm">
                  Analysez des milliers de morceaux en une seule opération. Conçu pour les labels et plateformes traitant de grands volumes. Jusqu'à 1 million de titres par semaine en plan Enterprise.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border">
                <Music className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Robuste face aux tentatives de contournement</h3>
                <p className="text-muted-foreground text-sm">
                  Résiste à la conversion MP3, au pitch shifting, aux changements de tempo et au réencodage. L'analyse porte sur des propriétés structurelles profondes qui persistent après tout post-traitement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground text-center mb-4">
              DetectX face à la concurrence
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Comparaison avec les autres outils de détection de musique IA disponibles sur le marché.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-foreground">Fonctionnalité</th>
                    <th className="text-center p-3 font-medium text-cyan-500">DetectX</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">ACRCloud</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Resemble AI</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">SubmitHub</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="p-3">Précision de Détection Suno</td>
                    <td className="p-3 text-center font-medium text-foreground">96,8%</td>
                    <td className="p-3 text-center">Inconnu</td>
                    <td className="p-3 text-center">94%</td>
                    <td className="p-3 text-center">90%+</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3">Analyse Multi-Moteur</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3">Traitement en Masse</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3">Détection de Deepfake Vocal</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3">Version Gratuite</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3">Accès API</td>
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
                  Essayez DetectX Gratuitement
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground text-center mb-4">
              Pour qui ?
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Du musicien indépendant aux majors traitant des millions de titres.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-lg border border-border">
                <Building2 className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">Labels</h3>
                <p className="text-xs text-muted-foreground">
                  Traitez de grands volumes de titres. Protégez votre catalogue contre les contenus IA. Analyse par lots de milliers de morceaux.
                </p>
              </div>
              <div className="p-5 rounded-lg border border-border">
                <Music className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">Plateformes de Streaming</h3>
                <p className="text-xs text-muted-foreground">
                  Filtrez automatiquement les contenus IA parmi les uploads. Plus de 60 000 morceaux IA soumis chaque jour. Intégration API pour une détection en temps réel.
                </p>
              </div>
              <div className="p-5 rounded-lg border border-border">
                <Shield className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">Sociétés de Droits d'Auteur</h3>
                <p className="text-xs text-muted-foreground">
                  Protégez vos fonds de redevances contre les enregistrements IA frauduleux. Rapports d'analyse de qualité professionnelle, exploitables en cas de litige.
                </p>
              </div>
              <div className="p-5 rounded-lg border border-border">
                <Mic className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">Musiciens et Producteurs</h3>
                <p className="text-xs text-muted-foreground">
                  Vérifiez vos propres productions. Prouvez l'origine humaine de vos morceaux. Détectez l'usage d'IA chez vos collaborateurs. Gratuit pour un usage individuel.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Supported AI Generators */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4">
              Compatible avec tous les générateurs de musique IA
            </h2>
            <p className="text-muted-foreground mb-10 max-w-2xl mx-auto">
              DetectX identifie l'audio issu de toute plateforme de génération IA, indépendamment du post-traitement ou de la conversion de format.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {["Suno v5.5", "Udio", "ElevenLabs Music", "Seed Music", "MiniMax", "Mureka", "Riffusion", "Sonauto", "AIVA", "Boomy"].map((name) => (
                <span key={name} className="px-4 py-2 bg-muted/30 rounded-full text-sm text-foreground border border-border/50">
                  {name}
                </span>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              La détection reste fiable après conversion MP3, pitch shifting, changement de tempo ou toute autre tentative de contournement.
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
                  alt="DetectX détection de deepfake vocal — détecteur de clones vocaux IA et de synthèse vocale"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
              <div>
                <h2 className="text-2xl font-medium text-foreground mb-4">
                  Détection de deepfakes vocaux et clones IA
                </h2>
                <p className="text-muted-foreground mb-4">
                  DetectX détecte aussi les voix synthétiques et deepfakes vocaux avec 97,8% de précision. Fonctionne avec seulement 2 secondes d'audio dans les conditions téléphoniques réelles.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> ElevenLabs, Google TTS, OpenAI détectés</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> Fonctionne sur codec téléphonique (G.711, 8kHz)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> Minimum 2 secondes d'audio requises</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> Détection en temps réel pour centres d'appels</li>
                </ul>
                <Link href="/verify-voice">
                  <Button variant="outline" className="text-sm">
                    Essayer la Détection Vocale
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
              Prêt à détecter la musique IA ?
            </h2>
            <p className="text-muted-foreground mb-8">
              Gratuit et sans engagement. Importez votre premier morceau et obtenez un verdict en quelques secondes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/verify-audio">
                <Button className="px-10 py-4 text-base font-medium">
                  Analyser gratuitement
                </Button>
              </Link>
              <Link href="/plan">
                <Button variant="outline" className="px-10 py-4 text-base font-medium">
                  Voir les Plans Enterprise
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Compatible WAV, MP3, FLAC, AAC, OGG jusqu'à 100 Mo. Analyse rapide en parallèle.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">Produit</h4>
              <div className="space-y-2">
                <Link href="/verify-audio" className="block text-sm text-muted-foreground hover:text-foreground">Détecteur de Musique IA</Link>
                <Link href="/verify-voice" className="block text-sm text-muted-foreground hover:text-foreground">Détecteur de Deepfake Vocal</Link>
                <Link href="/batch-verify" className="block text-sm text-muted-foreground hover:text-foreground">Analyse en lot</Link>
                <Link href="/plan" className="block text-sm text-muted-foreground hover:text-foreground">Tarifs</Link>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">Ressources</h4>
              <div className="space-y-2">
                <Link href="/technology" className="block text-sm text-muted-foreground hover:text-foreground">Technologie</Link>
                <Link href="/research" className="block text-sm text-muted-foreground hover:text-foreground">Recherche</Link>
                <Link href="/updates" className="block text-sm text-muted-foreground hover:text-foreground">Mises à Jour</Link>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">Entreprise</h4>
              <div className="space-y-2">
                <Link href="/about" className="block text-sm text-muted-foreground hover:text-foreground">À Propos</Link>
                <Link href="/contact" className="block text-sm text-muted-foreground hover:text-foreground">Contact</Link>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">Langues</h4>
              <div className="space-y-2">
                <Link href="/en/" className="block text-sm text-muted-foreground hover:text-foreground">English</Link>
                <Link href="/ko/" className="block text-sm text-muted-foreground hover:text-foreground">한국어</Link>
                <Link href="/ja/" className="block text-sm text-muted-foreground hover:text-foreground">日本語</Link>
                <Link href="/es/" className="block text-sm text-muted-foreground hover:text-foreground">Español</Link>
                <Link href="/de/" className="block text-sm text-muted-foreground hover:text-foreground">Deutsch</Link>
                <Link href="/fr/" className="block text-sm text-cyan-500 font-medium">Français</Link>
                <Link href="/pt/" className="block text-sm text-muted-foreground hover:text-foreground">Português</Link>
                <Link href="/zh/" className="block text-sm text-muted-foreground hover:text-foreground">中文</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; 2026 DetectX, Inc. Tous droits réservés.
            </p>
            <div className="flex gap-4">
              <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground">Conditions</Link>
              <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground">Confidentialité</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
