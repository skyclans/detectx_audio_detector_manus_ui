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

export default function LandingPT() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, loading, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Detector de Música IA: Detecte Suno, Udio e Músicas Geradas por IA"
        description="Detector de música IA gratuito com 96,8% de precisão no Suno v5.5. Análise de multi-motor com deep learning para detectar música gerada por inteligência artificial. Projetado para gravadoras, plataformas de streaming e sociedades de direitos autorais."
        path="/pt/"
      />
      {/* SoftwareApplication Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "DetectX Detector de Música IA",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Web",
        "url": "https://detectx.app/pt/",
        "description": "Ferramenta de detecção de música IA que identifica faixas geradas por Suno, Udio e outros geradores com 96,8% de precisão usando análise de multi-motor com deep learning.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "description": "Plano gratuito disponível"
        }
      }) }} />
      {/* FAQPage Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Como o DetectX detecta música gerada por IA?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectX utiliza análise proprietária de deep learning multicamada. Nossos modelos detectam padrões sutis e artefatos exclusivos do áudio gerado por IA, imperceptíveis ao ouvido humano. A validação cruzada entre múltiplos motores de análise alcança 96,8% de detecção no Suno v5.5, minimizando falsos positivos em músicas criadas por humanos."
            }
          },
          {
            "@type": "Question",
            "name": "Qual é a precisão do detector de música IA DetectX?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectX alcança 96,8% de detecção em músicas geradas pelo Suno v5.5 (validado em dezenas de milhares de faixas em todos os gêneros). O sistema foi projetado para minimizar falsos positivos, garantindo que músicas criadas por humanos não sejam marcadas incorretamente."
            }
          },
          {
            "@type": "Question",
            "name": "O DetectX pode detectar faixas IA do Suno e Udio?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sim. DetectX detecta Suno v5.5 com 96,8% de precisão em todos os gêneros, incluindo pop, jazz, clássico, hip-hop e eletrônico. A taxa de detecção do Udio é de 58%. O sistema identifica artefatos estruturais únicos do processo de síntese de cada gerador de IA."
            }
          },
          {
            "@type": "Question",
            "name": "O DetectX é gratuito?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sim, o DetectX oferece um plano gratuito com análise completa de multi-motor. Envie qualquer arquivo de áudio (WAV, MP3, FLAC, AAC, OGG até 100MB) e receba o resultado na hora. Planos profissionais estão disponíveis para análise em lote (até 1M de faixas/semana) e acesso à API."
            }
          },
          {
            "@type": "Question",
            "name": "O DetectX suporta análise em lote de música IA?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sim. DetectX oferece análise em lote para gravadoras, plataformas de streaming e distribuidoras. Analise de centenas a milhões de faixas de forma automatizada. Planos Enterprise processam até 1 milhão de faixas por semana com prioridade e acesso dedicado à API."
            }
          },
          {
            "@type": "Question",
            "name": "Como o DetectX é diferente de outros detectores de música IA?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectX se destaca por três diferenciais: (1) Arquitetura multi-motor com precisão superior a detectores de modelo único, (2) Detecção combinada de música IA e deepfake vocal em uma única plataforma, (3) Análise em lote de nível empresarial com até 1M de faixas/semana. Tecnologia patenteada, minimizando falsos positivos em músicas criadas por humanos."
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
              <Link href="/verify-audio"><Button className="text-sm font-medium">Analisar grátis</Button></Link>
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
                  Detecte música IA do Suno, Udio e mais
                </h1>
                <p className="text-lg text-muted-foreground mb-4">
                  Envie seu arquivo de áudio e descubra se foi gerado por IA. 96,8% de precisão no Suno v5.5. Feito para gravadoras, plataformas de streaming e sociedades de direitos autorais.
                </p>
                <p className="text-base text-muted-foreground mb-8">
                  Comece grátis. Aceita WAV, MP3, FLAC, AAC, OGG (até 100MB).
                </p>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-10">
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">96,8%</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Detecção Suno</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">97,8%</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Voice Deepfake</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">Rápido</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Velocidade</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">Todos</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Gêneros</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/verify-audio">
                    <Button className="px-8 py-3 text-base font-medium">
                      Analisar grátis
                    </Button>
                  </Link>
                  <Link href="/batch-verify">
                    <Button variant="outline" className="px-8 py-3 text-base font-medium">
                      Análise em lote para gravadoras
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="order-first md:order-last">
                <img
                  src="/images/herosection_new.png"
                  alt="DetectX detector de música IA analisando arquivo de áudio — detectando música gerada por Suno e Udio com 96,8% de precisão"
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
              Como Detectar Música Gerada por IA
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Três passos simples para descobrir se uma música foi gerada por IA. Funciona com qualquer formato de áudio.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-lg bg-muted/20">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">1. Envie o áudio</h3>
                <p className="text-sm text-muted-foreground">
                  Arraste e solte ou selecione seu arquivo de áudio. Aceita WAV, MP3, FLAC, AAC, OGG (até 100MB).
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-muted/20">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Cpu className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">2. Análise Multi-Motor</h3>
                <p className="text-sm text-muted-foreground">
                  Múltiplos modelos proprietários analisam padrões de áudio em diferentes dimensões ao mesmo tempo. Análise rápida em paralelo.
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-muted/20">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">3. Receba o resultado</h3>
                <p className="text-sm text-muted-foreground">
                  Resposta objetiva: sinal de IA detectado ou não. Sem porcentagens confusas. Um laudo confiável em que você pode se basear.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features / Why DetectX */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground text-center mb-4">
              Por Que o DetectX É o Detector de Música IA Mais Preciso
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Análise multi-motor com tecnologia patenteada de Deep Learning. Validado em dezenas de milhares de faixas de IA em todos os gêneros.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 rounded-lg border border-border">
                <Zap className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Motor Deep Learning</h3>
                <p className="text-muted-foreground text-sm">
                  Redes neurais proprietárias treinadas com milhares de faixas geradas por IA. Identifica padrões estruturais exclusivos de geradores como Suno, Udio e ElevenLabs Music.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border">
                <BarChart3 className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Verificação Multicamada</h3>
                <p className="text-muted-foreground text-sm">
                  Motor secundário que faz validação cruzada dos resultados primários. Detecta artefatos invisíveis a detectores de modelo único, maximizando a precisão e minimizando falsos positivos.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border">
                <Shield className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Análise em Lote em Escala</h3>
                <p className="text-muted-foreground text-sm">
                  Analise de centenas a milhões de faixas de forma automática. Processamento empresarial de até 1M de faixas por semana, com integração via API e relatórios detalhados.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border">
                <Music className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Resistente a Evasão</h3>
                <p className="text-muted-foreground text-sm">
                  Robusto contra conversão MP3, pitch shifting, alterações de tempo, adição de ruído e recodificação de codec. Analisa propriedades estruturais profundas que resistem a qualquer pós-processamento.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground text-center mb-4">
              Comparação de Detectores de Música IA
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Veja como o DetectX se posiciona frente a outros detectores de música IA do mercado.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-foreground">Recurso</th>
                    <th className="text-center p-3 font-medium text-cyan-500">DetectX</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">ACRCloud</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Resemble AI</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">SubmitHub</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="p-3">Detecção Suno</td>
                    <td className="p-3 text-center font-medium text-foreground">96,8%</td>
                    <td className="p-3 text-center">Desconhecido</td>
                    <td className="p-3 text-center">94%</td>
                    <td className="p-3 text-center">90%+</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3">Análise Multi-Motor</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3">Análise em Lote</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3">Detecção de Deepfake Vocal</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3">Plano Gratuito</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3">Acesso à API</td>
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
                  Testar DetectX grátis
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground text-center mb-4">
              Quem Usa Detecção de Música IA
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              De músicos independentes a grandes gravadoras que processam milhares de faixas em todos os gêneros.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-lg border border-border">
                <Building2 className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">Gravadoras</h3>
                <p className="text-xs text-muted-foreground">
                  Processe grandes volumes de faixas. Proteja seu catálogo contra conteúdo IA. Análise em lote de milhares de faixas.
                </p>
              </div>
              <div className="p-5 rounded-lg border border-border">
                <Music className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">Plataformas de Streaming</h3>
                <p className="text-xs text-muted-foreground">
                  Filtre uploads de IA automaticamente. Mais de 60 mil faixas IA são enviadas por dia. Integração via API para detecção em tempo real.
                </p>
              </div>
              <div className="p-5 rounded-lg border border-border">
                <Shield className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">Sociedades de Direitos Autorais</h3>
                <p className="text-xs text-muted-foreground">
                  Proteja os royalties contra registros fraudulentos de IA. Laudos com qualidade de evidência para disputas e processos.
                </p>
              </div>
              <div className="p-5 rounded-lg border border-border">
                <Mic className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">Músicos e Produtores</h3>
                <p className="text-xs text-muted-foreground">
                  Verifique suas faixas. Comprove a autoria humana. Confira se colaboradores usaram geração por IA. Gratuito para uso individual.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Supported AI Generators */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4">
              Detecta Todos os Principais Geradores de Música IA
            </h2>
            <p className="text-muted-foreground mb-10 max-w-2xl mx-auto">
              DetectX identifica áudio de qualquer plataforma de geração de música IA, independente de pós-processamento ou conversão de formato.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {["Suno v5.5", "Udio", "ElevenLabs Music", "Seed Music", "MiniMax", "Mureka", "Riffusion", "Sonauto", "AIVA", "Boomy"].map((name) => (
                <span key={name} className="px-4 py-2 bg-muted/30 rounded-full text-sm text-foreground border border-border/50">
                  {name}
                </span>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              A detecção funciona mesmo com conversão MP3, pitch shifting, alterações de tempo ou outras tentativas de mascaramento.
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
                  alt="DetectX detecção de deepfake vocal — detector de clones de voz IA e fala sintética"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
              <div>
                <h2 className="text-2xl font-medium text-foreground mb-4">
                  Detecção de Deepfake Vocal — Identifique Clones de Voz IA
                </h2>
                <p className="text-muted-foreground mb-4">
                  DetectX também identifica fala sintética e vozes deepfake com 97,8% de precisão. Basta 2 segundos de áudio, mesmo em ligações telefônicas reais.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> Detecta ElevenLabs, Google TTS e OpenAI</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> Compatível com codec telefônico (G.711, 8kHz)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> Apenas 2 segundos de áudio necessários</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> Detecção em tempo real para call centers</li>
                </ul>
                <Link href="/verify-voice">
                  <Button variant="outline" className="text-sm">
                    Testar detecção vocal
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
              Explore o DetectX
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Verifique uma música agora, leia como o detector funciona ou compare com outras ferramentas.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/verify-audio/" className="block p-6 rounded-lg border border-border hover:border-cyan-500/50 transition-colors">
                <h3 className="text-lg font-medium text-foreground mb-2">Verificar uma música</h3>
                <p className="text-sm text-muted-foreground">
                  Envie um arquivo WAV, MP3 ou FLAC e receba resultados de detecção de IA na hora. Plano gratuito disponível.
                </p>
              </Link>
              <Link href="/blog/how-to-detect-ai-generated-music/" className="block p-6 rounded-lg border border-border hover:border-cyan-500/50 transition-colors">
                <h3 className="text-lg font-medium text-foreground mb-2">Como detectar música IA</h3>
                <p className="text-sm text-muted-foreground">
                  Um guia prático para identificar música gerada por IA, sinais-chave e melhores práticas de fluxo de trabalho.
                </p>
              </Link>
              <Link href="/vs/acrcloud/" className="block p-6 rounded-lg border border-border hover:border-cyan-500/50 transition-colors">
                <h3 className="text-lg font-medium text-foreground mb-2">Comparar: DetectX vs ACRCloud</h3>
                <p className="text-sm text-muted-foreground">
                  Comparação funcionalidade a funcionalidade entre DetectX e ACRCloud para detecção de música IA.
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 px-6 border-t border-border">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4">
              Comece a detectar música IA agora
            </h2>
            <p className="text-muted-foreground mb-8">
              Plano gratuito disponível. Envie sua primeira faixa e receba o resultado em segundos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/verify-audio">
                <Button className="px-10 py-4 text-base font-medium">
                  Analisar grátis
                </Button>
              </Link>
              <Link href="/plan">
                <Button variant="outline" className="px-10 py-4 text-base font-medium">
                  Ver Planos Enterprise
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Aceita WAV, MP3, FLAC, AAC, OGG (até 100MB). Análise rápida em paralelo.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">Produto</h4>
              <div className="space-y-2">
                <Link href="/verify-audio" className="block text-sm text-muted-foreground hover:text-foreground">Detector de Música IA</Link>
                <Link href="/verify-voice" className="block text-sm text-muted-foreground hover:text-foreground">Detector de Deepfake Vocal</Link>
                <Link href="/batch-verify" className="block text-sm text-muted-foreground hover:text-foreground">Análise em Lote</Link>
                <Link href="/plan" className="block text-sm text-muted-foreground hover:text-foreground">Preços</Link>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">Recursos</h4>
              <div className="space-y-2">
                <Link href="/technology" className="block text-sm text-muted-foreground hover:text-foreground">Tecnologia</Link>
                <Link href="/research" className="block text-sm text-muted-foreground hover:text-foreground">Pesquisa</Link>
                <Link href="/updates" className="block text-sm text-muted-foreground hover:text-foreground">Atualizações</Link>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">Empresa</h4>
              <div className="space-y-2">
                <Link href="/about" className="block text-sm text-muted-foreground hover:text-foreground">Sobre</Link>
                <Link href="/contact" className="block text-sm text-muted-foreground hover:text-foreground">Contato</Link>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">Idiomas</h4>
              <div className="space-y-2">
                <Link href="/en/" className="block text-sm text-muted-foreground hover:text-foreground">English</Link>
                <Link href="/ko/" className="block text-sm text-muted-foreground hover:text-foreground">한국어</Link>
                <Link href="/ja/" className="block text-sm text-muted-foreground hover:text-foreground">日本語</Link>
                <Link href="/es/" className="block text-sm text-muted-foreground hover:text-foreground">Español</Link>
                <Link href="/de/" className="block text-sm text-muted-foreground hover:text-foreground">Deutsch</Link>
                <Link href="/fr/" className="block text-sm text-muted-foreground hover:text-foreground">Français</Link>
                <Link href="/pt/" className="block text-sm text-cyan-500 font-medium">Português</Link>
                <Link href="/zh/" className="block text-sm text-muted-foreground hover:text-foreground">中文</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; 2026 DetectX, Inc. Todos os direitos reservados.
            </p>
            <div className="flex gap-4">
              <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground">Termos</Link>
              <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground">Privacidade</Link>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/50 mt-4 text-center">
            Suno, Udio e outros nomes de produtos são marcas de seus respectivos proprietários. DetectX não é afiliado nem endossado pela Suno ou Udio.
          </p>
        </div>
      </footer>
    </div>
  );
}
