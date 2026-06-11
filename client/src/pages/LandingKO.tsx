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

export default function LandingKO() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, loading, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="AI 음악 감지기 | Suno, Udio AI 생성곡 무료 탐지"
        description="96.8% 정확도의 무료 AI 음악 탐지 도구. Suno, Udio 등 AI 생성 음악을 다중 엔진 딥러닝 기술로 판별합니다. 음반사, 스트리밍 플랫폼, 저작권 단체를 위해 설계되었습니다."
        path="/ko/"
      />
      {/* SoftwareApplication Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "DetectX AI 음악 감지기",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Web",
        "url": "https://detectx.app/ko/",
        "description": "Suno, Udio 등 AI 생성 음악을 96.8% 정확도로 탐지하는 다중 엔진 딥러닝 도구. 음반사, 스트리밍 플랫폼, 저작권 단체를 위해 설계되었습니다.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "description": "무료 플랜 제공"
        }
      }) }} />
      {/* FAQPage Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "DetectX는 AI 생성 음악을 어떻게 탐지하나요?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectX는 독자적인 다층 딥러닝 분석 기술을 사용합니다. 여러 AI 모델이 사람의 귀로는 감지할 수 없는 AI 생성 오디오 고유의 미세 패턴과 아티팩트를 탐지합니다. 다중 분석 엔진 간 교차 검증으로 Suno v5.5 기준 96.8% 탐지율을 달성하며, 사람이 만든 음악에 대한 오탐지를 최소화합니다."
            }
          },
          {
            "@type": "Question",
            "name": "DetectX의 정확도는 얼마인가요?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectX는 Suno v5.5 AI 생성 음악에 대해 96.8%의 탐지율을 달성합니다(모든 장르, 수만 곡 실전 테스트). 사람이 만든 음악에 대한 오탐지를 최소화하도록 설계되었습니다. 이는 현존 AI 음악 탐지 도구 중 가장 높은 정확도입니다."
            }
          },
          {
            "@type": "Question",
            "name": "Suno와 Udio 곡을 탐지할 수 있나요?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "네, DetectX는 Suno v5.5를 팝, 재즈, 클래식, 힙합, 일렉트로닉 등 모든 장르에서 96.8% 정확도로 탐지합니다. Udio 탐지율은 58%입니다. 각 AI 생성기의 고유한 합성 구조적 아티팩트를 식별합니다."
            }
          },
          {
            "@type": "Question",
            "name": "DetectX는 무료인가요?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "네, 다중 엔진 분석이 포함된 무료 플랜을 제공합니다. WAV, MP3, FLAC, AAC, OGG(최대 100MB) 파일을 업로드하면 즉시 AI 탐지 결과를 확인할 수 있습니다. 대량 처리(주당 최대 100만 곡)와 API 접근이 포함된 프로페셔널 플랜도 있습니다."
            }
          },
          {
            "@type": "Question",
            "name": "대량 스캔이 가능한가요?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "네, 음반사, 스트리밍 플랫폼, 유통사를 위한 대량 처리 기능을 제공합니다. 수백 곡에서 수백만 곡까지 자동 스캔이 가능하며, 엔터프라이즈 플랜은 주당 최대 100만 곡을 우선 처리하고 전용 API를 제공합니다."
            }
          },
          {
            "@type": "Question",
            "name": "다른 AI 음악 탐지 도구와 어떻게 다른가요?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DetectX는 세 가지 핵심 차별점이 있습니다. (1) 단일 모델보다 높은 정확도를 제공하는 다중 엔진 구조, (2) 음악과 음성 딥페이크 탐지를 하나의 플랫폼에서 제공, (3) 주당 100만 곡까지 처리하는 엔터프라이즈급 대량 스캔. 오탐지를 최소화하도록 설계되었습니다."
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
              aria-label="모바일 메뉴 열기"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="flex items-center gap-2 md:gap-4">
              <button onClick={toggleTheme} className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="테마 전환">
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
              <Link href="/verify-audio"><Button className="text-sm font-medium">무료 스캔</Button></Link>
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
                  AI 음악 탐지 | Suno·Udio 즉시 판별
                </h1>
                <p className="text-lg text-muted-foreground mb-4">
                  오디오 파일을 업로드하면 즉시 AI 생성 여부를 판별합니다. Suno v5.5 기준 96.8% 정확도. 음반사, 스트리밍 플랫폼, 저작권 단체를 위해 설계된 AI 음악 탐지 도구입니다.
                </p>
                <p className="text-base text-muted-foreground mb-8">
                  무료 플랜 제공. WAV, MP3, FLAC, AAC, OGG 최대 100MB 지원.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-10">
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">96.8%</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Suno 탐지율</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">97.8%</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Voice Deepfake</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">Fast</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">분석 속도</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">All</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">장르 지원</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/verify-audio">
                    <Button className="px-8 py-3 text-base font-medium">
                      무료로 음원 스캔하기
                    </Button>
                  </Link>
                  <Link href="/batch-verify">
                    <Button variant="outline" className="px-8 py-3 text-base font-medium">
                      음반사용 대량 스캔
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="order-first md:order-last">
                <img
                  src="/images/herosection_new.png"
                  alt="DetectX AI 음악 감지기가 오디오 파일을 분석하는 화면 — Suno, Udio AI 생성 음악을 96.8% 정확도로 탐지"
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
              AI 생성 음악 탐지 방법
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              간단한 3단계로 음원의 AI 생성 여부를 확인할 수 있습니다. 모든 오디오 파일 형식을 지원합니다.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-lg bg-muted/20">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">1. 오디오 업로드</h3>
                <p className="text-sm text-muted-foreground">
                  드래그 앤 드롭 또는 파일 선택. WAV, MP3, FLAC, AAC, OGG 지원. 최대 100MB.
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-muted/20">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Cpu className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">2. 다중 엔진 분석</h3>
                <p className="text-sm text-muted-foreground">
                  여러 독자적 AI 모델이 오디오 패턴을 다차원으로 동시 분석합니다. 고속 병렬 처리로 빠르게 결과를 도출합니다.
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-muted/20">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">3. 판정 결과 확인</h3>
                <p className="text-sm text-muted-foreground">
                  AI 신호 감지 또는 미감지, 명확한 결과를 제공합니다. 모호한 퍼센트 없이 신뢰할 수 있는 판정입니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features / Why DetectX */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground text-center mb-4">
              DetectX가 가장 정확한 AI 음악 판별기인 이유
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              독자적 다중 엔진 구조로 모든 장르, 수만 곡의 실전 AI 음악 테스트를 통과했습니다.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 rounded-lg border border-border">
                <Zap className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">딥러닝 엔진</h3>
                <p className="text-muted-foreground text-sm">
                  모든 장르의 AI 생성 음악으로 학습한 독자 신경망입니다. Suno, Udio, ElevenLabs Music 등 AI 음악 생성기 고유의 구조적 패턴을 식별합니다.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border">
                <BarChart3 className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">다층 검증</h3>
                <p className="text-muted-foreground text-sm">
                  1차 분석 결과를 2차 엔진이 교차 검증합니다. 단일 모델로는 발견할 수 없는 아티팩트까지 감지하여 오탐지를 최소화합니다.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border">
                <Shield className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">대규모 일괄 처리</h3>
                <p className="text-muted-foreground text-sm">
                  수천 곡을 한 번에 스캔합니다. 대형 카탈로그를 효율적으로 처리해야 하는 음반사와 플랫폼을 위해 설계되었습니다. 엔터프라이즈 플랜은 주당 최대 100만 곡 처리를 지원합니다.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border">
                <Music className="h-8 w-8 text-cyan-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">우회 시도에도 탐지 유지</h3>
                <p className="text-muted-foreground text-sm">
                  MP3 변환, 피치 변경, 템포 조절, 노이즈 추가, 코덱 재인코딩 등 어떤 후처리를 거쳐도 탐지가 유지됩니다. 표면이 아닌 심층 구조를 분석합니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground text-center mb-4">
              AI 음악 탐지 도구 비교
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              DetectX와 시중 다른 AI 음악 탐지 도구의 비교입니다.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-foreground">기능</th>
                    <th className="text-center p-3 font-medium text-cyan-500">DetectX</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">ACRCloud</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Resemble AI</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">SubmitHub</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="p-3">Suno 탐지 정확도</td>
                    <td className="p-3 text-center font-medium text-foreground">96.8%</td>
                    <td className="p-3 text-center">미공개</td>
                    <td className="p-3 text-center">94%</td>
                    <td className="p-3 text-center">90%+</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3">다중 엔진 분석</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3">대량 처리</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3">음성 딥페이크 탐지</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3">무료 플랜</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center text-muted-foreground/50">-</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3">API 접근</td>
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
                  DetectX 무료 체험하기
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground text-center mb-4">
              AI 음악 탐지 활용 분야
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              개인 뮤지션부터 수백만 곡을 처리하는 대형 음반사까지, 다양한 고객이 활용합니다.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-lg border border-border">
                <Building2 className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">음반사</h3>
                <p className="text-xs text-muted-foreground">
                  AI 생성 콘텐츠 유입으로부터 카탈로그를 보호합니다. 수천 곡을 한 번에 일괄 스캔할 수 있습니다.
                </p>
              </div>
              <div className="p-5 rounded-lg border border-border">
                <Music className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">스트리밍 플랫폼</h3>
                <p className="text-xs text-muted-foreground">
                  매일 60,000곡 이상 업로드되는 AI 트랙을 자동으로 필터링합니다. 실시간 탐지를 위한 API 연동을 지원합니다.
                </p>
              </div>
              <div className="p-5 rounded-lg border border-border">
                <Shield className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">저작권 단체</h3>
                <p className="text-xs text-muted-foreground">
                  사기성 AI 등록으로부터 로열티 풀을 보호합니다. 분쟁 시 증거로 활용할 수 있는 분석 보고서를 제공합니다.
                </p>
              </div>
              <div className="p-5 rounded-lg border border-border">
                <Mic className="h-6 w-6 text-cyan-500 mb-3" />
                <h3 className="font-medium text-foreground mb-2 text-sm">뮤지션 & 프로듀서</h3>
                <p className="text-xs text-muted-foreground">
                  자신의 작품이 인간 창작물임을 증명할 수 있습니다. 협업자의 AI 사용 여부도 확인할 수 있습니다. 개인 사용 무료.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Supported AI Generators */}
        <section className="py-16 md:py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4">
              모든 주요 AI 음악 생성기 탐지
            </h2>
            <p className="text-muted-foreground mb-10 max-w-2xl mx-auto">
              후처리나 포맷 변환에 관계없이 모든 AI 음악 생성 플랫폼의 출력물을 식별합니다.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {["Suno v5.5", "Udio", "ElevenLabs Music", "Seed Music", "MiniMax", "Mureka", "Riffusion", "Sonauto", "AIVA", "Boomy"].map((name) => (
                <span key={name} className="px-4 py-2 bg-muted/30 rounded-full text-sm text-foreground border border-border/50">
                  {name}
                </span>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              MP3 변환, 피치 변경, 템포 조절 등 우회 시도에도 탐지가 유지됩니다.
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
                  alt="DetectX 음성 딥페이크 탐지 — AI 음성 복제 및 합성 음성 감지기"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
              <div>
                <h2 className="text-2xl font-medium text-foreground mb-4">
                  음성 딥페이크 탐지 — AI 음성 복제 감지기
                </h2>
                <p className="text-muted-foreground mb-4">
                  DetectX는 97.8% 정확도로 AI 생성 음성과 딥페이크 보이스를 탐지합니다. 실제 전화 환경에서 단 2초의 오디오로 작동합니다.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> ElevenLabs, Google TTS, OpenAI 탐지</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> 전화 코덱(G.711, 8kHz)에서 작동</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> 최소 2초 오디오 필요</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> 콜센터용 실시간 탐지</li>
                </ul>
                <Link href="/verify-voice">
                  <Button variant="outline" className="text-sm">
                    음성 탐지 체험하기
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
              DetectX 더 알아보기
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              지금 바로 곡을 검증하거나, 작동 원리를 읽거나, 다른 도구와 비교해 보세요.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/verify-audio/" className="block p-6 rounded-lg border border-border hover:border-cyan-500/50 transition-colors">
                <h3 className="text-lg font-medium text-foreground mb-2">지금 곡 검증하기</h3>
                <p className="text-sm text-muted-foreground">
                  WAV, MP3, FLAC 파일을 업로드하면 즉시 AI 탐지 결과를 확인할 수 있습니다. 무료 플랜 제공.
                </p>
              </Link>
              <Link href="/blog/how-to-detect-ai-generated-music/" className="block p-6 rounded-lg border border-border hover:border-cyan-500/50 transition-colors">
                <h3 className="text-lg font-medium text-foreground mb-2">AI 음악 탐지 가이드</h3>
                <p className="text-sm text-muted-foreground">
                  AI 생성 음악을 식별하는 방법, 단서 신호, 워크플로우 모범 사례에 대한 종합 가이드입니다.
                </p>
              </Link>
              <Link href="/vs/acrcloud/" className="block p-6 rounded-lg border border-border hover:border-cyan-500/50 transition-colors">
                <h3 className="text-lg font-medium text-foreground mb-2">비교: DetectX vs ACRCloud</h3>
                <p className="text-sm text-muted-foreground">
                  AI 음악 탐지에서 DetectX와 ACRCloud가 어떻게 다른지 기능별로 비교한 자료입니다.
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 px-6 border-t border-border">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4">
              AI 음악 탐지, 지금 시작하세요
            </h2>
            <p className="text-muted-foreground mb-8">
              첫 음원을 업로드하면 바로 결과를 확인할 수 있습니다. 무료 플랜 제공.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/verify-audio">
                <Button className="px-10 py-4 text-base font-medium">
                  무료로 음원 스캔하기
                </Button>
              </Link>
              <Link href="/plan">
                <Button variant="outline" className="px-10 py-4 text-base font-medium">
                  엔터프라이즈 플랜 보기
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              WAV, MP3, FLAC, AAC, OGG 최대 100MB 지원.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">제품</h4>
              <div className="space-y-2">
                <Link href="/verify-audio" className="block text-sm text-muted-foreground hover:text-foreground">AI 음악 감지기</Link>
                <Link href="/verify-voice" className="block text-sm text-muted-foreground hover:text-foreground">음성 딥페이크 감지기</Link>
                <Link href="/batch-verify" className="block text-sm text-muted-foreground hover:text-foreground">대량 스캔</Link>
                <Link href="/plan" className="block text-sm text-muted-foreground hover:text-foreground">요금제</Link>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">리소스</h4>
              <div className="space-y-2">
                <Link href="/technology" className="block text-sm text-muted-foreground hover:text-foreground">기술</Link>
                <Link href="/research" className="block text-sm text-muted-foreground hover:text-foreground">연구</Link>
                <Link href="/updates" className="block text-sm text-muted-foreground hover:text-foreground">업데이트</Link>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">회사</h4>
              <div className="space-y-2">
                <Link href="/about" className="block text-sm text-muted-foreground hover:text-foreground">회사 소개</Link>
                <Link href="/contact" className="block text-sm text-muted-foreground hover:text-foreground">문의하기</Link>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">Languages</h4>
              <div className="space-y-2">
                <Link href="/en/" className="block text-sm text-muted-foreground hover:text-foreground">English</Link>
                <Link href="/ko/" className="block text-sm text-cyan-500 font-medium">한국어</Link>
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
              <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground">이용약관</Link>
              <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground">개인정보처리방침</Link>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/50 mt-4 text-center">
            Suno, Udio 및 기타 제품명은 각 소유자의 상표입니다. DetectX는 Suno 또는 Udio와 제휴하거나 보증받지 않습니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
