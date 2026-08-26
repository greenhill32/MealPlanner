import { MealThumb } from "../components/MealThumb";
import type { Meal, WeekRow } from "../types";

interface Props {
  weekPlan: WeekRow[];
  meals: Meal[];
  todayIndex: number;
  onTapDay: (i: number) => void;
}

export function Planner({ weekPlan, meals, todayIndex, onTapDay }: Props) {
  return (
    <>
      <header className="header">
        <div className="header-title">
          WEEK <span className="accent">PLANNER</span>
        </div>
        <div className="header-sub">Monday to Sunday, your tea</div>
      </header>
      <div className="content">
        <div className="planner-list">
          {weekPlan.map((row, i) => {
            const meal = row.mealId != null ? meals.find((m) => m.id === row.mealId) ?? null : null;
            const isToday = i === todayIndex;
            const tappable = isToday ? row.status === "planned" : i > todayIndex || row.status === "empty";

            let label = "";
            let rowClass = "planner-row";
            let badgeColor = "var(--ink)";
            let badgeBg = "transparent";

            if (row.status === "eaten") {
              badgeColor = "var(--green)";
              label = "✓ HAD IT";
            } else if (row.status === "skipped") {
              rowClass += " skipped";
              badgeColor = "var(--tan)";
              label = "SKIPPED";
            } else if (row.status === "empty") {
              rowClass += " empty";
              badgeColor = "var(--muted-border)";
              label = "+ ADD A MEAL";
            } else if (row.status === "planned" && isToday) {
              rowClass += " today-planned";
              badgeBg = "var(--yellow)";
              badgeColor = "var(--ink)";
              label = "TAP TO CONFIRM";
            } else {
              badgeColor = "var(--tan)";
              label = "PLANNED · TAP TO CHANGE";
            }

            return (
              <div
                key={row.day}
                className={rowClass}
                style={{ cursor: tappable ? "pointer" : "default" }}
                onClick={() => tappable && onTapDay(i)}
              >
                <div className="planner-day">{row.day}</div>
                {meal ? (
                  <>
                    <MealThumb emoji={meal.emoji} photo={meal.photo} name={meal.name} size={40} />
                    <div className="meal-row-name">{meal.name}</div>
                  </>
                ) : (
                  <div className="planner-empty-label">Nothing planned</div>
                )}
                <div
                  className="planner-badge"
                  style={{ color: badgeColor, background: badgeBg, padding: badgeBg !== "transparent" ? "4px 10px" : 0 }}
                >
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
