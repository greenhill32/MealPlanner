# What's for Tea?

A meal-picker PWA: pick your regulars, plan the week, never forget a favourite.

Built from a [Claude Design](https://claude.ai/design) mockup (see `design/README.md`, `design/chats/`, `design/project/` for the original design source). This is the real implementation — React + TypeScript + Vite, installable as a PWA, all state kept client-side in `localStorage`.

## Screens

- **Onboarding** — pick starter meals from a catalog or add your own.
- **Home ("Forgotten Favourites")** — today's tea, plus your meals sorted by how long it's been since you had them.
- **Week Planner** — Monday–Sunday, tap today to confirm what you had, tap a future/empty day to plan it.
- **Meals** — add, rename, change emoji, delete.

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
