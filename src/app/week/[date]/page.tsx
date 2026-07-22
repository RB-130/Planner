import { notFound } from "next/navigation";
import { WeekView } from "@/components/WeekView";
import { getWeekSchedule } from "@/lib/getWeekSchedule";
import { isWithinPlannerRange, startOfWeek } from "@/lib/date";

export default async function WeekPage({ params }: PageProps<"/week/[date]">) {
  const { date } = await params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !isWithinPlannerRange(date)) {
    notFound();
  }

  const { weekStart, days } = await getWeekSchedule(startOfWeek(date));

  return <WeekView weekStart={weekStart} days={days} />;
}
