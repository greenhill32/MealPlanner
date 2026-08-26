# Meal Picker Mobile App

_Started 2026-08-26 19:56 UTC_

---

## User

Design a mobile app for meal picker.
Onboarding — choose starter meals / add your own.
Forgotten Favourites / Home — the main screen; neglected meals sorted to the top.
Week Planner — Monday–Sunday vertical list.
Confirm Meal — “Did you have X?” / choose what you actually ate.
Meals — add, rename, change emoji, delete.
a mcdonalds `esque meal planner

## Assistant



## Assistant

_[tool: read_file]_

_[tool: list_files]_

_[tool: ask_user]_

Waiting on your answers about navigation, "forgotten" logic, confirm-meal trigger, meal slots per day, tone, and seed data.

## User

Answered — nav: Bottom tab bar (Home / Planner / Meals); neglect_logic: Days since last eaten (oldest first); confirm_trigger: When user taps today's meal on the Home/Planner screen; meal_unit: Just tea/dinner (one slot/day); tone: Keep it — same cheeky British voice everywhere; data: Seed with realistic fake history (last-eaten dates, a filled week)

## Assistant

_[tool: dc_write]_

_[tool: ready_for_verification]_

Built all 5 screens as one prototype: Onboarding (your file, now stateful), Home/Forgotten Favourites with a tappable "today" card, Week Planner (Mon–Sun, tap today to confirm, tap future/empty days to plan), Confirm Meal flow (yes/no → pick actual meal), and Meals management (add/rename/emoji/delete). Bottom tab bar ties Home/Planner/Meals together.

