import { Link } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon, ArrowLeft } from "lucide-react";

export default function Privacy() {
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Effective Date: January 17, 2026 | Last Updated: January 17, 2026
          </p>

          <p className="text-muted-foreground leading-relaxed">
            This Privacy Policy explains how DetectX, Inc. ("DetectX," "we," "us," or "our") collects, uses, and protects personal data in connection with the Service.
          </p>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">1. Information We Collect</h2>
            
            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">a. Information You Provide</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Name and email address</li>
              <li>Account and contact information</li>
              <li>Content submitted for analysis</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">b. Automatically Collected Information</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>IP address</li>
              <li>Device, browser, and system metadata</li>
              <li>Limited usage and security logs</li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">2. How We Use Information</h2>
            <p className="text-muted-foreground leading-relaxed">We use information to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
              <li>Operate and provide the Service</li>
              <li>Maintain security and prevent abuse</li>
              <li>Improve system stability and performance</li>
              <li>Comply with legal and regulatory obligations</li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">3. Content Processing and AI Analysis</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Submitted content is processed solely to provide analysis results</li>
              <li>DetectX does not use user content for advertising</li>
              <li>Any model improvement usage (if applicable) is anonymized and governed by internal policy</li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">4. Data Retention</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Content may be deleted automatically after processing</li>
              <li>Retention duration varies by Service tier and configuration</li>
              <li>Users may request deletion where applicable</li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">5. Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              DetectX does not sell personal data.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">We may share information only:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
              <li>With trusted service providers under confidentiality obligations</li>
              <li>To comply with legal requirements</li>
              <li>To protect the rights, safety, and integrity of DetectX and its users</li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">6. International Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              DetectX operates globally. By using the Service, you consent to the processing of information in the United States and other jurisdictions where DetectX operates.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">7. Security Measures</h2>
            <p className="text-muted-foreground leading-relaxed">
              DetectX implements reasonable technical and organizational safeguards. However, no system can guarantee absolute security.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">8. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              Depending on your jurisdiction, you may have rights to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
              <li>Access your personal data</li>
              <li>Request correction or deletion</li>
              <li>Object to or restrict certain processing</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Requests may be submitted to <a href="mailto:support@detectx.app" className="text-primary hover:underline">support@detectx.app</a>.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">9. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is not intended for children under the age of 13. DetectX does not knowingly collect personal data from children.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">10. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. Material changes will be communicated through the Service.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">11. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              DetectX, Inc.<br />
              Email: <a href="mailto:support@detectx.app" className="text-primary hover:underline">support@detectx.app</a>
            </p>
          </section>
        </article>

        {/* Footer Links */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
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
