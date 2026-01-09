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
import { useCallback, useRef, useState } from "react";

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
  const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Volume with immediate UI update, debounced audio update
  const handleVolumeChange = useCallback(
    (value: number[]) => {
      const newVolume = value[0] / 100;
      // Immediate UI update
      setLocalVolume(newVolume);

      // Debounced audio update
      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current);
      }
      volumeTimeoutRef.current = setTimeout(() => {
        onVolumeChange(newVolume);
      }, 16); // ~1 frame delay for audio
    },
    [onVolumeChange]
  );

  // Mute toggle with immediate feedback
  const handleMuteToggle = useCallback(() => {
    const newVolume = localVolume > 0 ? 0 : 1;
    setLocalVolume(newVolume);
    onVolumeChange(newVolume);
  }, [localVolume, onVolumeChange]);

  // Sync local volume when prop changes (e.g., from parent)
  if (Math.abs(localVolume - volume) > 0.01 && activeButton !== "volume") {
    setLocalVolume(volume);
  }

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

          {/* Volume - immediate UI feedback */}
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
