import { DAY_FULL } from "../data";
import type { Meal, PickerState } from "../types";

interface Props {
  picker: PickerState;
  meals: Meal[];
  onPick: (mealId: number) => void;
  onAddNew: () => void;
  onClose: () => void;
}

export function PickerSheet({ picker, meals, onPick, onAddNew, onClose }: Props) {
  const title = picker.purpose === "confirmNo" ? "WHAT DID YOU ACTUALLY HAVE?" : `PICK FOR ${DAY_FULL[picker.dayIndex]}`;

  return (
    <div className="overlay" style={{ zIndex: 22 }}>
      <div className="sheet-panel picker-panel">
        <div className="sheet-handle" />
        <div className="picker-header">
          <h2 className="picker-title">{title}</h2>
          <button type="button" className="picker-cancel" onClick={onClose}>
            CANCEL
          </button>
        </div>
        <div className="picker-body">
          <div className="picker-grid">
            {meals.map((m) => (
              <button key={m.id} type="button" className="picker-tile" onClick={() => onPick(m.id)}>
                {m.photo ? (
                  <img src={m.photo} alt="" />
                ) : (
                  <div className="picker-tile-emoji">{m.emoji}</div>
                )}
                <span className="picker-tile-label">{m.name}</span>
              </button>
            ))}
            <button type="button" className="add-tile small" onClick={onAddNew}>
              <div className="add-tile-plus">+</div>
              <span className="add-tile-label">Add your own</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
