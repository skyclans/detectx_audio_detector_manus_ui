import { drizzle } from 'drizzle-orm/mysql2';
import { like, or, eq, sql } from 'drizzle-orm';
import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, boolean, json, bigint } from 'drizzle-orm/mysql-core';

// Define schema inline
const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  plan: mysqlEnum("plan", ["free", "pro", "enterprise", "master"]).default("free").notNull(),
  usageCount: int("usageCount").default(0).notNull(),
  monthlyLimit: int("monthlyLimit").default(5).notNull(),
  usageResetDate: timestamp("usageResetDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

const audioVerifications = mysqlTable("audio_verifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  fileName: varchar("fileName", { length: 512 }).notNull(),
  verdict: mysqlEnum("verdict", ["observed", "not_observed"]),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

async function main() {
  const db = drizzle(process.env.DATABASE_URL);
  
  console.log("=== Users with skyclans or bigbandent email ===");
  const targetUsers = await db.select().from(users).where(
    or(
      like(users.email, '%skyclans%'),
      like(users.email, '%bigbandent%')
    )
  );
  
  for (const user of targetUsers) {
    console.log(`\nUser ID: ${user.id}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Plan: ${user.plan}`);
    console.log(`  Usage: ${user.usageCount} / ${user.monthlyLimit === -1 ? '∞' : user.monthlyLimit}`);
    console.log(`  Last Signed In: ${user.lastSignedIn}`);
    
    // Get verification count for this user
    const verifications = await db.select({ count: sql`count(*)` })
      .from(audioVerifications)
      .where(eq(audioVerifications.userId, user.id));
    console.log(`  Verifications: ${verifications[0]?.count || 0}`);
    
    // Get observed/not_observed counts
    const observedCount = await db.select({ count: sql`count(*)` })
      .from(audioVerifications)
      .where(
        sql`${audioVerifications.userId} = ${user.id} AND ${audioVerifications.verdict} = 'observed'`
      );
    const notObservedCount = await db.select({ count: sql`count(*)` })
      .from(audioVerifications)
      .where(
        sql`${audioVerifications.userId} = ${user.id} AND ${audioVerifications.verdict} = 'not_observed'`
      );
    console.log(`  AI Observed: ${observedCount[0]?.count || 0}`);
    console.log(`  Not Observed: ${notObservedCount[0]?.count || 0}`);
  }
  
  console.log("\n=== All users ===");
  const allUsers = await db.select().from(users).limit(20);
  console.table(allUsers.map(u => ({
    id: u.id,
    email: u.email,
    plan: u.plan,
    usage: `${u.usageCount}/${u.monthlyLimit === -1 ? '∞' : u.monthlyLimit}`,
    role: u.role
  })));
  
  process.exit(0);
}

main().catch(console.error);
