import { useState } from "react";
import { Shield, Zap, Info } from "lucide-react";

export type VerdictOrientation = "enhanced";

/**
 * Enhanced Mode Badge Component
 *
 * Displays the fixed Enhanced Mode configuration.
 * No longer a slider - Enhanced is the only mode.
 */
export function VerdictOrientationSlider({ disabled }: { disabled?: boolean }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={`bg-zinc-900 border border-zinc-700 rounded-lg p-4 mb-4 ${disabled ? 'opacity-50' : ''}`}>
      <div className="text-sm text-zinc-400 mb-3 font-medium">Detection Mode</div>

      {/* Enhanced Mode Badge */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-full">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400 font-semibold text-sm">ENHANCED MODE</span>
          <Zap className="w-4 h-4 text-emerald-400" />
        </div>
      </div>

      {/* Mode Info */}
      <div className="bg-zinc-800/50 rounded-md p-3 border border-zinc-700/50">
        <div className="flex items-center justify-between mb-2">
          <div className="text-emerald-400 font-medium text-sm">
            Dual-Engine Detection
          </div>
          {/* Note Tooltip Icon */}
          <div className="relative">
            <button
              type="button"
              className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
              aria-label="Show note"
            >
              <Info className="w-4 h-4" />
            </button>
            {/* Tooltip */}
            {showTooltip && (
              <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-zinc-800 border border-zinc-600 rounded-lg shadow-xl z-50">
                <div className="text-xs text-zinc-300 leading-relaxed">
                  <span className="text-zinc-500 font-medium block mb-1">About Enhanced Mode:</span>
                  Enhanced Mode uses a dual-engine approach: Classifier Engine as primary filter (protecting human music with ~0% false positive),
                  and Reconstruction Engine as secondary for AI detection boost. Trained on 10,000,000+ verified human music samples.
                </div>
                {/* Arrow */}
                <div className="absolute -top-1.5 right-3 w-3 h-3 bg-zinc-800 border-l border-t border-zinc-600 transform rotate-45" />
              </div>
            )}
          </div>
        </div>
        <ul className="text-xs text-zinc-400 space-y-1">
          <li>• <span className="text-zinc-300">Primary:</span> CNN (90% threshold)</li>
          <li>• <span className="text-zinc-300">Secondary:</span> Reconstruction Diff</li>
          <li>• <span className="text-zinc-300">Human FP:</span> ~0% (Human-safe)</li>
          <li>• <span className="text-zinc-300">AI Detection:</span> ~50%</li>
        </ul>
      </div>
    </div>
  );
}
