interface Props {
  mealName: string;
  onYes: () => void;
  onNo: () => void;
}

export function ConfirmSheet({ mealName, onYes, onNo }: Props) {
  return (
    <div className="overlay" style={{ zIndex: 21 }}>
      <div className="sheet-panel centered">
        <div className="sheet-handle" />
        <h2 className="confirm-title">DID YOU HAVE {mealName.toUpperCase()}?</h2>
        <p className="confirm-sub">Be honest. We won't judge. Much.</p>
        <div className="confirm-actions">
          <button type="button" className="confirm-button" onClick={onNo}>
            HAD SOMETHING ELSE
          </button>
          <button type="button" className="confirm-button primary" onClick={onYes}>
            YEAH, SORTED
          </button>
        </div>
      </div>
    </div>
  );
}
