import { useState } from "react";
import { Info } from "lucide-react";

export type VerdictOrientation = "ai_oriented" | "balanced" | "human_oriented";

interface OrientationProfile {
  label: string;
  scanType: string;
  geometry: string;
  persistence: string;
  description: string;
  note: string;
}

const ORIENTATION_PROFILES: Record<VerdictOrientation, OrientationProfile> = {
  ai_oriented: {
    label: "AI-Oriented",
    scanType: "Fast Scan",
    geometry: "Single axis sufficient",
    persistence: "Low threshold",
    description: "Aggressive AI tracking",
    note: "In genres with strong rhythmic emphasis or highly structured production, AI signal evidence may occasionally be observed. This can occur as a normal response under aggressive detection settings. For conservative interpretation, Normal or Human-Oriented mode is recommended.",
  },
  balanced: {
    label: "BALANCED",
    scanType: "Normal Scan",
    geometry: "Multi-axis required",
    persistence: "Medium",
    description: "Human-safe boundary interpretation",
    note: "This mode applies a balanced interpretation of the human geometry boundary. Scan speed is moderate and may require additional processing time compared to fast scan modes. BALANCED mode is recommended for general verification use.",
  },
  human_oriented: {
    label: "Human-Oriented",
    scanType: "Detailed Scan",
    geometry: "All axes required",
    persistence: "High threshold",
    description: "Maximum human protection",
    note: "This mode applies the most conservative interpretation of the human geometry boundary. Due to comprehensive multi-axis evaluation, scan time may be longer than other modes. Human-Oriented mode is recommended for copyright disputes, legal review, and human-first analysis.",
  },
};

interface Props {
  value: VerdictOrientation;
  onChange: (orientation: VerdictOrientation) => void;
  disabled?: boolean;
}

export function VerdictOrientationSlider({ value, onChange, disabled }: Props) {
  const orientations: VerdictOrientation[] = ["ai_oriented", "balanced", "human_oriented"];
  const currentIndex = orientations.indexOf(value);
  const profile = ORIENTATION_PROFILES[value];
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={`bg-zinc-900 border border-zinc-700 rounded-lg p-4 mb-4 ${disabled ? 'opacity-50' : ''}`}>
      <div className="text-sm text-zinc-400 mb-3 font-medium">Verdict Boundary Orientation</div>
      
      {/* Slider Track */}
      <div className="relative mb-4">
        <div className="flex justify-between text-xs text-zinc-500 mb-2">
          <span>AI-Oriented</span>
          <span>Human-Oriented</span>
        </div>
        
        <div className="relative h-2 bg-zinc-700 rounded-full">
          {/* Slider buttons */}
          <div className="absolute inset-0 flex justify-between items-center px-0">
            {orientations.map((orientation, index) => (
              <button
                key={orientation}
                onClick={() => !disabled && onChange(orientation)}
                disabled={disabled}
                className={`w-5 h-5 rounded-full border-2 transition-all z-10 ${
                  value === orientation
                    ? "bg-emerald-500 border-emerald-400 scale-110 shadow-lg shadow-emerald-500/30"
                    : "bg-zinc-600 border-zinc-500 hover:bg-zinc-500"
                } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Current Profile Info */}
      <div className="bg-zinc-800/50 rounded-md p-3 border border-zinc-700/50">
        <div className="flex items-center justify-between mb-2">
          <div className="text-emerald-400 font-medium text-sm">
            Current: {profile.label} ({profile.scanType})
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
                  <span className="text-zinc-500 font-medium block mb-1">Note:</span>
                  {profile.note}
                </div>
                {/* Arrow */}
                <div className="absolute -top-1.5 right-3 w-3 h-3 bg-zinc-800 border-l border-t border-zinc-600 transform rotate-45" />
              </div>
            )}
          </div>
        </div>
        <ul className="text-xs text-zinc-400 space-y-1">
          <li>• Geometry: {profile.geometry}</li>
          <li>• Persistence: {profile.persistence}</li>
          <li>• {profile.description}</li>
        </ul>
      </div>
    </div>
  );
}
