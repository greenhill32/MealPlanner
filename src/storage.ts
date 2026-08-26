import { DAY_SHORT } from "./data";
import { daysBetweenISO, mondayISO, toISODate } from "./dateUtils";
import type { PersistedState, WeekRow } from "./types";

const STORAGE_KEY = "meal-picker-state-v1";

function blankWeek(): WeekRow[] {
  return DAY_SHORT.map((day) => ({ day, mealId: null, status: "empty" }));
}

function applyTimePassage(s: PersistedState): PersistedState {
  const now = new Date();
  const todayISO = toISODate(now);
  const monday = mondayISO(now);

  let meals = s.meals;
  if (s.lastOpenedISO && s.lastOpenedISO !== todayISO) {
    const elapsed = daysBetweenISO(s.lastOpenedISO, todayISO);
    if (elapsed > 0) {
      meals = meals.map((m) => ({ ...m, lastEaten: m.lastEaten + elapsed }));
    }
  }

  const weekPlan = s.weekStartISO === monday ? s.weekPlan : blankWeek();

  return { ...s, meals, weekPlan, weekStartISO: monday, lastOpenedISO: todayISO };
}

export function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (!parsed.onboarded) return null;
    return applyTimePassage(parsed);
  } catch {
    return null;
  }
}

export function saveState(s: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // storage unavailable (private browsing, quota) — silently skip persistence
  }
}
