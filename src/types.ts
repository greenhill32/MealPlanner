export type MealStatus = "eaten" | "skipped" | "planned" | "empty";

export interface Meal {
  id: number;
  name: string;
  emoji: string;
  photo: string | null;
  lastEaten: number;
}

export interface WeekRow {
  day: string;
  mealId: number | null;
  status: MealStatus;
}

export type Screen = "home" | "planner" | "meals";

export interface CatalogItem {
  id: string;
  name: string;
  emoji: string;
  photo: string | null;
  def: number;
}

export type SheetContext = "onboardAdd" | "mealsAdd" | "mealsEdit" | "planAdd";

export interface SheetState {
  context: SheetContext;
  name: string;
  emoji: string;
  error: string;
  mealId?: number;
  dayIndex?: number;
  purpose?: PickerPurpose;
}

export type PickerPurpose = "planDay" | "confirmNo";

export interface ConfirmAskState {
  dayIndex: number;
  mealName: string;
}

export interface PickerState {
  dayIndex: number;
  purpose: PickerPurpose;
}

export interface PersistedState {
  onboarded: boolean;
  meals: Meal[];
  weekPlan: WeekRow[];
  weekStartISO: string;
  lastOpenedISO: string;
  nextMealId: number;
}
