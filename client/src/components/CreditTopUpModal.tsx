/**
 * CreditTopUpModal — 4 top-up packs + Stripe Checkout link.
 *
 * Backend contract (Phase 4): POST /api/stripe/create-topup-session
 *   body: { pack: "10k" | "50k" | "200k" | "1m" }
 *   resp: { checkout_url: string } | { url: string }
 *
 * Used from:
 *   - Sidebar credit widget (CreditBalanceSidebar)
 *   - Plan page Top-up section
 *   - CreditExhaustedModal
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchWithAuth } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const packs = [
  {
    id: "10k",
    credits: 10_000,
    price: 9,
    anchor: 14,
    discount: 36,
    mp3Min: 200,
    losslessMin: 153,
  },
  {
    id: "50k",
    credits: 50_000,
    price: 40,
    anchor: 69,
    discount: 42,
    mp3Min: 1_000,
    losslessMin: 769,
  },
  {
    id: "200k",
    credits: 200_000,
    price: 140,
    anchor: 249,
    discount: 44,
    mp3Min: 4_000,
    losslessMin: 3_076,
  },
  {
    id: "1m",
    credits: 1_000_000,
    price: 600,
    anchor: 1_200,
    discount: 50,
    mp3Min: 20_000,
    losslessMin: 15_384,
  },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreditTopUpModal({ open, onOpenChange }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleBuy = async (packId: string) => {
    setLoadingId(packId);
    try {
      const res = await fetchWithAuth("/api/stripe/create-topup-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack: packId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to create top-up session");
      }

      const data = await res.json();
      const url: string | undefined = data.checkout_url || data.url;
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to start top-up checkout.");
      setLoadingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Buy Credit Packs</DialogTitle>
          <DialogDescription>
            Top-up anytime. Credits never expire while your account is active.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          {packs.map((pack) => {
            const isLoading = loadingId === pack.id;
            const isFeatured = pack.id === "50k";
            return (
              <div
                key={pack.id}
                className={`border rounded-md p-4 flex flex-col transition-colors ${
                  isFeatured
                    ? "border-purple-500/70 bg-purple-500/5"
                    : "border-border hover:border-purple-500/70"
                }`}
              >
                <div className="text-2xl font-bold text-foreground">
                  {pack.credits.toLocaleString()}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  credits
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-gray-400 line-through text-sm">
                    ${pack.anchor}
                  </span>
                  <span className="text-3xl font-bold text-foreground">
                    ${pack.price}
                  </span>
                </div>
                <div className="mt-1">
                  <span className="inline-block px-2 py-0.5 bg-green-600 text-white text-[10px] font-bold rounded-full">
                    {pack.discount}% OFF
                  </span>
                </div>

                <div className="text-xs text-muted-foreground mt-3 space-y-0.5 flex-1">
                  <div>
                    ≈ {pack.mp3Min.toLocaleString()} MP3 min
                  </div>
                  <div>
                    ≈ {pack.losslessMin.toLocaleString()} Lossless min
                  </div>
                </div>

                <Button
                  onClick={() => handleBuy(pack.id)}
                  className="w-full mt-4"
                  size="sm"
                  variant={isFeatured ? "default" : "outline"}
                  disabled={loadingId !== null}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Redirecting…
                    </>
                  ) : (
                    "Buy Now"
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-muted-foreground text-center mt-4">
          Secure payment via Stripe. You will be redirected to Stripe Checkout.
        </p>
      </DialogContent>
    </Dialog>
  );
}
