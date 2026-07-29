// Kleuren volgen een gevalideerd categorisch palet (CVD-veilig, licht/donker
// apart getest) i.p.v. losse tint per categorie. Verwante categorieën delen
// bewust een kleur zodat het om een klein aantal betekenisvolle groepen gaat,
// niet 15 losse regenboogkleuren. Overgangen/pauzes zijn bewust neutraal en
// terughoudend, zodat de echte activiteiten opvallen.
//
// Let op: Tailwind scant de broncode op complete, letterlijke klassenamen —
// elke klasse staat hier daarom voluit (geen samengestelde template strings),
// anders genereert de build de bijbehorende CSS niet.

const NEUTRAL = "border-l-neutral-300 bg-white dark:border-l-neutral-700 dark:bg-neutral-950";

// Diep werk (schrijven, revisie) — het zwaarste werk, blauw #2a78d6 / #3987e5
const DEEP_WORK = "border-l-[#2a78d6] bg-[#2a78d6]/[0.07] dark:border-l-[#3987e5] dark:bg-[#3987e5]/[0.14]";
// Lezen — aqua #1baf7a / #199e70
const READING = "border-l-[#1baf7a] bg-[#1baf7a]/[0.07] dark:border-l-[#199e70] dark:bg-[#199e70]/[0.14]";
// Lopend werk / administratie — magenta #e87ba4 / #d55181
const ONGOING_WORK = "border-l-[#e87ba4] bg-[#e87ba4]/[0.07] dark:border-l-[#d55181] dark:bg-[#d55181]/[0.14]";
// Maaltijd — geel #eda100 / #c98500
const MEAL = "border-l-[#eda100] bg-[#eda100]/[0.07] dark:border-l-[#c98500] dark:bg-[#c98500]/[0.14]";
// Flexibel (reserveblok, boodschappen) — groen #008300
const FLEXIBLE = "border-l-[#008300] bg-[#008300]/[0.07] dark:border-l-[#008300] dark:bg-[#008300]/[0.14]";
// Vaste kloktijd (afspraken, kerkdienst, avondblok) — oranje #eb6834 / #d95926
const FIXED = "border-l-[#eb6834] bg-[#eb6834]/[0.07] dark:border-l-[#d95926] dark:bg-[#d95926]/[0.14]";

export const categoryStyles: Record<string, string> = {
  prep: NEUTRAL,
  transit: NEUTRAL,
  microbreak: NEUTRAL,
  break: NEUTRAL,
  writing: DEEP_WORK,
  revision: DEEP_WORK,
  reading: READING,
  seminar_ongoing: ONGOING_WORK,
  admin: ONGOING_WORK,
  lunch: MEAL,
  block5: FLEXIBLE,
  errand: FLEXIBLE,
  evening: FIXED,
  church: FIXED,
  appointment: FIXED,
};

export function categoryStyle(category: string): string {
  return categoryStyles[category] ?? NEUTRAL;
}
