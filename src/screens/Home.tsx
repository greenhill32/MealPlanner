import { badgeText } from "../data";
import { MealThumb } from "../components/MealThumb";
import type { Meal, WeekRow } from "../types";

interface Props {
  meals: Meal[];
  weekPlan: WeekRow[];
  todayIndex: number;
  onTapToday: () => void;
}

export function Home({ meals, weekPlan, todayIndex, onTapToday }: Props) {
  const neglected = [...meals].sort((a, b) => b.lastEaten - a.lastEaten).map((m) => ({ ...m, badge: badgeText(m.lastEaten) }));
  const hero = neglected[0] ?? null;
  const restMeals = neglected.slice(1);

  const todayRow = weekPlan[todayIndex] ?? null;
  const todayMeal = todayRow ? meals.find((m) => m.id === todayRow.mealId) ?? null : null;
  const todayIsPlanned = todayRow?.status === "planned";

  return (
    <>
      <header className="header">
        <div className="header-title">
          FORGOTTEN <span className="accent">FAVOURITES</span>
        </div>
        <div className="header-sub">Oldest first · give one some love</div>
      </header>
      <div className="content">
        {todayMeal && (
          <button type="button" className="today-card" onClick={onTapToday}>
            <MealThumb emoji={todayMeal.emoji} photo={todayMeal.photo} name={todayMeal.name} size={56} />
            <div className="today-card-body">
              <div className="today-card-label">TODAY'S TEA</div>
              <div className="today-card-name">{todayMeal.name}</div>
            </div>
            <div className={todayIsPlanned ? "badge-planned" : "badge-sorted"}>
              {todayIsPlanned ? "TAP TO CONFIRM" : "✓ SORTED"}
            </div>
          </button>
        )}

        <h2 className="section-title">YOUR NEGLECTED LOT</h2>

        {hero && (
          <div className="hero-card">
            {hero.photo ? <img src={hero.photo} alt={hero.name} /> : <div className="hero-emoji">{hero.emoji}</div>}
            <div className="hero-overlay">
              <div className="hero-badge">{hero.badge}</div>
              <div className="hero-name">{hero.name}</div>
            </div>
          </div>
        )}

        <div className="meal-list">
          {restMeals.map((m) => (
            <div className="meal-row" key={m.id}>
              <MealThumb emoji={m.emoji} photo={m.photo} name={m.name} size={44} />
              <div className="meal-row-name">{m.name}</div>
              <div className="meal-row-badge">{m.badge}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
