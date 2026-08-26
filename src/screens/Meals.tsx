import { badgeText } from "../data";
import { MealThumb } from "../components/MealThumb";
import type { Meal } from "../types";

interface Props {
  meals: Meal[];
  onEdit: (meal: Meal) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
}

export function Meals({ meals, onEdit, onDelete, onAdd }: Props) {
  return (
    <>
      <header className="header">
        <div className="header-title">
          YOUR <span className="accent">MEALS</span>
        </div>
        <div className="header-sub">Add, rename, swap the emoji</div>
      </header>
      <div className="content">
        <div className="meal-list">
          {meals.map((m) => (
            <div className="meal-row" key={m.id}>
              <MealThumb emoji={m.emoji} photo={m.photo} name={m.name} size={44} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, fontSize: 14 }}>{m.name}</div>
                <div className="meal-row-sub">Last had {badgeText(m.lastEaten).toLowerCase()}</div>
              </div>
              <button type="button" className="icon-button edit" onClick={() => onEdit(m)}>
                ✎
              </button>
              <button type="button" className="icon-button delete" onClick={() => onDelete(m.id)}>
                ✕
              </button>
            </div>
          ))}
          <button type="button" className="cta-button" style={{ marginTop: 6 }} onClick={onAdd}>
            + ADD A MEAL
          </button>
        </div>
      </div>
    </>
  );
}
