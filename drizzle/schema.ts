import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, bigint, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with plan and usage tracking for admin management.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // Plan and usage tracking
  plan: mysqlEnum("plan", ["free", "pro", "enterprise", "master"]).default("free").notNull(),
  usageCount: int("usageCount").default(0).notNull(),
  monthlyLimit: int("monthlyLimit").default(5).notNull(),
  usageResetDate: timestamp("usageResetDate"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Admin users table for managing admin access.
 * Super admins can add/remove other admins.
 */
export const adminUsers = mysqlTable("admin_users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  isSuperAdmin: boolean("isSuperAdmin").default(false).notNull(),
  addedBy: varchar("addedBy", { length: 320 }), // Email of admin who added this admin
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = typeof adminUsers.$inferInsert;

/**
 * Admin activity logs for audit trail.
 * Tracks all admin actions for accountability.
 */
export const adminLogs = mysqlTable("admin_logs", {
  id: int("id").autoincrement().primaryKey(),
  adminEmail: varchar("adminEmail", { length: 320 }).notNull(),
  action: varchar("action", { length: 64 }).notNull(), // plan_change, usage_modify, admin_add, admin_remove, bulk_action
  targetType: varchar("targetType", { length: 64 }).notNull(), // user, admin
  targetId: int("targetId"), // User ID or Admin ID
  targetEmail: varchar("targetEmail", { length: 320 }),
  previousValue: json("previousValue"), // Previous state before change
  newValue: json("newValue"), // New state after change
  details: text("details"), // Additional details or notes
  ipAddress: varchar("ipAddress", { length: 64 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = typeof adminLogs.$inferInsert;

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
