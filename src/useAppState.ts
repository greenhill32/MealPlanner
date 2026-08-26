import { useEffect, useMemo, useState } from "react";
import { CATALOG, DAY_SHORT, norm } from "./data";
import { toISODate, todayWeekdayIndex } from "./dateUtils";
import { loadState, saveState } from "./storage";
import type {
  CatalogItem,
  ConfirmAskState,
  Meal,
  PersistedState,
  PickerState,
  Screen,
  SheetState,
  WeekRow,
} from "./types";

function buildFreshWeek(meals: Meal[], todayIndex: number): WeekRow[] {
  return DAY_SHORT.map((day, i) => {
    if (i === todayIndex && meals.length) {
      return { day, mealId: meals[0].id, status: "planned" };
    }
    return { day, mealId: null, status: "empty" };
  });
}

export function useAppState() {
  const [persisted, setPersisted] = useState<PersistedState | null>(() => loadState());
  const [screen, setScreenState] = useState<Screen>("home");
  const [onboardCatalog, setOnboardCatalog] = useState<CatalogItem[]>(CATALOG);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [splash, setSplash] = useState(false);
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const [confirmAsk, setConfirmAsk] = useState<ConfirmAskState | null>(null);
  const [picker, setPicker] = useState<PickerState | null>(null);

  useEffect(() => {
    if (persisted) saveState(persisted);
  }, [persisted]);

  const todayIndex = useMemo(() => todayWeekdayIndex(), []);

  function toggleSelect(key: string) {
    setSelected((sel) => {
      const next = { ...sel };
      if (next[key]) delete next[key];
      else next[key] = true;
      return next;
    });
  }

  function openOnboardAdd() {
    setSheet({ context: "onboardAdd", name: "", emoji: "🍽️", error: "" });
  }
  function openMealsAdd() {
    setSheet({ context: "mealsAdd", name: "", emoji: "🍽️", error: "" });
  }
  function openMealsEdit(meal: Meal) {
    setSheet({ context: "mealsEdit", mealId: meal.id, name: meal.name, emoji: meal.emoji, error: "" });
  }
  function openPlanAdd(dayIndex: number, purpose: "planDay" | "confirmNo") {
    setSheet({ context: "planAdd", dayIndex, purpose, name: "", emoji: "🍽️", error: "" });
  }
  function closeSheet() {
    setSheet(null);
  }
  function setSheetName(v: string) {
    setSheet((s) => (s ? { ...s, name: v, error: "" } : s));
  }
  function setSheetEmoji(e: string) {
    setSheet((s) => (s ? { ...s, emoji: e } : s));
  }
  function deleteFromSheet() {
    const id = sheet?.mealId;
    if (id != null) deleteMeal(id);
    setSheet(null);
  }

  function saveSheet() {
    if (!sheet) return;
    const name = sheet.name.trim().replace(/\s+/g, " ");
    if (!name) {
      setSheet((s) => (s ? { ...s, error: "Give it a name first." } : s));
      return;
    }
    const key = norm(name);

    if (sheet.context === "onboardAdd") {
      if (onboardCatalog.some((m) => norm(m.name) === key)) {
        setSheet((s) => (s ? { ...s, error: "You've already got that one." } : s));
        return;
      }
      const item: CatalogItem = { id: "custom" + Date.now(), name, emoji: sheet.emoji || "🍽️", photo: null, def: 5 };
      setOnboardCatalog((c) => [...c, item]);
      setSelected((sel) => ({ ...sel, [key]: true }));
      setSheet(null);
      return;
    }

    if (!persisted) return;

    if (sheet.context === "mealsAdd" || sheet.context === "planAdd") {
      if (persisted.meals.some((m) => norm(m.name) === key)) {
        setSheet((s) => (s ? { ...s, error: "You've already got that one." } : s));
        return;
      }
      const id = persisted.nextMealId;
      const meal: Meal = { id, name, emoji: sheet.emoji || "🍽️", photo: null, lastEaten: 0 };
      setPersisted((s) => {
        if (!s) return s;
        const meals = [...s.meals, meal];
        let weekPlan = s.weekPlan;
        if (sheet.context === "planAdd" && sheet.dayIndex != null) {
          weekPlan = s.weekPlan.map((row, i) => (i === sheet.dayIndex ? { ...row, mealId: id, status: "planned" } : row));
        }
        return { ...s, meals, weekPlan, nextMealId: id + 1 };
      });
      setSheet(null);
      return;
    }

    if (sheet.context === "mealsEdit") {
      setPersisted((s) =>
        s
          ? { ...s, meals: s.meals.map((m) => (m.id === sheet.mealId ? { ...m, name, emoji: sheet.emoji || m.emoji } : m)) }
          : s
      );
      setSheet(null);
      return;
    }
  }

  function deleteMeal(id: number) {
    setPersisted((s) =>
      s
        ? {
            ...s,
            meals: s.meals.filter((m) => m.id !== id),
            weekPlan: s.weekPlan.map((row) => (row.mealId === id ? { ...row, mealId: null, status: "empty" as const } : row)),
          }
        : s
    );
  }

  function finishOnboarding() {
    const selectedItems = onboardCatalog.filter((m) => selected[norm(m.name)]);
    if (!selectedItems.length) return;
    const meals: Meal[] = selectedItems.map((m, i) => ({
      id: i + 1,
      name: m.name,
      emoji: m.emoji,
      photo: m.photo,
      lastEaten: m.def ?? 5,
    }));
    const weekPlan = buildFreshWeek(meals, todayIndex);
    const now = new Date();
    setSplash(true);
    setPersisted({
      onboarded: true,
      meals,
      weekPlan,
      weekStartISO: toISODate(now),
      lastOpenedISO: toISODate(now),
      nextMealId: meals.length + 1,
    });
    setTimeout(() => {
      setSplash(false);
      setScreenState("home");
    }, 700);
  }

  function tapToday() {
    if (!persisted) return;
    const row = persisted.weekPlan[todayIndex];
    if (!row || row.status !== "planned") return;
    const meal = persisted.meals.find((m) => m.id === row.mealId);
    setConfirmAsk({ dayIndex: todayIndex, mealName: meal ? meal.name : "" });
  }

  function tapDay(i: number) {
    if (i === todayIndex) {
      tapToday();
      return;
    }
    if (!persisted) return;
    const row = persisted.weekPlan[i];
    if (i > todayIndex || row.status === "empty") {
      setPicker({ dayIndex: i, purpose: "planDay" });
    }
  }

  function confirmYes() {
    if (!confirmAsk || !persisted) return;
    const row = persisted.weekPlan[confirmAsk.dayIndex];
    setPersisted((s) =>
      s
        ? {
            ...s,
            weekPlan: s.weekPlan.map((r, i) => (i === confirmAsk.dayIndex ? { ...r, status: "eaten" as const } : r)),
            meals: s.meals.map((m) => (m.id === row.mealId ? { ...m, lastEaten: 0 } : m)),
          }
        : s
    );
    setConfirmAsk(null);
  }

  function confirmNo() {
    if (!confirmAsk) return;
    setConfirmAsk(null);
    setPicker({ dayIndex: confirmAsk.dayIndex, purpose: "confirmNo" });
  }

  function closePicker() {
    setPicker(null);
  }

  function pickMeal(mealId: number) {
    if (!picker) return;
    const newStatus: WeekRow["status"] = picker.purpose === "confirmNo" ? "eaten" : "planned";
    setPersisted((s) =>
      s
        ? {
            ...s,
            weekPlan: s.weekPlan.map((r, i) => (i === picker.dayIndex ? { ...r, mealId, status: newStatus } : r)),
            meals: picker.purpose === "confirmNo" ? s.meals.map((m) => (m.id === mealId ? { ...m, lastEaten: 0 } : m)) : s.meals,
          }
        : s
    );
    setPicker(null);
  }

  function openPlanAddFromPicker() {
    if (!picker) return;
    const p = picker;
    setPicker(null);
    openPlanAdd(p.dayIndex, p.purpose);
  }

  function swapDays(fromIndex: number, toIndex: number) {
    if (!persisted || fromIndex === toIndex) return;
    const from = persisted.weekPlan[fromIndex];
    const to = persisted.weekPlan[toIndex];
    if (!from || !to) return;
    if (from.status !== "planned" || from.mealId == null) return;
    if (to.status === "eaten" || to.status === "skipped") return;
    setPersisted((s) =>
      s
        ? {
            ...s,
            weekPlan: s.weekPlan.map((row, i) => {
              if (i === fromIndex) return { ...row, mealId: to.mealId, status: to.status };
              if (i === toIndex) return { ...row, mealId: from.mealId, status: from.status };
              return row;
            }),
          }
        : s
    );
  }

  function setScreen(sc: Screen) {
    setScreenState(sc);
  }

  return {
    onboarded: !!persisted?.onboarded,
    persisted,
    screen,
    onboardCatalog,
    selected,
    splash,
    sheet,
    confirmAsk,
    picker,
    todayIndex,
    toggleSelect,
    openOnboardAdd,
    openMealsAdd,
    openMealsEdit,
    openPlanAdd,
    closeSheet,
    setSheetName,
    setSheetEmoji,
    deleteFromSheet,
    saveSheet,
    deleteMeal,
    finishOnboarding,
    tapToday,
    tapDay,
    confirmYes,
    confirmNo,
    closePicker,
    pickMeal,
    openPlanAddFromPicker,
    swapDays,
    setScreen,
  };
}
