# Heath18 · Lean & Healthy OS

Daily habit OS for getting lean: what to do today, a Mon–Sun plan, and why each item matters.
Vite + React + TypeScript + Tailwind. Everything is saved in the browser (`localStorage`, `h18_*` keys).

```
npm install
npm run dev      # local dev server
npm test         # schedule tests (day lists must match the spec)
npm run build    # type-check + production build to dist/
```

## Layout

- `src/data/` — the 30 items (Why / Fixes / How / Tip), weekly food plan, gut-fix steps, category colours
- `src/lib/schedule.ts` — which items are due on a date (daily, weekdays, every N weeks, every N days, unlock week)
- `src/pages/` — Today, Week, Day, Food, Progress, Settings
- `public/burn/` — the original burn planner, served unchanged at `/burn/` and shown on Progress
- `public/sw.js` + `manifest.webmanifest` — offline support and "Add to Home Screen"

## Features

- **Today**: all-day goals (fasting bar, steps, water, protein, no processed meat), timed items with
  tick / late / missed, score %, Focus timer, must-dos, item detail sheet (Why / Fixes / How / Tip / Your context)
- **Week / Day**: Mon–Sun grid with done/missed colours; tap a day to log it
- **Food**: meals with "Ate it" (adds protein), protein counter, weekly grocery list (copy to share)
- **Progress**: weight (7-day avg), waist, workouts, weekly score, Bristol chart, streaks, photo compare, blood tests
- **Settings**: program start, body weight, eating window, reminders, items on/off, backup download/restore
- Poop log with red-flag and auto gut-fix panels; Sunday weekly review

All data stays on the device (`localStorage` + IndexedDB for photos). Use Settings → Backup to move it.

## Deploy (Vercel)

Framework preset **Vite**, build `npm run build`, output `dist`. `vercel.json` handles SPA routes.

Live: https://health18.vercel.app
