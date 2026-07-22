import { prisma } from "@/lib/prisma";
import { buildDaySchedule, getDayType, type DaySchedule } from "@/lib/schedule";

export async function getDaySchedule(dateKey: string): Promise<DaySchedule> {
  const dayType = getDayType(dateKey);

  const [blocks, overrides, daySettings, appointments] = await Promise.all([
    prisma.scheduleBlock.findMany({ where: { dayType } }),
    prisma.dayOverride.findMany({ where: { date: dateKey } }),
    prisma.daySettings.findUnique({ where: { date: dateKey } }),
    prisma.appointment.findMany({ where: { date: dateKey } }),
  ]);

  return buildDaySchedule(dateKey, { blocks, overrides, daySettings, appointments });
}
