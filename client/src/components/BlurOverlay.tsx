import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlurOverlayProps {
  message?: string;
  onLogin: () => void;
}

/**
 * BlurOverlay Component
 * 
 * Displays a blur overlay with skeleton placeholders and login CTA
 * for non-logged-in users who have completed a verification scan.
 * 
 * Phase 3: Blur overlay implementation for preview mode
 */
export function BlurOverlay({ message, onLogin }: BlurOverlayProps) {
  return (
    <div className="relative">
      {/* Blurred skeleton content */}
      <div className="filter blur-md pointer-events-none select-none">
        {/* Skeleton verdict panel */}
        <div className="p-6 rounded-lg bg-card/50 border border-border/50 mb-4">
          <div className="h-6 w-48 bg-muted/50 rounded mb-3 animate-pulse" />
          <div className="h-4 w-full bg-muted/30 rounded mb-2 animate-pulse" />
          <div className="h-4 w-3/4 bg-muted/30 rounded animate-pulse" />
        </div>
        
        {/* Skeleton analysis sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Timeline Analysis skeleton */}
          <div className="p-4 rounded-lg bg-card/50 border border-border/50">
            <div className="h-5 w-32 bg-muted/50 rounded mb-3 animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-muted/30 rounded animate-pulse" />
              <div className="h-3 w-5/6 bg-muted/30 rounded animate-pulse" />
              <div className="h-3 w-4/5 bg-muted/30 rounded animate-pulse" />
            </div>
          </div>
          
          {/* Detailed Analysis skeleton */}
          <div className="p-4 rounded-lg bg-card/50 border border-border/50">
            <div className="h-5 w-36 bg-muted/50 rounded mb-3 animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-muted/30 rounded animate-pulse" />
              <div className="h-3 w-4/5 bg-muted/30 rounded animate-pulse" />
              <div className="h-3 w-5/6 bg-muted/30 rounded animate-pulse" />
            </div>
          </div>
          
          {/* Source Components skeleton */}
          <div className="p-4 rounded-lg bg-card/50 border border-border/50">
            <div className="h-5 w-40 bg-muted/50 rounded mb-3 animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-muted/30 rounded animate-pulse" />
              <div className="h-3 w-3/4 bg-muted/30 rounded animate-pulse" />
              <div className="h-3 w-5/6 bg-muted/30 rounded animate-pulse" />
            </div>
          </div>
        </div>
        
        {/* Geometry Scan skeleton */}
        <div className="p-4 rounded-lg bg-card/50 border border-border/50">
          <div className="h-5 w-44 bg-muted/50 rounded mb-3 animate-pulse" />
          <div className="h-24 w-full bg-muted/20 rounded animate-pulse" />
        </div>
      </div>
      
      {/* Overlay with login CTA */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg">
        <div className="text-center p-8 max-w-md">
          {/* Lock icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          
          {/* Message */}
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Analysis Complete
          </h3>
          <p className="text-muted-foreground mb-6">
            {message || "Sign in to view your full analysis results, access detailed reports, and save your verification history."}
          </p>
          
          {/* Google Sign In Button */}
          <Button
            onClick={onLogin}
            size="lg"
            className="w-full max-w-xs mx-auto flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </Button>
          
          {/* Additional info */}
          <p className="text-xs text-muted-foreground mt-4">
            Free account includes 5 verifications per month
          </p>
        </div>
      </div>
    </div>
  );
}
