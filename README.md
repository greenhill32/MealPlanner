# What's for Tea?

A meal-picker PWA: pick your regulars, plan the week, never forget a favourite.

Built from a [Claude Design](https://claude.ai/design) mockup (see `design/README.md`, `design/chats/`, `design/project/` for the original design source). This is the real implementation — React + TypeScript + Vite, installable as a PWA, all state kept client-side in `localStorage`.

## Screens

- **Onboarding** — pick starter meals from a catalog or add your own.
- **Home ("Forgotten Favourites")** — today's tea, plus your meals sorted by how long it's been since you had them.
- **Week Planner** — Monday–Sunday, tap today to confirm what you had, tap a future/empty day to plan it.
- **Meals** — add, rename, change emoji, delete.

## Adding new meals

Onboarding has no starter catalog — new meals get added one photo at a time via the
bulk importer, not by editing code by hand.

1. **Upload photos to GitHub.** On any device, go to
   [github.com/greenhill32/MealPlanner](https://github.com/greenhill32/MealPlanner) →
   `tools/` → **Add file → Upload files**. Name each photo after the meal, with
   underscores for spaces — e.g. `Chicken_Curry.jpg`, `Ham_&_Egg.jpeg`. That filename
   becomes the meal's display name. Commit straight to `main`.
2. **Pull and import** (on a machine with this repo cloned, e.g. via Claude Code):
   ```sh
   git pull
   python3 tools/import/add_meals_bulk.py tools
   ```
   This copies each photo into `src/assets/meals/`, adds/updates its entry in
   `src/data.ts`, and makes one commit for the batch. It'll ask `Import these meals? [Y/n]`
   and `Push to origin now? [y/N]`.
3. **Clean up the originals** — the uploaded photos in `tools/` are no longer needed
   once copied into `src/assets/meals/`:
   ```sh
   git rm tools/<the uploaded files>
   git commit -m "Remove source photos from tools/ after import"
   ```
4. **Push.** `git push` — Vercel auto-deploys on push to `main` (see PROJECT.md).

Note: this only affects the onboarding catalog (what new/re-onboarded users can pick
from). It does **not** retroactively add meals to an already-onboarded user's saved
list — that's a separate, deliberate design choice (see `src/useAppState.ts`).

## Develop

```sh
npm install
npm run dev
```

## Build

```sh
npm run build   # type-checks, builds, and generates the PWA service worker
npm run preview # serve the production build locally
```
