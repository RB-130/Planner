import { redirect } from "next/navigation";
import { clampToPlannerRange, todayDateKey } from "@/lib/date";

export default function Home() {
  redirect(`/day/${clampToPlannerRange(todayDateKey())}`);
}
