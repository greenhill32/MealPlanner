# PROJECT.md — Mealplanner ("What's for Tea?")

- **Project ID:** mealplanner
- **Aliases:** what's-for-tea, whats-for-tea
- **Type:** App (PWA)
- **Status:** ACTIVE
- **Created:** 2026-08-27 (cloned to NUC from existing GitHub repo `greenhill32/MealPlanner`)
- **Last reviewed:** 2026-08-27

## Purpose

A weekly meal-picker PWA for one person (Lee). Pick your regular meals, plan the week,
never forget a favourite. Problem it solves: deciding what to eat each week is annoying
when you can't quickly see what you haven't had in a while.

## Current status

Already built and functional — not starting from zero. Cloned from an existing repo with
7 commits of history: initial React/TS PWA implementation, draggable week planner cards,
a photo-swap tool, and a bulk meal-add tool.

## Architecture

- React 19 + TypeScript + Vite, built as an installable PWA (`vite-plugin-pwa`).
- All state kept client-side in `localStorage` — no backend, no network exposure.
- Design source: built from a Claude Design (claude.ai/design) mockup — see `design/README.md`,
  `design/chats/`, `design/project/` for the original design intent and chat transcripts.

## Main workflow

- **Onboarding** — pick starter meals from a catalog or add your own.
- **Home ("Forgotten Favourites")** — today's tea, plus meals sorted by how long since you last had them.
- **Week Planner** — Monday–Sunday; tap today to confirm what you had, tap a future/empty day to plan it.
- **Meals** — add, rename, change emoji, delete.

## Important files

- `src/App.tsx`, `src/screens/` — main screens
- `src/useAppState.ts` — app state management
- `src/storage.ts` — localStorage persistence
- `src/data.ts`, `src/types.ts` — meal catalog / types
- `tools/add_meal_photo.py`, `tools/import/` — offline helper scripts for meal photos/bulk import
- `design/` — Claude Design handoff bundle (original mockup + chat transcripts)

## Data / storage

All data lives in browser `localStorage`. No server, no database, no sync between devices.

## External dependencies

None at runtime — no APIs, no backend. Dev tooling only: React, Vite, TypeScript, oxlint.

## Security / access / network exposure

None — purely local, client-side PWA. No accounts, no network calls, no exposed ports.

## Decisions made and why

- **Meal picker only — no recipes, no shopping list, no nutrition tracking.** Explicitly
  out of scope; keeps the app to its one job (deciding what's for tea this week).
- **Single-user, local-only.** No accounts or sync — success is just "easily planning weekly
  meals" for Lee, not a multi-user product.
- **Client-side only, `localStorage`.** No backend needed for a single-user local tool.

## Known problems / gotchas

- None recorded yet — first review since cloning to this NUC.

## Out of scope

- Recipes
- Shopping lists
- Nutrition tracking
- Multi-user / accounts / sync

## Recovery notes

If it breaks: check `git status` and `git log` first. `npm install` then `npm run dev` to
run locally; `npm run build` to type-check and produce the PWA build.

## Next 3 things

- TBD — first live review since clone; ask Lee what he wants to work on next.
- TBD
- TBD

## AI handoff instructions

Read this file and run `git status` before changing anything. Don't delete, move, or
restructure files without flagging it first. Prefer small, testable changes. Update
Status / Known Problems / Next 3 Things after significant work. Scope is locked to
meal-picking only — don't add recipes, shopping lists, or nutrition features without
Lee explicitly asking.

## Recent important history

2026-08-27 — Repo cloned from `https://github.com/greenhill32/MealPlanner` onto the NUC
and registered in this machine's project index. The app was originally designed in Claude
Design (see `design/`) and implemented as a React/TS/Vite PWA prior to this clone; no NUC-side
history exists before this date. Lee confirmed scope is strictly meal-picking — no recipes,
shopping lists, or other features to be added.
