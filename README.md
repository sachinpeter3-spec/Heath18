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

Live: https://health18.vercel.app
