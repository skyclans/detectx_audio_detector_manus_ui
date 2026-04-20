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

export default function LandingZH() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, loading, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="即刻检测 Suno·Udio AI 生成音乐 | DetectX"
        description="免费 AI 音乐检测工具，Suno v5.5 检测率 96.8%。Multi-Engine Deep Learning 分析，精准检测 AI 生成音乐。专为唱片公司、流媒体平台和版权组织打造。"
        path="/zh/"
      />
      {/* SoftwareApplication Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "DetectX AI音乐检测器",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Web",
        "url": "https://detectx.app/zh/",
        "description": "AI 音乐检测工具，通过 Multi-Engine Deep Learning 分析以 96.8% 的准确率识别 Suno、Udio 等生成器生成的 AI 音乐。",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "description": "提供免费版本"
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
            "name": "DetectX如何检测AI生成的音乐？",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectX使用专有的多层Deep Learning分析技术。多个AI模型检测人耳无法感知的AI生成音频特有的微妙模式和伪影。Multi-Engine交叉验证在Suno v5.5上达到96.8%的检测率，同时将人类音乐的误判降到最低。"
            }
          },
          {
            "@type": "Question",
            "name": "DetectX AI音乐检测器的准确率是多少？",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectX对Suno v5.5生成的AI音乐检测率达到96.8%（在16种音乐类型的995首曲目上测试）。Multi-Engine架构将人类音乐的误判降到最低，对人类创作的音乐几乎零误报。这使DetectX成为市场上最准确的AI音乐检测器之一。"
            }
          },
          {
            "@type": "Question",
            "name": "DetectX能检测Suno和Udio的AI曲目吗？",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "可以。DetectX 以 96.8% 的准确率检测 Suno v5.5，涵盖流行、爵士、古典、嘻哈和电子等所有类型。Udio 检测率为 58%。系统能识别每个 AI 生成器合成过程中独有的结构性伪影。"
            }
          },
          {
            "@type": "Question",
            "name": "DetectX是免费的吗？",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "是的，DetectX 提供免费版本，包含完整的 Multi-Engine 分析。上传您的音频文件（WAV、MP3、FLAC、AAC、OGG，最大 100MB）即可获得即时检测结果。Pro 版支持批量处理（每周最多 100 万首）和 API 接入。"
            }
          },
          {
            "@type": "Question",
            "name": "DetectX支持批量AI音乐扫描吗？",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "支持。DetectX 为唱片公司、流媒体平台和发行商提供批量处理，可自动扫描数百到数百万首曲目。企业版每周最多处理 100 万首，享受优先处理和专属 API 接入。"
            }
          },
          {
            "@type": "Question",
            "name": "DetectX与其他AI音乐检测器有何不同？",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectX 在三方面领先：(1) Multi-Engine 架构，准确率优于单模型检测器；(2) 同一平台同时检测 AI 音乐和 Voice Deepfake；(3) 企业级批量处理，每周最多 100 万首。专利技术，将人类音乐的误判降到最低。"
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
              <Link href="/verify-audio"><Button className="text-sm font-medium">免费扫描您的音乐</Button></Link>
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
                  即刻检测 Suno·Udio AI 生成音乐
                </h1>
                <p className="text-lg text-muted-foreground mb-4">
                  上传您的音频文件，即时获取AI检测结果。Suno v5.5 检测率 96.8%。专为唱片公司、流媒体平台和版权组织打造。
                </p>
                <p className="text-base text-muted-foreground mb-8">
                  免费使用。支持 WAV、MP3、FLAC、AAC、OGG，最大 100MB。
                </p>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-10">
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">96.8%</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Suno 检测</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">97.8%</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Voice Deepfake</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">Fast</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">极速分析</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">16+</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">音乐类型</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/verify-audio">
                    <Button className="px-8 py-3 text-base font-medium">
                      免费扫描您的音乐
                    </Button>
                  </Link>
                  <Link href="/batch-verify">
                    <Button variant="outline" className="px-8 py-3 text-base font-medium">
                      厂牌批量扫描
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="order-first md:order-last">
                <img
                  src="/images/herosection_new.png"
                  alt="DetectX AI 音乐检测器分析音频文件 — 以 96.8% 准确率检测 Suno 和 Udio 生成的 AI 音乐"
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
              如何检测AI生成音乐
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              三步完成检测，支持所有主流音频格式。
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-lg bg-muted/20">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">1. 上传音频</h3>
                <p className="text-sm text-muted-foreground">
                  拖放或选择您的音频文件。支持 WAV、MP3、FLAC、AAC、OGG，最大 100MB。
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-muted/20">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Cpu className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">2. Multi-Engine 分析</h3>
                <p className="text-sm text-muted-foreground">
                  多个专有 AI 模型同时从不同维度分析音频特征。高速并行处理，快速出结果。
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-muted/20">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">3. 获取结果</h3>
                <p className="text-sm text-muted-foreground">
                  清晰结论：是否存在 AI 生成信号。专业级分析报告，可作为证据留存。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features / Why DetectX */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground text-center mb-4">
              为什么DetectX是最准确的AI音乐检测器
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Multi-Engine Deep Learning 分析，专利技术。经 16 种音乐类型、995 首 Suno v5.5 曲目实测验证。
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 rounded-lg border border-border">
                <Zap className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Deep Learning 引擎</h3>
                <p className="text-muted-foreground text-sm">
                  基于全类型大量 AI 生成曲目训练的专有神经网络。精准识别 Suno、Udio、ElevenLabs Music 等生成器独有的结构模式。
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border">
                <BarChart3 className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">多层交叉验证</h3>
                <p className="text-muted-foreground text-sm">
                  二次分析引擎交叉验证首次检测结果。发现单模型检测器遗漏的伪影，将人类音乐的误判降到最低。
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border">
                <Shield className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">企业级批量处理</h3>
                <p className="text-muted-foreground text-sm">
                  处理大量曲目，保护您的音乐目录免受 AI 内容侵入。支持数千首批量扫描，企业版每周可达 100 万首。
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border">
                <Music className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">抗规避能力</h3>
                <p className="text-muted-foreground text-sm">
                  对 MP3 转码、变调、变速、加噪声等操作均保持稳定检测。分析深层结构特征，后处理无法抹除。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground text-center mb-4">
              AI音乐检测器对比
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              DetectX 与市场主流 AI 音乐检测工具的对比。
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-foreground">功能</th>
                    <th className="text-center p-3 font-medium text-cyan-500">DetectX</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">ACRCloud</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Resemble AI</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">SubmitHub</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="p-3">Suno 检测率</td>
                    <td className="p-3 text-center font-medium text-foreground">96.8%</td>
                    <td className="p-3 text-center">未知</td>
                    <td className="p-3 text-center">94%</td>
                    <td className="p-3 text-center">90%+</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3">Multi-Engine 分析</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3">批量处理</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3">Voice Deepfake 检测</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3">免费版本</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3">API 接入</td>
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
                  免费试用DetectX
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground text-center mb-4">
              面向各类音乐行业用户设计
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              从独立音乐人到管理百万曲库的大型唱片公司，都能适用。
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-lg border border-border">
                <Building2 className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">唱片公司</h3>
                <p className="text-xs text-muted-foreground">
                  处理大量曲目，保护您的音乐目录免受 AI 内容侵入。支持数千首批量扫描，高效筛选投稿。
                </p>
              </div>
              <div className="p-5 rounded-lg border border-border">
                <Music className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">流媒体平台</h3>
                <p className="text-xs text-muted-foreground">
                  自动过滤 AI 上传内容。每天超过 60,000 首 AI 曲目涌入平台。通过 API 集成实现实时拦截。
                </p>
              </div>
              <div className="p-5 rounded-lg border border-border">
                <Shield className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">版权管理组织</h3>
                <p className="text-xs text-muted-foreground">
                  保护版税池免受欺诈性 AI 注册侵害。为版权争议提供证据级分析报告。
                </p>
              </div>
              <div className="p-5 rounded-lg border border-border">
                <Mic className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">音乐人与制作人</h3>
                <p className="text-xs text-muted-foreground">
                  验证自己的作品，证明人类创作来源。检查合作者是否使用了 AI 生成内容。个人免费。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Supported AI Generators */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4">
              检测所有主流AI音乐生成器
            </h2>
            <p className="text-muted-foreground mb-10 max-w-2xl mx-auto">
              无论后处理还是格式转换，DetectX 均可识别来自各大 AI 音乐生成平台的音频。
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {["Suno v5.5", "Udio", "ElevenLabs Music", "Seed Music", "MiniMax", "Mureka", "Riffusion", "Sonauto", "AIVA", "Boomy"].map((name) => (
                <span key={name} className="px-4 py-2 bg-muted/30 rounded-full text-sm text-foreground border border-border/50">
                  {name}
                </span>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              MP3 转码、变调、变速等规避手段均无法逃脱检测。
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
                  alt="DetectX Voice Deepfake 检测 — AI 语音克隆和合成语音检测器"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
              <div>
                <h2 className="text-2xl font-medium text-foreground mb-4">
                  Voice Deepfake 检测：AI 语音克隆识别
                </h2>
                <p className="text-muted-foreground mb-4">
                  DetectX 同时支持 AI 生成语音和 Deepfake 声音检测，准确率 97.8%。真实电话环境下仅需 2 秒音频即可判定。
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> 检测 ElevenLabs、Google TTS、OpenAI 等</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> 支持电话编解码器 (G.711, 8kHz)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> 最短 2 秒音频即可判定</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> 适用于呼叫中心实时检测</li>
                </ul>
                <Link href="/verify-voice">
                  <Button variant="outline" className="text-sm">
                    体验语音检测
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
              立即开始检测AI生成音乐
            </h2>
            <p className="text-muted-foreground mb-8">
              免费使用，上传您的第一首曲目，即刻获取检测结果。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/verify-audio">
                <Button className="px-10 py-4 text-base font-medium">
                  免费扫描您的音乐
                </Button>
              </Link>
              <Link href="/plan">
                <Button variant="outline" className="px-10 py-4 text-base font-medium">
                  查看企业版方案
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              支持 WAV、MP3、FLAC、AAC、OGG，最大 100MB。高速并行分析。
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">产品</h4>
              <div className="space-y-2">
                <Link href="/verify-audio" className="block text-sm text-muted-foreground hover:text-foreground">AI 音乐检测</Link>
                <Link href="/verify-voice" className="block text-sm text-muted-foreground hover:text-foreground">Voice Deepfake 检测</Link>
                <Link href="/batch-verify" className="block text-sm text-muted-foreground hover:text-foreground">批量扫描</Link>
                <Link href="/plan" className="block text-sm text-muted-foreground hover:text-foreground">价格</Link>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">资源</h4>
              <div className="space-y-2">
                <Link href="/technology" className="block text-sm text-muted-foreground hover:text-foreground">技术</Link>
                <Link href="/research" className="block text-sm text-muted-foreground hover:text-foreground">研究</Link>
                <Link href="/updates" className="block text-sm text-muted-foreground hover:text-foreground">更新</Link>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">公司</h4>
              <div className="space-y-2">
                <Link href="/about" className="block text-sm text-muted-foreground hover:text-foreground">关于</Link>
                <Link href="/contact" className="block text-sm text-muted-foreground hover:text-foreground">联系</Link>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">语言</h4>
              <div className="space-y-2">
                <Link href="/en/" className="block text-sm text-muted-foreground hover:text-foreground">English</Link>
                <Link href="/ko/" className="block text-sm text-muted-foreground hover:text-foreground">한국어</Link>
                <Link href="/ja/" className="block text-sm text-muted-foreground hover:text-foreground">日本語</Link>
                <Link href="/es/" className="block text-sm text-muted-foreground hover:text-foreground">Español</Link>
                <Link href="/de/" className="block text-sm text-muted-foreground hover:text-foreground">Deutsch</Link>
                <Link href="/fr/" className="block text-sm text-muted-foreground hover:text-foreground">Français</Link>
                <Link href="/pt/" className="block text-sm text-muted-foreground hover:text-foreground">Português</Link>
                <Link href="/zh/" className="block text-sm text-cyan-500 font-medium">中文</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; 2026 DetectX, Inc. 保留所有权利。
            </p>
            <div className="flex gap-4">
              <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground">条款</Link>
              <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground">隐私</Link>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/50 mt-4 text-center">
            Suno、Udio 及其他产品名称为各自所有者的商标。DetectX 与 Suno 或 Udio 无关联或认可关系。
          </p>
        </div>
      </footer>
    </div>
  );
}
