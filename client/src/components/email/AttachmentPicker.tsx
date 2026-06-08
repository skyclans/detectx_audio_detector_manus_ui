/**
 * AttachmentPicker
 *
 * Drag-and-drop + button-driven attachment picker for the admin email
 * composer. Mirrors Gmail's compose footer attachments strip: chip per
 * file, image thumbnail, MIME-aware icon, per-file remove (X), running
 * total-size indicator with limit enforcement.
 *
 * Files are stored as base64 (without the data: prefix) so the parent
 * can pass them directly to POST /admin/email/send under the
 * `attachments` array. Backend rejects total > 25 MB with 413.
 */

import { useCallback, useRef, useState } from "react";
import {
  Paperclip,
  X,
  FileText,
  FileImage,
  FileArchive,
  File as FileIcon,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface Attachment {
  filename: string;
  content: string;        // base64 (no data:...;base64, prefix)
  content_type: string;
  size: number;           // bytes
  /** Object URL for image preview thumbnail (browser-only, transient). */
  previewUrl?: string;
}

export interface AttachmentPickerProps {
  attachments: Attachment[];
  onChange: (next: Attachment[]) => void;
  maxTotalBytes?: number;
  maxFileBytes?: number;
  acceptedTypes?: string[];
  /** Render compact chip row only — used by the UserDetail modal */
  compact?: boolean;
}

const DEFAULT_MAX_TOTAL = 25 * 1024 * 1024; // 25 MB
const DEFAULT_MAX_FILE = 10 * 1024 * 1024;  // 10 MB

const DEFAULT_ACCEPTED = [
  ".jpg", ".jpeg", ".png", ".gif", ".webp",
  ".pdf",
  ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
  ".txt", ".csv", ".md",
  ".zip",
];

const BLOCKED_EXT = new Set([
  "exe", "bat", "sh", "cmd", "com", "scr", "msi", "vbs", "ps1",
  "app", "deb", "dmg", "jar", "js", "wsf",
]);

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function fileExtension(name: string): string {
  const idx = name.lastIndexOf(".");
  return idx === -1 ? "" : name.slice(idx + 1).toLowerCase();
}

function isImage(contentType: string): boolean {
  return contentType.startsWith("image/");
}

function iconForFile(contentType: string, name: string) {
  if (isImage(contentType)) return FileImage;
  const ext = fileExtension(name);
  if (ext === "pdf") return FileText;
  if (["doc", "docx", "txt", "md", "csv"].includes(ext)) return FileText;
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return FileArchive;
  return FileIcon;
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the "data:<mime>;base64," prefix
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function AttachmentPicker({
  attachments,
  onChange,
  maxTotalBytes = DEFAULT_MAX_TOTAL,
  maxFileBytes = DEFAULT_MAX_FILE,
  acceptedTypes = DEFAULT_ACCEPTED,
  compact = false,
}: AttachmentPickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [reading, setReading] = useState(false);

  const totalBytes = attachments.reduce((s, a) => s + a.size, 0);
  const overTotal = totalBytes > maxTotalBytes;

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (list.length === 0) return;

      // Filter blocked executable types upfront
      const safe: File[] = [];
      for (const f of list) {
        const ext = fileExtension(f.name);
        if (BLOCKED_EXT.has(ext)) {
          toast.error(`${f.name}: executable files are not allowed`);
          continue;
        }
        if (f.size > maxFileBytes) {
          toast.error(
            `${f.name}: exceeds per-file limit (${formatBytes(maxFileBytes)})`,
          );
          continue;
        }
        safe.push(f);
      }
      if (safe.length === 0) return;

      // Total size pre-check
      const incoming = safe.reduce((s, f) => s + f.size, 0);
      if (totalBytes + incoming > maxTotalBytes) {
        toast.error(
          `Total attachment size would exceed ${formatBytes(maxTotalBytes)}`,
        );
        return;
      }

      setReading(true);
      try {
        const newAttachments: Attachment[] = await Promise.all(
          safe.map(async (f) => {
            const content = await fileToBase64(f);
            const ct =
              f.type ||
              (fileExtension(f.name) === "pdf"
                ? "application/pdf"
                : "application/octet-stream");
            return {
              filename: f.name,
              content,
              content_type: ct,
              size: f.size,
              previewUrl: isImage(ct) ? URL.createObjectURL(f) : undefined,
            };
          }),
        );
        onChange([...attachments, ...newAttachments]);
      } catch (err) {
        toast.error(
          err instanceof Error
            ? `Failed to read file: ${err.message}`
            : "Failed to read file",
        );
      } finally {
        setReading(false);
      }
    },
    [attachments, maxFileBytes, maxTotalBytes, onChange, totalBytes],
  );

  const removeAt = useCallback(
    (idx: number) => {
      const next = attachments.slice();
      const [removed] = next.splice(idx, 1);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      onChange(next);
    },
    [attachments, onChange],
  );

  const handlePick = () => inputRef.current?.click();

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer?.files?.length) {
      void addFiles(e.dataTransfer.files);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!dragOver) setDragOver(true);
      }}
      onDragLeave={(e) => {
        // only clear when leaving the wrapper
        if (e.currentTarget === e.target) setDragOver(false);
      }}
      onDrop={handleDrop}
      className={cn(
        "rounded-md border border-dashed border-border bg-background/50 transition-colors",
        compact ? "p-2" : "p-3",
        dragOver && "border-primary bg-primary/5",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(",")}
        className="hidden"
        onChange={(e) => {
          if (e.target.files) void addFiles(e.target.files);
          e.target.value = ""; // allow re-selecting same file
        }}
      />

      {attachments.length === 0 ? (
        <div
          className={cn(
            "flex items-center justify-between gap-3",
            compact ? "text-xs" : "text-sm",
          )}
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Paperclip className="h-4 w-4" />
            <span>
              {dragOver
                ? "Drop files here…"
                : "Drag files here or click to attach"}
            </span>
          </div>
          <button
            type="button"
            onClick={handlePick}
            disabled={reading}
            className="px-3 py-1.5 rounded-md border border-border text-sm hover:bg-muted disabled:opacity-50"
          >
            <Paperclip className="inline h-3.5 w-3.5 mr-1" />
            Attach files
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {attachments.map((a, idx) => {
              const Icon = iconForFile(a.content_type, a.filename);
              return (
                <div
                  key={`${a.filename}-${idx}`}
                  className={cn(
                    "group flex items-center gap-2 rounded-md border border-border bg-card",
                    compact ? "px-2 py-1" : "px-2.5 py-1.5",
                  )}
                  title={`${a.filename} (${formatBytes(a.size)})`}
                >
                  {a.previewUrl ? (
                    <img
                      src={a.previewUrl}
                      alt=""
                      className="h-8 w-8 rounded object-cover bg-muted"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex flex-col leading-tight max-w-[160px]">
                    <span className="text-xs font-medium truncate">
                      {a.filename}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatBytes(a.size)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAt(idx)}
                    title="Remove"
                    className="ml-1 p-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handlePick}
              disabled={reading}
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <Paperclip className="h-3.5 w-3.5" />
              {reading ? "Reading…" : "Attach more"}
            </button>
            <div
              className={cn(
                "flex items-center gap-1",
                overTotal ? "text-red-500" : "text-muted-foreground",
              )}
            >
              {overTotal && <AlertCircle className="h-3.5 w-3.5" />}
              <span>
                {formatBytes(totalBytes)} / {formatBytes(maxTotalBytes)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttachmentPicker;
