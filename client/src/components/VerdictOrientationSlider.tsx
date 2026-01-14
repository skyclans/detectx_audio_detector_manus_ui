import { useState } from "react";

export type VerdictOrientation = "ai_oriented" | "balanced" | "human_oriented";

interface OrientationProfile {
  label: string;
  geometry: string;
  persistence: string;
  description: string;
}

const ORIENTATION_PROFILES: Record<VerdictOrientation, OrientationProfile> = {
  ai_oriented: {
    label: "AI-Oriented",
    geometry: "Single axis sufficient",
    persistence: "Low threshold",
    description: "Aggressive AI tracking",
  },
  balanced: {
    label: "BALANCED",
    geometry: "Multi-axis required",
    persistence: "Medium",
    description: "Human-safe boundary interpretation",
  },
  human_oriented: {
    label: "Human-Oriented",
    geometry: "All axes required",
    persistence: "High threshold",
    description: "Maximum Human protection",
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
        <div className="text-emerald-400 font-medium text-sm mb-2">
          Current: {profile.label}
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
