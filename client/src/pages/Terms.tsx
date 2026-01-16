import { Link } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon, ArrowLeft } from "lucide-react";

export default function Terms() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Home</span>
            </Link>

            <Link href="/" className="text-xl font-semibold tracking-tight text-foreground">
              DetectX
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
            Effective Date: January 17, 2026 | Last Updated: January 17, 2026
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
            <h2 className="text-xl font-semibold text-foreground mb-4">9. Service Availability</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis. DetectX does not guarantee uninterrupted, error-free, or continuous operation.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">10. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">To the maximum extent permitted by law:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
              <li>DetectX shall not be liable for indirect, incidental, consequential, or special damages</li>
              <li>DetectX shall not be liable for loss of profits, data, reputation, or business opportunity</li>
              <li>DetectX's total liability shall not exceed the amount paid by you to DetectX in the preceding twelve (12) months</li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">11. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">DetectX may suspend or terminate access to the Service at any time for:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
              <li>Violation of these Terms</li>
              <li>Misuse of the Service</li>
              <li>Compliance with legal obligations</li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">12. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict-of-law principles.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">13. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              DetectX, Inc.<br />
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
        </div>
      </main>
    </div>
  );
}
