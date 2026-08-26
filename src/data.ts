import type { CatalogItem } from "./types";

const RAW_CATALOG: Omit<CatalogItem, "id">[] = [
  { name: "Sausage & Chips", emoji: "🌭", photo: "https://images.pexels.com/photos/1893556/pexels-photo-1893556.jpeg?auto=compress&cs=tinysrgb&w=800", def: 2 },
  { name: "Chicken Curry", emoji: "🍛", photo: "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=800", def: 21 },
  { name: "Lasagne", emoji: "🍝", photo: "https://images.pexels.com/photos/4079520/pexels-photo-4079520.jpeg?auto=compress&cs=tinysrgb&w=800", def: 9 },
  { name: "Cottage Pie", emoji: "🥧", photo: "https://images.pexels.com/photos/675951/pexels-photo-675951.jpeg?auto=compress&cs=tinysrgb&w=800", def: 30 },
  { name: "Fish Pie", emoji: "🐟", photo: "https://images.pexels.com/photos/262959/pexels-photo-262959.jpeg?auto=compress&cs=tinysrgb&w=800", def: 14 },
  { name: "Chilli", emoji: "🌶️", photo: "https://images.pexels.com/photos/5737247/pexels-photo-5737247.jpeg?auto=compress&cs=tinysrgb&w=800", def: 6 },
  { name: "Pizza", emoji: "🍕", photo: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80", def: 3 },
  { name: "Roast Dinner", emoji: "🍗", photo: "https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=800", def: 45 },
  { name: "Stir Fry", emoji: "🥡", photo: "https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=800", def: 12 },
  { name: "Jacket Potato", emoji: "🥔", photo: "https://images.pexels.com/photos/2284166/pexels-photo-2284166.jpeg?auto=compress&cs=tinysrgb&w=800", def: 18 },
];

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
