import type { CatalogItem } from "./types";
import imgCrispChilliBeef from "./assets/meals/crisp-chilli-beef.jpeg";
import imgHamAndEggAndChips from "./assets/meals/ham-and-egg-and-chips.jpeg";
import imgBbqRibsAndChips from "./assets/meals/bbq-ribs-and-chips.jpeg";
import imgIndianCurryTakeaway from "./assets/meals/indian-curry-takeaway.jpeg";
import imgRoastDinner from "./assets/meals/roast-dinner.jpeg";
import imgSausageAndMash from "./assets/meals/sausage-and-mash.jpeg";
import imgTunaSandwich from "./assets/meals/tuna-sandwich.jpeg";

const RAW_CATALOG: Omit<CatalogItem, "id">[] = [
  { name: "Crisp chilli beef", emoji: "🍽️", photo: imgCrispChilliBeef, def: 5 },
  { name: "Ham and egg and chips", emoji: "🍽️", photo: imgHamAndEggAndChips, def: 5 },
  { name: "BBQ ribs and chips", emoji: "🍽️", photo: imgBbqRibsAndChips, def: 5 },
  { name: "Indian curry takeaway", emoji: "🍽️", photo: imgIndianCurryTakeaway, def: 5 },
  { name: "Roast Dinner", emoji: "🍽️", photo: imgRoastDinner, def: 5 },
  { name: "Sausage and mash", emoji: "🍽️", photo: imgSausageAndMash, def: 5 },
  { name: "Tuna sandwich", emoji: "🍽️", photo: imgTunaSandwich, def: 5 },
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
