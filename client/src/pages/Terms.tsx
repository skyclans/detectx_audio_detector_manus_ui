import { Link } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon, ArrowLeft } from "lucide-react";
import SEO from "@/components/SEO";

export default function Terms() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Terms of Service"
        description="DetectX Terms of Service. Read our terms for using the AI music and voice detection platform, including usage limits, data handling, and user responsibilities."
        path="/terms/"
      />
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Home</span>
            </Link>

            <Link href="/" className="flex items-center gap-2.5">
              <img src="/detectx-logo.png" alt="DetectX" className="w-8 h-8 object-contain" />
              <span className="text-xl font-semibold tracking-tight text-foreground">DetectX</span>
            </Link>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-12">
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Effective Date: June 18, 2026 | Last Updated: June 18, 2026
          </p>

          <p className="text-muted-foreground leading-relaxed">
            These Terms of Service ("Terms") govern your access to and use of the services, websites, applications, and tools (collectively, the "Service") provided by DetectX, Inc. ("DetectX," "we," "us," or "our").
          </p>
          <p className="text-muted-foreground leading-relaxed font-medium">
            By accessing or using the Service, you agree to be bound by these Terms.
          </p>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">1. Description of the Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              DetectX provides AI-based content verification and analysis tools, including but not limited to audio, text, image, and other digital content detection services ("Detector Services").
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong className="text-foreground">DetectX does not provide:</strong>
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Authorship determination</li>
              <li>Legal or forensic conclusions</li>
              <li>Probability, confidence, or similarity scores</li>
              <li>Guarantees of originality, human creation, or non-AI origin</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              All outputs are provided for informational and evidentiary reference only.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">2. Eligibility</h2>
            <p className="text-muted-foreground leading-relaxed">
              You must be at least 18 years old and legally capable of entering into a binding agreement to use the Service.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">3. User Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed">You agree to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
              <li>Use the Service only for lawful purposes</li>
              <li>Provide accurate and current information when required</li>
              <li>Not misuse, reverse engineer, probe, or attempt to extract proprietary models, logic, or thresholds</li>
              <li>Not represent DetectX outputs as definitive proof of authorship, legality, or infringement</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You are solely responsible for how you use the Service and its outputs.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">4. Nature and Limitations of Detection Results (Important)</h2>
            <p className="text-muted-foreground leading-relaxed">DetectX outputs:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
              <li>Are non-deterministic indicators, not factual assertions</li>
              <li>Do not establish legal authorship, ownership, infringement, or liability</li>
              <li>May be affected by ambiguity, incomplete data, or evolving AI generation techniques</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              DetectX disclaims any responsibility for decisions, actions, or outcomes based solely on Service outputs.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">5. No Legal, Financial, or Professional Advice</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service does not provide legal, tax, financial, or professional advice. You must consult qualified professionals before making decisions based on the Service.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">6. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All software, models, algorithms, interfaces, documentation, trademarks, and branding associated with the Service are the exclusive property of DetectX, Inc.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Except as expressly permitted, no rights are granted to users.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">7. License to Process User Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              By submitting content to the Service, you grant DetectX a limited, non-exclusive, non-transferable license to process such content solely for the purpose of providing the Service.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              DetectX does not claim ownership of user-submitted content.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">8. Data Handling and Retention</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Content is processed primarily on an ephemeral basis</li>
              <li>DetectX does not sell user content</li>
              <li>Storage and retention depend on Service tier, configuration, and user choice</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Further details are provided in the <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">9. Email Communications</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>By creating an account, you consent to receive transactional emails necessary for the operation of the Service, including account, billing, security, dispute response, and service announcement messages.</li>
              <li>Marketing emails, including product updates, feature releases, and newsletters, require separate explicit opt-in. DetectX will not send marketing emails to users who have not provided express consent.</li>
              <li>You may withdraw marketing consent at any time, without effect on your account status or your continued access to the Service. Withdrawal does not affect transactional emails.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Additional details, including the legal bases for processing and the retention period for email logs, are provided in the <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">10. Service Availability</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis. DetectX does not guarantee uninterrupted, error-free, or continuous operation.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">11. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">To the maximum extent permitted by law:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
              <li>DetectX shall not be liable for indirect, incidental, consequential, or special damages</li>
              <li>DetectX shall not be liable for loss of profits, data, reputation, or business opportunity</li>
              <li>DetectX's total liability shall not exceed the amount paid by you to DetectX in the preceding twelve (12) months</li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">12. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">DetectX may suspend or terminate access to the Service at any time for:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
              <li>Violation of these Terms</li>
              <li>Misuse of the Service</li>
              <li>Compliance with legal obligations</li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">13. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict-of-law principles.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">14. Third-Party References & Trademarks</h2>
            <p className="text-muted-foreground leading-relaxed">
              DetectX is an independent analysis tool. Any mention of third-party services, platforms, or products — including but not limited to Suno, Udio, ElevenLabs, OpenAI, ACRCloud, and Resemble AI — is for identification and interoperability purposes only and does not imply any affiliation, endorsement, or sponsorship by those parties.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              All third-party trademarks, service marks, trade names, and logos are the property of their respective owners. DetectX uses these names solely to describe the compatibility and detection capabilities of the Service in a factual, non-disparaging manner consistent with nominative fair use principles.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              By using the Service, you acknowledge and agree to this interpretation of third-party references throughout the DetectX platform, documentation, and marketing materials.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">15. Credit System</h2>
            <p className="text-muted-foreground leading-relaxed">
              Access to detection features is metered through a credit-based system.
            </p>
            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">a. Credit Consumption</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>One (1) Music scan consumes one (1) credit.</li>
              <li>Voice scans consume zero (0) credits while the Voice detection feature remains in Beta (see Section 18).</li>
              <li>Stem Evidence generation (Demucs-based four-stem separation) consumes ten (10) credits per track. Studio tier users receive five (5) free Stem Evidence runs per billing cycle, after which the standard 10-credit rate applies.</li>
              <li>Generator version identification (where available) consumes one (1) additional credit per scan and is offered to Pro tier and above.</li>
            </ul>
            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">b. Monthly Reset and Roll-Over</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Subscription credits are granted at the start of each billing cycle in the amount specified by your plan and reset at the start of the next billing cycle.</li>
              <li>Top-up credits purchased outside of a subscription grant also reset at the start of each billing cycle and do not roll over.</li>
              <li>Free tier users receive thirty (30) credits per calendar month, which reset on the same day each month.</li>
              <li>Unused credits, whether from a subscription or a top-up pack, are forfeited at cycle end. DetectX does not provide a credit roll-over mechanism.</li>
            </ul>
            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">c. Top-Up Credits</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Top-up credit packs are one-time purchases applied to your account immediately upon successful payment.</li>
              <li>Top-up credits are non-refundable except as required by applicable law or as described in Section 16(c).</li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">16. Subscription, Billing, and Refunds</h2>
            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">a. Plans</h3>
            <p className="text-muted-foreground leading-relaxed">
              DetectX offers a tiered subscription model consisting of Free, Basic, Pro, Studio, and Enterprise plans. Credit allocations, included features, and pricing for each tier are published on the DetectX pricing page and may be revised from time to time with reasonable notice.
            </p>
            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">b. Billing Cycle</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Paid subscriptions are billed monthly in advance on the calendar day corresponding to your initial subscription date.</li>
              <li>Credit grants are issued at the start of each billing cycle and expire at the end of that cycle as described in Section 15.</li>
            </ul>
            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">c. Cancellation and Refunds</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>You may cancel your subscription at any time. Cancellation takes effect at the end of the then-current billing cycle, and you retain access to the Service and unused credits until that date.</li>
              <li>Unused credits at the time of cancellation are forfeited and are not refundable.</li>
              <li>Top-up credit purchases are non-refundable.</li>
              <li>Notwithstanding the foregoing, charges resulting from a verified billing system error (for example, duplicate charges, charges to a closed account, or charges in excess of the published plan price) are eligible for refund if reported to <a href="mailto:support@detectx.app" className="text-primary hover:underline">support@detectx.app</a> within thirty (30) days of the original charge date.</li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">17. Fair Use and Rate Limits</h2>
            <p className="text-muted-foreground leading-relaxed">
              To protect platform stability and ensure equitable access for all users, DetectX enforces per-minute API rate limits that vary by subscription tier.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
              <li>Pro tier: up to thirty (30) detection requests per minute.</li>
              <li>Studio tier: up to one hundred (100) detection requests per minute.</li>
              <li>Stem Evidence requests: up to five (5) requests per minute across all tiers.</li>
              <li>Free and Basic tier rate limits are published on the pricing page and may be more restrictive.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Excessive automated scanning, distributed scraping, credential sharing, or other patterns that exceed reasonable single-user usage are prohibited. DetectX reserves the right to review suspicious activity and, where warranted, to throttle, suspend, or terminate access to the Service without prior notice. DetectX will use reasonable efforts to notify the affected account holder when feasible.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">18. Voice Detection Beta</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>The Voice detection feature is provided as a Beta service. Models, thresholds, and accuracy characteristics are subject to ongoing improvement.</li>
              <li>DetectX makes no representation or warranty regarding the accuracy, completeness, or fitness for any particular purpose of Voice detection outputs during the Beta period.</li>
              <li>Voice scans are provided at no credit cost during the Beta period and are available to all tiers, subject to the rate limits described in Section 17.</li>
              <li>DetectX will provide reasonable advance notice through the Service and via email before transitioning Voice detection from Beta to a paid feature. Pricing, credit consumption, and tier eligibility for the post-Beta Voice feature have not yet been determined.</li>
              <li>Voice outputs must not be used as the sole basis for any legal, employment, financial, or accusatory decision. Section 4 applies in full to Voice outputs.</li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">19. Professional Forensic Reports</h2>
            <p className="text-muted-foreground leading-relaxed">
              Professional forensic reports prepared by DetectX personnel for evidentiary, regulatory, or litigation-support purposes ("Professional Forensic Reports") are not provided through the standard subscription tiers. Professional Forensic Reports are delivered exclusively under a separate written engagement agreement.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-4">
              <li>Engagements are scoped on a case-by-case basis. DetectX will respond to a Professional Forensic Report inquiry with a written quote within one (1) to seven (7) business days of receiving sufficient case information.</li>
              <li>Pricing is determined per engagement and typically ranges from USD $500 to USD $50,000 depending on scope, evidentiary requirements, and turnaround time. The applicable fee, scope of work, and deliverables are set out in the engagement agreement.</li>
              <li>DetectX's liability, refund eligibility, and scope of work for any Professional Forensic Report are limited to the terms set forth in the corresponding engagement agreement and are not governed by Section 16 of these Terms.</li>
              <li>Submission of an inquiry does not create an engagement, an attorney-client relationship, or any expert-witness obligation until a written engagement agreement is executed by both parties.</li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">20. Stem Evidence Output Retention</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Stem Evidence outputs (separated vocal, drums, bass, and other stems delivered in MP3 and WAV formats) are stored on DetectX servers for seven (7) days from the time of generation and are then automatically deleted.</li>
              <li>You are responsible for downloading and retaining your own copies of Stem Evidence outputs within the retention window. DetectX is not obligated to regenerate expired outputs free of charge; regeneration consumes credits at the standard Stem Evidence rate.</li>
              <li>Stem Evidence is not available on the Free tier. Free tier users will receive a prompt to upgrade when attempting to generate Stem Evidence.</li>
              <li>Standard PDF reports are available to all paid tiers and to Free tier users with tier-appropriate redactions. Redacted data fields can be unlocked by upgrading the subscription tier and do not require a separate purchase.</li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">21. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              DetectX, Inc.<br />
              c/o Legalinc Corporate Services Inc.<br />
              131 Continental Dr, Suite 305<br />
              Newark, DE 19713, USA<br />
              Email: <a href="mailto:support@detectx.app" className="text-primary hover:underline">support@detectx.app</a>
            </p>
          </section>
        </article>

        {/* Footer Links */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
          <p className="text-xs text-muted-foreground/50 mt-6">
            Suno, Udio, and other product names mentioned on this site are trademarks of their respective owners.
            DetectX is not affiliated with or endorsed by Suno or Udio.
          </p>
        </div>
      </main>
    </div>
  );
}
