import { useState } from "react";
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
import { Sun, Moon, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

/**
 * Contact Page
 * 
 * Purpose: Professional and institutional inquiries only
 * Tone: Calm, technical, institutional
 */

const inquiryTypes = [
  { value: "artist-creator", label: "Artist / Creator" },
  { value: "producer-studio", label: "Producer / Studio" },
  { value: "record-label", label: "Record Label / Publisher" },
  { value: "distributor-platform", label: "Distributor / Platform" },
  { value: "streaming-service", label: "Streaming Service" },
  { value: "association-institution", label: "Association / Institution" },
  { value: "research-academic", label: "Research / Academic Inquiry" },
  { value: "other-professional", label: "Other Professional Inquiry" },
];

export default function Contact() {
  const { theme, toggleTheme } = useTheme();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    inquiryType: "",
    name: "",
    organization: "",
    email: "",
    subject: "",
    message: "",
  });

  const contactMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Failed to submit inquiry. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.inquiryType || !formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    contactMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
              <Link href="/updates" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Updates
              </Link>
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Blog
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
              Contact
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Professional and institutional inquiries.
            </p>
          </div>

          {/* Disclaimer */}
          <div className="mb-12 border border-border rounded-lg p-6 bg-muted/30">
            <h2 className="text-lg font-medium text-foreground mb-4">Before You Contact Us</h2>
            <ul className="space-y-3 text-muted-foreground text-sm">
              <li className="flex items-start gap-3">
                <span className="text-foreground mt-1">•</span>
                <span>This is not consumer support. DetectX does not provide individual user assistance.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-foreground mt-1">•</span>
                <span>DetectX does not provide authorship certification or legal documentation.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-foreground mt-1">•</span>
                <span>Inquiries are reviewed for forensic relevance only. Not all inquiries will receive a response.</span>
              </li>
            </ul>
          </div>

          {submitted ? (
            /* Success State */
            <div className="text-center py-16 border border-border rounded-lg bg-card">
              <CheckCircle className="h-16 w-16 text-cyan-500 mx-auto mb-6" />
              <h2 className="text-2xl font-medium text-foreground mb-4">
                Inquiry Submitted
              </h2>
              <p className="text-muted-foreground mb-2">
                Your inquiry has been received and will be reviewed for forensic relevance.
              </p>
              <p className="text-sm text-muted-foreground">
                Not all inquiries will receive a response. Professional and institutional inquiries are prioritized.
              </p>
            </div>
          ) : (
            /* Contact Form */
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Your name"
                    className="bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Organization <span className="text-muted-foreground text-xs">(optional)</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => handleChange("organization", e.target.value)}
                    placeholder="Your organization"
                    className="bg-background"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="your@email.com"
                  className="bg-background"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleChange("subject", e.target.value)}
                  placeholder="Brief description of your inquiry"
                  className="bg-background"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <Textarea
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
                  disabled={contactMutation.isPending}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white w-full md:w-auto"
                >
                  {contactMutation.isPending ? "Submitting..." : "Submit Inquiry"}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                By submitting this form, you acknowledge that DetectX does not provide consumer support, authorship certification, or legal documentation. Inquiries are reviewed for forensic relevance only.
              </p>
            </form>
          )}
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
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/technology" className="hover:text-foreground transition-colors">Technology</Link>
              <Link href="/research" className="hover:text-foreground transition-colors">Research</Link>
              <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
