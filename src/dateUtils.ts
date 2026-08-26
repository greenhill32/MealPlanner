export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function mondayISO(d: Date): string {
  const weekday = (d.getDay() + 6) % 7; // Mon=0 .. Sun=6
  const monday = new Date(d);
  monday.setDate(d.getDate() - weekday);
  return toISODate(monday);
}

export function todayWeekdayIndex(d: Date = new Date()): number {
  return (d.getDay() + 6) % 7; // Mon=0 .. Sun=6
}

export function daysBetweenISO(fromISO: string, toISO: string): number {
  const from = new Date(`${fromISO}T00:00:00`);
  const to = new Date(`${toISO}T00:00:00`);
  return Math.max(0, Math.round((to.getTime() - from.getTime()) / 86400000));
}
