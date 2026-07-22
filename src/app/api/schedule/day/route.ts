import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDaySchedule } from "@/lib/getDaySchedule";
import { isWithinPlannerRange } from "@/lib/date";

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

  if (!isWithinPlannerRange(parsed.data.date)) {
    return NextResponse.json({ error: "Datum valt buiten de planningsperiode" }, { status: 400 });
  }

  const schedule = await getDaySchedule(parsed.data.date);
  return NextResponse.json(schedule);
}
