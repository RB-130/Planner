import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  wakeTime: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
});

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 });
  }

  const { date, wakeTime } = parsed.data;

  if (wakeTime === null) {
    await prisma.daySettings.delete({ where: { date } }).catch(() => null);
    return NextResponse.json({ ok: true });
  }

  const settings = await prisma.daySettings.upsert({
    where: { date },
    create: { date, wakeTime },
    update: { wakeTime },
  });

  return NextResponse.json(settings);
}
