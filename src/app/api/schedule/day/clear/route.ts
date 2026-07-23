import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { addDays } from "@/lib/date";
import { getDayType } from "@/lib/schedule";

const schema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  })
  .refine((data) => !data.endDate || data.endDate >= data.date, {
    message: "endDate moet op of na date liggen",
  });

// Markeert alle blokken van een datum (of datumbereik) als verwijderd
// (herstelbaar, zelfde mechanisme als een los blok verwijderen) en verwijdert
// alle afspraken in die periode (niet herstelbaar) — bedoeld voor
// feestdagen/vakantiedagen waarop het standaardschema niet van toepassing is.
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 });
  }

  const { date, endDate } = parsed.data;
  const dateKeys: string[] = [];
  for (let d = date; d <= (endDate ?? date); d = addDays(d, 1)) {
    dateKeys.push(d);
  }

  // Per dag parallel (zoals elders al veilig gebleken), maar de dagen zelf
  // ná elkaar — anders overschrijdt een lange periode (bv. 2 weken vakantie
  // x ~20 blokken) het verbindingslimiet van de gepoolde databaseverbinding.
  for (const dateKey of dateKeys) {
    const dayType = getDayType(dateKey);
    const blocks = await prisma.scheduleBlock.findMany({ where: { dayType } });
    await Promise.all(
      blocks.map((block) =>
        prisma.dayOverride.upsert({
          where: { date_blockId: { date: dateKey, blockId: block.id } },
          create: { date: dateKey, blockId: block.id, removed: true },
          update: { removed: true },
        })
      )
    );
  }

  await prisma.appointment.deleteMany({ where: { date: { in: dateKeys } } });

  return NextResponse.json({ ok: true, clearedDates: dateKeys });
}
