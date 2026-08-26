import { EMOJIS } from "../data";
import type { SheetState } from "../types";

interface Props {
  sheet: SheetState;
  onNameChange: (v: string) => void;
  onEmojiChange: (e: string) => void;
  onSave: () => void;
  onClose: () => void;
  onDelete: () => void;
}

export function MealSheet({ sheet, onNameChange, onEmojiChange, onSave, onClose, onDelete }: Props) {
  const title = sheet.context === "mealsEdit" ? "EDIT MEAL" : "ADD YOUR OWN";
  const showDelete = sheet.context === "mealsEdit";

  return (
    <div className="overlay" style={{ zIndex: 20 }}>
      <div className="sheet-panel">
        <div className="sheet-handle" />
        <h2 className="sheet-title">{title}</h2>
        <p className="sheet-subtitle">Name it. Emoji optional — we'll use 🍽️.</p>
        <div className="sheet-name-row">
          <button type="button" className="emoji-picker-button" tabIndex={-1}>
            {sheet.emoji}
          </button>
          <input
            className="sheet-name-input"
            value={sheet.name}
            onChange={(e) => onNameChange(e.target.value)}
            maxLength={28}
            placeholder="e.g. Egg & chips"
            autoComplete="off"
          />
        </div>
        <div className="emoji-row">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              className={`emoji-option ${sheet.emoji === e ? "selected" : ""}`}
              onClick={() => onEmojiChange(e)}
            >
              {e}
            </button>
          ))}
        </div>
        <div className="sheet-error">{sheet.error}</div>
        <div className="sheet-actions">
          <button type="button" className="sheet-button" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="sheet-button primary" onClick={onSave}>
            SAVE
          </button>
        </div>
        {showDelete && (
          <div className="sheet-delete-row">
            <button type="button" className="sheet-delete-link" onClick={onDelete}>
              Delete this meal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
