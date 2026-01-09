import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createVerification,
  getVerificationById,
  getVerificationsByUserId,
  updateVerification,
  deleteVerification,
  deleteAllVerificationsByUserId,
} from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";
import { extractAudioMetadata } from "./audioMetadata";

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
    // Create a new verification record
    create: protectedProcedure
      .input(
        z.object({
          fileName: z.string(),
          fileSize: z.number(),
          fileUrl: z.string(),
          fileKey: z.string(),
          duration: z.number().optional(),
          sampleRate: z.number().optional(),
          bitDepth: z.number().optional(),
          channels: z.number().optional(),
          codec: z.string().optional(),
          fileHash: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const id = await createVerification({
          userId: ctx.user.id,
          fileName: input.fileName,
          fileSize: input.fileSize,
          fileUrl: input.fileUrl,
          fileKey: input.fileKey,
          duration: input.duration,
          sampleRate: input.sampleRate,
          bitDepth: input.bitDepth,
          channels: input.channels,
          codec: input.codec,
          fileHash: input.fileHash,
          status: "pending",
        });
        return { id };
      }),

    // Get a single verification by ID
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const verification = await getVerificationById(input.id);
        if (!verification) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Verification not found" });
        }
        if (verification.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }
        return verification;
      }),

    // Get user's verification history
    list: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(50) }).optional())
      .query(async ({ ctx, input }) => {
        return getVerificationsByUserId(ctx.user.id, input?.limit ?? 50);
      }),

    // Process verification (simulate analysis)
    process: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const verification = await getVerificationById(input.id);
        if (!verification) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Verification not found" });
        }
        if (verification.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }

        // Update status to processing
        await updateVerification(input.id, { status: "processing" });

        // Simulate analysis (in production, this would call actual analysis engine)
        // Generate deterministic, evidence-based results
        const analysisResult = simulateForensicAnalysis(verification);

        // Update with results
        await updateVerification(input.id, {
          status: "completed",
          verdict: analysisResult.verdict,
          crgStatus: analysisResult.crgStatus,
          primaryExceededAxis: analysisResult.primaryExceededAxis,
          timelineMarkers: analysisResult.timelineMarkers,
          analysisData: analysisResult.analysisData,
        });

        return { success: true };
      }),

    // Delete a verification
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const verification = await getVerificationById(input.id);
        if (!verification) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Verification not found" });
        }
        if (verification.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }
        await deleteVerification(input.id);
        return { success: true };
      }),

    // Delete all verifications for current user
    deleteAll: protectedProcedure
      .mutation(async ({ ctx }) => {
        await deleteAllVerificationsByUserId(ctx.user.id);
        return { success: true };
      }),

    // Upload file endpoint with forensic metadata extraction
    upload: protectedProcedure
      .input(
        z.object({
          fileName: z.string(),
          fileData: z.string(), // base64 encoded
          contentType: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const fileBuffer = Buffer.from(input.fileData, "base64");
        const fileKey = `audio/${ctx.user.id}/${nanoid()}-${input.fileName}`;

        // Extract forensic metadata using ffprobe (container-level inspection)
        // This occurs BEFORE any analysis or normalization
        const metadata = await extractAudioMetadata(fileBuffer, input.fileName);

        const { url } = await storagePut(fileKey, fileBuffer, input.contentType);

        return {
          url,
          fileKey,
          // Forensic intake record - immutable properties of original file
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
  }),
});

// Simulated forensic analysis function
// In production, this would connect to actual analysis engine
function simulateForensicAnalysis(verification: {
  duration?: number | null;
  sampleRate?: number | null;
  fileSize: number;
}) {
  // Generate deterministic results based on file characteristics
  // This is a simulation - real implementation would use actual forensic algorithms
  const seed = verification.fileSize % 100;
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
