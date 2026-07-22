import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getDayType } from "@/lib/schedule";

const schema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) });

// Markeert alle blokken van een datum als verwijderd (herstelbaar, zelfde
// mechanisme als een los blok verwijderen) en verwijdert alle afspraken van
// die datum (niet herstelbaar) — bedoeld voor feestdagen/vakantiedagen waarop
// het standaardschema niet van toepassing is.
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 });
  }

  const { date } = parsed.data;
  const dayType = getDayType(date);
  const blocks = await prisma.scheduleBlock.findMany({ where: { dayType } });

  await Promise.all([
    ...blocks.map((block) =>
      prisma.dayOverride.upsert({
        where: { date_blockId: { date, blockId: block.id } },
        create: { date, blockId: block.id, removed: true },
        update: { removed: true },
      })
    ),
    prisma.appointment.deleteMany({ where: { date } }),
  ]);

  return NextResponse.json({ ok: true });
}
