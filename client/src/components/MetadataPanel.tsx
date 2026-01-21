/**
 * FILE METADATA - Forensic Intake Record
 * 
 * This section is NOT an analysis feature and must NOT influence detection or verdicts.
 * It exists solely as a forensic intake record for auditability, reproducibility,
 * and file identity verification.
 * 
 * All values reflect the state of the file BEFORE analysis and BEFORE normalization.
 * No inference, estimation, correction, or normalization is allowed at this layer.
 * 
 * Metadata is context, not evidence.
 */

import React, { useState, useCallback } from "react";
import { Copy, Check, Info } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MetadataItem {
  label: string;
  value: string | number | null | undefined;
  mono?: boolean;
  copyable?: boolean;
  fullValue?: string; // Full value for copying (e.g., full hash)
  tooltip?: string; // Tooltip text for additional context
}

interface MetadataPanelProps {
  metadata: {
    fileName?: string;
    duration?: number | null;
    sampleRate?: number | null;
    bitDepth?: number | null;
    channels?: number | null;
    codec?: string | null;
    fileHash?: string | null; // SHA-256 hash
    fileSize?: number;
    // ID3/Vorbis tag metadata
    artist?: string | null;
    title?: string | null;
    album?: string | null;
  } | null;
}

/**
 * Format duration from seconds to MM:SS.mmm
 * Duration comes from ffprobe in seconds
 */
