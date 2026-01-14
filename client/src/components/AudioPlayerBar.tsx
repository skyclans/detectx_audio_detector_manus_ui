/**
 * AudioPlayerBar - Stateless Presentation Component
 * 
 * INTEGRATION RULES (MANDATORY):
 * - Must NOT create audio contexts or decide volume
 * - Provides immediate UI feedback only
 * - All state injected via props
 * - All actions dispatched via callbacks
 */

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  FastForward,
  Pause,
  Play,
  Rewind,
  Square,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useState } from "react";

interface AudioPlayerBarProps {
  /** Whether audio is currently playing (injected) */
  isPlaying: boolean;
  /** Current playback position in seconds (injected) */
  currentTime: number;
  /** Total audio duration in seconds (injected) */
  duration: number;
  /** Current volume level 0-1 (injected) */
  volume: number;
  /** Callback to start playback */
  onPlay: () => void;
  /** Callback to pause playback */
  onPause: () => void;
  /** Callback to stop playback */
  onStop: () => void;
  /** Callback to seek backward */
  onSeekBackward: () => void;
  /** Callback to seek forward */
  onSeekForward: () => void;
  /** Callback to change volume */
  onVolumeChange: (volume: number) => void;
  /** Whether controls are disabled */
  disabled?: boolean;
}

/**
 * Format time in MM:SS format
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * AudioPlayerBar Component
 * 
 * Stateless presentation component that provides playback controls.
 * No audio context creation, volume calculation, or timing logic.
 * Only immediate UI feedback.
 */
export function AudioPlayerBar({
  isPlaying,
  currentTime,
  duration,
  volume,
  onPlay,
  onPause,
  onStop,
  onSeekBackward,
  onSeekForward,
  onVolumeChange,
  disabled = false,
}: AudioPlayerBarProps) {
  const remaining = Math.max(0, duration - currentTime);

  // Local UI state for immediate visual feedback only
  const [activeButton, setActiveButton] = useState<string | null>(null);

  // Immediate visual feedback handlers
  const handleButtonPress = useCallback((buttonId: string) => {
    setActiveButton(buttonId);
  }, []);

  const handleButtonRelease = useCallback(() => {
    setActiveButton(null);
  }, []);

  // Play with immediate UI feedback
  const handlePlay = useCallback(() => {
    handleButtonPress("play");
    onPlay();
    requestAnimationFrame(() => handleButtonRelease());
  }, [onPlay, handleButtonPress, handleButtonRelease]);

  // Pause with immediate UI feedback
  const handlePause = useCallback(() => {
    handleButtonPress("pause");
    onPause();
    requestAnimationFrame(() => handleButtonRelease());
  }, [onPause, handleButtonPress, handleButtonRelease]);

  // Stop with immediate UI feedback
  const handleStop = useCallback(() => {
    handleButtonPress("stop");
    onStop();
    requestAnimationFrame(() => handleButtonRelease());
  }, [onStop, handleButtonPress, handleButtonRelease]);

  // Seek backward with immediate UI feedback
  const handleSeekBackward = useCallback(() => {
    handleButtonPress("backward");
    onSeekBackward();
    requestAnimationFrame(() => handleButtonRelease());
  }, [onSeekBackward, handleButtonPress, handleButtonRelease]);

  // Seek forward with immediate UI feedback
  const handleSeekForward = useCallback(() => {
    handleButtonPress("forward");
    onSeekForward();
    requestAnimationFrame(() => handleButtonRelease());
  }, [onSeekForward, handleButtonPress, handleButtonRelease]);

  // Volume change - immediate callback dispatch
  const handleVolumeChange = useCallback(
    (value: number[]) => {
      const newVolume = value[0] / 100;
      onVolumeChange(newVolume);
    },
    [onVolumeChange]
  );

  // Mute toggle
  const handleMuteToggle = useCallback(() => {
    onVolumeChange(volume > 0 ? 0 : 1);
  }, [volume, onVolumeChange]);

  // Button active state class
  const getButtonClass = (buttonId: string) =>
    cn(
      "h-9 w-9 transition-none",
      activeButton === buttonId && "bg-accent scale-95"
    );

  return (
    <div className="forensic-panel">
      <div className="px-3 lg:px-4 py-3 flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-4">
        {/* Top row on mobile / Left side on desktop: Playback controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={getButtonClass("backward")}
            onClick={handleSeekBackward}
            disabled={disabled}
            title="Backward 10s"
          >
            <Rewind className="w-4 h-4" />
          </Button>

          {isPlaying ? (
            <Button
              variant="ghost"
              size="icon"
              className={getButtonClass("pause")}
              onClick={handlePause}
              disabled={disabled}
              title="Pause"
            >
              <Pause className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className={getButtonClass("play")}
              onClick={handlePlay}
              disabled={disabled}
              title="Play"
            >
              <Play className="w-4 h-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className={getButtonClass("stop")}
            onClick={handleStop}
            disabled={disabled}
            title="Stop"
          >
            <Square className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={getButtonClass("forward")}
            onClick={handleSeekForward}
            disabled={disabled}
            title="Forward 10s"
          >
            <FastForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Bottom row on mobile / Right side on desktop: Time display and volume */}
        <div className="flex items-center gap-3 lg:gap-6 flex-wrap justify-center">
          {/* Position */}
          <div className="flex items-center gap-1 lg:gap-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider hidden sm:inline">
              Position
            </span>
            <span className="text-xs lg:text-sm font-mono text-foreground w-10 lg:w-12 text-right tabular-nums">
              {formatTime(currentTime)}
            </span>
          </div>

          {/* Remaining */}
          <div className="flex items-center gap-1 lg:gap-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider hidden sm:inline">
              Remaining
            </span>
            <span className="text-xs lg:text-sm font-mono text-foreground w-10 lg:w-12 text-right tabular-nums">
              -{formatTime(remaining)}
            </span>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-1 lg:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 transition-none"
              onClick={handleMuteToggle}
              disabled={disabled}
            >
              {volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              className="w-16 lg:w-20"
              onValueChange={handleVolumeChange}
              disabled={disabled}
            />
            <span className="text-xs font-mono text-muted-foreground w-8 tabular-nums">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
