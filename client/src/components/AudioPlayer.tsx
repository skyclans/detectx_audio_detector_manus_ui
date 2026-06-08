/**
 * AudioPlayer
 *
 * Reusable HTML5 audio player with custom forensic-style controls.
 * No external waveform dependencies — native <audio> + Tailwind.
 *
 * Props:
 *   src:      Source URL (passed to <audio> + download anchor).
 *   filename: Display label + download filename hint.
 *   disabled: If true, controls are disabled and the player won't load.
 *
 * Used by the admin investigation view to play back the stored audio
 * (admin-only endpoint, served via fetchWithAuth — see AdminVerificationDetail).
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  Download,
  Volume2,
  VolumeX,
  Loader2,
  AlertCircle,
  FileAudio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getToken } from "@/lib/api";

interface AudioPlayerProps {
  src: string;
  filename?: string;
  disabled?: boolean;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function AudioPlayer({ src, filename, disabled = false }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Object URL created from the authenticated fetch — keeps Bearer token
  // off the <audio> element while still allowing playback + download.
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Fetch the audio bytes with auth, then expose them as an object URL.
  useEffect(() => {
    if (!src || disabled) return;
    let cancelled = false;
    let createdUrl: string | null = null;

    const load = async () => {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage("");
      try {
        const token = getToken();
        const headers: HeadersInit = token
          ? { Authorization: `Bearer ${token}` }
          : {};
        const resp = await fetch(src, { headers });
        if (!resp.ok) {
          if (resp.status === 404 || resp.status === 410) {
            throw new Error("Audio no longer available — expired or deleted");
          }
          throw new Error(`Failed to load audio (HTTP ${resp.status})`);
        }
        const blob = await resp.blob();
        if (cancelled) return;
        createdUrl = URL.createObjectURL(blob);
        setObjectUrl(createdUrl);
      } catch (err) {
        if (cancelled) return;
        setHasError(true);
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Audio no longer available — expired or deleted",
        );
        setIsLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [src, disabled]);

  // Wire audio element listeners.
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !objectUrl) return;

    const onLoaded = () => {
      setDuration(el.duration || 0);
      setIsLoading(false);
    };
    const onTime = () => setCurrentTime(el.currentTime || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnd = () => setIsPlaying(false);
    const onError = () => {
      setHasError(true);
      setErrorMessage("Audio playback error");
      setIsLoading(false);
    };

    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnd);
    el.addEventListener("error", onError);

    return () => {
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnd);
      el.removeEventListener("error", onError);
    };
  }, [objectUrl]);

  // Apply volume / mute to the audio element.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const togglePlay = useCallback(() => {
    const el = audioRef.current;
    if (!el || hasError || disabled) return;
    if (isPlaying) {
      el.pause();
    } else {
      el.play().catch(() => {
        setHasError(true);
        setErrorMessage("Playback blocked by browser");
      });
    }
  }, [isPlaying, hasError, disabled]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = audioRef.current;
    if (!el || !duration) return;
    const t = Number(e.target.value);
    el.currentTime = t;
    setCurrentTime(t);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v);
    if (v > 0 && isMuted) setIsMuted(false);
  };

  const handleDownload = useCallback(() => {
    if (!objectUrl) return;
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename || "audio";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [objectUrl, filename]);

  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header flex items-center gap-2">
        <FileAudio className="h-4 w-4 text-forensic-cyan" />
        <span>Audio Playback</span>
      </div>
      <div className="forensic-panel-content space-y-3">
        {filename && (
          <div className="text-xs text-muted-foreground truncate" title={filename}>
            {filename}
          </div>
        )}

        {/* Error state */}
        {hasError ? (
          <div className="flex items-start gap-2 p-3 rounded border border-red-500/40 bg-red-500/10 text-red-400 text-xs">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{errorMessage || "Audio no longer available — expired or deleted"}</span>
          </div>
        ) : (
          <>
            {/* Hidden native audio element driven by object URL */}
            {objectUrl && (
              <audio ref={audioRef} src={objectUrl} preload="metadata" />
            )}

            {/* Transport row: play/pause + time + download */}
            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={togglePlay}
                disabled={disabled || isLoading || !objectUrl}
                className="h-9 w-9 p-0"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>

              <div className="flex-1 min-w-0">
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  disabled={disabled || isLoading || !duration}
                  className={cn(
                    "w-full h-1.5 rounded-full appearance-none cursor-pointer",
                    "bg-muted/40 accent-forensic-cyan",
                  )}
                  aria-label="Seek"
                />
                <div className="flex justify-between text-[10px] font-mono text-muted-foreground mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleDownload}
                disabled={disabled || !objectUrl}
                className="h-9"
                aria-label="Download audio"
              >
                <Download className="h-4 w-4 mr-1" />
                <span className="text-xs">Download</span>
              </Button>
            </div>

            {/* Volume row */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setIsMuted((m) => !m)}
                disabled={disabled}
                className="h-7 w-7 p-0"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={handleVolume}
                disabled={disabled}
                className="w-32 h-1 rounded-full appearance-none cursor-pointer bg-muted/40 accent-forensic-cyan"
                aria-label="Volume"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
