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

await db.delete(schema.expensesTable);
await db.delete(schema.usersTable);

console.log("done cleaning ✅");
console.log("Seeding users and expenses 🌱");

// Create users
const [scooter, kaede, kouga, nanako, kyochan] = await db
  .insert(schema.usersTable)
  .values([
    { displayName: "Scooter" },
    { displayName: "楓" },
    { displayName: "恒河" },
    { displayName: "ななこ" },
    { displayName: "きょうちゃん" },
  ])
  .returning();

// Helper function to get a date N days ago
const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
};

// Create 20 expenses
const expenses = [
  {
    title: "トイレットペーパー",
    emoji: "🧻",
    totalAmount: 980,
    paidAt: daysAgo(58),
    userId: scooter.id,
  },
  {
    title: "居酒屋",
    emoji: "🍺",
    totalAmount: 8500,
    paidAt: daysAgo(55),
    userId: kaede.id,
  },
  {
    title: "シャンプー・リンス",
    emoji: "🧴",
    totalAmount: 1580,
    paidAt: daysAgo(52),
    userId: nanako.id,
  },
  {
    title: "焼肉",
    emoji: "🥩",
    totalAmount: 12000,
    paidAt: daysAgo(48),
    userId: kouga.id,
  },
  {
    title: "洗濯洗剤",
    emoji: "🧺",
    totalAmount: 780,
    paidAt: daysAgo(45),
    userId: kyochan.id,
  },
  {
    title: "カラオケ",
    emoji: "🎤",
    totalAmount: 6300,
    paidAt: daysAgo(42),
    userId: scooter.id,
  },
  {
    title: "食器用洗剤",
    emoji: "🧽",
    totalAmount: 450,
    paidAt: daysAgo(38),
    userId: kaede.id,
  },
  {
    title: "みんなで鍋",
    emoji: "🍲",
    totalAmount: 5400,
    paidAt: daysAgo(35),
    userId: nanako.id,
  },
  {
    title: "キッチンペーパー",
    emoji: "🧻",
    totalAmount: 680,
    paidAt: daysAgo(31),
    userId: kouga.id,
  },
  {
    title: "ラーメン屋",
    emoji: "🍜",
    totalAmount: 4200,
    paidAt: daysAgo(28),
    userId: kyochan.id,
  },
  {
    title: "ゴミ袋",
    emoji: "🗑️",
    totalAmount: 580,
    paidAt: daysAgo(24),
    userId: scooter.id,
  },
  {
    title: "お好み焼き",
    emoji: "🥞",
    totalAmount: 3800,
    paidAt: daysAgo(21),
    userId: kaede.id,
  },
  {
    title: "ハンドソープ",
    emoji: "🧴",
    totalAmount: 320,
    paidAt: daysAgo(18),
    userId: nanako.id,
  },
  {
    title: "映画館",
    emoji: "🎬",
    totalAmount: 7500,
    paidAt: daysAgo(14),
    userId: kouga.id,
  },
  {
    title: "キッチンスポンジ",
    emoji: "🧽",
    totalAmount: 280,
    paidAt: daysAgo(11),
    userId: kyochan.id,
  },
  {
    title: "寿司",
    emoji: "🍣",
    totalAmount: 9200,
    paidAt: daysAgo(9),
    userId: scooter.id,
  },
  {
    title: "ティッシュペーパー",
    emoji: "📦",
    totalAmount: 880,
    paidAt: daysAgo(7),
    userId: kaede.id,
  },
  {
    title: "温泉",
    emoji: "♨️",
    totalAmount: 5000,
    paidAt: daysAgo(5),
    userId: nanako.id,
  },
  {
    title: "コンビニお菓子",
    emoji: "🍫",
    totalAmount: 1200,
    paidAt: daysAgo(3),
    userId: kouga.id,
  },
  {
    title: "タピオカ",
    emoji: "🧋",
    totalAmount: 2100,
    paidAt: daysAgo(1),
    userId: kyochan.id,
  },
];

await db.insert(schema.expensesTable).values(expenses);

console.log("Seeding complete! ✅");
