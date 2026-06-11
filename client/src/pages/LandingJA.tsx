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

export default function LandingJA() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, loading, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Suno・Udio AI楽曲を瞬時に検出"
        description="Suno v5.5検出率96.8%の無料AI音楽検出ツール。Multi-Engine Deep Learning分析でAI生成楽曲を判定。レコード会社・配信プラットフォーム・著作権管理団体向け。"
        path="/ja/"
      />
      {/* SoftwareApplication Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "DetectX AI音楽検出ツール",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Web",
        "url": "https://detectx.app/ja/",
        "description": "Suno、Udio等のAI生成楽曲を96.8%の精度で検出するMulti-Engine Deep Learning分析ツール。レコード会社・配信プラットフォーム・著作権管理団体向けのAI音楽検出ツールです。",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "description": "無料プランあり"
        }
      }) }} />
      {/* FAQPage Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "DetectXはどのようにAI生成音楽を検出しますか？",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectXは独自のMulti-Engine Deep Learning分析を採用しています。複数のAIモデルが、人間の耳では検知できないAI生成オーディオ固有の微細パターンを検出します。エンジン間のクロスバリデーションにより、Suno v5.5で96.8%の検出率を達成。人間が制作した楽曲に対する誤検知を最小限に抑える設計です。"
            }
          },
          {
            "@type": "Question",
            "name": "DetectXの精度はどのくらいですか？",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectXはSuno v5.5のAI生成楽曲に対して96.8%の検出率を達成しています（全ジャンル、数万曲で実戦テスト済み）。人間が制作した楽曲に対する誤検知を最小限に抑える設計で、フォルスポジティブはほぼゼロです。現存するAI音楽検出ツールの中で最高水準の精度を提供します。"
            }
          },
          {
            "@type": "Question",
            "name": "SunoやUdioの楽曲を検出できますか？",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "はい、検出可能です。Suno v5.5はポップ、ジャズ、クラシック、ヒップホップ、エレクトロニックなど全ジャンルで96.8%の精度で検出します。Udoの検出率は58%です。各AI音楽生成ツール固有の合成パターンを識別する仕組みです。"
            }
          },
          {
            "@type": "Question",
            "name": "DetectXは無料ですか？",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "はい、無料プランをご用意しています。WAV、MP3、FLAC、AAC、OGG（最大100MB）のオーディオファイルをアップロードするだけで、Multi-Engine分析による検出結果を即座に取得できます。大量処理（週最大100万曲）やAPI連携が可能な有料プランもございます。"
            }
          },
          {
            "@type": "Question",
            "name": "大量スキャンに対応していますか？",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "はい、レコード会社・配信プラットフォーム・ディストリビューター向けのバッチ処理機能を提供しています。数百曲から数百万曲まで自動スキャンが可能です。エンタープライズプランでは週最大100万曲の優先処理と専用API連携をご利用いただけます。"
            }
          },
          {
            "@type": "Question",
            "name": "他のAI音楽検出ツールとの違いは？",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectXの差別化ポイントは3つあります。(1) 複数エンジンによるクロスバリデーションで単一モデルを超える精度を実現、(2) 音楽検出とボイスディープフェイク検出を一つのプラットフォームで提供、(3) 週最大100万曲処理可能なエンタープライズ対応のバッチ処理。人間が制作した楽曲に対する誤検知を最小限に抑える設計の特許出願済み技術です。"
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
              aria-label="モバイルメニューを開く"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="flex items-center gap-2 md:gap-4">
              <button onClick={toggleTheme} className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="テーマ切替">
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
              <Link href="/verify-audio"><Button className="text-sm font-medium">無料スキャン</Button></Link>
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
                  Suno・Udio AI楽曲を瞬時に検出
                </h1>
                <p className="text-lg text-muted-foreground mb-4">
                  オーディオファイルをアップロードするだけで、AI生成楽曲かどうかを瞬時に判定。Suno v5.5検出率96.8%。レコード会社・配信プラットフォーム・著作権管理団体に対応したAI音楽検出ツールです。
                </p>
                <p className="text-base text-muted-foreground mb-8">
                  無料プランあり。WAV / MP3 / FLAC / AAC / OGG（最大100MB）対応。
                </p>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-10">
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">96.8%</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Suno検出率</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">97.8%</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Voice Deepfake</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">Fast</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">分析速度</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">All</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">ジャンル</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/verify-audio">
                    <Button className="px-8 py-3 text-base font-medium">
                      無料でスキャン開始
                    </Button>
                  </Link>
                  <Link href="/batch-verify">
                    <Button variant="outline" className="px-8 py-3 text-base font-medium">
                      バッチスキャン
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="order-first md:order-last">
                <img
                  src="/images/herosection_new.png"
                  alt="DetectX AI音楽検出ツールがオーディオファイルを分析 — SunoやUdioのAI生成楽曲を96.8%の精度で検出"
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
              検出の仕組み
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              3ステップでAI生成楽曲かどうかを判定します。主要オーディオ形式すべてに対応。
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-lg bg-muted/20">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">1. オーディオをアップロード</h3>
                <p className="text-sm text-muted-foreground">
                  ドラッグ＆ドロップまたはファイルを選択。WAV、MP3、FLAC、AAC、OGGに対応。最大100MB。
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-muted/20">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Cpu className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">2. Multi-Engine分析</h3>
                <p className="text-sm text-muted-foreground">
                  複数の独自AIモデルがオーディオの構造パターンを多角的に分析。高速並列処理で結果を出力します。
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-muted/20">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">3. 結果を確認</h3>
                <p className="text-sm text-muted-foreground">
                  AI信号の有無を明確に判定。曖昧なスコアではなく、根拠のある分析レポートを提供します。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features / Why DetectX */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground text-center mb-4">
              DetectXが選ばれる理由
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              特許出願済みのMulti-Engine Deep Learning分析。全ジャンル、数万曲のAI生成楽曲で実戦検証済み。
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 rounded-lg border border-border">
                <Zap className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Deep Learningエンジン</h3>
                <p className="text-muted-foreground text-sm">
                  全ジャンルの大量AI生成トラックで学習した独自ニューラルネットワークが、Suno・Udio・ElevenLabs Music固有の構造パターンを特定します。
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border">
                <BarChart3 className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Multi-Engine検証</h3>
                <p className="text-muted-foreground text-sm">
                  一次検出結果を二次エンジンでクロスバリデーション。単一モデルでは検出困難なアーティファクトも捕捉し、誤検知を最小限に抑えます。
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border">
                <Shield className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">大規模バッチ処理</h3>
                <p className="text-muted-foreground text-sm">
                  数千曲を一括スキャン可能。レコード会社やプラットフォーム向けに設計されたバッチ処理で、カタログ全体を効率的に検査します。
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border">
                <Music className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">回避操作にも対応</h3>
                <p className="text-muted-foreground text-sm">
                  MP3変換、ピッチシフト、テンポ変更、ノイズ追加、再エンコードに対しても検出可能。ポストプロセスで消えない深層構造を分析します。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground text-center mb-4">
              他ツールとの比較
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              主要なAI音楽検出ツールとDetectXの機能比較です。
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-foreground">機能</th>
                    <th className="text-center p-3 font-medium text-cyan-500">DetectX</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">ACRCloud</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Resemble AI</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">SubmitHub</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="p-3">Suno検出精度</td>
                    <td className="p-3 text-center font-medium text-foreground">96.8%</td>
                    <td className="p-3 text-center">非公開</td>
                    <td className="p-3 text-center">94%</td>
                    <td className="p-3 text-center">90%+</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3">マルチエンジン分析</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3">バッチ処理</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3">ボイスディープフェイク検出</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3">無料プラン</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3">APIアクセス</td>
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
                  DetectXを無料で試す
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground text-center mb-4">
              活用シーン
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              個人ミュージシャンから大手レコード会社まで、幅広い用途に対応します。
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-lg border border-border">
                <Building2 className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">レコード会社</h3>
                <p className="text-xs text-muted-foreground">
                  カタログ全体をAIコンテンツから保護。数千曲の一括スキャンに対応します。
                </p>
              </div>
              <div className="p-5 rounded-lg border border-border">
                <Music className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">配信プラットフォーム</h3>
                <p className="text-xs text-muted-foreground">
                  日々60,000曲以上アップロードされるAIトラックを自動フィルタリング。API連携でリアルタイム検出が可能です。
                </p>
              </div>
              <div className="p-5 rounded-lg border border-border">
                <Shield className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">著作権管理団体</h3>
                <p className="text-xs text-muted-foreground">
                  ロイヤリティプールを不正AI登録から保護。紛争時には専門家レベルの分析レポートを提供します。
                </p>
              </div>
              <div className="p-5 rounded-lg border border-border">
                <Mic className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">ミュージシャン・プロデューサー</h3>
                <p className="text-xs text-muted-foreground">
                  自身の作品がAI判定されないことを確認。コラボ相手のAI使用有無も検証可能。個人利用は無料です。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Supported AI Generators */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4">
              主要AI音楽生成ツールに対応
            </h2>
            <p className="text-muted-foreground mb-10 max-w-2xl mx-auto">
              フォーマット変換やポストプロセスの有無にかかわらず、主要AI音楽生成プラットフォームの出力を識別します。
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {["Suno v5.5", "Udio", "ElevenLabs Music", "Seed Music", "MiniMax", "Mureka", "Riffusion", "Sonauto", "AIVA", "Boomy"].map((name) => (
                <span key={name} className="px-4 py-2 bg-muted/30 rounded-full text-sm text-foreground border border-border/50">
                  {name}
                </span>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              MP3変換・ピッチシフト・テンポ変更などの回避操作にも対応。
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
                  alt="DetectXボイスディープフェイク検出 — AI音声クローンおよび合成音声検出ツール"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
              <div>
                <h2 className="text-2xl font-medium text-foreground mb-4">
                  ボイスディープフェイク検出
                </h2>
                <p className="text-muted-foreground mb-4">
                  AI生成音声・ディープフェイクボイスを97.8%の精度で検出。実際の電話環境で、わずか2秒の音声から判定可能です。
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> ElevenLabs / Google TTS / OpenAI対応</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> 電話コーデック（G.711 / 8kHz）対応</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> 最短2秒の音声で判定可能</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> コールセンター向けリアルタイム対応</li>
                </ul>
                <Link href="/verify-voice">
                  <Button variant="outline" className="text-sm">
                    音声検出を試す
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
              DetectXをもっと知る
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              今すぐ楽曲を検証する、検出の仕組みを読む、他ツールと比較するなどの導線です。
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/verify-audio/" className="block p-6 rounded-lg border border-border hover:border-cyan-500/50 transition-colors">
                <h3 className="text-lg font-medium text-foreground mb-2">今すぐ楽曲を検証</h3>
                <p className="text-sm text-muted-foreground">
                  WAV・MP3・FLACファイルをアップロードすると、AI検出結果がすぐに表示されます。無料プランあり。
                </p>
              </Link>
              <Link href="/blog/how-to-detect-ai-generated-music/" className="block p-6 rounded-lg border border-border hover:border-cyan-500/50 transition-colors">
                <h3 className="text-lg font-medium text-foreground mb-2">AI音楽の検出ガイド</h3>
                <p className="text-sm text-muted-foreground">
                  AI生成音楽を見分ける方法、注目すべき手がかり、ワークフローのベストプラクティスをまとめたガイドです。
                </p>
              </Link>
              <Link href="/vs/acrcloud/" className="block p-6 rounded-lg border border-border hover:border-cyan-500/50 transition-colors">
                <h3 className="text-lg font-medium text-foreground mb-2">比較: DetectX vs ACRCloud</h3>
                <p className="text-sm text-muted-foreground">
                  AI音楽検出におけるDetectXとACRCloudの違いを機能ごとに比較した資料です。
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 px-6 border-t border-border">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4">
              今すぐ検出を始める
            </h2>
            <p className="text-muted-foreground mb-8">
              無料で利用可能。ファイルをアップロードすれば、数秒で結果が得られます。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/verify-audio">
                <Button className="px-10 py-4 text-base font-medium">
                  無料でスキャン開始
                </Button>
              </Link>
              <Link href="/plan">
                <Button variant="outline" className="px-10 py-4 text-base font-medium">
                  料金プランを見る
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              WAV / MP3 / FLAC / AAC / OGG（最大100MB）対応。高速並列分析。
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">製品</h4>
              <div className="space-y-2">
                <Link href="/verify-audio" className="block text-sm text-muted-foreground hover:text-foreground">AI音楽検出ツール</Link>
                <Link href="/verify-voice" className="block text-sm text-muted-foreground hover:text-foreground">ボイスディープフェイク検出</Link>
                <Link href="/batch-verify" className="block text-sm text-muted-foreground hover:text-foreground">バッチスキャン</Link>
                <Link href="/plan" className="block text-sm text-muted-foreground hover:text-foreground">料金プラン</Link>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">リソース</h4>
              <div className="space-y-2">
                <Link href="/technology" className="block text-sm text-muted-foreground hover:text-foreground">テクノロジー</Link>
                <Link href="/research" className="block text-sm text-muted-foreground hover:text-foreground">リサーチ</Link>
                <Link href="/updates" className="block text-sm text-muted-foreground hover:text-foreground">アップデート</Link>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">会社情報</h4>
              <div className="space-y-2">
                <Link href="/about" className="block text-sm text-muted-foreground hover:text-foreground">会社概要</Link>
                <Link href="/contact" className="block text-sm text-muted-foreground hover:text-foreground">お問い合わせ</Link>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">Languages</h4>
              <div className="space-y-2">
                <Link href="/en/" className="block text-sm text-muted-foreground hover:text-foreground">English</Link>
                <Link href="/ko/" className="block text-sm text-muted-foreground hover:text-foreground">한국어</Link>
                <Link href="/ja/" className="block text-sm text-cyan-500 font-medium">日本語</Link>
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
              <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground">利用規約</Link>
              <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground">プライバシーポリシー</Link>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/50 mt-4 text-center">
            Suno、Udio およびその他の製品名は各所有者の商標です。DetectX は Suno または Udio と提携・推奨関係にありません。
          </p>
        </div>
      </footer>
    </div>
  );
}
