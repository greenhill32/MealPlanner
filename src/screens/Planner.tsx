import { useRef, useState } from "react";
import { MealThumb } from "../components/MealThumb";
import type { Meal, WeekRow } from "../types";

interface Props {
  weekPlan: WeekRow[];
  meals: Meal[];
  todayIndex: number;
  onTapDay: (i: number) => void;
  onSwapDays: (fromIndex: number, toIndex: number) => void;
}

interface DragInfo {
  pointerId: number;
  sourceIndex: number;
  startY: number;
  moved: boolean;
}

const DRAG_THRESHOLD = 6;

export function Planner({ weekPlan, meals, todayIndex, onTapDay, onSwapDays }: Props) {
  const rowRefs = useRef<Array<HTMLDivElement | null>>([]);
  const dragInfo = useRef<DragInfo | null>(null);
  const suppressClick = useRef(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  function isDraggableSource(row: WeekRow) {
    return row.status === "planned" && row.mealId != null;
  }
  function isValidDropTarget(row: WeekRow) {
    return row.status !== "eaten" && row.status !== "skipped";
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>, i: number) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (!isDraggableSource(weekPlan[i])) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragInfo.current = { pointerId: e.pointerId, sourceIndex: i, startY: e.clientY, moved: false };
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>, i: number) {
    const info = dragInfo.current;
    if (!info || info.sourceIndex !== i || info.pointerId !== e.pointerId) return;

    if (!info.moved && Math.abs(e.clientY - info.startY) > DRAG_THRESHOLD) {
      info.moved = true;
      setDraggingIndex(i);
    }
    if (!info.moved) return;

    e.preventDefault();
    let hoverIndex: number | null = null;
    rowRefs.current.forEach((el, idx) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (e.clientY >= rect.top && e.clientY <= rect.bottom) hoverIndex = idx;
    });
    if (hoverIndex != null && hoverIndex !== info.sourceIndex && isValidDropTarget(weekPlan[hoverIndex])) {
      setDropTargetIndex(hoverIndex);
    } else {
      setDropTargetIndex(null);
    }
  }

  function endDrag(e: React.PointerEvent<HTMLDivElement>, i: number, commit: boolean) {
    const info = dragInfo.current;
    if (!info || info.sourceIndex !== i || info.pointerId !== e.pointerId) return;
    if (commit && info.moved && dropTargetIndex != null) {
      onSwapDays(info.sourceIndex, dropTargetIndex);
    }
    if (info.moved) suppressClick.current = true;
    dragInfo.current = null;
    setDraggingIndex(null);
    setDropTargetIndex(null);
  }

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
            const draggable = isDraggableSource(row);

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
              label = "PLANNED · DRAG TO MOVE";
            }

            if (draggingIndex === i) rowClass += " dragging";
            if (dropTargetIndex === i) rowClass += " drop-target";

            return (
              <div
                key={row.day}
                ref={(el) => {
                  rowRefs.current[i] = el;
                }}
                className={rowClass}
                style={{ cursor: draggable ? "grab" : tappable ? "pointer" : "default", touchAction: draggable ? "none" : "auto" }}
                onPointerDown={(e) => handlePointerDown(e, i)}
                onPointerMove={(e) => handlePointerMove(e, i)}
                onPointerUp={(e) => endDrag(e, i, true)}
                onPointerCancel={(e) => endDrag(e, i, false)}
                onClick={() => {
                  if (suppressClick.current) {
                    suppressClick.current = false;
                    return;
                  }
                  if (tappable) onTapDay(i);
                }}
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
