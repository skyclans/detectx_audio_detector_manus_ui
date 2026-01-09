interface MetadataItem {
  label: string;
  value: string | number | null | undefined;
  mono?: boolean;
}

interface MetadataPanelProps {
  metadata: {
    fileName?: string;
    duration?: number | null;
    sampleRate?: number | null;
    bitDepth?: number | null;
    channels?: number | null;
    codec?: string | null;
    fileHash?: string | null;
    fileSize?: number;
  } | null;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const milliseconds = ms % 1000;
  return `${mins}:${secs.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function MetadataRow({ label, value, mono = false }: MetadataItem) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className={`text-sm text-foreground ${mono ? "font-mono" : ""}`}>
        {value ?? "—"}
      </span>
    </div>
  );
}

export function MetadataPanel({ metadata }: MetadataPanelProps) {
  if (!metadata) {
    return (
      <div className="forensic-panel">
        <div className="forensic-panel-header">File Metadata</div>
        <div className="forensic-panel-content">
          <p className="text-sm text-muted-foreground text-center py-8">
            No file selected
          </p>
        </div>
      </div>
    );
  }

  const items: MetadataItem[] = [
    { label: "Filename", value: metadata.fileName },
    {
      label: "Duration",
      value: metadata.duration ? formatDuration(metadata.duration) : null,
      mono: true,
    },
    {
      label: "Sample Rate",
      value: metadata.sampleRate ? `${metadata.sampleRate} Hz` : null,
      mono: true,
    },
    {
      label: "Bit Depth",
      value: metadata.bitDepth ? `${metadata.bitDepth}-bit` : null,
      mono: true,
    },
    {
      label: "Channels",
      value: metadata.channels
        ? metadata.channels === 1
          ? "Mono"
          : metadata.channels === 2
          ? "Stereo"
          : `${metadata.channels} channels`
        : null,
    },
    { label: "Codec", value: metadata.codec },
    {
      label: "File Size",
      value: metadata.fileSize ? formatFileSize(metadata.fileSize) : null,
      mono: true,
    },
    {
      label: "SHA-256",
      value: metadata.fileHash ? `${metadata.fileHash.substring(0, 16)}...` : null,
      mono: true,
    },
  ];

  return (
    <div className="forensic-panel">
      <div className="forensic-panel-header">File Metadata</div>
      <div className="forensic-panel-content">
        {items.map((item) => (
          <MetadataRow key={item.label} {...item} />
        ))}
      </div>
    </div>
  );
}
