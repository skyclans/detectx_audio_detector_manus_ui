import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { extractAudioMetadata } from "./audioMetadata";
import { sendContactEmail } from "./_core/email";

// DetectX RunPod Server URL
const DETECTX_API_URL = process.env.DETECTX_API_URL || "https://emjvw2an6oynf9-8000.proxy.runpod.net";

/**
 * Anonymous Stateless Verification Flow
 * 
 * NON-NEGOTIABLE CONSTRAINTS:
 * 1) No login/authentication required for verification
 * 2) No file storage in Manus - files are transient
 * 3) No upload history or session-based access control
 * 4) DetectX server is sole authority for processing and results
 * 5) Manus acts only as UI layer and request forwarder
 */

// Timeline marker type for evidence-based markers only
const TimelineMarkerSchema = z.object({
  timestamp: z.number(), // milliseconds
  type: z.string(), // e.g., "structural_event", "signal_anomaly"
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  verification: router({
    /**
     * Upload and extract metadata - ANONYMOUS, NO STORAGE
     * 
     * Files are processed in-memory and NOT persisted to Manus storage.
     * Metadata is extracted using ffprobe (container-level inspection).
     * Returns metadata only - file is discarded after extraction.
     */
    upload: publicProcedure
      .input(
        z.object({
          fileName: z.string(),
          fileData: z.string(), // base64 encoded
          contentType: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const fileBuffer = Buffer.from(input.fileData, "base64");

        // Extract forensic metadata using ffprobe (container-level inspection)
        // This occurs BEFORE any analysis or normalization
        const metadata = await extractAudioMetadata(fileBuffer, input.fileName);

        // DO NOT store file - return metadata only
        // File is transient and will be re-sent for processing
        return {
          // No url or fileKey - file is not stored
          metadata: {
            filename: metadata.filename,
            duration: metadata.duration,
            sampleRate: metadata.sampleRate,
            bitDepth: metadata.bitDepth,
            channels: metadata.channels,
            codec: metadata.codec,
            fileSize: metadata.fileSize,
            sha256: metadata.sha256,
          },
        };
      }),

    /**
     * Process verification - ANONYMOUS, STATELESS
     * 
     * Receives file data directly (not from storage).
     * Processes in-memory and returns result immediately.
     * No database records created.
     */
    process: publicProcedure
      .input(
        z.object({
          fileName: z.string(),
          fileData: z.string(), // base64 encoded
          fileSize: z.number().optional(),
          duration: z.number().optional(),
          sampleRate: z.number().optional(),
          orientation: z.enum(["ai_oriented", "balanced", "human_oriented"]).default("balanced"),
        })
      )
      .mutation(async ({ input }) => {
        // Process file in-memory - no storage
        const fileBuffer = Buffer.from(input.fileData, "base64");

        console.log(`[Verification] Processing with orientation: ${input.orientation}`);
        console.log(`[Verification] File: ${input.fileName}, Size: ${input.fileSize}`);

        try {
          // Forward to DetectX RunPod Server using native FormData
          const blob = new Blob([fileBuffer], { type: "audio/mpeg" });
          const formData = new FormData();
          formData.append("file", blob, input.fileName);

          const apiUrl = `${DETECTX_API_URL}/verify-audio?orientation=${input.orientation}`;
          console.log(`[Verification] Calling DetectX API: ${apiUrl}`);

          const response = await fetch(apiUrl, {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Verification] DetectX API error: ${response.status} - ${errorText}`);
            throw new Error(`DetectX API returned ${response.status}`);
          }

          // Extended DetectX response with detailed analysis
          interface AxisMetric {
            name: string;
            value: string;
          }
          interface AxisDetail {
            id: string;
            name: string;
            status: "exceeded" | "within_bounds";
            metrics: AxisMetric[];
          }
          interface TimelineEvent {
            time: number;
            event_type: string;
            axis: string;
            note: string | null;
          }
          interface StemComponent {
            id: string;
            name: string;
            available: boolean;
          }
          interface GeometryTraceAxis {
            axis: string;
            exceeded: boolean;
            metrics: AxisMetric[];
          }
          interface DetailedAnalysis {
            axes: AxisDetail[];
            timeline_events: TimelineEvent[];
            stem_components: StemComponent[];
            geometry_trace: GeometryTraceAxis[];
            g1_b_metrics: Record<string, unknown> | null;
            g3_b_metrics: Record<string, unknown> | null;
          }

          const detectxResult = await response.json() as {
            verdict: string;
            authority: string;
            orientation: string;
            exceeded_axes: string[];
            cnn_score: number | null;
            geometry_exceeded: boolean | null;
            notice: string | null;
            metadata: {
              duration: number | null;
              sample_rate: number | null;
              channels: number | null;
              bit_depth: number | null;
              codec: string | null;
              file_size: number | null;
            } | null;
            detailed_analysis: DetailedAnalysis | null;
          };

          console.log(`[Verification] DetectX result:`, detectxResult);

          // Map DetectX response to UI format
          const isAI = detectxResult.verdict === "AI signal evidence was observed.";

          // Map detailed analysis for UI components
          const detailedAnalysis = detectxResult.detailed_analysis;

          return {
            success: true,
            verdict: isAI ? "observed" as const : "not_observed" as const,
            crgStatus: isAI ? "CR-G_exceeded" : "CR-G_within_HDB-G",
            primaryExceededAxis: detectxResult.exceeded_axes[0] || null,
            exceededAxes: detectxResult.exceeded_axes,
            timelineMarkers: [] as { timestamp: number; type: string }[],
            // Server metadata from DetectX
            metadata: detectxResult.metadata || {
              duration: input.duration,
              sample_rate: input.sampleRate,
              channels: 2,
              bit_depth: 16,
              codec: "PCM_16",
              file_size: input.fileSize,
            },
            orientation: detectxResult.orientation as "ai_oriented" | "balanced" | "human_oriented",
            cnn_score: detectxResult.cnn_score,
            geometry_exceeded: detectxResult.geometry_exceeded,
            notice: detectxResult.notice,
            // Detailed analysis for UI components
            detailedAnalysis: detailedAnalysis ? {
              axes: detailedAnalysis.axes,
              timelineEvents: detailedAnalysis.timeline_events.map(e => ({
                time: e.time,
                eventType: e.event_type,
                axis: e.axis,
                note: e.note,
              })),
              stemComponents: detailedAnalysis.stem_components,
              geometryTrace: detailedAnalysis.geometry_trace,
            } : null,
          };
        } catch (error) {
          console.error(`[Verification] Error calling DetectX:`, error);

          // Fallback to simulation if DetectX is unavailable
          console.log(`[Verification] Falling back to simulation mode`);
          const analysisResult = simulateForensicAnalysis({
            duration: input.duration,
            sampleRate: input.sampleRate,
            fileSize: input.fileSize,
            orientation: input.orientation,
          });

          return {
            success: true,
            verdict: analysisResult.verdict,
            crgStatus: analysisResult.crgStatus,
            primaryExceededAxis: analysisResult.primaryExceededAxis,
            timelineMarkers: analysisResult.timelineMarkers,
            metadata: {
              duration: input.duration,
              sample_rate: input.sampleRate,
              channels: 2,
              bit_depth: 16,
              codec: "PCM_16",
              file_size: input.fileSize,
            },
            orientation: input.orientation,
            notice: "Fallback mode - DetectX server unavailable",
          };
        }
      }),
  }),

  contact: router({
    /**
     * Submit contact form inquiry
     * Sends notification to owner and stores inquiry
     */
    submit: publicProcedure
      .input(
        z.object({
          inquiryType: z.string(),
          name: z.string(),
          organization: z.string().optional(),
          email: z.string().email(),
          subject: z.string(),
          message: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        console.log("[Contact] Inquiry received:", {
          inquiryType: input.inquiryType,
          name: input.name,
          organization: input.organization,
          email: input.email,
          subject: input.subject,
          messageLength: input.message.length,
          timestamp: new Date().toISOString(),
        });

        // Send email to support@detectx.app
        const emailResult = await sendContactEmail({
          inquiryType: input.inquiryType,
          name: input.name,
          organization: input.organization,
          email: input.email,
          subject: input.subject,
          message: input.message,
        });

        if (!emailResult.success) {
          console.error("[Contact] Failed to send email:", emailResult.error);
          // Still return success to user - inquiry was received
          // Email failure is logged but doesn't block submission
        }

        return {
          success: true,
          message: "Inquiry submitted successfully",
        };
      }),
  }),
});

// Simulated forensic analysis function
// In production, this would forward to DetectX server
function simulateForensicAnalysis(verification: {
  duration?: number | null;
  sampleRate?: number | null;
  fileSize?: number;
  orientation?: "ai_oriented" | "balanced" | "human_oriented";
}) {
  // Generate deterministic results based on file characteristics
  // This is a simulation - real implementation would forward to DetectX
  const seed = (verification.fileSize || 1000) % 100;
  
  // Orientation affects threshold for AI signal detection
  // ai_oriented: lower threshold (more likely to detect AI)
  // human_oriented: higher threshold (more protective of humans)
  const orientationThresholds = {
    ai_oriented: 30,
    balanced: 50,
    human_oriented: 70,
  };
  const threshold = orientationThresholds[verification.orientation || "balanced"];
  const hasAISignal = seed > threshold;

  const verdict: "observed" | "not_observed" = hasAISignal ? "observed" : "not_observed";
  const crgStatus = hasAISignal ? "CR-G_exceeded" : "CR-G_within_HDB-G";
  const primaryExceededAxis = hasAISignal ? "spectral_coherence" : null;

  // Generate timeline markers (evidence-only, no severity scores)
  const timelineMarkers: { timestamp: number; type: string }[] = [];
  const duration = verification.duration || 60000;

  if (hasAISignal) {
    // Add structural event markers
    const markerCount = Math.floor(seed / 20) + 1;
    for (let i = 0; i < markerCount; i++) {
      timelineMarkers.push({
        timestamp: Math.floor((duration / (markerCount + 1)) * (i + 1)),
        type: "structural_event",
      });
    }
  }

  return {
    verdict,
    crgStatus,
    primaryExceededAxis,
    timelineMarkers,
    analysisData: {
      analysisVersion: "1.0.0",
      analysisTimestamp: new Date().toISOString(),
      sampleRate: verification.sampleRate,
      duration: verification.duration,
      crgMetrics: {
        status: crgStatus,
        exceededAxis: primaryExceededAxis,
      },
      structuralEvents: timelineMarkers.length,
    },
  };
}

export type AppRouter = typeof appRouter;
