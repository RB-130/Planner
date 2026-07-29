import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const timeRegex = /^\d{2}:\d{2}$/;

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  startTime: z.string().regex(timeRegex).optional(),
  endTime: z.string().regex(timeRegex).optional(),
  notes: z.string().nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/appointments/[id]">
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 });
  }

  const appointment = await prisma.appointment
    .update({ where: { id }, data: parsed.data })
    .catch(() => null);

  if (!appointment) {
    return NextResponse.json({ error: "Afspraak niet gevonden" }, { status: 404 });
  }

  return NextResponse.json(appointment);
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/appointments/[id]">
) {
  const { id } = await ctx.params;
  await prisma.appointment.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
