import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const timeRegex = /^\d{2}:\d{2}$/;

const createSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().min(1),
  startTime: z.string().regex(timeRegex),
  endTime: z.string().regex(timeRegex),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 });
  }

  const appointment = await prisma.appointment.create({ data: parsed.data });
  return NextResponse.json(appointment, { status: 201 });
}
