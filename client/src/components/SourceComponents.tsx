/**
 * Source Components Section — replaced (2026-09-13)
 *
 * Per-instrument source component (stem) playback was removed from the public
 * site. Deep forensic analysis is offered on request instead.
 * Props are kept so existing render sites (Home, HomeTest) need no change.
 */

import { Layers, Mail } from "lucide-react";

interface StemComponent {
  id: string;
  name: string;
  available: boolean;
  downloadUrl?: string;
}

interface SourceComponentsData {
  components: StemComponent[];
}

interface SourceComponentsProps {
  data: SourceComponentsData | null;
  isProcessing?: boolean;
  stemVolumes?: Record<string, number>;
  onVolumeChange?: (stemId: string, volume: number) => void;
  onDownload?: (stemId: string) => void;
  /** Kept for interface compatibility; unused by the notice panel. */
  apiBaseUrl?: string;
}

const CONTACT_EMAIL = "support@detectx.app";

// Props are accepted but intentionally unused: the panel is a static notice now.
export function SourceComponents(_props: SourceComponentsProps) {
  return (
    <div className="forensic-panel h-full">
      <div className="forensic-panel-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-forensic-cyan" />
          <span>Deep Forensic Analysis</span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-forensic-cyan/20 text-forensic-cyan">
          ON REQUEST
        </span>
      </div>
      <div className="forensic-panel-content">
        <div className="h-full min-h-32 bg-muted/10 rounded-lg border border-dashed border-border/30 flex flex-col items-center justify-center text-center px-4 py-6">
          <Mail className="w-8 h-8 text-forensic-cyan/60 mb-3" />
          <p className="text-sm text-foreground">
            Deep forensic analysis is available on request.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Per-instrument source component analysis and forensic reports are provided as a dedicated service.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Deep%20forensic%20analysis%20request`}
            className="mt-3 text-sm text-forensic-cyan hover:underline"
          >
            Contact us at {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </div>
  );
}
