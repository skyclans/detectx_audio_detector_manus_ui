import { useAuth } from "@/_core/hooks/useAuth";
import { ForensicLayout } from "@/components/ForensicLayout";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Clock, FileAudio, LogIn, Trash2 } from "lucide-react";
import { toast } from "sonner";

const VERDICT_TEXTS = {
  observed: "AI signal evidence was observed.",
  not_observed: "AI signal evidence was not observed.",
} as const;

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function History() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: verifications, isLoading } = trpc.verification.list.useQuery(
    { limit: 50 },
    { enabled: isAuthenticated }
  );

  const deleteMutation = trpc.verification.delete.useMutation({
    onSuccess: () => {
      utils.verification.list.invalidate();
      toast.success("Verification record deleted");
    },
    onError: () => {
      toast.error("Failed to delete record");
    },
  });

  if (!authLoading && !isAuthenticated) {
    return (
      <ForensicLayout title="History" subtitle="Verification records">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <LogIn className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Authentication Required
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Sign in to view your verification history.
          </p>
          <Button
            size="lg"
            onClick={() => (window.location.href = getLoginUrl())}
          >
            Sign In to Continue
          </Button>
        </div>
      </ForensicLayout>
    );
  }

  return (
    <ForensicLayout title="History" subtitle="Verification records">
      <div className="forensic-panel">
        <div className="forensic-panel-header flex items-center justify-between">
          <span>Recent Verifications</span>
          {verifications && (
            <span className="text-xs font-normal normal-case">
              {verifications.length} records
            </span>
          )}
        </div>
        <div className="forensic-panel-content">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !verifications || verifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No verification records yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Upload and verify audio files to see them here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {verifications.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-4 p-4 bg-muted/20 rounded-md"
                >
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileAudio className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {v.fileName}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{formatFileSize(v.fileSize)}</span>
                      <span>•</span>
                      <span>{formatDate(new Date(v.createdAt))}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {v.status === "completed" && v.verdict ? (
                      <div
                        className={`text-xs px-2 py-1 rounded ${
                          v.verdict === "observed"
                            ? "bg-forensic-amber/20 text-forensic-amber"
                            : "bg-forensic-green/20 text-forensic-green"
                        }`}
                      >
                        {v.verdict === "observed" ? "Signal Observed" : "No Signal"}
                      </div>
                    ) : v.status === "processing" ? (
                      <div className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">
                        Processing
                      </div>
                    ) : v.status === "failed" ? (
                      <div className="text-xs px-2 py-1 rounded bg-destructive/20 text-destructive">
                        Failed
                      </div>
                    ) : (
                      <div className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                        Pending
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteMutation.mutate({ id: v.id })}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ForensicLayout>
  );
}
