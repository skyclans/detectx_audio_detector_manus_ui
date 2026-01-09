import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, bigint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Audio verification records table.
 * Stores all verification results with evidence-based data.
 */
export const audioVerifications = mysqlTable("audio_verifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // File metadata
  fileName: varchar("fileName", { length: 512 }).notNull(),
  fileSize: bigint("fileSize", { mode: "number" }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  
  // Audio technical metadata
  duration: int("duration"), // in milliseconds
  sampleRate: int("sampleRate"),
  bitDepth: int("bitDepth"),
  channels: int("channels"),
  codec: varchar("codec", { length: 64 }),
  fileHash: varchar("fileHash", { length: 128 }), // SHA-256 hash
  
  // Verification result - ONLY two allowed verdicts
  verdict: mysqlEnum("verdict", ["observed", "not_observed"]),
  
  // CR-G status data
  crgStatus: varchar("crgStatus", { length: 64 }), // e.g., "CR-G_exceeded" or "CR-G_within_HDB-G"
  primaryExceededAxis: varchar("primaryExceededAxis", { length: 64 }),
  
  // Timeline markers (evidence-only, no severity/probability)
  timelineMarkers: json("timelineMarkers"), // Array of { timestamp: number, type: string }
  
  // Analysis metadata
  analysisData: json("analysisData"), // Raw analysis data for export
  
  // Status
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AudioVerification = typeof audioVerifications.$inferSelect;
export type InsertAudioVerification = typeof audioVerifications.$inferInsert;
