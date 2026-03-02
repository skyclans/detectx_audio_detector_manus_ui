import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

/**
 * Updates Page
 * 
 * Purpose: Record design decisions and system changes
 * Tone: Calm, technical, institutional
 */

export default function Updates() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-xl font-semibold tracking-tight text-foreground">
              DetectX
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/technology" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Technology
              </Link>
              <Link href="/research" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Research
              </Link>
              <Link href="/updates" className="text-sm text-foreground font-medium">
                Updates
              </Link>
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <Link href="/verify-audio">
                <Button variant="outline" className="text-sm font-medium">
                  Verify Audio
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-6">
          {/* Page Title */}
          <div className="mb-16">
            <h1 className="text-3xl md:text-4xl font-medium text-foreground mb-6">
              Updates
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Design decisions, system changes, and development notes.
            </p>
          </div>

          {/* Update Entry: 2026-03-02 */}
          <article className="mb-16 border border-border rounded-lg overflow-hidden">
            <div className="bg-muted/30 px-6 py-4 border-b border-border">
              <time className="text-sm font-mono text-muted-foreground">2026-03-02</time>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-medium text-foreground mb-6">
                Voice SSL v5: External False Positive Rate Reduced to 0.02%
              </h2>

              <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  The v5 multi-bonafide training approach resolved the critical external false positive problem identified in v2. By training on diverse bonafide sources beyond the original ASVspoof VCTK corpus, the model now correctly identifies real human speech from previously unseen recording environments.
                </p>

                <h3 className="text-lg font-medium text-foreground mt-8 mb-4">Problem</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Voice SSL v2 achieved strong detection metrics (EER 1.0%, 99.54% detection rate) but exhibited ~49% false positive rate on external bonafide datasets — LibriSpeech, FLEURS, and CommonVoice recordings were frequently misclassified as AI-generated. Root cause: the model had only seen VCTK-environment bonafide during training.
                </p>

                <h3 className="text-lg font-medium text-foreground mt-8 mb-4">Solution</h3>
                <p className="text-muted-foreground leading-relaxed">
                  v5 training incorporated bonafide samples from ASVspoof VCTK, LibriSpeech (~12,000), FLEURS (~7,000), and CommonVoice, totaling ~21,580 bonafide samples with domain-weighted sampling to maintain source balance.
                </p>

                <h3 className="text-lg font-medium text-foreground mt-8 mb-4">Results</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4 text-foreground font-medium">Metric</th>
                        <th className="text-left py-2 pr-4 text-foreground font-medium">v2</th>
                        <th className="text-left py-2 text-foreground font-medium">v5 (pc4)</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4">EER</td>
                        <td className="py-2 pr-4">1.00%</td>
                        <td className="py-2">1.00%</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4">Overall Detection</td>
                        <td className="py-2 pr-4">99.54%</td>
                        <td className="py-2">98.96%</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4">External Bonafide FP</td>
                        <td className="py-2 pr-4">~49%</td>
                        <td className="py-2 font-medium text-foreground">0.02% (2/8,775)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Training reproducibility was verified across 4 independent PCs with different hardware configurations. The pc4 model (Ultra 9 285K + RTX 5060) was selected as the v5 reference model.
                </p>

                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground italic">
                    v5 trade-off: A18 (waveform filter VC) detection dropped from 97.5% to 90.5%. A18 is a specialized ASVspoof 2019 synthesis method with limited real-world relevance.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Update Entry: 2026-03-01b */}
          <article className="mb-16 border border-border rounded-lg overflow-hidden">
            <div className="bg-muted/30 px-6 py-4 border-b border-border">
              <time className="text-sm font-mono text-muted-foreground">2026-03-01</time>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-medium text-foreground mb-6">
                Mass TTS Evaluation: 97.8% Detection Across Phone Conditions
              </h2>

              <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  Large-scale evaluation of the Voice SSL v2 engine across 5,328 TTS samples confirmed robust detection under real-world telephony conditions. The test covered 4 commercial TTS engines, 32 voices, and 8 phone environment simulations.
                </p>

                <h3 className="text-lg font-medium text-foreground mt-8 mb-4">Test Matrix</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-1">•</span>
                    <span><strong className="text-foreground">TTS Engines:</strong> ElevenLabs, OpenAI TTS-1, Google Cloud Neural2, Microsoft Edge TTS</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-1">•</span>
                    <span><strong className="text-foreground">Languages:</strong> English, Korean, Japanese, Chinese</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-1">•</span>
                    <span><strong className="text-foreground">Phone Conditions:</strong> G.711 codec, 8kHz resampling, background noise (SNR 10dB), short utterances (2 seconds), combined phone environment</span>
                  </li>
                </ul>

                <h3 className="text-lg font-medium text-foreground mt-8 mb-4">Key Findings</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4 text-foreground font-medium">Condition</th>
                        <th className="text-left py-2 text-foreground font-medium">Detection Rate</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4">Overall</td>
                        <td className="py-2 font-medium text-foreground">97.8%</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4">Phone environment (combined)</td>
                        <td className="py-2">99.5%</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4">G.711 codec</td>
                        <td className="py-2">99.8%</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4">Background noise (SNR 10dB)</td>
                        <td className="py-2">100%</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4">2-second utterances</td>
                        <td className="py-2">98.2%</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4">Korean / Japanese / Chinese</td>
                        <td className="py-2">100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  A counterintuitive finding: phone codec artifacts (G.711, 8kHz resampling) actually amplify AI signal evidence, making detection easier under telephony conditions than in clean audio. All 115 missed detections were English-language clean audio samples.
                </p>

                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground italic">
                    This evaluation used the Voice SSL v2 model trained exclusively on ASVspoof 2019 data, detecting commercial TTS engines released in 2025–2026.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Update Entry: 2026-03-01a */}
          <article className="mb-16 border border-border rounded-lg overflow-hidden">
            <div className="bg-muted/30 px-6 py-4 border-b border-border">
              <time className="text-sm font-mono text-muted-foreground">2026-03-01</time>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-medium text-foreground mb-6">
                Patent Application: Audio + Voice + Triple Engine
              </h2>

              <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  USPTO provisional patent specification completed, covering three core inventions: the multi-stage Audio verification engine (CNN + Reconstruction), the Voice deepfake detection engine (SSL-based), and the Triple Engine architecture that combines both for music containing vocal content.
                </p>

                <h3 className="text-lg font-medium text-foreground mt-8 mb-4">Coverage</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-1">•</span>
                    <span><strong className="text-foreground">Audio Engine:</strong> Multi-stage forensic verification with independent analysis engines and cross-validation consensus</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-1">•</span>
                    <span><strong className="text-foreground">Voice Engine:</strong> Self-supervised learning approach for deepfake voice detection optimized for telephony conditions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-1">•</span>
                    <span><strong className="text-foreground">Triple Engine:</strong> Unified architecture applying both audio and voice analysis to vocal-containing music for comprehensive verification</span>
                  </li>
                </ul>

                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground italic">
                    Filing status: Patent pending. Specific technical details are protected under the pending application.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Update Entry: 2026-02-27 */}
          <article className="mb-16 border border-border rounded-lg overflow-hidden">
            <div className="bg-muted/30 px-6 py-4 border-b border-border">
              <time className="text-sm font-mono text-muted-foreground">2026-02-27</time>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-medium text-foreground mb-6">
                DetectX Voice Engine: SSL v2 Approved for Production
              </h2>

              <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  The Voice deepfake detection engine reached production readiness. Voice SSL v2 uses wav2vec 2.0 large (317M parameters) with partial fine-tuning and weighted layer aggregation, achieving EER 1.0% on the ASVspoof 2019 LA evaluation set.
                </p>

                <h3 className="text-lg font-medium text-foreground mt-8 mb-4">Architecture Decision</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The original voice PoC used mel-spectrogram + ResNet18, which achieved functional but suboptimal results (EER 2–6%). Analysis of published research showed self-supervised learning frontends outperform spectrogram approaches by 10–50x on equal error rate. The architecture was upgraded to SSL (wav2vec 2.0) with an Attention Pooling + MLP backend.
                </p>

                <h3 className="text-lg font-medium text-foreground mt-8 mb-4">Performance</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4 text-foreground font-medium">Metric</th>
                        <th className="text-left py-2 pr-4 text-foreground font-medium">PoC (mel+ResNet)</th>
                        <th className="text-left py-2 pr-4 text-foreground font-medium">SSL PoC</th>
                        <th className="text-left py-2 text-foreground font-medium">SSL v2</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4">EER</td>
                        <td className="py-2 pr-4">~4%</td>
                        <td className="py-2 pr-4">1.5%</td>
                        <td className="py-2 font-medium text-foreground">1.0%</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4">Overall Detection</td>
                        <td className="py-2 pr-4">89.96%</td>
                        <td className="py-2 pr-4">98.5%</td>
                        <td className="py-2 font-medium text-foreground">99.54%</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4">Weakest System</td>
                        <td className="py-2 pr-4">A17: 52%</td>
                        <td className="py-2 pr-4">A17: 96.5%</td>
                        <td className="py-2 font-medium text-foreground">A18: 97.5%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  All 13 unseen attack systems in ASVspoof 2019 LA were detected at 97.5% or above. The AASIST graph attention backend (v3) was evaluated and rejected — it exhibited overfitting and worse performance than the simpler Attention Pooling + MLP approach.
                </p>

                <h3 className="text-lg font-medium text-foreground mt-8 mb-4">Real-World TTS Validation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Initial validation against 55 commercial TTS samples (ElevenLabs, OpenAI, Google Cloud — 13 voices, 2 languages) achieved 100% detection rate. The model was trained only on ASVspoof 2019 academic data but successfully generalized to 2025–2026 commercial TTS engines.
                </p>

                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground italic">
                    This update documents the progression from PoC to production-ready voice detection. The Voice engine is the foundation for DetectX's voice phishing prevention capabilities.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Update Entry: 2026-01-17 */}
          <article className="mb-16 border border-border rounded-lg overflow-hidden">
            <div className="bg-muted/30 px-6 py-4 border-b border-border">
              <time className="text-sm font-mono text-muted-foreground">2026-01-17</time>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-medium text-foreground mb-6">
                Enhanced Mode: Dual-Engine Architecture Released
              </h2>

              <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  DetectX Audio now operates exclusively in Enhanced Mode, a dual-engine verification architecture designed to maximize human protection while maintaining effective AI detection.
                </p>

                <h3 className="text-lg font-medium text-foreground mt-8 mb-4">Architecture Overview</h3>
                {/* Dual-Engine Diagram */}
                <div className="my-6">
                  <img
                    src="/images/update1_dual_engine_architecture.png"
                    alt="Dual-engine architecture release"
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Enhanced Mode combines two complementary engines working in sequence:
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-1">•</span>
                    <span><strong className="text-foreground">DetectX Engine (Primary):</strong> A deep learning engine trained on over 30,000,000 verified human music samples. Optimized for near-zero false positives. If the DetectX Engine determines content is human, the verdict is trusted immediately.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-1">•</span>
                    <span><strong className="text-foreground">Reconstruction Engine (Secondary):</strong> Activates when the DetectX Engine score exceeds the threshold. Analyzes stem separation and reconstruction patterns to boost AI detection accuracy.</span>
                  </li>
                </ul>

                <h3 className="text-lg font-medium text-foreground mt-8 mb-4">Performance Characteristics</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-1">•</span>
                    <span><strong className="text-foreground">Human False Positive Rate:</strong> &lt;1% — human creators are protected</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-1">•</span>
                    <span><strong className="text-foreground">AI Detection Rate:</strong> Strong detection for confirmed AI-generated content</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-1">•</span>
                    <span><strong className="text-foreground">Binary Verdicts:</strong> No probabilistic scores, only structural observations</span>
                  </li>
                </ul>

                <h3 className="text-lg font-medium text-foreground mt-8 mb-4">Design Philosophy</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The dual-engine approach prioritizes human safety as a hard constraint. By using the DetectX Engine as the primary filter, the system ensures that human creative work is never unfairly flagged. The Reconstruction Engine serves as a secondary check only when the primary engine indicates potential AI content.
                </p>

                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground italic">
                    This update documents a system architecture change. Performance metrics are based on internal testing and may vary with different content types.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Update Entry: 2026-01-12 */}
          <article className="mb-16 border border-border rounded-lg overflow-hidden">
            <div className="bg-muted/30 px-6 py-4 border-b border-border">
              <time className="text-sm font-mono text-muted-foreground">2026-01-12</time>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-medium text-foreground mb-6">
                Human Baseline Minimal Strategy Locked
              </h2>
              
              <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  After extensive testing across multiple baseline construction approaches, the minimal strategy has been locked for production deployment.
                </p>

                <h3 className="text-lg font-medium text-foreground mt-8 mb-4">Decision Summary</h3>
                {/* Baseline Strategy Diagram */}
                <div className="my-6">
                  <img
                    src="/images/update2_human_baseline_minimal_strategy.png"
                    alt="Baseline strategy comparison: minimal vs expansive"
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  The human baseline will be constructed using a minimal, high-confidence corpus rather than an expansive, diverse corpus. This decision prioritizes false positive prevention over detection sensitivity.
                </p>

                <h3 className="text-lg font-medium text-foreground mt-8 mb-4">Rationale</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-1">•</span>
                    <span>Larger baselines increase the risk of including edge-case human content that resembles AI patterns, leading to baseline contamination.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-1">•</span>
                    <span>Minimal baselines with strict provenance verification provide cleaner separation between human and AI signal geometry.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-1">•</span>
                    <span>False positives (human work flagged as AI) cause more harm than false negatives (AI work not detected). The minimal strategy optimizes for human safety.</span>
                  </li>
                </ul>

                <h3 className="text-lg font-medium text-foreground mt-8 mb-4">Implementation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The DetectX Engine has been trained on over 30,000,000 verified human-created audio samples spanning diverse genre categories. Each sample has documented provenance including recording session metadata, artist verification, and production chain attestation.
                </p>

                <h3 className="text-lg font-medium text-foreground mt-8 mb-4">Validation Results</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Testing against a held-out validation set of 800 verified human samples showed zero false positives. Testing against a corpus of 1,200 AI-generated samples showed 94.2% detection rate.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  The 5.8% of AI samples not detected exhibited signal geometry within human baseline parameters. These samples are being analyzed to determine whether baseline expansion is warranted or whether they represent legitimate edge cases.
                </p>

                <h3 className="text-lg font-medium text-foreground mt-8 mb-4">Next Steps</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-1">•</span>
                    <span>Deploy minimal baseline to production verification pipeline</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-1">•</span>
                    <span>Monitor false positive reports and baseline performance metrics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-1">•</span>
                    <span>Continue analysis of undetected AI samples for potential baseline refinement</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-1">•</span>
                    <span>Document baseline versioning and update procedures</span>
                  </li>
                </ul>

                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground italic">
                    This update documents a design decision. It does not constitute a guarantee of system performance or accuracy.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Archive Notice */}
          <div className="text-center py-12 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Previous updates will be archived here as the system evolves.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 mt-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <p className="text-sm text-muted-foreground">
                DetectX does not determine authorship. It reports structural signal observations only.
              </p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <Link href="/technology" className="hover:text-foreground transition-colors">Technology</Link>
              <Link href="/research" className="hover:text-foreground transition-colors">Research</Link>
              <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
              <span className="text-muted-foreground/30">|</span>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
