import Link from "next/link";
import { addDays, formatDateShort, isWithinPlannerRange, startOfWeek } from "@/lib/date";
import { categoryStyle } from "@/lib/categories";
import { DateJumpForm } from "@/components/DateJumpForm";
import { computeConflicts, type DaySchedule } from "@/lib/schedule";

export function WeekView({ weekStart, days }: { weekStart: string; days: DaySchedule[] }) {
  const prevWeek = addDays(weekStart, -7);
  const nextWeek = addDays(weekStart, 7);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <Link
          href={isWithinPlannerRange(prevWeek) ? `/week/${prevWeek}` : "#"}
          className={`rounded px-2 py-1 text-sm ${
            isWithinPlannerRange(prevWeek) ? "hover:bg-black/5 dark:hover:bg-white/10" : "pointer-events-none opacity-30"
          }`}
        >
          ← vorige week
        </Link>
        <h1 className="text-lg font-semibold">Week van {formatDateShort(weekStart)}</h1>
        <Link
          href={isWithinPlannerRange(nextWeek) ? `/week/${nextWeek}` : "#"}
          className={`rounded px-2 py-1 text-sm ${
            isWithinPlannerRange(nextWeek) ? "hover:bg-black/5 dark:hover:bg-white/10" : "pointer-events-none opacity-30"
          }`}
        >
          volgende week →
        </Link>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm">
        <span className="text-neutral-500">Ga naar</span>
        <DateJumpForm currentDate={weekStart} buildHref={(date) => `/week/${startOfWeek(date)}`} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {days.map((day) => (
          <Link
            key={day.date}
            href={`/day/${day.date}`}
            className="flex flex-col gap-2 rounded border border-black/10 p-2 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
          >
            <div className="text-sm font-medium capitalize">{formatDateShort(day.date)}</div>
            <div className="flex flex-col gap-1">
              {(() => {
                const activeItems = day.items.filter((i) => !i.removed);
                const conflicts = computeConflicts(activeItems);
                return activeItems.map((item) => {
                  const conflictLabels = conflicts.get(`${item.kind}:${item.id}`);
                  const title = conflictLabels
                    ? `${item.start}–${item.end} ${item.label} — botst met: ${conflictLabels.join(", ")}`
                    : `${item.start}–${item.end} ${item.label}`;
                  return (
                    <div
                      key={`${item.kind}:${item.id}`}
                      className={`truncate rounded border-l-2 px-1 py-0.5 text-xs ${categoryStyle(item.category)} ${
                        conflictLabels ? "ring-1 ring-red-500" : ""
                      }`}
                      title={title}
                    >
                      {conflictLabels ? "⚠ " : ""}
                      {item.start} {item.label}
                    </div>
                  );
                });
              })()}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
