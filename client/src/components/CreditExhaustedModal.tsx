/**
 * CreditExhaustedModal — shown when the user hits 402 (Payment Required)
 * during a scan or download because the credit balance is too low.
 *
 * Trigger sources:
 *   - Audio scan submit → 402 response from /verify-audio
 *   - PDF / Forensic export → 402 from /api/export/single
 *   - Stem separate → 402 from /api/stems/separate
 *
 * Backend contract (Phase 4):
 *   On 402, server returns:
 *     {
 *       detail: "...",
 *       required: number,
 *       balance: number,
 *       quality_tier: "standard" | "lossless" | "hires" | "audiophile",
 *       duration_sec: number,
 *       reset_in_days: number
 *     }
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreditTopUpModal } from "@/components/CreditTopUpModal";
import { Gem, Zap, Clock, CreditCard } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  required?: number;
  balance?: number;
  qualityTier?: string;
  durationSec?: number;
  resetInDays?: number;
}

export function CreditExhaustedModal({
  open,
  onClose,
  required = 0,
  balance = 0,
  qualityTier = "standard",
  durationSec = 0,
  resetInDays = 30,
}: Props) {
  const [, setLocation] = useLocation();
  const [showTopUp, setShowTopUp] = useState(false);

  const shortage = Math.max(0, required - balance);
  const minutes = Math.max(1, Math.ceil(durationSec / 60));

  // Suggested top-up = cheapest pack that covers the shortage
  let suggestedPack = "10k";
  let suggestedPrice = 9;
  let suggestedCredits = 10_000;
  if (shortage > 200_000) {
    suggestedPack = "1m";
    suggestedPrice = 600;
    suggestedCredits = 1_000_000;
  } else if (shortage > 50_000) {
    suggestedPack = "200k";
    suggestedPrice = 140;
    suggestedCredits = 200_000;
  } else if (shortage > 10_000) {
    suggestedPack = "50k";
    suggestedPrice = 40;
    suggestedCredits = 50_000;
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o) onClose();
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gem className="w-5 h-5 text-purple-500" />
              Out of Credits
            </DialogTitle>
            <DialogDescription>
              This scan needs more credits than you currently have.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-muted/30 rounded-md p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Required</span>
              <span className="font-mono font-medium">
                {required.toLocaleString()} cr
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Your balance</span>
              <span className="font-mono font-medium">
                {balance.toLocaleString()} cr
              </span>
            </div>
            <div className="flex justify-between border-t border-border/40 pt-1 mt-1">
              <span className="text-muted-foreground">Shortage</span>
              <span className="font-mono font-medium text-red-500">
                −{shortage.toLocaleString()} cr
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 pt-2 border-t border-border/40">
              {qualityTier} quality · {minutes} min
            </p>
          </div>

          <div className="space-y-3 mt-2">
            {/* Top-up suggestion */}
            <div className="border border-border rounded-md p-3 hover:border-purple-500/70 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-semibold">Quick Top-up</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-600 text-white font-bold">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {suggestedCredits.toLocaleString()} credits for ${suggestedPrice}
              </p>
              <Button
                onClick={() => setShowTopUp(true)}
                className="w-full mt-2"
                size="sm"
              >
                Top-up Now
              </Button>
            </div>

            {/* Upgrade suggestion */}
            <div className="border border-border rounded-md p-3 hover:border-forensic-cyan/70 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-forensic-cyan" />
                <span className="text-sm font-semibold">Or upgrade your plan</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Pro — $23 / month for 30,000 credits.
              </p>
              <Button
                onClick={() => {
                  onClose();
                  setLocation("/plan");
                }}
                variant="outline"
                className="w-full mt-2"
                size="sm"
              >
                See Plans
              </Button>
            </div>

            {/* Wait */}
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground justify-center">
              <Clock className="w-3 h-3" />
              Or wait — credits reset in {resetInDays} days.
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreditTopUpModal open={showTopUp} onOpenChange={setShowTopUp} />
    </>
  );
}
