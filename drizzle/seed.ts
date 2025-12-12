// seeds/index.ts
import { drizzle } from "drizzle-orm/d1";
import { D1Database, D1DatabaseAPI } from "@miniflare/d1";
import { createSQLiteDB } from "@miniflare/shared";
import * as schema from "../server/db/schema";
import { fairSplit } from "../app/utils/fairSplit";
import { ratioSplit } from "../app/utils/ratioSplit";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not defined");

const sqliteDb = await createSQLiteDB(process.env.DATABASE_URL);
const db = drizzle(new D1Database(new D1DatabaseAPI(sqliteDb)), {
  schema,
});

console.log("cleaning...🧹");

await db.delete(schema.oAuthAccountsTable);
await db.delete(schema.involvementsTable);
await db.delete(schema.expensesTable);
await db.delete(schema.groupMembersTable);
await db.delete(schema.usersTable);
await db.delete(schema.groupsTable);

console.log("done cleaning ✅");
console.log("Seeding users and expenses 🌱");

const [all, dubai, shizuoka] = await db
  .insert(schema.groupsTable)
  .values([
    {
      name: "みんな",
      emoji: "🏠",
    },
    {
      name: "ドバイ旅行",
      emoji: "🇦🇪",
    },
    {
      name: "静岡旅行",
      emoji: "🚙",
    },
  ])
  .returning();

// Create users
const users = await db
  .insert(schema.usersTable)
  .values([
    {
      displayName: "Scooter",
      profilePictureUrl:
        "https://profile.line-scdn.net/0hZuO-jXPgBVpiVBtI3WV7ZBIEBjBBJVxIHGBCNQBXWjlcYUYPGTQdOF9UXW5XbUEJRjsdOV5cCWhAGABYOTo9WTEwXg5eCgBwEWdLbxw1Ij4vFxJ0CGI8O1RcWGo6ATFfKC5IQRBcLB8JJz94OmYaYjY_LjxaEAZuMANpDGdma9kNVnIPTzNDOV5cU27f",
    },
    {
      displayName: "楓",
      profilePictureUrl:
        "https://profile.line-scdn.net/0h3P04sdyXbH8dTX0xOxkSAG0dbxU-PDVtZXsqGiBEYEYnei4tMSx0TSBINhogLiMgMC50HCkYNxoRXhsZAxuQSxp9MU4hdC4gOSMnmQ",
    },
    {
      displayName: "恒河",
      profilePictureUrl:
        "https://profile.line-scdn.net/0hMIsg80Z-EmZeHgwnta9sWC5OEQx9b0t0c35UATkcTQFgLFZkIXhUAGgaTVczJwBkdnEOAW5LHgV8eQM3FiMbeRJgDgsRTg42AQhfUBxONQs3S0k3GxYnAw9aCjRkLlVOFzwqfWxDTioYUFVRCgYYZ2lBBV4Rcy1PCEl-MFssfOUxHGUzc3lUBWIWRFLj",
    },
    {
      displayName: "ななこ",
      profilePictureUrl: "https://placehold.jp/150x150.png",
    },
    {
      displayName: "きょうちゃん",
      profilePictureUrl: "https://placehold.jp/150x150.png",
    },
  ])
  .returning();

const [scooter, kaede, kouga, nanako, kyochan] = users;

const members = await db.insert(schema.groupMembersTable).values([
  ...users.map((user) => ({
    userId: user.id,
    groupId: all.id,
  })),
  ...[kouga, kaede, kyochan].map((user) => ({
    userId: user.id,
    groupId: dubai.id,
  })),
  ...[kouga, nanako, scooter, kaede].map((user) => ({
    userId: user.id,
    groupId: shizuoka.id,
  })),
]);

// Helper function to get a date N days ago
const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
};

