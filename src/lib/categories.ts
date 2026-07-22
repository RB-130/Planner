export const categoryStyles: Record<string, string> = {
  prep: "border-l-neutral-400 bg-neutral-50 dark:bg-neutral-900",
  reading: "border-l-sky-500 bg-sky-50 dark:bg-sky-950",
  transit: "border-l-neutral-400 bg-neutral-50 dark:bg-neutral-900",
  writing: "border-l-violet-500 bg-violet-50 dark:bg-violet-950",
  microbreak: "border-l-neutral-300 bg-white dark:bg-black",
  break: "border-l-neutral-300 bg-white dark:bg-black",
  revision: "border-l-indigo-500 bg-indigo-50 dark:bg-indigo-950",
  lunch: "border-l-amber-500 bg-amber-50 dark:bg-amber-950",
  seminar_ongoing: "border-l-teal-500 bg-teal-50 dark:bg-teal-950",
  admin: "border-l-slate-500 bg-slate-50 dark:bg-slate-900",
  block5: "border-l-rose-400 bg-rose-50 dark:bg-rose-950",
  evening: "border-l-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-950",
  errand: "border-l-lime-500 bg-lime-50 dark:bg-lime-950",
  church: "border-l-amber-600 bg-amber-50 dark:bg-amber-950",
  appointment: "border-l-orange-500 bg-orange-50 dark:bg-orange-950",
};

export function categoryStyle(category: string): string {
  return categoryStyles[category] ?? "border-l-neutral-300 bg-white dark:bg-black";
}
