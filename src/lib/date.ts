export const PLANNER_START = "2026-07-26"; // zondag
export const PLANNER_END = "2030-03-30"; // zaterdag

export function toDateKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function addDays(dateKey: string, days: number): string {
  const date = parseDateKey(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  return toDateKey(date);
}

export function getWeekday(dateKey: string): number {
  return parseDateKey(dateKey).getUTCDay(); // 0 = zondag
}

export function startOfWeek(dateKey: string): string {
  return addDays(dateKey, -getWeekday(dateKey));
}

export function clampToPlannerRange(dateKey: string): string {
  if (dateKey < PLANNER_START) return PLANNER_START;
  if (dateKey > PLANNER_END) return PLANNER_END;
  return dateKey;
}

export function isWithinPlannerRange(dateKey: string): boolean {
  return dateKey >= PLANNER_START && dateKey <= PLANNER_END;
}

export function todayDateKey(): string {
  return toDateKey(new Date());
}

export function minutesToTime(minutes: number): string {
  const wrapped = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

const WEEKDAY_NAMES = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
const WEEKDAY_SHORT = ["zo", "ma", "di", "wo", "do", "vr", "za"];
const MONTH_NAMES = [
  "januari",
  "februari",
  "maart",
  "april",
  "mei",
  "juni",
  "juli",
  "augustus",
  "september",
  "oktober",
  "november",
  "december",
];

export function formatDateLong(dateKey: string): string {
  const date = parseDateKey(dateKey);
  const weekday = WEEKDAY_NAMES[date.getUTCDay()];
  const day = date.getUTCDate();
  const month = MONTH_NAMES[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return `${weekday} ${day} ${month} ${year}`;
}

export function formatDateShort(dateKey: string): string {
  const date = parseDateKey(dateKey);
  const weekday = WEEKDAY_SHORT[date.getUTCDay()];
  const day = date.getUTCDate();
  const month = MONTH_NAMES[date.getUTCMonth()].slice(0, 3);
  return `${weekday} ${day} ${month}`;
}
