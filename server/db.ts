import { eq, desc, sql, inArray, like, or, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  audioVerifications, 
  InsertAudioVerification, 
  AudioVerification,
  adminUsers,
  InsertAdminUser,
  AdminUser,
  adminLogs,
  InsertAdminLog,
  AdminLog
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================
// User Management Functions
// ============================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

// ============================================
// Admin User Management Functions
// ============================================

export async function getAllUsers(options?: {
  search?: string;
  plan?: string;
  page?: number;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return { users: [], total: 0 };
  
  const { search, plan, page = 1, limit = 20 } = options || {};
  const offset = (page - 1) * limit;
  
  let conditions = [];
  
  if (search) {
    conditions.push(
      or(
        like(users.email, `%${search}%`),
        like(users.name, `%${search}%`)
      )
    );
  }
  
  if (plan && plan !== 'all') {
    conditions.push(eq(users.plan, plan as "free" | "pro" | "enterprise" | "master"));
  }
  
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(whereClause);
  const total = countResult[0]?.count || 0;
  
  // Get paginated users
  const userList = await db
    .select()
    .from(users)
    .where(whereClause)
    .orderBy(desc(users.lastSignedIn))
    .limit(limit)
    .offset(offset);
  
  return { users: userList, total };
}

export async function updateUserPlan(
  userId: number, 
  plan: "free" | "pro" | "enterprise" | "master"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Set monthly limit based on plan
  const planLimits: Record<string, number> = {
    free: 5,
    pro: 30,
    enterprise: 1000,
    master: -1, // unlimited
  };
  
  await db.update(users).set({ 
    plan,
    monthlyLimit: planLimits[plan],
  }).where(eq(users.id, userId));
}

export async function updateUserUsage(
  userId: number,
  data: {
    usageCount?: number;
    monthlyLimit?: number;
    usageResetDate?: Date | null;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users).set(data).where(eq(users.id, userId));
}

export async function resetUserUsage(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users).set({ 
    usageCount: 0,
    usageResetDate: new Date(),
  }).where(eq(users.id, userId));
}

/**
 * Increment user usage count by 1
 */
export async function incrementUserUsage(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users).set({ 
    usageCount: sql`${users.usageCount} + 1`,
  }).where(eq(users.id, userId));
}

export async function bulkUpdateUserPlan(
  userIds: number[],
  plan: "free" | "pro" | "enterprise" | "master"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const planLimits: Record<string, number> = {
    free: 5,
    pro: 30,
    enterprise: 1000,
    master: -1,
  };
  
  await db.update(users).set({ 
    plan,
    monthlyLimit: planLimits[plan],
  }).where(inArray(users.id, userIds));
}

export async function bulkResetUserUsage(userIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users).set({ 
    usageCount: 0,
    usageResetDate: new Date(),
  }).where(inArray(users.id, userIds));
}

// ============================================
// Admin Management Functions
// ============================================

export async function getAllAdmins() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(adminUsers).orderBy(desc(adminUsers.createdAt));
}

export async function isAdmin(email: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1);
  
  return result.length > 0;
}

export async function isSuperAdmin(email: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db
    .select()
    .from(adminUsers)
    .where(and(
      eq(adminUsers.email, email),
      eq(adminUsers.isSuperAdmin, true)
    ))
    .limit(1);
  
  return result.length > 0;
}

export async function addAdmin(email: string, addedBy: string, isSuperAdmin = false) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(adminUsers).values({
    email,
    isSuperAdmin,
    addedBy,
  });
}

export async function removeAdmin(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(adminUsers).where(eq(adminUsers.email, email));
}

// ============================================
// Admin Log Functions
// ============================================

export async function createAdminLog(log: InsertAdminLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(adminLogs).values(log);
}

export async function getAdminLogs(options?: {
  adminEmail?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return { logs: [], total: 0 };
  
  const { adminEmail, action, startDate, endDate, page = 1, limit = 50 } = options || {};
  const offset = (page - 1) * limit;
  
  let conditions = [];
  
  if (adminEmail) {
    conditions.push(eq(adminLogs.adminEmail, adminEmail));
  }
  
  if (action) {
    conditions.push(eq(adminLogs.action, action));
  }
  
  if (startDate) {
    conditions.push(gte(adminLogs.createdAt, startDate));
  }
  
  if (endDate) {
    conditions.push(lte(adminLogs.createdAt, endDate));
  }
  
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(adminLogs)
    .where(whereClause);
  const total = countResult[0]?.count || 0;
  
  // Get paginated logs
  const logs = await db
    .select()
    .from(adminLogs)
    .where(whereClause)
    .orderBy(desc(adminLogs.createdAt))
    .limit(limit)
    .offset(offset);
  
  return { logs, total };
}

// ============================================
// Audio Verification Queries
// ============================================

export async function createVerification(data: InsertAudioVerification): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(audioVerifications).values(data);
  return Number(result[0].insertId);
}

