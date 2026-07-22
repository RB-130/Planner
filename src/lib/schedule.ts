import { getWeekday, minutesToTime, timeToMinutes } from "@/lib/date";
import { isSummerTime } from "@/lib/dst";
import type { Appointment, DayOverride, DaySettings, ScheduleBlock } from "@/generated/prisma/client";

export type DayType = "weekday" | "saturday" | "sunday";

export function getDayType(dateKey: string): DayType {
  const weekday = getWeekday(dateKey);
  if (weekday === 0) return "sunday";
  if (weekday === 6) return "saturday";
  return "weekday";
}

export function getDefaultWakeTime(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00Z`);
  return isSummerTime(date) ? "07:30" : "06:30";
}

export type ScheduleItem = {
  kind: "block" | "appointment";
  id: string;
  sourceBlockId?: string;
  label: string;
  category: string;
  start: string; // "HH:mm"
  end: string; // "HH:mm"
  removed: boolean;
  taskText: string | null;
  notes?: string | null;
  // Vaste-kloktijd items (fixedClockTime-blokken en afspraken) verschuiven niet mee
  // wanneer de rest van de dag herschikt wordt door te slepen.
  fixedTime: boolean;
};

export type DaySchedule = {
  date: string;
  dayType: DayType;
  wakeTime: string;
  wakeTimeIsCustom: boolean;
  items: ScheduleItem[];
};

export function buildDaySchedule(
  dateKey: string,
  data: {
    blocks: ScheduleBlock[];
    overrides: DayOverride[];
    daySettings: DaySettings | null;
    appointments: Appointment[];
  }
): DaySchedule {
  const dayType = getDayType(dateKey);
  const wakeTime = data.daySettings?.wakeTime ?? getDefaultWakeTime(dateKey);
  const wakeMinutes = timeToMinutes(wakeTime);

  const overrideByBlockId = new Map(data.overrides.map((o) => [o.blockId, o]));

  const blockItems: ScheduleItem[] = data.blocks
    .filter((b) => b.dayType === dayType)
    .sort((a, b) => a.order - b.order)
    .map((block) => {
      const override = overrideByBlockId.get(block.id);

      const defaultStart = block.fixedClockTime
        ? timeToMinutes(block.fixedStart!)
        : wakeMinutes + block.startOffsetMinutes;
      const defaultEnd = block.fixedClockTime
        ? timeToMinutes(block.fixedEnd!)
        : wakeMinutes + block.endOffsetMinutes;

      const start = override?.overrideStartMinutes ?? defaultStart;
      const end = override?.overrideEndMinutes ?? defaultEnd;

      return {
        kind: "block" as const,
        id: block.id,
        sourceBlockId: block.id,
        label: override?.labelOverride ?? block.label,
        category: block.category,
        start: minutesToTime(start),
        end: minutesToTime(end),
        removed: override?.removed ?? false,
        taskText: override?.taskText ?? null,
        fixedTime: block.fixedClockTime,
      };
    });

  const appointmentItems: ScheduleItem[] = data.appointments.map((appt) => ({
    kind: "appointment" as const,
    id: appt.id,
    label: appt.title,
    category: "appointment",
    start: appt.startTime,
    end: appt.endTime,
    removed: false,
    taskText: null,
    notes: appt.notes,
    fixedTime: true,
  }));

  const items = [...blockItems, ...appointmentItems].sort((a, b) =>
    a.start === b.start ? 0 : a.start < b.start ? -1 : 1
  );

  return {
    date: dateKey,
    dayType,
    wakeTime,
    wakeTimeIsCustom: Boolean(data.daySettings),
    items,
  };
}
