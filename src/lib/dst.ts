// EU-zomertijdregeling: zomertijd loopt van de laatste zondag van maart (02:00 UTC)
// t/m de laatste zondag van oktober (01:00 UTC). We werken hier op datumniveau
// (lokale kalenderdag), dus de exacte kloktijd van de omslag is niet relevant —
// alleen op welke datum winter- vs zomerschema geldt.

function lastSundayOfMonth(year: number, monthIndex0: number): Date {
  // monthIndex0: 0 = januari ... 11 = december
  const lastDay = new Date(Date.UTC(year, monthIndex0 + 1, 0));
  const weekday = lastDay.getUTCDay(); // 0 = zondag
  const offset = weekday === 0 ? 0 : weekday;
  lastDay.setUTCDate(lastDay.getUTCDate() - offset);
  return lastDay;
}

export function isSummerTime(date: Date): boolean {
  const year = date.getUTCFullYear();
  const dstStart = lastSundayOfMonth(year, 2); // laatste zondag maart
  const dstEnd = lastSundayOfMonth(year, 9); // laatste zondag oktober

  const d = new Date(Date.UTC(year, date.getUTCMonth(), date.getUTCDate()));
  return d >= dstStart && d < dstEnd;
}
