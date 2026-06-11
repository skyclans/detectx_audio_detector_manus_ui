import { useState, useRef, useCallback, useEffect } from "react";
import { ForensicLayout } from "@/components/ForensicLayout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchWithAuth } from "@/lib/api";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  Mic,
  Upload,
  FileAudio,
  X,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Loader2,
  AlertTriangle,
  User,
  Lock,
} from "lucide-react";

const SUPPORTED_FORMATS = ["audio/wav", "audio/mpeg", "audio/mp3", "audio/flac", "audio/ogg", "audio/m4a", "audio/x-m4a", "audio/mp4"];
const SUPPORTED_EXTENSIONS = [".wav", ".mp3", ".flac", ".ogg", ".m4a"];

interface VoiceResult {
  score: number;
  is_spoof: boolean;
  verdict: "SPOOF" | "BONAFIDE";
  threshold: number;
  model: string;
  processing_time_ms: number;
}

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

export default function VoiceVerify() {
  const { user, isAuthenticated } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDuration, setFileDuration] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VoiceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  // ESC key to close login modal
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showLoginPrompt) setShowLoginPrompt(false);
    };
    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [showLoginPrompt]);

  const processFile = useCallback((file: File) => {
    setError(null);
    setResult(null);

    const isValidType = SUPPORTED_FORMATS.some((f) => file.type.includes(f.split("/")[1]));
    const isValidExt = SUPPORTED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!isValidType && !isValidExt) {
      setError("Unsupported format. Use WAV, MP3, FLAC, OGG, or M4A.");
      return;
    }

    setSelectedFile(file);
    setFileDuration(null);

    // Async decode for duration
    (async () => {
      try {
        const ctx = new AudioContext();
        const buf = await ctx.decodeAudioData(await file.arrayBuffer());
        setFileDuration(buf.duration);
        ctx.close();
      } catch { /* format may not be decodable in browser */ }
    })();
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  }, [processFile]);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setFileDuration(null);
    setResult(null);
    setError(null);
  }, []);

  const handleVerify = useCallback(async () => {
    if (!selectedFile) return;

    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    setIsVerifying(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetchWithAuth("/api/verify-voice", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.detail || `Server error (${response.status})`);
      }

      const data: VoiceResult = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Voice verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }, [selectedFile, isAuthenticated]);

  const handleCancel = useCallback(() => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    setIsVerifying(false);
  }, []);

  return (
    <>
      <SEO
        title="Voice Deepfake Detector — AI Voice Clone & Fraud Detection"
        description="Free voice deepfake detector with 97.8% accuracy. Detect AI-generated voices, voice cloning, and deepfake audio. Protect against voice phishing (vishing) and AI voice fraud."
        path="/verify-voice/"
      />
    <ForensicLayout
      title="Voice Verification"
      subtitle="Deepfake voice detection"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header description */}
        <div className="forensic-panel">
          <div className="forensic-panel-header flex items-center gap-2">
            <Shield className="w-4 h-4" />
            DetectX Voice
          </div>
          <div className="forensic-panel-content">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Detect AI-generated speech (TTS deepfake) using SSL v6 engine.
              Upload a voice clip to check if it's real or synthesized by AI (ElevenLabs, OpenAI TTS, Google TTS, etc.).
              For spoken voice only — singing/vocal not yet supported.
            </p>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                ~30ms inference
              </span>
              <span className="flex items-center gap-1">
                <Mic className="w-3 h-3" />
                4s analysis window
              </span>
            </div>
          </div>
        </div>

        {/* Upload panel */}
        <div className="forensic-panel">
          <div className="forensic-panel-header">Voice Upload</div>
          <div className="forensic-panel-content">
            {!selectedFile ? (
              <div
                className={cn(
                  "border-2 border-dashed rounded-md p-8 text-center transition-colors",
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
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
                  id="voice-upload"
                />
                <label htmlFor="voice-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <Mic className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Drop voice recording here or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supported: WAV, MP3, FLAC, OGG, M4A
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                {/* File info */}
                <div className="bg-muted/30 rounded-md p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                        <FileAudio className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate max-w-[250px]">
                          {selectedFile.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span>{formatFileSize(selectedFile.size)}</span>
                          {fileDuration !== null && (
                            <>
                              <span>&middot;</span>
                              <span>{formatDuration(fileDuration)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (isVerifying) handleCancel();
                        else clearFile();
                      }}
                      className="p-1 hover:bg-muted rounded transition-colors"
                      title={isVerifying ? "Cancel" : "Remove file"}
                    >
                      <X className={cn("w-4 h-4", isVerifying ? "text-destructive" : "text-muted-foreground")} />
                    </button>
                  </div>
                </div>

                {/* Verify button */}
                <Button
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className={cn(
                    "w-full h-12 font-semibold text-sm tracking-wide",
                    "bg-forensic-cyan hover:bg-forensic-cyan/90 text-background",
                    isVerifying && "opacity-70"
                  )}
                >
                  {isVerifying ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      ANALYZING VOICE...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Mic className="w-4 h-4" />
                      VERIFY VOICE
                    </span>
                  )}
                </Button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-xs text-destructive flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3" />
                  {error}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Result panel */}
        {result && (
          <div className="forensic-panel">
            <div className="forensic-panel-header flex items-center gap-2">
              {result.is_spoof ? (
                <ShieldAlert className="w-4 h-4 text-red-500" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              )}
              Verdict
            </div>
            <div className="forensic-panel-content">
              {/* Main verdict */}
              <div className={cn(
                "p-6 rounded-lg border-2 text-center",
                result.is_spoof
                  ? "bg-red-500/5 border-red-500/30"
                  : "bg-emerald-500/5 border-emerald-500/30"
              )}>
                <div className={cn(
                  "text-3xl font-bold tracking-tight",
                  result.is_spoof ? "text-red-500" : "text-emerald-500"
                )}>
                  {result.is_spoof ? "AI Voice Detected" : "Human Voice Verified"}
                </div>
                <p className={cn(
                  "text-sm mt-2",
                  result.is_spoof ? "text-red-400/80" : "text-emerald-400/80"
                )}>
                  {result.is_spoof
                    ? "This voice recording shows characteristics of AI-generated speech (deepfake)."
                    : "This voice recording is consistent with authentic human speech."}
                </p>
              </div>

              {/* Metrics */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-muted/30 rounded-md p-3">
                  <div className="text-xs text-muted-foreground mb-1">Model</div>
                  <div className="text-sm font-mono font-medium text-foreground">
                    {result.model}
                  </div>
                </div>
                <div className="bg-muted/30 rounded-md p-3">
                  <div className="text-xs text-muted-foreground mb-1">Processing Time</div>
                  <div className="text-sm font-mono font-medium text-foreground">
                    {result.processing_time_ms}ms
                  </div>
                </div>
                <div className="bg-muted/30 rounded-md p-3">
                  <div className="text-xs text-muted-foreground mb-1">Score</div>
                  <div className="text-sm font-mono font-medium text-foreground">
                    {result.score.toFixed(6)}
                  </div>
                </div>
                <div className="bg-muted/30 rounded-md p-3">
                  <div className="text-xs text-muted-foreground mb-1">Threshold</div>
                  <div className="text-sm font-mono font-medium text-foreground">
                    {result.threshold}
                  </div>
                </div>
              </div>

              {/* Score bar visualization */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>BONAFIDE</span>
                  <span>SPOOF</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden relative">
                  {/* Threshold marker */}
                  <div
                    className="absolute top-0 bottom-0 w-px bg-yellow-500 z-10"
                    style={{ left: `${Math.min(result.threshold * 100, 100)}%` }}
                    title={`Threshold: ${result.threshold}`}
                  />
                  {/* Score indicator */}
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      result.is_spoof ? "bg-red-500" : "bg-emerald-500"
                    )}
                    style={{ width: `${Math.min(result.score * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Login prompt modal */}
        {showLoginPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-background border border-border rounded-lg p-6 max-w-sm mx-4 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Sign in required</h3>
                  <p className="text-xs text-muted-foreground">Voice verification requires authentication</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowLoginPrompt(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-forensic-cyan hover:bg-forensic-cyan/90 text-background"
                  onClick={() => (window.location.href = getLoginUrl())}
                >
                  <User className="w-3 h-3 mr-1" />
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ForensicLayout>
    </>
  );
}
