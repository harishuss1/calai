// Date helpers shared by the Log and Stats screens.
// All meal queries key off a local "YYYY-MM-DD" day string.

/** Local calendar day as "YYYY-MM-DD" (not UTC — matches the user's clock). */
export function toDayString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Today's day string. */
export function todayString(): string {
  return toDayString(new Date());
}

/** The last `count` day strings, oldest first, ending today. */
export function lastNDays(count: number): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push(toDayString(d));
  }
  return days;
}

/** Short weekday label for charts, e.g. "Mon". */
export function weekdayLabel(dayString: string): string {
  const date = new Date(`${dayString}T00:00:00`);
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

/** Compact month/day label from an ISO timestamp, e.g. "Jun 10". */
export function monthDayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Date + time label for the weight log sheet, e.g. "Today, Jun 22 · 8:14 AM". */
export function dateTimeLabel(date: Date): string {
  const monthDay = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const prefix = toDayString(date) === todayString() ? `Today, ${monthDay}` : monthDay;
  const time = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${prefix} · ${time}`;
}

/** Human-friendly label for the date picker, e.g. "Today" or "Jun 21". */
export function friendlyDayLabel(dayString: string): string {
  if (dayString === todayString()) return "Today";
  const date = new Date(`${dayString}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
