import type { Screen } from "../types";

interface Props {
  screen: Screen;
  onSelect: (s: Screen) => void;
}

export function TabBar({ screen, onSelect }: Props) {
  const tabs: { key: Screen; label: string }[] = [
    { key: "home", label: "HOME" },
    { key: "planner", label: "WEEK" },
    { key: "meals", label: "MEALS" },
  ];
  return (
    <div className="tab-bar">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          className={`tab-button ${screen === t.key ? "active" : ""}`}
          onClick={() => onSelect(t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