// Helper to get random subset of users
const getRandomParticipants = (
  allUsers: typeof users,
  minCount: number = 2
) => {
  // 60% chance of everyone, 40% chance of subset
  if (Math.random() < 0.6) {
    return allUsers;
  }

  // Random subset: 2 to (users.length - 1) people
  const count =
    Math.floor(Math.random() * (allUsers.length - minCount + 1)) + minCount;
  const shuffled = [...allUsers].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Helper to get random user from array
const getRandomUser = (userArray: typeof users) => {
  return userArray[Math.floor(Math.random() * userArray.length)];
};

// Define group members
const allGroupMembers = users; // All 5 users
const dubaiGroupMembers = [kouga, kaede, kyochan];
const shizuokaGroupMembers = [kouga, nanako, scooter, kaede];

// Create expenses for みんな group (7 expenses - equal split)
const allGroupExpenses = [
  {
    title: "トイレットペーパー",
    emoji: "🧻",
    totalAmount: 980,
    paidAt: daysAgo(58),
    userId: getRandomUser(allGroupMembers).id,
    groupId: all.id,
  },
  {
    title: "居酒屋",
    emoji: "🍺",
    totalAmount: 8500,
    paidAt: daysAgo(52),
    userId: getRandomUser(allGroupMembers).id,
    groupId: all.id,
  },
  {
    title: "シャンプー・リンス",
    emoji: "🧴",
    totalAmount: 1580,
    paidAt: daysAgo(45),
    userId: getRandomUser(allGroupMembers).id,
    groupId: all.id,
  },
  {
    title: "焼肉",
    emoji: "🥩",
    totalAmount: 12000,
    paidAt: daysAgo(38),
    userId: getRandomUser(allGroupMembers).id,
    groupId: all.id,
  },
  {
    title: "洗濯洗剤",
    emoji: "🧺",
    totalAmount: 780,
    paidAt: daysAgo(31),
    userId: getRandomUser(allGroupMembers).id,
    groupId: all.id,
  },
  {
    title: "カラオケ",
    emoji: "🎤",
    totalAmount: 6300,
    paidAt: daysAgo(24),
    userId: getRandomUser(allGroupMembers).id,
    groupId: all.id,
  },
  {
    title: "食器用洗剤",
    emoji: "🧽",
    totalAmount: 450,
    paidAt: daysAgo(18),
    userId: getRandomUser(allGroupMembers).id,
    groupId: all.id,
  },
];

// Create expenses for Dubai group (7 expenses - equal split)
const dubaiGroupExpenses = [
  {
    title: "飛行機チケット",
    emoji: "✈️",
    totalAmount: 120000,
    paidAt: daysAgo(55),
    userId: getRandomUser(dubaiGroupMembers).id,
    groupId: dubai.id,
  },
  {
    title: "ホテル代",
    emoji: "🏨",
    totalAmount: 85000,
    paidAt: daysAgo(48),
    userId: getRandomUser(dubaiGroupMembers).id,
    groupId: dubai.id,
  },
  {
    title: "ディナークルーズ",
    emoji: "🚢",
    totalAmount: 15000,
    paidAt: daysAgo(42),
    userId: getRandomUser(dubaiGroupMembers).id,
    groupId: dubai.id,
  },
  {
    title: "お土産",
    emoji: "🎁",
    totalAmount: 8500,
    paidAt: daysAgo(35),
    userId: getRandomUser(dubaiGroupMembers).id,
    groupId: dubai.id,
  },
  {
    title: "砂漠ツアー",
    emoji: "🐪",
    totalAmount: 12000,
    paidAt: daysAgo(28),
    userId: getRandomUser(dubaiGroupMembers).id,
    groupId: dubai.id,
  },
  {
    title: "タクシー代",
    emoji: "🚕",
    totalAmount: 3500,
    paidAt: daysAgo(21),
    userId: getRandomUser(dubaiGroupMembers).id,
    groupId: dubai.id,
  },
  {
    title: "レストラン",
    emoji: "🍽️",
    totalAmount: 9200,
    paidAt: daysAgo(14),
    userId: getRandomUser(dubaiGroupMembers).id,
    groupId: dubai.id,
  },
];

// Create expenses for Shizuoka group (6 expenses - equal split)
const shizuokaGroupExpenses = [
  {
    title: "ガソリン代",
    emoji: "⛽",
    totalAmount: 8500,
    paidAt: daysAgo(50),
    userId: getRandomUser(shizuokaGroupMembers).id,
    groupId: shizuoka.id,
  },
  {
    title: "温泉宿",
    emoji: "♨️",
    totalAmount: 32000,
    paidAt: daysAgo(44),
    userId: getRandomUser(shizuokaGroupMembers).id,
    groupId: shizuoka.id,
  },
  {
    title: "お茶お土産",
    emoji: "🍵",
    totalAmount: 4500,
    paidAt: daysAgo(37),
    userId: getRandomUser(shizuokaGroupMembers).id,
    groupId: shizuoka.id,
  },
  {
    title: "海鮮丼",
    emoji: "🦐",
    totalAmount: 6400,
    paidAt: daysAgo(30),
    userId: getRandomUser(shizuokaGroupMembers).id,
    groupId: shizuoka.id,
  },
  {
    title: "高速道路代",
    emoji: "🛣️",
    totalAmount: 5200,
    paidAt: daysAgo(23),
    userId: getRandomUser(shizuokaGroupMembers).id,
    groupId: shizuoka.id,
  },
  {
    title: "おでん",
    emoji: "🍢",
    totalAmount: 3800,
    paidAt: daysAgo(16),
    userId: getRandomUser(shizuokaGroupMembers).id,
    groupId: shizuoka.id,
  },
];

const allExpenses = [
  ...allGroupExpenses,
  ...dubaiGroupExpenses,
  ...shizuokaGroupExpenses,
];

const insertedExpenses = await db
  .insert(schema.expensesTable)
  .values(allExpenses)
  .returning();

// Create involvements for each expense
for (const expense of insertedExpenses) {
  // Determine which group this expense belongs to
  let groupMembers: typeof users;
  if (expense.groupId === all.id) {
    groupMembers = allGroupMembers;
  } else if (expense.groupId === dubai.id) {
    groupMembers = dubaiGroupMembers;
  } else if (expense.groupId === shizuoka.id) {
    groupMembers = shizuokaGroupMembers;
  } else {
    continue;
  }

  // For the first few expenses, include all group members
  // Otherwise, randomly select participants
  const expenseIndex = insertedExpenses.indexOf(expense);
  const participants =
    expenseIndex < 3 ? groupMembers : getRandomParticipants(groupMembers);

  const participantIds = participants.map((user) => user.id);
  const splits = fairSplit(expense.totalAmount || 0, participantIds);

  const values = [
    ...Array.from(splits?.entries() || []).map(([userId, amount]) => {
      return {
        userId,
        expenseId: expense.id,
        amount: amount,
        type: "share",
      };
    }),
    {
      userId: expense.userId,
      expenseId: expense.id,
      amount: -expense.totalAmount,
      type: "payment",
    },
  ];

  await db.insert(schema.involvementsTable).values(values);
}

// Create ratio split expenses (2 for each group = 6 total)
const allGroupRatioExpenses = [
  {
    title: "寿司",
    emoji: "🍣",
    totalAmount: 9200,
    paidAt: daysAgo(11),
    userId: getRandomUser(allGroupMembers).id,
    groupId: all.id,
    splitType: "ratio",
  },
  {
    title: "ティッシュペーパー",
    emoji: "📦",
    totalAmount: 880,
    paidAt: daysAgo(5),
    userId: getRandomUser(allGroupMembers).id,
    groupId: all.id,
    splitType: "ratio",
  },
];

const dubaiGroupRatioExpenses = [
  {
    title: "スパ",
    emoji: "💆",
    totalAmount: 18000,
    paidAt: daysAgo(9),
    userId: getRandomUser(dubaiGroupMembers).id,
    groupId: dubai.id,
    splitType: "ratio",
  },
  {
    title: "カフェ",
    emoji: "☕",
    totalAmount: 2400,
    paidAt: daysAgo(3),
    userId: getRandomUser(dubaiGroupMembers).id,
    groupId: dubai.id,
    splitType: "ratio",
  },
];

const shizuokaGroupRatioExpenses = [
  {
    title: "みかん",
    emoji: "🍊",
    totalAmount: 3200,
    paidAt: daysAgo(7),
    userId: getRandomUser(shizuokaGroupMembers).id,
    groupId: shizuoka.id,
    splitType: "ratio",
  },
  {
    title: "駐車場代",
    emoji: "🅿️",
    totalAmount: 1500,
    paidAt: daysAgo(1),
    userId: getRandomUser(shizuokaGroupMembers).id,
    groupId: shizuoka.id,
    splitType: "ratio",
  },
];

const allRatioExpenses = [
  ...allGroupRatioExpenses,
  ...dubaiGroupRatioExpenses,
  ...shizuokaGroupRatioExpenses,
];

const insertedRatioExpenses = await db
  .insert(schema.expensesTable)
  .values(allRatioExpenses)
  .returning();

// Create involvements for ratio expenses
for (const expense of insertedRatioExpenses) {
  // Determine which group this expense belongs to
  let groupMembers: typeof users;
  if (expense.groupId === all.id) {
    groupMembers = allGroupMembers;
  } else if (expense.groupId === dubai.id) {
    groupMembers = dubaiGroupMembers;
  } else if (expense.groupId === shizuoka.id) {
    groupMembers = shizuokaGroupMembers;
  } else {
    continue;
  }

  // For the first few expenses, include all group members
  // Otherwise, randomly select participants
  const expenseIndex = insertedRatioExpenses.indexOf(expense);
  const participants =
    expenseIndex < 2 ? groupMembers : getRandomParticipants(groupMembers);

  const ratioMap = new Map(
    participants.map((user) => [user.id, Math.ceil(Math.random() * 4)])
  );
  const splits = ratioSplit(expense.totalAmount || 0, ratioMap);

  const values = [
    ...Array.from(splits?.entries() || []).map(([userId, amount]) => {
      return {
        userId,
        expenseId: expense.id,
        amount: amount,
        type: "share",
        shareRatio: ratioMap.get(userId),
      };
    }),
    {
      userId: expense.userId,
      expenseId: expense.id,
      amount: -expense.totalAmount,
      type: "payment",
    },
  ];

  await db.insert(schema.involvementsTable).values(values);
}
console.log("Seeding complete! ✅");
