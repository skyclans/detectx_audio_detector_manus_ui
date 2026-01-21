import { drizzle } from 'drizzle-orm/mysql2';
import { sql, desc } from 'drizzle-orm';
import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, bigint, json } from 'drizzle-orm/mysql-core';

// Define schema inline
const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
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
  
  console.log("=== All Verifications ===");
  const verifications = await db.select().from(audioVerifications).orderBy(desc(audioVerifications.createdAt)).limit(50);
  
  console.log(`Total verifications found: ${verifications.length}`);
  console.log("");
  
  // Group by userId
  const byUser = {};
  for (const v of verifications) {
    if (!byUser[v.userId]) {
      byUser[v.userId] = [];
    }
    byUser[v.userId].push(v);
  }
  
  console.log("=== Verifications by User ID ===");
  for (const [userId, vList] of Object.entries(byUser)) {
    console.log(`\nUser ID ${userId}: ${vList.length} verifications`);
    for (const v of vList) {
      console.log(`  - ${v.fileName} | ${v.verdict || 'pending'} | ${v.createdAt}`);
    }
  }
  
  // Check if there are any verifications with user IDs that don't match our known users
  console.log("\n=== Checking User Mapping ===");
  const allUsers = await db.select().from(users);
  const userMap = new Map(allUsers.map(u => [u.id, u]));
  
  for (const [userId, vList] of Object.entries(byUser)) {
    const user = userMap.get(parseInt(userId));
    if (user) {
      console.log(`User ID ${userId} (${user.email}): ${vList.length} verifications`);
    } else {
      console.log(`User ID ${userId} (NOT FOUND IN USERS TABLE): ${vList.length} verifications`);
    }
  }
  
  process.exit(0);
}

main().catch(console.error);
