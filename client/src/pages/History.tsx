/**
 * History Page - Verification History from DetectX RunPod Server
 * 
 * Fetches verification history from RunPod server using user_id.
 * History is stored on DetectX server, not Manus.
 */

import { ForensicLayout } from "@/components/ForensicLayout";
import { FileAudio, Info, Clock, CheckCircle, XCircle, Loader2, LogIn } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useEffect, useState } from "react";

// DetectX RunPod Server URL
const DETECTX_API_URL = "https://emjvw2an6oynf9-8000.proxy.runpod.net";

interface HistoryRecord {
  id: string;
  filename: string;
  verdict: string; // Full verdict text from API
  orientation: string;
  created_at: string;
  file_size?: number;
  duration?: number;
  cnn_score?: number;
  geometry_exceeded?: boolean;
}

export default function History() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchHistory(user.id.toString());
    }
  }, [user?.id]);

  const fetchHistory = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${DETECTX_API_URL}/history?user_id=${encodeURIComponent(userId)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.status}`);
      }
      const data = await response.json();
      console.log("[History] API response:", data);
      setHistory(data.history || []);
    } catch (err) {
      console.error("Failed to fetch history:", err);
      setError("Failed to load verification history");
    } finally {
      setLoading(false);
    }
  };

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <ForensicLayout title="History" subtitle="Verification history">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <LogIn className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Sign In Required
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
    <ForensicLayout title="History" subtitle="Verification history">
      <div className="forensic-panel">
        <div className="forensic-panel-header flex items-center gap-2">
          <FileAudio className="w-4 h-4" />
          Verification History
        </div>
        <div className="forensic-panel-content">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-forensic-cyan mb-4" />
              <p className="text-sm text-muted-foreground">Loading history...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">Error Loading History</h3>
              <p className="text-sm text-muted-foreground max-w-md">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => user?.id && fetchHistory(user.id.toString())}
              >
                Retry
              </Button>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Info className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Verification History</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                You haven't verified any audio files yet. Start by uploading an audio file on the Verify Audio page.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/30"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      record.verdict.includes("was observed") 
                        ? "bg-forensic-amber/20" 
                        : "bg-forensic-green/20"
                    }`}>
                      {record.verdict.includes("was observed") ? (
                        <XCircle className="w-5 h-5 text-forensic-amber" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-forensic-green" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{record.filename}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {new Date(record.created_at).toLocaleString()}
                        <span className="px-1.5 py-0.5 bg-muted rounded text-[10px] uppercase">
                          {record.orientation.replace("_", " ")}
                        </span>
                        {record.cnn_score !== undefined && (
                          <span className="px-1.5 py-0.5 bg-forensic-cyan/10 text-forensic-cyan rounded text-[10px]">
                            CNN: {(record.cnn_score * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {record.cnn_score !== undefined && (
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-muted-foreground">CNN Score</p>
                        <p className="text-sm font-mono text-foreground">{(record.cnn_score * 100).toFixed(2)}%</p>
                      </div>
                    )}
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      record.verdict.includes("was observed")
                        ? "bg-forensic-amber/20 text-forensic-amber"
                        : "bg-forensic-green/20 text-forensic-green"
                    }`}>
                      {record.verdict.includes("was observed") ? "AI Signal Observed" : "No AI Signal"}
                    </div>
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
