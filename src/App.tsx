import "./App.css";
import { ConfirmSheet } from "./components/ConfirmSheet";
import { MealSheet } from "./components/MealSheet";
import { PickerSheet } from "./components/PickerSheet";
import { Splash } from "./components/Splash";
import { TabBar } from "./components/TabBar";
import { Home } from "./screens/Home";
import { Meals } from "./screens/Meals";
import { Onboarding } from "./screens/Onboarding";
import { Planner } from "./screens/Planner";
import { useAppState } from "./useAppState";

export default function App() {
  const app = useAppState();

  if (!app.onboarded || !app.persisted) {
    return (
      <div className="app-root">
        <Onboarding
          catalog={app.onboardCatalog}
          selected={app.selected}
          onToggle={app.toggleSelect}
          onAddOwn={app.openOnboardAdd}
          onFinish={app.finishOnboarding}
        />
        {app.splash && <Splash />}
        {app.sheet && (
          <MealSheet
            sheet={app.sheet}
            onNameChange={app.setSheetName}
            onEmojiChange={app.setSheetEmoji}
            onSave={app.saveSheet}
            onClose={app.closeSheet}
            onDelete={app.deleteFromSheet}
          />
        )}
      </div>
    );
  }

  const { meals, weekPlan } = app.persisted;

  return (
    <div className="app-root">
      <div className="screen">
        {app.screen === "home" && (
          <Home meals={meals} weekPlan={weekPlan} todayIndex={app.todayIndex} onTapToday={app.tapToday} />
        )}
        {app.screen === "planner" && (
          <Planner
            weekPlan={weekPlan}
            meals={meals}
            todayIndex={app.todayIndex}
            onTapDay={app.tapDay}
            onSwapDays={app.swapDays}
          />
        )}
        {app.screen === "meals" && (
          <Meals meals={meals} onEdit={app.openMealsEdit} onDelete={app.deleteMeal} onAdd={app.openMealsAdd} />
        )}

        <TabBar screen={app.screen} onSelect={app.setScreen} />
      </div>

      {app.sheet && (
        <MealSheet
          sheet={app.sheet}
          onNameChange={app.setSheetName}
          onEmojiChange={app.setSheetEmoji}
          onSave={app.saveSheet}
          onClose={app.closeSheet}
          onDelete={app.deleteFromSheet}
        />
      )}

      {app.confirmAsk && <ConfirmSheet mealName={app.confirmAsk.mealName} onYes={app.confirmYes} onNo={app.confirmNo} />}

      {app.picker && (
        <PickerSheet
          picker={app.picker}
          meals={meals}
          onPick={app.pickMeal}
          onAddNew={app.openPlanAddFromPicker}
          onClose={app.closePicker}
        />
      )}
    </div>
  );
}
