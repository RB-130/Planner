import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDaySchedule } from "@/lib/getDaySchedule";
import { addDays, startOfWeek } from "@/lib/date";

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse({
    date: request.nextUrl.searchParams.get("date"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige of ontbrekende datum" }, { status: 400 });
  }

  const weekStart = startOfWeek(parsed.data.date);
  const dateKeys = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const days = await Promise.all(dateKeys.map((dateKey) => getDaySchedule(dateKey)));

  return NextResponse.json({ weekStart, days });
}
