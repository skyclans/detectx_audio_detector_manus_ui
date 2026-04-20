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
        title="Suno・Udio AI生成楽曲を即座に検出 | DetectX"
        description="Suno v5.5で96.8%の精度を誇る無料AI音楽検出ツール。マルチレイヤーDeep Learning分析でAI生成楽曲を判定。レコード会社、ストリーミングプラットフォーム、著作権団体向けのAI音楽判定ツール。"
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
        "description": "Suno、Udio等のAI生成楽曲を96.8%の精度で検出するマルチレイヤーDeep Learning分析ツール。レコード会社、ストリーミングプラットフォーム、著作権団体向けのAI音楽判定ツールです。",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "description": "無料プランあり"
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
            "name": "DetectXはどのようにAI生成音楽を検出しますか？",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectXは独自のマルチレイヤーディープラーニング分析を使用します。複数のAIモデルが、人間の耳では検知できないAI生成オーディオ固有の微細パターンとアーティファクトを検出します。複数の分析エンジン間のクロスバリデーションにより、Suno v5.5で96.8%の検出率と98.89%のヒューマンプロテクション率を実現しています。"
            }
          },
          {
            "@type": "Question",
            "name": "DetectXの精度はどのくらいですか？",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectXはSuno v5.5のAI生成楽曲に対して96.8%の検出率を達成しています（16ジャンル、995曲でテスト済み）。ヒューマンプロテクション率は98.89%で、人間が制作した楽曲をAIと誤判定するフォルスポジティブはほぼゼロです。これは現存するAI音楽検出ツールの中で最高精度です。"
            }
          },
          {
            "@type": "Question",
            "name": "SunoやUdioの楽曲を検出できますか？",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "はい、可能です。DetectXはSuno v5.5をポップ、ジャズ、クラシック、ヒップホップ、エレクトロニックなど全ジャンルで96.8%の精度で検出します。Udoの検出率は58%です。各AI生成ツール固有の合成構造アーティファクトを特定します。"
            }
          },
          {
            "@type": "Question",
            "name": "DetectXは無料ですか？",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "はい、DetectXはマルチエンジン分析を含む無料プランを提供しています。どのオーディオファイル（WAV、MP3、FLAC、AAC、OGG、最大100MB）でもアップロードすれば、即座にAI検出結果を取得できます。バッチ処理（週最大100万曲）とAPIアクセスが可能なプロフェッショナルプランもご用意しています。"
            }
          },
          {
            "@type": "Question",
            "name": "大量スキャンに対応していますか？",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "はい、DetectXはレコード会社、ストリーミングプラットフォーム、ディストリビューター向けのバッチ処理機能を提供しています。数百曲から数百万曲まで自動スキャンが可能です。エンタープライズプランでは週最大100万曲の優先処理と専用APIアクセスを提供します。"
            }
          },
          {
            "@type": "Question",
            "name": "他のAI音楽検出ツールとの違いは？",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectXには3つの主要な差別化ポイントがあります。(1) 単一モデル検出器より高い精度を実現するマルチエンジン構造、(2) 音楽とボイスディープフェイク検出を一つのプラットフォームで提供、(3) 週最大100万曲処理可能なエンタープライズグレードのバッチ処理。業界最低のフォルスポジティブ率を誇る特許出願済み技術です。"
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
                <h1 className="text-3xl md:text-4xl font-medium leading-tight text-foreground mb-6">
                  Suno・Udio AI生成楽曲を即座に検出
                </h1>
                <p className="text-lg text-muted-foreground mb-4">
                  オーディオファイルをアップロードするだけで、即座にAI生成かどうかを判定します。Suno v5.5で96.8%の精度。世界中のレコード会社、ストリーミングプラットフォーム、著作権団体向けのAI音楽検出ツール。
                </p>
                <p className="text-base text-muted-foreground mb-8">
                  無料プラン提供中。WAV、MP3、FLAC、AAC、OGG 最大100MBに対応。
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
                      レーベル向け大量スキャン
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
              AI生成楽曲の検出方法
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              3つの簡単なステップで楽曲がAI生成かどうかを確認できます。あらゆるオーディオファイル形式に対応。
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
                <h3 className="font-medium text-foreground mb-2">2. マルチエンジン分析</h3>
                <p className="text-sm text-muted-foreground">
                  複数の独自AIモデルがオーディオパターンを多次元で同時分析します。高速並列分析で結果を出力。
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-muted/20">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">3. 判定結果を取得</h3>
                <p className="text-sm text-muted-foreground">
                  明確な結果：AI信号の検出または非検出。曖昧なパーセンテージではなく、信頼できるエビデンスを提供します。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features / Why DetectX */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground text-center mb-4">
              DetectXが最も精度の高いAI音楽検出ツールである理由
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              特許出願済み技術によるマルチレイヤーDeep Learning分析。16ジャンル995曲のSuno v5.5トラックで検証済み。
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 rounded-lg border border-border">
                <Zap className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">ディープラーニングエンジン</h3>
                <p className="text-muted-foreground text-sm">
                  全ジャンル・大量のAI生成トラックで学習した独自ニューラルネットワーク。Suno、Udio、ElevenLabs MusicなどのAI音楽生成ツール固有の構造パターンを特定します。
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border">
                <BarChart3 className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">マルチレイヤー検証</h3>
                <p className="text-muted-foreground text-sm">
                  一次検出結果をクロスバリデーションする二次分析エンジン。単一モデル検出器では発見できないアーティファクトを検出し、最小の誤検出率で最大精度を実現します。
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border">
                <Shield className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">大規模バッチ処理</h3>
                <p className="text-muted-foreground text-sm">
                  数千曲を一度にスキャン可能。レコード会社やプラットフォーム向けに設計されたバッチ処理で、カタログ全体のAIコンテンツを効率的に検出します。
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border">
                <Music className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">回避耐性</h3>
                <p className="text-muted-foreground text-sm">
                  MP3変換、ピッチシフト、テンポ変更、ノイズ追加、コーデック再エンコードに対して堅牢。あらゆるポストプロセスに耐える深層構造特性を分析します。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground text-center mb-4">
              AI音楽検出ツール比較
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              DetectXと市場にある他のAI音楽検出ツールとの比較です。
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
              AI音楽検出の活用分野
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              個人ミュージシャンから数百万曲を処理する大手レコード会社まで。
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-lg border border-border">
                <Building2 className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">レコード会社</h3>
                <p className="text-xs text-muted-foreground">
                  大量の楽曲処理が可能。AIコンテンツからカタログを保護。数千曲の一括スキャン対応。
                </p>
              </div>
              <div className="p-5 rounded-lg border border-border">
                <Music className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">ストリーミングプラットフォーム</h3>
                <p className="text-xs text-muted-foreground">
                  AIアップロードを自動フィルタリング。毎日60,000曲以上のAIトラックがアップロードされています。リアルタイム検出のためのAPI連携。
                </p>
              </div>
              <div className="p-5 rounded-lg border border-border">
                <Shield className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">著作権団体</h3>
                <p className="text-xs text-muted-foreground">
                  世界中の著作権管理団体のロイヤリティプールを不正AI登録から保護します。紛争時に証拠レベルの分析レポートを提供します。
                </p>
              </div>
              <div className="p-5 rounded-lg border border-border">
                <Mic className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">ミュージシャン＆プロデューサー</h3>
                <p className="text-xs text-muted-foreground">
                  自身の作品を検証。人間による制作であることを証明。コラボレーターがAIを使用したか確認可能。個人利用は無料。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Supported AI Generators */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4">
              すべての主要AI音楽生成ツールを検出
            </h2>
            <p className="text-muted-foreground mb-10 max-w-2xl mx-auto">
              DetectXは、ポストプロセスやフォーマット変換に関係なく、あらゆるAI音楽生成プラットフォームのオーディオを識別します。
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {["Suno v5.5", "Udio", "ElevenLabs Music", "Seed Music", "MiniMax", "Mureka", "Riffusion", "Sonauto", "AIVA", "Boomy"].map((name) => (
                <span key={name} className="px-4 py-2 bg-muted/30 rounded-full text-sm text-foreground border border-border/50">
                  {name}
                </span>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              MP3変換、ピッチシフト、テンポ変更などの回避操作に関係なく検出が機能します。
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
                  ボイスディープフェイク検出 — AI音声クローン検出ツール
                </h2>
                <p className="text-muted-foreground mb-4">
                  DetectXは97.8%の精度でAI生成音声とディープフェイクボイスを検出します。実際の電話環境でわずか2秒のオーディオで動作します。
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> ElevenLabs、Google TTS、OpenAIを検出</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> 電話コーデック（G.711、8kHz）で動作</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> 最小2秒のオーディオが必要</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> コールセンター向けリアルタイム検出</li>
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

        {/* CTA Section */}
        <section className="py-20 md:py-28 px-6 border-t border-border">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4">
              今すぐAI生成楽曲の検出を始めましょう
            </h2>
            <p className="text-muted-foreground mb-8">
              無料プラン提供中。最初のトラックをアップロードすれば、数秒で結果が得られます。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/verify-audio">
                <Button className="px-10 py-4 text-base font-medium">
                  無料でスキャン開始
                </Button>
              </Link>
              <Link href="/plan">
                <Button variant="outline" className="px-10 py-4 text-base font-medium">
                  エンタープライズプランを見る
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              WAV、MP3、FLAC、AAC、OGG 最大100MBに対応。高速並列分析。
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
        </div>
      </footer>
    </div>
  );
}
