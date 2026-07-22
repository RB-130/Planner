import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is niet ingesteld.");
}
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type BlockSeed = {
  order: number;
  label: string;
  category: string;
  startOffsetMinutes: number;
  endOffsetMinutes: number;
  fixedClockTime?: boolean;
  fixedStart?: string;
  fixedEnd?: string;
};

// Bron: dagschemaPhDplanning.md. Offsets zijn minuten-na-ontwaken; identiek voor
// winter en zomer (rule 2: seizoen is een rechte verschuiving van de wektijd).
// fixedClockTime-items (avondvenster, kerkdienst) staan expliciet los van de wektijd.
const weekday: BlockSeed[] = [
  { order: 0, label: "Opstaan, klaarmaken", category: "prep", startOffsetMinutes: 0, endOffsetMinutes: 30 },
  { order: 1, label: "Lezen", category: "reading", startOffsetMinutes: 30, endOffsetMinutes: 90 },
  { order: 2, label: "Verplaatsing naar universiteit", category: "transit", startOffsetMinutes: 90, endOffsetMinutes: 120 },
  { order: 3, label: "Schrijven", category: "writing", startOffsetMinutes: 120, endOffsetMinutes: 165 },
  { order: 4, label: "Micro-pauze", category: "microbreak", startOffsetMinutes: 165, endOffsetMinutes: 170 },
  { order: 5, label: "Schrijven", category: "writing", startOffsetMinutes: 170, endOffsetMinutes: 210 },
  { order: 6, label: "Pauze", category: "break", startOffsetMinutes: 210, endOffsetMinutes: 225 },
  { order: 7, label: "Revisie", category: "revision", startOffsetMinutes: 225, endOffsetMinutes: 270 },
  { order: 8, label: "Micro-pauze", category: "microbreak", startOffsetMinutes: 270, endOffsetMinutes: 275 },
  { order: 9, label: "Revisie", category: "revision", startOffsetMinutes: 275, endOffsetMinutes: 315 },
  { order: 10, label: "Lunch + wandeling", category: "lunch", startOffsetMinutes: 315, endOffsetMinutes: 360 },
  { order: 11, label: "Seminars / lopend werk", category: "seminar_ongoing", startOffsetMinutes: 360, endOffsetMinutes: 405 },
  { order: 12, label: "Micro-pauze", category: "microbreak", startOffsetMinutes: 405, endOffsetMinutes: 410 },
  { order: 13, label: "Seminars / lopend werk", category: "seminar_ongoing", startOffsetMinutes: 410, endOffsetMinutes: 450 },
  { order: 14, label: "Pauze", category: "break", startOffsetMinutes: 450, endOffsetMinutes: 465 },
  { order: 15, label: "Administratie", category: "admin", startOffsetMinutes: 465, endOffsetMinutes: 510 },
  { order: 16, label: "Pauze (indien Blok 5 doorgaat)", category: "break", startOffsetMinutes: 510, endOffsetMinutes: 525 },
  { order: 17, label: "Blok 5 (overig)", category: "block5", startOffsetMinutes: 525, endOffsetMinutes: 570 },
  { order: 18, label: "Terugreis", category: "transit", startOffsetMinutes: 570, endOffsetMinutes: 600 },
  {
    order: 19,
    label: "Sociaal/cultureel venster",
    category: "evening",
    startOffsetMinutes: 0,
    endOffsetMinutes: 0,
    fixedClockTime: true,
    fixedStart: "18:00",
    fixedEnd: "20:00",
  },
];

const saturday: BlockSeed[] = [
  { order: 0, label: "Opstaan, klaarmaken", category: "prep", startOffsetMinutes: 0, endOffsetMinutes: 45 },
  { order: 1, label: "Lezen", category: "reading", startOffsetMinutes: 45, endOffsetMinutes: 135 },
  {
    order: 2,
    label: "Weekboodschappen (flexibel, versleep naar wens)",
    category: "errand",
    startOffsetMinutes: 390,
    endOffsetMinutes: 450,
  },
];

const sunday: BlockSeed[] = [
  { order: 0, label: "Opstaan, klaarmaken", category: "prep", startOffsetMinutes: 0, endOffsetMinutes: 30 },
  { order: 1, label: "Lezen", category: "reading", startOffsetMinutes: 30, endOffsetMinutes: 90 },
  {
    order: 2,
    label: "Kerkdienst",
    category: "church",
    startOffsetMinutes: 0,
    endOffsetMinutes: 0,
    fixedClockTime: true,
    fixedStart: "10:00",
    fixedEnd: "11:30",
  },
];

async function seedDayType(dayType: string, blocks: BlockSeed[]) {
  for (const block of blocks) {
    await prisma.scheduleBlock.create({
      data: { dayType, ...block },
    });
  }
}

async function main() {
  await prisma.dayOverride.deleteMany();
  await prisma.scheduleBlock.deleteMany();

  await seedDayType("weekday", weekday);
  await seedDayType("saturday", saturday);
  await seedDayType("sunday", sunday);

  console.log("Seed voltooid.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
