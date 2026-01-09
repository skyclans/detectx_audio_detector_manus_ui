import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  FastForward,
  Pause,
  Play,
  Rewind,
  Square,
  Volume2,
  VolumeX,
} from "lucide-react";

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

  return (
    <div className="forensic-panel">
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        {/* Left side: Playback controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={onSeekBackward}
            disabled={disabled}
            title="Backward 10s"
          >
            <Rewind className="w-4 h-4" />
          </Button>

          {isPlaying ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={onPause}
              disabled={disabled}
              title="Pause"
            >
              <Pause className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={onPlay}
              disabled={disabled}
              title="Play"
            >
              <Play className="w-4 h-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={onStop}
            disabled={disabled}
            title="Stop"
          >
            <Square className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={onSeekForward}
            disabled={disabled}
            title="Forward 10s"
          >
            <FastForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Right side: Time display and volume - LOCKED GROUP */}
        <div className="flex items-center gap-6">
          {/* Position */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Position
            </span>
            <span className="text-sm font-mono text-foreground w-12 text-right">
              {formatTime(currentTime)}
            </span>
          </div>

          {/* Remaining */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Remaining
            </span>
            <span className="text-sm font-mono text-foreground w-12 text-right">
              -{formatTime(remaining)}
            </span>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onVolumeChange(volume > 0 ? 0 : 1)}
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
              className="w-20"
              onValueChange={(value) => onVolumeChange(value[0] / 100)}
              disabled={disabled}
            />
            <span className="text-xs font-mono text-muted-foreground w-8">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
