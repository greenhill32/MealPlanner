import type { CatalogItem } from "./types";

const RAW_CATALOG: Omit<CatalogItem, "id">[] = [];

export const CATALOG: CatalogItem[] = RAW_CATALOG.map((c, i) => ({ id: `c${i}`, ...c }));

export const EMOJIS = ["🍽️", "🌭", "🍛", "🍝", "🥧", "🐟", "🌶️", "🍕", "🍗", "🥡", "🥔", "🍔", "🥗", "🍜", "🌮", "🥘"];

export const DAY_SHORT = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
export const DAY_FULL = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

export function norm(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

export function badgeText(n: number): string {
  return n <= 0 ? "TODAY" : n === 1 ? "1 DAY AGO" : `${n} DAYS AGO`;
}