function formatDuration(seconds: number): string {
  const totalSeconds = Math.floor(seconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const milliseconds = Math.round((seconds - totalSeconds) * 1000);
  return `${mins}:${secs.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Truncate filename if too long
 * Shows first 20 chars + ... + last 15 chars (including extension)
 * Total max display length: ~38 characters
 */
function truncateFilename(filename: string, maxLength: number = 35): { truncated: string; isTruncated: boolean } {
  if (filename.length <= maxLength) {
    return { truncated: filename, isTruncated: false };
  }
  
  // Find the extension
  const lastDotIndex = filename.lastIndexOf('.');
  const hasExtension = lastDotIndex > 0 && lastDotIndex > filename.length - 6;
  
  if (hasExtension) {
    const extension = filename.substring(lastDotIndex);
    const nameWithoutExt = filename.substring(0, lastDotIndex);
    const availableLength = maxLength - extension.length - 3; // 3 for "..."
    
    if (availableLength > 10) {
      const frontLength = Math.ceil(availableLength * 0.6);
      const backLength = availableLength - frontLength;
      const truncatedName = nameWithoutExt.substring(0, frontLength) + "..." + nameWithoutExt.substring(nameWithoutExt.length - backLength);
      return { truncated: truncatedName + extension, isTruncated: true };
    }
  }
  
  // Fallback: simple truncation
  const frontLength = Math.ceil((maxLength - 3) * 0.6);
  const backLength = maxLength - 3 - frontLength;
  return { 
    truncated: filename.substring(0, frontLength) + "..." + filename.substring(filename.length - backLength),
    isTruncated: true 
  };
}

/**
 * Format sample rate in kHz
 */
function formatSampleRate(hz: number): string {
  if (hz >= 1000) {
    return `${(hz / 1000).toFixed(hz % 1000 === 0 ? 0 : 1)} kHz`;
  }
  return `${hz} Hz`;
}

function MetadataRow({ label, value, mono = false, copyable = false, fullValue, tooltip }: MetadataItem) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const textToCopy = fullValue || String(value);
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success("Copied to clipboard", {
        description: label,
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  }, [value, fullValue, label]);

  return (
    <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3 h-3 text-muted-foreground/50 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs text-xs">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm text-foreground ${mono ? "font-mono" : ""}`}>
          {value ?? "—"}
        </span>
        {copyable && value && (
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-muted/50 transition-colors"
            title={`Copy ${label}`}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-forensic-green" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export function MetadataPanel({ metadata }: MetadataPanelProps) {
  if (!metadata) {
    return (
      <div className="forensic-panel h-full">
        <div className="forensic-panel-header">FILE METADATA</div>
        <div className="forensic-panel-content flex flex-col justify-center">
          <p className="text-sm text-muted-foreground text-center py-8">
            No file selected
          </p>
        </div>
      </div>
    );
  }

  // Check if track info (ID3/Vorbis tags) is available
  const hasTrackInfo = metadata.artist || metadata.title || metadata.album;

  // Track info items (ID3/Vorbis tag metadata)
  const trackInfoItems: MetadataItem[] = [
    {
      label: "Title",
      value: metadata.title || null,
      tooltip: "Track title extracted from ID3 (MP3) or Vorbis (OGG/FLAC) tags.",
    },
    {
      label: "Artist",
      value: metadata.artist || null,
      tooltip: "Artist name extracted from ID3 (MP3) or Vorbis (OGG/FLAC) tags.",
    },
    {
      label: "Album",
      value: metadata.album || null,
      tooltip: "Album name extracted from ID3 (MP3) or Vorbis (OGG/FLAC) tags.",
    },
  ];

  // Field list in FIXED ORDER as specified
  // If a value is unavailable → display "—"
  // Do NOT calculate, estimate, or infer missing values
  const items: MetadataItem[] = [
    { 
      label: "Filename", 
      value: metadata.fileName ? truncateFilename(metadata.fileName).truncated : null,
      copyable: metadata.fileName ? truncateFilename(metadata.fileName).isTruncated : false,
      fullValue: metadata.fileName || undefined,
      tooltip: metadata.fileName && truncateFilename(metadata.fileName).isTruncated 
        ? "Full filename is truncated for display. Click copy button to copy full filename."
        : undefined,
    },
    {
      label: "Duration",
      value: metadata.duration != null ? formatDuration(metadata.duration) : null,
      mono: true,
    },
    {
      label: "Sample Rate",
      value: metadata.sampleRate != null ? formatSampleRate(metadata.sampleRate) : null,
      mono: true,
    },
    {
      label: "Bit Depth",
      value: metadata.bitDepth != null ? `${metadata.bitDepth}-bit` : null,
      mono: true,
      tooltip: "Bit depth is reported from the source file encoding metadata. For lossless formats, this reflects the original PCM depth. For lossy formats, this reflects container declaration only. This value is not used for analysis or normalization.",
    },
    {
      label: "Channels",
      value: metadata.channels != null
        ? metadata.channels === 1
          ? "Mono"
          : metadata.channels === 2
          ? "Stereo"
          : `${metadata.channels} ch`
        : null,
    },
    { 
      label: "Codec", 
      value: metadata.codec || null,
    },
    {
      label: "File Size",
      value: metadata.fileSize != null ? formatFileSize(metadata.fileSize) : null,
      mono: true,
    },
    {
      label: "SHA-256",
      value: metadata.fileHash ? `${metadata.fileHash.substring(0, 16)}...` : null,
      mono: true,
      copyable: true,
      fullValue: metadata.fileHash || undefined,
      tooltip: "SHA-256 hash is calculated from the original uploaded file and is used solely for file identity verification and audit reproducibility.",
    },
  ];

  return (
    <div className="forensic-panel h-full">
      {/* Title: FILE METADATA (exact text) */}
      <div className="forensic-panel-header">FILE METADATA</div>
      <div className="forensic-panel-content">
        {/* Subline: Forensic input record (pre-analysis, pre-normalization) */}
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b border-border/30">
          Forensic input record (pre-analysis, pre-normalization)
        </p>
        
        {/* Track Info Section - Only show if any tag data exists */}
        {hasTrackInfo && (
          <div className="mb-6 mt-2">
            <div className="bg-muted/20 rounded-lg p-4 border border-border/30">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-forensic-cyan"></span>
                Track Info (ID3/Vorbis Tags)
              </p>
              <div className="space-y-2 pl-3">
                {trackInfoItems.map((item) => (
                  item.value && <MetadataRow key={item.label} {...item} />
                ))}
              </div>
            </div>
          </div>
        )}
        {items.map((item) => (
          <MetadataRow key={item.label} {...item} />
        ))}
      </div>
    </div>
  );
}