export async function getVerificationById(id: number): Promise<AudioVerification | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(audioVerifications).where(eq(audioVerifications.id, id)).limit(1);
  return result[0];
}

export async function getVerificationsByUserId(userId: number, options?: {
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
}): Promise<{ verifications: AudioVerification[]; total: number }> {
  const db = await getDb();
  if (!db) return { verifications: [], total: 0 };
  
  const { page = 1, limit = 50, startDate, endDate } = options || {};
  const offset = (page - 1) * limit;
  
  let conditions = [eq(audioVerifications.userId, userId)];
  
  if (startDate) {
    conditions.push(gte(audioVerifications.createdAt, startDate));
  }
  
  if (endDate) {
    conditions.push(lte(audioVerifications.createdAt, endDate));
  }
  
  const whereClause = and(...conditions);
  
  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(audioVerifications)
    .where(whereClause);
  const total = countResult[0]?.count || 0;
  
  // Get paginated verifications
  const verifications = await db
    .select()
    .from(audioVerifications)
    .where(whereClause)
    .orderBy(desc(audioVerifications.createdAt))
    .limit(limit)
    .offset(offset);
  
  return { verifications, total };
}

/**
 * Get user verification statistics (total, observed, not_observed counts)
 */
export async function getUserVerificationStats(userId: number) {
  const db = await getDb();
  if (!db) return { total: 0, observed: 0, notObserved: 0 };
  
  // Get total count
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(audioVerifications)
    .where(eq(audioVerifications.userId, userId));
  const total = totalResult[0]?.count || 0;
  
  // Get observed count
  const observedResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(audioVerifications)
    .where(and(
      eq(audioVerifications.userId, userId),
      eq(audioVerifications.verdict, 'observed')
    ));
  const observed = observedResult[0]?.count || 0;
  
  // Get not_observed count
  const notObservedResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(audioVerifications)
    .where(and(
      eq(audioVerifications.userId, userId),
      eq(audioVerifications.verdict, 'not_observed')
    ));
  const notObserved = notObservedResult[0]?.count || 0;
  
  return { total, observed, notObserved };
}

export async function getAllVerifications(options?: {
  search?: string;
  status?: string;
  verdict?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return { verifications: [], total: 0 };
  
  const { search, status, verdict, startDate, endDate, page = 1, limit = 20 } = options || {};
  const offset = (page - 1) * limit;
  
  let conditions = [];
  
  if (search) {
    conditions.push(like(audioVerifications.fileName, `%${search}%`));
  }
  
  if (status && status !== 'all') {
    conditions.push(eq(audioVerifications.status, status as "pending" | "processing" | "completed" | "failed"));
  }
  
  if (verdict && verdict !== 'all') {
    conditions.push(eq(audioVerifications.verdict, verdict as "observed" | "not_observed"));
  }
  
  if (startDate) {
    conditions.push(gte(audioVerifications.createdAt, startDate));
  }
  
  if (endDate) {
    conditions.push(lte(audioVerifications.createdAt, endDate));
  }
  
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(audioVerifications)
    .where(whereClause);
  const total = countResult[0]?.count || 0;
  
  // Get paginated verifications
  const verifications = await db
    .select()
    .from(audioVerifications)
    .where(whereClause)
    .orderBy(desc(audioVerifications.createdAt))
    .limit(limit)
    .offset(offset);
  
  return { verifications, total };
}

export async function updateVerification(
  id: number,
  data: Partial<Omit<AudioVerification, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(audioVerifications).set(data).where(eq(audioVerifications.id, id));
}

export async function deleteVerification(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(audioVerifications).where(eq(audioVerifications.id, id));
}

export async function deleteAllVerificationsByUserId(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(audioVerifications).where(eq(audioVerifications.userId, userId));
}
