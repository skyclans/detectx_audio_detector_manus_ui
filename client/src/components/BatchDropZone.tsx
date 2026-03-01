import { cn } from "@/lib/utils";
import { Upload, FileArchive, FolderOpen } from "lucide-react";
import { useCallback, useState, useRef } from "react";
import JSZip from "jszip";

const SUPPORTED_EXTENSIONS = [".wav", ".mp3", ".flac", ".ogg", ".m4a"];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_FILES = 100;

interface BatchDropZoneProps {
  onFilesAdded: (files: File[]) => void;
  disabled?: boolean;
  fileCount: number;
}

function isAudioFile(name: string): boolean {
  const lower = name.toLowerCase();
  return SUPPORTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function isZipFile(file: File): boolean {
  return (
    file.type === "application/zip" ||
    file.type === "application/x-zip-compressed" ||
    file.name.toLowerCase().endsWith(".zip")
  );
}

/**
 * Recursively read all files from a dropped directory entry
 */
async function readDirectoryEntries(entry: FileSystemDirectoryEntry): Promise<File[]> {
  const files: File[] = [];
  const reader = entry.createReader();

  const readBatch = (): Promise<FileSystemEntry[]> =>
    new Promise((resolve, reject) => {
      reader.readEntries(resolve, reject);
    });

  let batch = await readBatch();
  while (batch.length > 0) {
    for (const child of batch) {
      if (child.isFile) {
        const file = await new Promise<File>((resolve, reject) => {
          (child as FileSystemFileEntry).file(resolve, reject);
        });
        if (isAudioFile(file.name)) {
          files.push(file);
        }
      } else if (child.isDirectory) {
        const subFiles = await readDirectoryEntries(child as FileSystemDirectoryEntry);
        files.push(...subFiles);
      }
    }
    batch = await readBatch();
  }

  return files;
}

/**
 * Extract audio files from a ZIP archive using JSZip
 */
async function extractZipFiles(zipFile: File): Promise<File[]> {
  const zip = await JSZip.loadAsync(await zipFile.arrayBuffer());
  const files: File[] = [];

  const entries = Object.entries(zip.files).filter(
    ([name, entry]) => !entry.dir && isAudioFile(name)
  );

  for (const [name, entry] of entries) {
    const blob = await entry.async("blob");
    // Use just the filename (strip directory path)
    const fileName = name.split("/").pop() || name;
    const file = new File([blob], fileName, {
      type: blob.type || "audio/unknown",
    });
    files.push(file);
  }

  return files;
}

export function BatchDropZone({ onFilesAdded, disabled = false, fileCount }: BatchDropZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const processDroppedItems = useCallback(
    async (dataTransfer: DataTransfer) => {
      const items = dataTransfer.items;
      const collectedFiles: File[] = [];

      // Try webkitGetAsEntry for directory support
      const entries: FileSystemEntry[] = [];
      const plainFiles: File[] = [];

      for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry?.();
        if (entry) {
          entries.push(entry);
        } else {
          const file = items[i].getAsFile();
          if (file) plainFiles.push(file);
        }
      }

      setIsExtracting(true);

      try {
        // Process entries (directories + files)
        for (const entry of entries) {
          if (entry.isDirectory) {
            const dirFiles = await readDirectoryEntries(entry as FileSystemDirectoryEntry);
            collectedFiles.push(...dirFiles);
          } else if (entry.isFile) {
            const file = await new Promise<File>((resolve, reject) => {
              (entry as FileSystemFileEntry).file(resolve, reject);
            });
            if (isZipFile(file)) {
              const zipFiles = await extractZipFiles(file);
              collectedFiles.push(...zipFiles);
            } else if (isAudioFile(file.name)) {
              collectedFiles.push(file);
            }
          }
        }

        // Process plain files (fallback)
        for (const file of plainFiles) {
          if (isZipFile(file)) {
            const zipFiles = await extractZipFiles(file);
            collectedFiles.push(...zipFiles);
          } else if (isAudioFile(file.name)) {
            collectedFiles.push(file);
          }
        }
      } finally {
        setIsExtracting(false);
      }

      // Enforce limits
      const remaining = MAX_FILES - fileCount;
      const validFiles = collectedFiles
        .filter((f) => f.size <= MAX_FILE_SIZE)
        .slice(0, remaining);

      if (validFiles.length > 0) {
        onFilesAdded(validFiles);
      }
    },
    [onFilesAdded, fileCount]
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
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (disabled) return;
      await processDroppedItems(e.dataTransfer);
    },
    [disabled, processDroppedItems]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (!fileList) return;

      const files: File[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (isAudioFile(file.name) && file.size <= MAX_FILE_SIZE) {
          files.push(file);
        }
      }

      const remaining = MAX_FILES - fileCount;
      onFilesAdded(files.slice(0, remaining));
      e.target.value = "";
    },
    [onFilesAdded, fileCount]
  );

  const handleZipInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (!fileList || fileList.length === 0) return;

      setIsExtracting(true);
      try {
        const allFiles: File[] = [];
        for (let i = 0; i < fileList.length; i++) {
          if (isZipFile(fileList[i])) {
            const extracted = await extractZipFiles(fileList[i]);
            allFiles.push(...extracted);
          }
        }
        const remaining = MAX_FILES - fileCount;
        onFilesAdded(allFiles.slice(0, remaining));
      } finally {
        setIsExtracting(false);
        e.target.value = "";
      }
    },
    [onFilesAdded, fileCount]
  );

  const atLimit = fileCount >= MAX_FILES;

  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header">Upload Files</div>
      <div className="forensic-panel-content">
        <div
          className={cn(
            "border-2 border-dashed rounded-md p-8 text-center transition-colors",
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-muted-foreground/50",
            (disabled || atLimit) && "opacity-50 cursor-not-allowed"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {isExtracting ? (
            <div className="flex flex-col items-center gap-3">
              <FileArchive className="w-10 h-10 text-forensic-cyan animate-pulse" />
              <p className="text-sm text-muted-foreground">Extracting files...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Drop audio files, folders, or ZIP archives here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  WAV, MP3, FLAC, OGG, M4A — max 100MB each, up to {MAX_FILES} files
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* File browse button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={SUPPORTED_EXTENSIONS.join(",")}
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                  disabled={disabled || atLimit}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled || atLimit}
                  className="px-4 py-2 text-xs font-medium rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Browse Files
                </button>

                {/* Folder browse button */}
                <input
                  ref={folderInputRef}
                  type="file"
                  // @ts-expect-error webkitdirectory is non-standard
                  webkitdirectory=""
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                  disabled={disabled || atLimit}
                />
                <button
                  onClick={() => folderInputRef.current?.click()}
                  disabled={disabled || atLimit}
                  className="px-4 py-2 text-xs font-medium rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  Browse Folder
                </button>

                {/* ZIP browse button */}
                <input
                  type="file"
                  accept=".zip"
                  onChange={handleZipInput}
                  className="hidden"
                  id="zip-upload"
                  disabled={disabled || atLimit}
                />
                <label
                  htmlFor="zip-upload"
                  className={cn(
                    "px-4 py-2 text-xs font-medium rounded-md border border-border hover:bg-muted transition-colors cursor-pointer flex items-center gap-1.5",
                    (disabled || atLimit) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <FileArchive className="w-3.5 h-3.5" />
                  Browse ZIP
                </label>
              </div>
            </div>
          )}
        </div>

        {atLimit && (
          <p className="text-xs text-amber-500 mt-2 text-center">
            Maximum {MAX_FILES} files reached
          </p>
        )}
      </div>
    </div>
  );
}
