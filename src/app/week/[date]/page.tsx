import { notFound } from "next/navigation";
import { WeekView } from "@/components/WeekView";
import { getDaySchedule } from "@/lib/getDaySchedule";
import { addDays, isWithinPlannerRange, startOfWeek } from "@/lib/date";

export default async function WeekPage({ params }: PageProps<"/week/[date]">) {
  const { date } = await params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !isWithinPlannerRange(date)) {
    notFound();
  }

  const weekStart = startOfWeek(date);
  const dateKeys = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const days = await Promise.all(dateKeys.map((d) => getDaySchedule(d)));

  return <WeekView weekStart={weekStart} days={days} />;
}
