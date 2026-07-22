"use client";

import { useRouter } from "next/navigation";
import { PLANNER_END, PLANNER_START, clampToPlannerRange } from "@/lib/date";

export function DateJumpForm({
  currentDate,
  buildHref,
}: {
  currentDate: string;
  buildHref: (date: string) => string;
}) {
  const router = useRouter();

  return (
    <input
      type="date"
      defaultValue={currentDate}
      min={PLANNER_START}
      max={PLANNER_END}
      onChange={(e) => {
        // De browser-datumkiezer respecteert min/max meestal, maar niet altijd
        // (bv. handmatig getypte datums) — daarom hier ook expliciet begrenzen.
        if (e.target.value) router.push(buildHref(clampToPlannerRange(e.target.value)));
      }}
      aria-label="Ga naar datum"
      className="rounded border border-black/20 px-2 py-1 text-sm dark:border-white/20 dark:bg-black"
    />
  );
}
