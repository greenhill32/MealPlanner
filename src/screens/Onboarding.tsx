import { norm } from "../data";
import type { CatalogItem } from "../types";

interface Props {
  catalog: CatalogItem[];
  selected: Record<string, boolean>;
  onToggle: (key: string) => void;
  onAddOwn: () => void;
  onFinish: () => void;
}

export function Onboarding({ catalog, selected, onToggle, onAddOwn, onFinish }: Props) {
  const selectedCount = Object.keys(selected).length;
  const hint = selectedCount === 0 ? "Pick at least one to continue" : selectedCount === 1 ? "1 regular locked in" : `${selectedCount} regulars locked in`;
  const live =
    selectedCount === 0 ? "" : selectedCount === 1 ? "Nice. One down." : selectedCount >= 4 ? "Proper menu, that." : "That's more like it.";

  return (
    <div className="screen">
      <header className="header">
        <div className="header-title">
          WHAT'S FOR <span className="accent">TEA?</span>
        </div>
        <div className="header-sub">Your regulars · pick &amp; go</div>
      </header>
      <div className="onboard-intro">
        <h1>WHAT DO YOU USUALLY HAVE FOR TEA?</h1>
        <p>Pick a few favourites or add your own. You can change them later.</p>
        <div className="onboard-live">{live}</div>
      </div>
      <div className="content" style={{ paddingBottom: 132 }}>
        <div className="tile-grid">
          {catalog.map((tile) => {
            const key = norm(tile.name);
            const on = !!selected[key];
            return (
              <button
                key={tile.id}
                type="button"
                className={`tile ${on ? "selected" : ""}`}
                onClick={() => onToggle(key)}
              >
                {tile.photo ? (
                  <img src={tile.photo} alt={tile.name} />
                ) : (
                  <div className="tile-emoji">{tile.emoji}</div>
                )}
                <span className="tile-check">✓</span>
                <span className="tile-label">{tile.name}</span>
              </button>
            );
          })}
          <button type="button" className="add-tile" onClick={onAddOwn}>
            <div className="add-tile-plus">+</div>
            <span className="add-tile-label">Add your own</span>
          </button>
        </div>
      </div>
      <div className="onboard-footer">
        <div className="onboard-hint">{hint}</div>
        <button type="button" className="cta-button" disabled={selectedCount === 0} onClick={onFinish}>
          LET'S EAT
        </button>
      </div>
    </div>
  );
}
