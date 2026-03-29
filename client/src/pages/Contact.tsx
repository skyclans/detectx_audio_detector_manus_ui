import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon, Mail, Send, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const SUPPORT_EMAIL = "support@detectx.app";

const inquiryTypes = [
  { value: "billing-payment", label: "Billing / Payment" },
  { value: "refund-request", label: "Refund Request" },
  { value: "service-issue", label: "Service Issue / Bug Report" },
  { value: "enterprise-sales", label: "Enterprise Sales" },
  { value: "artist-creator", label: "Artist / Creator" },
  { value: "producer-studio", label: "Producer / Studio" },
  { value: "record-label", label: "Record Label / Publisher" },
  { value: "distributor-platform", label: "Distributor / Platform" },
  { value: "research-academic", label: "Research / Academic" },
  { value: "other", label: "Other" },
];

export default function Contact() {
  const { theme, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    inquiryType: "",
    name: "",
    organization: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Pre-fill inquiry type from URL params (e.g., /contact?type=enterprise-sales)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    if (type && inquiryTypes.some((t) => t.value === type)) {
      setFormData((prev) => ({ ...prev, inquiryType: type }));
      window.history.replaceState({}, "", "/contact");
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.inquiryType || !formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to send inquiry");
      }

      setSubmitted(true);
      toast.success("Your inquiry has been sent. We'll get back to you soon!");
      setFormData({
        inquiryType: "",
        name: "",
        organization: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/detectx-logo.png" alt="DetectX" className="w-8 h-8 object-contain" />
              <span className="text-xl font-semibold tracking-tight text-foreground">DetectX</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/technology" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Technology
              </Link>
              <Link href="/research" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Research
              </Link>
              <Link href="/updates" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Updates
              </Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-sm text-foreground font-medium">
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
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-medium text-foreground mb-6">
              Contact Us
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We're here to help. Reach out for billing questions, technical support, enterprise inquiries, or any other feedback.
            </p>
          </div>

          {/* Direct Email */}
          <div className="mb-12 border border-border rounded-lg p-6 bg-muted/30">
            <div className="flex items-center gap-3 mb-3">
              <Mail className="w-5 h-5 text-cyan-500" />
              <h2 className="text-lg font-medium text-foreground">Email Us Directly</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              For all inquiries, you can email us at:
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-cyan-500 hover:text-cyan-400 font-medium text-lg transition-colors"
            >
              {SUPPORT_EMAIL}
            </a>
            <p className="text-xs text-muted-foreground mt-3">
              We typically respond within 1-2 business days. Pro and Studio subscribers receive priority support.
            </p>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-lg font-medium text-foreground">Or use the form below</h2>

            {/* Inquiry Type */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Inquiry Type <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.inquiryType}
                onValueChange={(value) => handleChange("inquiryType", value)}
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Select inquiry type" />
                </SelectTrigger>
                <SelectContent>
                  {inquiryTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Name and Organization */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contact-name" className="block text-sm font-medium text-foreground mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Your name"
                  className="bg-background"
                />
              </div>
              <div>
                <label htmlFor="contact-organization" className="block text-sm font-medium text-foreground mb-2">
                  Organization <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <Input
                  id="contact-organization"
                  name="organization"
                  type="text"
                  autoComplete="organization"
                  value={formData.organization}
                  onChange={(e) => handleChange("organization", e.target.value)}
                  placeholder="Your organization"
                  className="bg-background"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium text-foreground mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <Input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="your@email.com"
                className="bg-background"
              />
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="contact-subject" className="block text-sm font-medium text-foreground mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <Input
                id="contact-subject"
                name="subject"
                type="text"
                autoComplete="off"
                value={formData.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
                placeholder="Brief description of your inquiry"
                className="bg-background"
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="contact-message" className="block text-sm font-medium text-foreground mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="contact-message"
                name="message"
                autoComplete="off"
                value={formData.message}
                onChange={(e) => handleChange("message", e.target.value)}
                placeholder="Describe your inquiry in detail"
                rows={6}
                className="bg-background resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-cyan-600 hover:bg-cyan-700 text-white w-full md:w-auto"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Inquiry
                  </>
                )}
              </Button>
            </div>

            {submitted && (
              <div className="flex items-center gap-2 text-sm text-green-500">
                <CheckCircle className="w-4 h-4" />
                <span>Thank you! We've received your inquiry and will respond within 1-2 business days.</span>
              </div>
            )}
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 mt-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <p className="text-sm text-muted-foreground">
                DetectX — AI-generated audio detection and verification.
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
