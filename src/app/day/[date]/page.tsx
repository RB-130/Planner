import { notFound } from "next/navigation";
import { DayView } from "@/components/DayView";
import { getDaySchedule } from "@/lib/getDaySchedule";
import { isWithinPlannerRange } from "@/lib/date";

export default async function DayPage({ params }: PageProps<"/day/[date]">) {
  const { date } = await params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !isWithinPlannerRange(date)) {
    notFound();
  }

  const schedule = await getDaySchedule(date);

  return <DayView initial={schedule} />;
}
