/**
 * ForensicThankYou — confirmation page after Forensic request submission.
 *
 * Route: /forensic/thank-you[?request_id=…]
 */

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ForensicLayout } from "@/components/ForensicLayout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Mail, Clock, FileText } from "lucide-react";

export default function ForensicThankYou() {
  const [, setLocation] = useLocation();
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRequestId(params.get("request_id"));
  }, []);

  return (
    <ForensicLayout
      title="Request Received"
      subtitle="Thank you for contacting DetectX"
    >
      <SEO
        title="Thank You — Forensic Report Request Received | DetectX"
        description="DetectX has received your Professional Forensic Report request and will respond by email within 1-7 business days."
        path="/forensic/thank-you/"
      />
      <div className="max-w-2xl">
        <div className="forensic-panel">
          <div className="forensic-panel-content text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-forensic-green/15 mb-6">
              <CheckCircle2 className="w-9 h-9 text-forensic-green" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Request Received
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Thank you. DetectX will respond by email within 1-7 business days
              with a tailored quote and next steps.
            </p>

            {requestId && (
              <div className="inline-block bg-muted/40 rounded-md px-4 py-2 text-xs mb-6">
                <span className="text-muted-foreground">Request ID:</span>{" "}
                <code className="font-mono text-foreground">{requestId}</code>
              </div>
            )}

            <div className="text-left max-w-md mx-auto space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 text-forensic-cyan flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Email response
                  </p>
                  <p className="text-xs text-muted-foreground">
                    We will reach out via the address you provided.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 mt-0.5 text-forensic-cyan flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Turnaround: 1-7 business days
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Urgent cases — mention the deadline in your notes.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 mt-0.5 text-forensic-cyan flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Track this request
                  </p>
                  <p className="text-xs text-muted-foreground">
                    View status and replies under "My Forensic Requests".
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => setLocation("/forensic/requests")}
              >
                View My Requests
              </Button>
              <Button onClick={() => setLocation("/verify-audio")}>
                Back to Scanner
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ForensicLayout>
  );
}
