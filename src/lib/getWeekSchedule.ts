import { prisma } from "@/lib/prisma";
import { addDays } from "@/lib/date";
import { buildDaySchedule, getDayType, type DaySchedule } from "@/lib/schedule";

// Haalt alle data voor een hele week op in 4 query's totaal (i.p.v. 4 query's
// per dag x 7 dagen = 28 tegelijk), om het verbindingslimiet van de database
// niet te overschrijden.
export async function getWeekSchedule(weekStart: string): Promise<{ weekStart: string; days: DaySchedule[] }> {
  const dateKeys = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const dayTypes = Array.from(new Set(dateKeys.map((d) => getDayType(d))));

  const [blocks, overrides, daySettings, appointments] = await Promise.all([
    prisma.scheduleBlock.findMany({ where: { dayType: { in: dayTypes } } }),
    prisma.dayOverride.findMany({ where: { date: { in: dateKeys } } }),
    prisma.daySettings.findMany({ where: { date: { in: dateKeys } } }),
    prisma.appointment.findMany({ where: { date: { in: dateKeys } } }),
  ]);

  const days = dateKeys.map((dateKey) => {
    const dayType = getDayType(dateKey);
    return buildDaySchedule(dateKey, {
      blocks: blocks.filter((b) => b.dayType === dayType),
      overrides: overrides.filter((o) => o.date === dateKey),
      daySettings: daySettings.find((s) => s.date === dateKey) ?? null,
      appointments: appointments.filter((a) => a.date === dateKey),
    });
  });

  return { weekStart, days };
}
