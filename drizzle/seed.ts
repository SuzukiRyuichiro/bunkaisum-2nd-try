// seeds/index.ts
import { drizzle } from "drizzle-orm/d1";
import { D1Database, D1DatabaseAPI } from "@miniflare/d1";
import { createSQLiteDB } from "@miniflare/shared";
import * as schema from "../server/db/schema";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not defined");

const sqliteDb = await createSQLiteDB(process.env.DATABASE_URL);
const db = drizzle(new D1Database(new D1DatabaseAPI(sqliteDb)), {
  schema,
});

console.log("cleaning...🧹");

await db.delete(schema.usersTable);
await db.delete(schema.expensesTable);

console.log("done cleaning ✅");
console.log("Seeding users and expenses 🌱");

const [scooter] = await db
  .insert(schema.usersTable)
  .values({
    displayName: "Scooter",
  })
  .returning();

await db.insert(schema.expensesTable).values({
  title: "Lunch in Meguro",
  emoji: "🍕",
  totalAmount: 4300,
  paidAt: new Date().toISOString().split("T")[0],
  userId: scooter.id,
});
