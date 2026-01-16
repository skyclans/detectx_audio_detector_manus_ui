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
  onCancel?: () => void; // Cancel ongoing verification
  isVerifying?: boolean;
  disabled?: boolean;
  uploadProgress?: number | null; // 0-100 or null when not uploading
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

/**
 * PERFORMANCE-FIRST AUDIO UPLOAD PANEL
 * 
 * CRITICAL REQUIREMENTS:
 * - File selection must provide IMMEDIATE UI feedback (0ms)
 * - Audio decoding happens ASYNCHRONOUSLY
 * - VERIFY AUDIO button must respond INSTANTLY
 * - NO blocking operations on user interactions
 */
export function AudioUploadPanel({
  onFileSelect,
  onVerify,
  onCancel,
  isVerifying = false,
  disabled = false,
  uploadProgress = null,
}: AudioUploadPanelProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<AudioFileInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * PERFORMANCE-FIRST FILE PROCESSING
   * 
   * PHASE 1: Immediate UI update with file info
   * PHASE 2: Async audio decoding for metadata
   */
  const processFile = useCallback(
    (file: File) => {
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

      // PHASE 1: IMMEDIATE UI UPDATE (0ms)
      // Show file info immediately without waiting for audio decoding
      const preliminaryFileInfo: AudioFileInfo = {
        file,
        name: file.name,
        size: file.size,
        duration: null, // Will be updated async
        sampleRate: null, // Will be updated async
        type: file.type || "audio/unknown",
      };

      setSelectedFile(preliminaryFileInfo);
      setIsProcessing(true);
      
      // Notify parent immediately - parent handles async decoding
      onFileSelect(preliminaryFileInfo);
      
      // PHASE 2: ASYNC METADATA EXTRACTION (non-blocking)
      // This updates local state only - parent already has the file
      (async () => {
        try {
          const audioContext = new AudioContext();
          const arrayBuffer = await file.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // Update local state with decoded metadata
          setSelectedFile({
            file,
            name: file.name,
            size: file.size,
            duration: audioBuffer.duration,
            sampleRate: audioBuffer.sampleRate,
            type: file.type || "audio/unknown",
          });
          
          audioContext.close();
        } catch {
          // Decoding failed - keep preliminary info
          // File is still valid for verification
        } finally {
          setIsProcessing(false);
        }
      })();
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
    setIsProcessing(false);
  }, []);

  /**
   * PERFORMANCE-FIRST VERIFY BUTTON HANDLER
   * 
   * Button click must provide IMMEDIATE visual feedback.
   * The actual verification is handled by parent component.
   */
  const handleVerifyClick = useCallback(() => {
    // Call parent handler immediately - no blocking operations
    onVerify();
  }, [onVerify]);

  const isUploading = uploadProgress !== null && uploadProgress >= 0 && uploadProgress < 100;

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
            {/* File info card */}
            <div className="bg-muted/30 rounded-md p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                    <FileAudio className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                      {selectedFile.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span>{formatFileSize(selectedFile.size)}</span>
                      {selectedFile.duration !== null && (
                        <>
                          <span>•</span>
                          <span>{formatDuration(selectedFile.duration)}</span>
                        </>
                      )}
                      {selectedFile.sampleRate !== null && (
                        <>
                          <span>•</span>
                          <span>{(selectedFile.sampleRate / 1000).toFixed(1)} kHz</span>
                        </>
                      )}
                      {isProcessing && (
                        <>
                          <span>•</span>
                          <span className="text-forensic-cyan">Decoding...</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (isVerifying || isUploading) {
                      // Cancel ongoing verification/upload
                      onCancel?.();
                    } else {
                      // Clear file when not verifying
                      clearFile();
                    }
                  }}
                  className="p-1 hover:bg-muted rounded transition-colors"
                  title={isVerifying || isUploading ? "Cancel verification" : "Remove file"}
                >
                  <X className={cn(
                    "w-4 h-4",
                    isVerifying || isUploading ? "text-destructive" : "text-muted-foreground"
                  )} />
                </button>
              </div>
            </div>

            {/* Upload Progress Bar */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Uploading...</span>
                  <span className="text-forensic-cyan font-mono">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-forensic-cyan transition-all duration-150 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Verify button - IMMEDIATE RESPONSE */}
            <Button
              onClick={handleVerifyClick}
              disabled={isVerifying || disabled || isUploading}
              className={cn(
                "w-full h-12 font-semibold text-sm tracking-wide transition-all duration-0",
                "bg-forensic-cyan hover:bg-forensic-cyan/90 text-background",
                (isVerifying || isUploading) && "opacity-70"
              )}
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <Upload className="w-4 h-4 animate-pulse" />
                  UPLOADING... {Math.round(uploadProgress)}%
                </span>
              ) : isVerifying ? (
                <span className="flex items-center gap-2">
                  <AudioLines className="w-4 h-4 animate-pulse" />
                  VERIFYING...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <AudioLines className="w-4 h-4" />
                  VERIFY AUDIO
                </span>
              )}
            </Button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
