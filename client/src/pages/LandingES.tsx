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

export default function LandingES() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, loading, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Detector de Música IA: Detecta Canciones de Suno y Udio"
        description="Detector de música IA gratuito con 96.8% de precisión en Suno v5.5. Análisis multi-motor para detectar música generada por inteligencia artificial. Diseñado para sellos discográficos y sociedades de derechos de autor."
        path="/es/"
      />
      {/* SoftwareApplication Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "DetectX Detector de Música IA",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Web",
        "url": "https://detectx.app/es/",
        "description": "Herramienta de detección de música IA que identifica canciones generadas por inteligencia artificial de Suno, Udio y otros generadores con 96.8% de precisión mediante análisis multi-motor.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "description": "Plan gratuito disponible"
        }
      }) }} />
      {/* FAQPage Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "¿Cómo detecta DetectX la música generada por IA?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectX utiliza análisis propietario de deep learning multicapa. Nuestros modelos de IA detectan patrones sutiles y artefactos exclusivos del audio generado por IA, invisibles al oído humano. La validación cruzada entre múltiples motores de análisis alcanza un 96.8% de detección en Suno v5.5, minimizando falsos positivos en música creada por humanos."
            }
          },
          {
            "@type": "Question",
            "name": "¿Cuál es la precisión del detector de música IA DetectX?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectX logra un 96.8% de tasa de detección en música generada por Suno v5.5 (probado en decenas de miles de pistas en todos los géneros), minimizando falsos positivos en música creada por humanos. Su arquitectura multi-motor garantiza resultados fiables, convirtiéndolo en uno de los detectores de música IA más precisos disponibles."
            }
          },
          {
            "@type": "Question",
            "name": "¿Puede DetectX detectar pistas de Suno y Udio?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sí. DetectX detecta Suno v5.5 con 96.8% de precisión en todos los géneros incluyendo pop, jazz, clásica, hip-hop y electrónica. La tasa de detección de Udio es del 58%. El sistema identifica artefactos estructurales únicos del proceso de síntesis de cada generador de IA."
            }
          },
          {
            "@type": "Question",
            "name": "¿Es gratuito usar DetectX?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sí, DetectX ofrece un plan gratuito con análisis completo multi-motor. Sube cualquier archivo de audio (WAV, MP3, FLAC, AAC, OGG hasta 100MB) y obtén resultados de detección al instante. Los planes profesionales incluyen procesamiento masivo (hasta 1M de pistas/semana) y acceso API."
            }
          },
          {
            "@type": "Question",
            "name": "¿DetectX admite escaneo masivo de música IA?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sí. DetectX ofrece procesamiento masivo para sellos discográficos, plataformas de streaming y distribuidores. Escanea desde cientos hasta millones de pistas automáticamente. Los planes Enterprise soportan hasta 1 millón de pistas por semana con procesamiento prioritario y acceso API dedicado."
            }
          },
          {
            "@type": "Question",
            "name": "¿En qué se diferencia DetectX de otros detectores de música IA?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectX es único en tres aspectos: (1) Arquitectura multi-motor para mayor precisión que detectores de un solo modelo, (2) Detección combinada de música IA Y deepfake de voz en una sola plataforma, (3) Procesamiento masivo de nivel empresarial de hasta 1M de pistas/semana. Tecnología con patente pendiente y la tasa de falsos positivos más baja de la industria."
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
              <Link href="/verify-audio"><Button className="text-sm font-medium">Escanear Gratis</Button></Link>
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
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-medium leading-tight text-foreground mb-6">
                  Detecta música IA de Suno, Udio y más
                </h1>
                <p className="text-lg text-muted-foreground mb-4">
                  Sube cualquier archivo de audio y obtén resultados de detección al instante. 96.8% de precisión en Suno v5.5. Diseñado para sellos, plataformas de streaming y entidades de gestión de derechos.
                </p>
                <p className="text-base text-muted-foreground mb-8">
                  Plan gratuito disponible. Soporta WAV, MP3, FLAC, AAC, OGG hasta 100MB.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-10">
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">96.8%</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Detección Suno</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">97.8%</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Voice Deepfake</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">Fast</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Velocidad</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">All</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Géneros</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/verify-audio">
                    <Button className="px-8 py-3 text-base font-medium">
                      Analizar gratis
                    </Button>
                  </Link>
                  <Link href="/batch-verify">
                    <Button variant="outline" className="px-8 py-3 text-base font-medium">
                      Análisis masivo para sellos
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="order-first md:order-last">
                <img
                  src="/images/herosection_new.png"
                  alt="DetectX detector de música IA analizando archivo de audio — detectando música generada por IA de Suno y Udio con 96.8% de precisión"
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
              Cómo Detectar Música Generada por IA
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Tres sencillos pasos para verificar si una canción fue generada por inteligencia artificial. Funciona con cualquier formato de audio.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-lg bg-muted/20">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">1. Sube Audio</h3>
                <p className="text-sm text-muted-foreground">
                  Arrastra y suelta o selecciona cualquier archivo de audio. Soporta WAV, MP3, FLAC, AAC, OGG. Hasta 100MB.
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-muted/20">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Cpu className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">2. Análisis Multi-Motor</h3>
                <p className="text-sm text-muted-foreground">
                  Múltiples modelos propietarios analizan patrones de audio en diferentes dimensiones de forma simultánea. Análisis paralelo de alta velocidad.
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-muted/20">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">3. Obtén el Veredicto</h3>
                <p className="text-sm text-muted-foreground">
                  Resultado claro: señal de IA detectada o no. Sin porcentajes ambiguos. Evidencia profesional en la que puedes confiar.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features / Why DetectX */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground text-center mb-4">
              Por Qué DetectX Es el Detector de Música IA Más Preciso
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Análisis multi-motor con tecnología de patente pendiente. Probado en decenas de miles de pistas IA en todos los géneros.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 rounded-lg border border-border">
                <Zap className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Motor Deep Learning</h3>
                <p className="text-muted-foreground text-sm">
                  Redes neuronales propietarias entrenadas con miles de pistas generadas por IA en todos los géneros. Identifica patrones estructurales exclusivos de generadores como Suno, Udio y ElevenLabs Music.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border">
                <BarChart3 className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Verificación Multicapa</h3>
                <p className="text-muted-foreground text-sm">
                  Un segundo motor valida los resultados de la detección primaria. Detecta artefactos invisibles para detectores de modelo único, asegurando máxima precisión con mínimos falsos positivos.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border">
                <BarChart3 className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Procesamiento por Lotes a Escala</h3>
                <p className="text-muted-foreground text-sm">
                  Escanea desde cientos hasta millones de pistas de forma automática. Procesamiento paralelo de alto rendimiento para sellos, distribuidores y plataformas que necesitan verificar catálogos completos.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border">
                <Music className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Resistente a Evasión</h3>
                <p className="text-muted-foreground text-sm">
                  Robusto ante conversión MP3, cambio de tono, tempo, ruido y recodificación de códec. Analiza propiedades estructurales profundas que sobreviven a cualquier postprocesamiento.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground text-center mb-4">
              Comparativa de Detectores de Música IA
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Cómo se compara DetectX con otras herramientas de detección de música IA en el mercado.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-foreground">Característica</th>
                    <th className="text-center p-3 font-medium text-cyan-500">DetectX</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">ACRCloud</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Resemble AI</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">SubmitHub</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="p-3">Precisión Detección Suno</td>
                    <td className="p-3 text-center font-medium text-foreground">96.8%</td>
                    <td className="p-3 text-center">Desconocido</td>
                    <td className="p-3 text-center">94%</td>
                    <td className="p-3 text-center">90%+</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3">Análisis Multi-Motor</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3">Procesamiento Masivo</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3">Detección de Deepfake de Voz</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3">Plan Gratuito</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3">Acceso API</td>
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
                  Prueba DetectX Gratis
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground text-center mb-4">
              Quién Usa la Detección de Música IA
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Desde músicos individuales hasta grandes sellos que procesan millones de pistas.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-lg border border-border">
                <Building2 className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">Sellos Discográficos</h3>
                <p className="text-xs text-muted-foreground">
                  Procesa grandes volúmenes de forma eficiente. Protege tu catálogo del contenido IA. Análisis masivo de miles de pistas.
                </p>
              </div>
              <div className="p-5 rounded-lg border border-border">
                <Music className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">Plataformas de Streaming</h3>
                <p className="text-xs text-muted-foreground">
                  Filtra subidas de IA de forma automática. Más de 60,000 pistas IA subidas a diario. Integración API para detección en tiempo real.
                </p>
              </div>
              <div className="p-5 rounded-lg border border-border">
                <Shield className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">Sociedades de Derechos de Autor</h3>
                <p className="text-xs text-muted-foreground">
                  Protege los fondos de regalías contra registros fraudulentos de IA. Informes de análisis con calidad de evidencia para disputas.
                </p>
              </div>
              <div className="p-5 rounded-lg border border-border">
                <Mic className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">Músicos y Productores</h3>
                <p className="text-xs text-muted-foreground">
                  Verifica tu propio trabajo. Demuestra origen humano. Comprueba si colaboradores usaron generación IA. Gratis para uso individual.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Supported AI Generators */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4">
              Detecta Todos los Principales Generadores de Música IA
            </h2>
            <p className="text-muted-foreground mb-10 max-w-2xl mx-auto">
              DetectX identifica audio de cualquier generador de música IA, sin importar el postprocesamiento o la conversión de formato.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {["Suno v5.5", "Udio", "ElevenLabs Music", "Seed Music", "MiniMax", "Mureka", "Riffusion", "Sonauto", "AIVA", "Boomy"].map((name) => (
                <span key={name} className="px-4 py-2 bg-muted/30 rounded-full text-sm text-foreground border border-border/50">
                  {name}
                </span>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              La detección funciona independientemente de la conversión a MP3, cambio de tono, cambios de tempo u otros intentos de evasión.
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
                  alt="DetectX detección de deepfake de voz — detector de clones de voz IA y habla sintética"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
              <div>
                <h2 className="text-2xl font-medium text-foreground mb-4">
                  Detección de Deepfake de Voz — Detector de Clones de Voz IA
                </h2>
                <p className="text-muted-foreground mb-4">
                  DetectX también detecta voces sintéticas y deepfakes de voz con 97.8% de precisión. Funciona con solo 2 segundos de audio en condiciones telefónicas reales.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> ElevenLabs, Google TTS, OpenAI detectados</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> Funciona con códec telefónico (G.711, 8kHz)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> Mínimo 2 segundos de audio requeridos</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> Detección en tiempo real para centros de llamadas</li>
                </ul>
                <Link href="/verify-voice">
                  <Button variant="outline" className="text-sm">
                    Probar Detección de Voz
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
              Explora DetectX
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Verifica una canción ahora, lee cómo funciona el detector o compáralo con otras herramientas.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/verify-audio/" className="block p-6 rounded-lg border border-border hover:border-cyan-500/50 transition-colors">
                <h3 className="text-lg font-medium text-foreground mb-2">Verificar una canción ahora</h3>
                <p className="text-sm text-muted-foreground">
                  Sube un archivo WAV, MP3 o FLAC y obtén resultados de detección de IA al instante. Plan gratuito disponible.
                </p>
              </Link>
              <Link href="/blog/how-to-detect-ai-generated-music/" className="block p-6 rounded-lg border border-border hover:border-cyan-500/50 transition-colors">
                <h3 className="text-lg font-medium text-foreground mb-2">Cómo detectar música IA — guía</h3>
                <p className="text-sm text-muted-foreground">
                  Una guía práctica para identificar música generada por IA, señales clave y mejores prácticas de flujo de trabajo.
                </p>
              </Link>
              <Link href="/vs/acrcloud/" className="block p-6 rounded-lg border border-border hover:border-cyan-500/50 transition-colors">
                <h3 className="text-lg font-medium text-foreground mb-2">Comparar: DetectX vs ACRCloud</h3>
                <p className="text-sm text-muted-foreground">
                  Comparación característica por característica de DetectX y ACRCloud para la detección de música IA.
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 px-6 border-t border-border">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4">
              Detecta música IA hoy mismo
            </h2>
            <p className="text-muted-foreground mb-8">
              Plan gratuito disponible. Sube tu primera pista y obtén resultados en segundos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/verify-audio">
                <Button className="px-10 py-4 text-base font-medium">
                  Analizar gratis
                </Button>
              </Link>
              <Link href="/plan">
                <Button variant="outline" className="px-10 py-4 text-base font-medium">
                  Planes Enterprise
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Soporta WAV, MP3, FLAC, AAC, OGG hasta 100MB. Análisis paralelo de alta velocidad.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">Producto</h4>
              <div className="space-y-2">
                <Link href="/verify-audio" className="block text-sm text-muted-foreground hover:text-foreground">Detector de Música IA</Link>
                <Link href="/verify-voice" className="block text-sm text-muted-foreground hover:text-foreground">Detector de Deepfake de Voz</Link>
                <Link href="/batch-verify" className="block text-sm text-muted-foreground hover:text-foreground">Escaneo Masivo</Link>
                <Link href="/plan" className="block text-sm text-muted-foreground hover:text-foreground">Precios</Link>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">Recursos</h4>
              <div className="space-y-2">
                <Link href="/technology" className="block text-sm text-muted-foreground hover:text-foreground">Tecnología</Link>
                <Link href="/research" className="block text-sm text-muted-foreground hover:text-foreground">Investigación</Link>
                <a href="/blog.html" className="block text-sm text-muted-foreground hover:text-foreground">Blog</a>
                <Link href="/updates" className="block text-sm text-muted-foreground hover:text-foreground">Actualizaciones</Link>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">Empresa</h4>
              <div className="space-y-2">
                <Link href="/about" className="block text-sm text-muted-foreground hover:text-foreground">Acerca de</Link>
                <Link href="/contact" className="block text-sm text-muted-foreground hover:text-foreground">Contacto</Link>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">Idiomas</h4>
              <div className="space-y-2">
                <Link href="/en/" className="block text-sm text-muted-foreground hover:text-foreground">English</Link>
                <Link href="/ko/" className="block text-sm text-muted-foreground hover:text-foreground">한국어</Link>
                <Link href="/ja/" className="block text-sm text-muted-foreground hover:text-foreground">日本語</Link>
                <Link href="/es/" className="block text-sm text-cyan-500 font-medium">Español</Link>
                <Link href="/de/" className="block text-sm text-muted-foreground hover:text-foreground">Deutsch</Link>
                <Link href="/fr/" className="block text-sm text-muted-foreground hover:text-foreground">Français</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; 2026 DetectX, Inc. Todos los derechos reservados.
            </p>
            <div className="flex gap-4">
              <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground">Términos</Link>
              <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground">Privacidad</Link>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/50 mt-4 text-center">
            Suno, Udio y otros nombres de productos son marcas de sus respectivos propietarios. DetectX no está afiliado ni respaldado por Suno o Udio.
          </p>
        </div>
      </footer>
    </div>
  );
}
