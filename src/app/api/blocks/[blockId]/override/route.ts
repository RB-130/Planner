import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { timeToMinutes } from "@/lib/date";

const timeRegex = /^\d{2}:\d{2}$/;

const patchSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start: z.string().regex(timeRegex).optional(),
  end: z.string().regex(timeRegex).optional(),
  removed: z.boolean().optional(),
  taskText: z.string().nullable().optional(),
  label: z.string().min(1).nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/blocks/[blockId]/override">
) {
  const { blockId } = await ctx.params;
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 });
  }

  const block = await prisma.scheduleBlock.findUnique({ where: { id: blockId } });
  if (!block) {
    return NextResponse.json({ error: "Blok niet gevonden" }, { status: 404 });
  }

  const { date, start, end, removed, taskText, label } = parsed.data;

  const override = await prisma.dayOverride.upsert({
    where: { date_blockId: { date, blockId } },
    create: {
      date,
      blockId,
      removed: removed ?? false,
      taskText: taskText ?? null,
      labelOverride: label ?? null,
      overrideStartMinutes: start ? timeToMinutes(start) : null,
      overrideEndMinutes: end ? timeToMinutes(end) : null,
    },
    update: {
      ...(removed !== undefined ? { removed } : {}),
      ...(taskText !== undefined ? { taskText } : {}),
      ...(label !== undefined ? { labelOverride: label } : {}),
      ...(start !== undefined ? { overrideStartMinutes: timeToMinutes(start) } : {}),
      ...(end !== undefined ? { overrideEndMinutes: timeToMinutes(end) } : {}),
    },
  });

  return NextResponse.json(override);
}

const deleteQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/blocks/[blockId]/override">
) {
  const { blockId } = await ctx.params;
  const parsed = deleteQuerySchema.safeParse({
    date: request.nextUrl.searchParams.get("date"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige of ontbrekende datum" }, { status: 400 });
  }

  await prisma.dayOverride
    .delete({ where: { date_blockId: { date: parsed.data.date, blockId } } })
    .catch(() => null);

  return NextResponse.json({ ok: true });
}
