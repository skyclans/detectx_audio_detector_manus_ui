import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AudioLines, FileAudio, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";

interface AudioFileInfo {
  file: File;
  name: string;
  size: number;
  duration: number | null;
  sampleRate: number | null;
  type: string;
}

interface AudioUploadPanelProps {
  onFileSelect: (fileInfo: AudioFileInfo) => void;
  onVerify: () => void;
  isVerifying?: boolean;
  disabled?: boolean;
}

const SUPPORTED_FORMATS = ["audio/wav", "audio/mpeg", "audio/mp3", "audio/flac", "audio/ogg", "audio/m4a", "audio/x-m4a", "audio/mp4"];
const SUPPORTED_EXTENSIONS = [".wav", ".mp3", ".flac", ".ogg", ".m4a"];

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function AudioUploadPanel({
  onFileSelect,
  onVerify,
  isVerifying = false,
  disabled = false,
}: AudioUploadPanelProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<AudioFileInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);

      // Validate file type
      const isValidType = SUPPORTED_FORMATS.some((format) => file.type.includes(format.split("/")[1]));
      const isValidExtension = SUPPORTED_EXTENSIONS.some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      );

      if (!isValidType && !isValidExtension) {
        setError("Unsupported file format. Please use WAV, MP3, FLAC, OGG, or M4A.");
        return;
      }

      // Get audio metadata
      const audioContext = new AudioContext();
      const arrayBuffer = await file.arrayBuffer();

      try {
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const fileInfo: AudioFileInfo = {
          file,
          name: file.name,
          size: file.size,
          duration: audioBuffer.duration,
          sampleRate: audioBuffer.sampleRate,
          type: file.type || "audio/unknown",
        };

        setSelectedFile(fileInfo);
        onFileSelect(fileInfo);
      } catch {
        // If decoding fails, still allow the file but without metadata
        const fileInfo: AudioFileInfo = {
          file,
          name: file.name,
          size: file.size,
          duration: null,
          sampleRate: null,
          type: file.type || "audio/unknown",
        };

        setSelectedFile(fileInfo);
        onFileSelect(fileInfo);
      } finally {
        audioContext.close();
      }
    },
    [onFileSelect]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files && files[0]) {
        processFile(files[0]);
      }
    },
    [disabled, processFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files[0]) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setError(null);
  }, []);

  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header">File Upload</div>
      <div className="forensic-panel-content">
        {!selectedFile ? (
          <div
            className={cn(
              "border-2 border-dashed rounded-md p-8 text-center transition-colors",
              dragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground/50",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept={SUPPORTED_EXTENSIONS.join(",")}
              onChange={handleFileInput}
              className="hidden"
              id="audio-upload"
              disabled={disabled}
            />
            <label
              htmlFor="audio-upload"
              className={cn("cursor-pointer", disabled && "cursor-not-allowed")}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Drop audio file here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supported formats: WAV, MP3, FLAC, OGG, M4A
                  </p>
                </div>
              </div>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            {/* File info */}
            <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-md">
              <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileAudio className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {selectedFile.name}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground font-mono">
                  <span>Size: {formatFileSize(selectedFile.size)}</span>
                  {selectedFile.duration !== null && (
                    <span>Duration: {formatDuration(selectedFile.duration)}</span>
                  )}
                  {selectedFile.sampleRate !== null && (
                    <span>Sample Rate: {selectedFile.sampleRate} Hz</span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={clearFile}
                disabled={isVerifying}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Verify button */}
            <Button
              className="w-full h-12 text-sm font-semibold uppercase tracking-wider"
              onClick={onVerify}
              disabled={disabled || isVerifying}
            >
              {isVerifying ? (
                <>
                  <AudioLines className="w-4 h-4 mr-2 animate-pulse" />
                  Processing...
                </>
              ) : (
                <>
                  <AudioLines className="w-4 h-4 mr-2" />
                  Verify Audio
                </>
              )}
            </Button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
