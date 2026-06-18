/**
 * ReportTypeModal — Standard vs Professional Forensic chooser.
 *
 * Shown when the user clicks the PDF (or "Generate Report") button in
 * ExportPanel. Standard = current free PDF download. Professional =
 * Custom Quote flow → /forensic/request.
 */

import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, FileText, ShieldCheck, ArrowRight, Download } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  recordId?: string | null;
  onStandard: () => void;
}

export function ReportTypeModal({
  open,
  onClose,
  recordId,
  onStandard,
}: Props) {
  const [, setLocation] = useLocation();

  const handleStandard = () => {
    onStandard();
    onClose();
  };

  const handleProfessional = () => {
    const qs = recordId ? `?record_id=${encodeURIComponent(recordId)}` : "";
    setLocation(`/forensic/request${qs}`);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Choose Report Type</DialogTitle>
          <DialogDescription>
            DetectX produces two kinds of reports. Standard is included with
            every scan. Professional Forensic is a custom-quoted, legal-grade
            evidence package.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {/* Standard */}
          <button
            type="button"
            onClick={handleStandard}
            className="text-left border border-border rounded-md p-4 hover:border-purple-500/70 transition-colors flex flex-col"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-forensic-cyan" />
                <span className="text-sm font-semibold">STANDARD</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-forensic-green/20 text-forensic-green font-medium">
                Included
              </span>
            </div>
            <ul className="space-y-1.5 text-xs flex-1">
              <li className="flex gap-2">
                <Check className="w-3.5 h-3.5 text-forensic-green flex-shrink-0 mt-0.5" />
                <span>Verdict + Score</span>
              </li>
              <li className="flex gap-2">
                <Check className="w-3.5 h-3.5 text-forensic-green flex-shrink-0 mt-0.5" />
                <span>Stem visualization</span>
              </li>
              <li className="flex gap-2">
                <Check className="w-3.5 h-3.5 text-forensic-green flex-shrink-0 mt-0.5" />
                <span>Basic metadata</span>
              </li>
              <li className="flex gap-2">
                <Check className="w-3.5 h-3.5 text-forensic-green flex-shrink-0 mt-0.5" />
                <span>Audit hash (SHA-256)</span>
              </li>
            </ul>
            <div className="mt-4 inline-flex items-center justify-center gap-2 px-3 py-2 rounded bg-forensic-cyan text-background text-xs font-medium">
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </div>
          </button>

          {/* Professional */}
          <button
            type="button"
            onClick={handleProfessional}
            className="text-left border-2 border-red-500/50 rounded-md p-4 hover:border-red-500 transition-colors bg-red-500/5 flex flex-col"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-500" />
                <span className="text-sm font-semibold">PROFESSIONAL</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-500 font-medium">
                Custom Quote
              </span>
            </div>
            <ul className="space-y-1.5 text-xs flex-1">
              <li className="flex gap-2">
                <Check className="w-3.5 h-3.5 text-forensic-green flex-shrink-0 mt-0.5" />
                <span>Everything in Standard +</span>
              </li>
              <li className="flex gap-2">
                <Check className="w-3.5 h-3.5 text-forensic-green flex-shrink-0 mt-0.5" />
                <span>Digital signature</span>
              </li>
              <li className="flex gap-2">
                <Check className="w-3.5 h-3.5 text-forensic-green flex-shrink-0 mt-0.5" />
                <span>Generator FP precise</span>
              </li>
              <li className="flex gap-2">
                <Check className="w-3.5 h-3.5 text-forensic-green flex-shrink-0 mt-0.5" />
                <span>Plan estimation</span>
              </li>
              <li className="flex gap-2">
                <Check className="w-3.5 h-3.5 text-forensic-green flex-shrink-0 mt-0.5" />
                <span>DDEX auto-disclosure</span>
              </li>
              <li className="flex gap-2">
                <Check className="w-3.5 h-3.5 text-forensic-green flex-shrink-0 mt-0.5" />
                <span>Multilingual PDF (EN/JA/KO)</span>
              </li>
              <li className="flex gap-2">
                <Check className="w-3.5 h-3.5 text-forensic-green flex-shrink-0 mt-0.5" />
                <span>Expert review certification</span>
              </li>
            </ul>
            <div className="mt-4 inline-flex items-center justify-center gap-2 px-3 py-2 rounded bg-red-500 text-white text-xs font-medium">
              Request Quote
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>

        <Button variant="ghost" size="sm" onClick={onClose} className="self-end">
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default ReportTypeModal;
