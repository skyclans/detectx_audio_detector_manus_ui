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
import { useCallback, useRef, useState, useEffect } from "react";

interface AudioPlayerBarProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeekBackward: () => void;
  onSeekForward: () => void;
  onVolumeChange: (volume: number) => void;
  disabled?: boolean;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Forensic Audio Player Control Bar
 * 
 * VOLUME CONTROL RESPONSIVENESS (CRITICAL - MANDATORY):
 * - Volume UI must update immediately on pointer down/move (perceptual 0ms)
 * - Update volume UI state synchronously on every interaction event
 * - Apply audio.volume updates using requestAnimationFrame
 * - Do NOT debounce volume updates
 * - Do NOT wait for audio playback state or processing to update UI
 * - Volume control must feel as responsive as a hardware audio knob
 * 
 * Design principles:
 * - Immediate visual feedback (0ms delay) for all button interactions
 * - UI state changes are decoupled from audio processing
 * - Controls feel precise and deterministic
 * - No animations that imply processing or intelligence
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

  // Local UI state for immediate visual feedback
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [localVolume, setLocalVolume] = useState(volume);
  const rafRef = useRef<number | null>(null);
  const pendingVolumeRef = useRef<number | null>(null);

  // Sync local volume when prop changes from parent
  useEffect(() => {
    // Only sync if not actively dragging
    if (pendingVolumeRef.current === null) {
      setLocalVolume(volume);
    }
  }, [volume]);

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
    // UI updates immediately, audio follows
    requestAnimationFrame(() => {
      onPlay();
      handleButtonRelease();
    });
  }, [onPlay, handleButtonPress, handleButtonRelease]);

  // Pause with immediate UI feedback
  const handlePause = useCallback(() => {
    handleButtonPress("pause");
    requestAnimationFrame(() => {
      onPause();
      handleButtonRelease();
    });
  }, [onPause, handleButtonPress, handleButtonRelease]);

  // Stop with immediate UI feedback
  const handleStop = useCallback(() => {
    handleButtonPress("stop");
    requestAnimationFrame(() => {
      onStop();
      handleButtonRelease();
    });
  }, [onStop, handleButtonPress, handleButtonRelease]);

  // Seek backward with immediate UI feedback
  const handleSeekBackward = useCallback(() => {
    handleButtonPress("backward");
    requestAnimationFrame(() => {
      onSeekBackward();
      handleButtonRelease();
    });
  }, [onSeekBackward, handleButtonPress, handleButtonRelease]);

  // Seek forward with immediate UI feedback
  const handleSeekForward = useCallback(() => {
    handleButtonPress("forward");
    requestAnimationFrame(() => {
      onSeekForward();
      handleButtonRelease();
    });
  }, [onSeekForward, handleButtonPress, handleButtonRelease]);

  /**
   * Volume control with IMMEDIATE UI update
   * 
   * CRITICAL: No debouncing - UI must update synchronously
   * Audio volume is applied via requestAnimationFrame for smooth updates
   * without blocking UI responsiveness
   */
  const handleVolumeChange = useCallback(
    (value: number[]) => {
      const newVolume = value[0] / 100;
      
      // IMMEDIATE UI update - synchronous, no delay
      setLocalVolume(newVolume);
      
      // Store pending volume for RAF
      pendingVolumeRef.current = newVolume;
      
      // Apply audio volume via requestAnimationFrame
      // This ensures smooth updates without blocking UI
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(() => {
          if (pendingVolumeRef.current !== null) {
            onVolumeChange(pendingVolumeRef.current);
            pendingVolumeRef.current = null;
          }
          rafRef.current = null;
        });
      }
    },
    [onVolumeChange]
  );

  /**
   * Handle volume change complete (pointer up)
   * Ensures final volume value is applied
   */
  const handleVolumeCommit = useCallback(
    (value: number[]) => {
      const newVolume = value[0] / 100;
      setLocalVolume(newVolume);
      // Apply immediately on commit
      onVolumeChange(newVolume);
      pendingVolumeRef.current = null;
    },
    [onVolumeChange]
  );

  // Mute toggle with immediate feedback
  const handleMuteToggle = useCallback(() => {
    const newVolume = localVolume > 0 ? 0 : 1;
    setLocalVolume(newVolume);
    onVolumeChange(newVolume);
  }, [localVolume, onVolumeChange]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Button active state class
  const getButtonClass = (buttonId: string) =>
    cn(
      "h-9 w-9 transition-none", // No transition for instant feedback
      activeButton === buttonId && "bg-accent scale-95"
    );

  return (
    <div className="forensic-panel">
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        {/* Left side: Playback controls */}
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

        {/* Right side: Time display and volume */}
        <div className="flex items-center gap-6">
          {/* Position */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Position
            </span>
            <span className="text-sm font-mono text-foreground w-12 text-right tabular-nums">
              {formatTime(currentTime)}
            </span>
          </div>

          {/* Remaining */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Remaining
            </span>
            <span className="text-sm font-mono text-foreground w-12 text-right tabular-nums">
              -{formatTime(remaining)}
            </span>
          </div>

          {/* Volume - IMMEDIATE UI feedback, no debounce */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 transition-none"
              onClick={handleMuteToggle}
              disabled={disabled}
            >
              {localVolume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            <Slider
              value={[localVolume * 100]}
              max={100}
              step={1}
              className="w-20"
              onValueChange={handleVolumeChange}
              onValueCommit={handleVolumeCommit}
              disabled={disabled}
            />
            <span className="text-xs font-mono text-muted-foreground w-8 tabular-nums">
              {Math.round(localVolume * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
