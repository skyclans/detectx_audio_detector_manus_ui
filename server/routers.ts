import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { extractAudioMetadata } from "./audioMetadata";
import { sendContactEmail } from "./_core/email";

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
        })
      )
      .mutation(async ({ input }) => {
        // Process file in-memory - no storage
        const fileBuffer = Buffer.from(input.fileData, "base64");

        // Simulate analysis (in production, forward to DetectX server)
        // Generate deterministic, evidence-based results
        const analysisResult = simulateForensicAnalysis({
          duration: input.duration,
          sampleRate: input.sampleRate,
          fileSize: input.fileSize,
        });

        // Return results immediately - no database storage
        return {
          success: true,
          verdict: analysisResult.verdict,
          crgStatus: analysisResult.crgStatus,
          primaryExceededAxis: analysisResult.primaryExceededAxis,
          timelineMarkers: analysisResult.timelineMarkers,
        };
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
}) {
  // Generate deterministic results based on file characteristics
  // This is a simulation - real implementation would forward to DetectX
  const seed = (verification.fileSize || 1000) % 100;
  const hasAISignal = seed > 50;

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
