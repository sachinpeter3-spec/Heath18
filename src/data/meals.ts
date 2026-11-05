import type { DayMeals, Dow, Food, Portion } from './types'

/** Food plan per weekday (spec §3). Unspecified egg/paneer amounts use 3 eggs / 100 g. */
export const MEALS: Record<Dow, DayMeals> = {
  mon: { title: 'Week start - new targets + Workout A', meal1: '4 eggs + chicken 150 g + broth', meal2: 'Mutton curry 200 g + curd + isabgol', prep: 'Thaw chicken for Tuesday',
    m1: { eggs: 4, chicken: 150, broth: 1 }, m2: { mutton: 200, curd: 1, isabgol: 1 } },
  tue: { title: 'Rest + fish day', meal1: 'Chicken 200 g + 2 eggs', meal2: 'Fish (bangda/mathi) 200 g + curd + veg', prep: 'Soak/start broth for Wednesday',
    m1: { chicken: 200, eggs: 2 }, m2: { fish: 200, curd: 1, veg: 1 } },
  wed: { title: 'Workout B', meal1: 'Paneer 150 g + 3 eggs + broth', meal2: 'Mutton/beef 200 g + curd + isabgol', prep: 'Thaw chicken + fish',
    m1: { paneer: 150, eggs: 3, broth: 1 }, m2: { mutton: 200, curd: 1, isabgol: 1 } },
  thu: { title: 'Rest + fish day', meal1: 'Chicken 200 g', meal2: 'Fish 200 g + curd + veg', prep: 'Marinate mutton for Friday',
    m1: { chicken: 200 }, m2: { fish: 200, curd: 1, veg: 1 } },
  fri: { title: 'Workout A', meal1: 'Eggs + broth + paneer 100 g', meal2: 'Mutton 200 g + curd + isabgol', prep: 'Buy eggs, paneer',
    m1: { eggs: 3, broth: 1, paneer: 100 }, m2: { mutton: 200, curd: 1, isabgol: 1 } },
  sat: { title: 'Light day + mobility', meal1: 'Chicken keema 200 g', meal2: 'Eggs + paneer + curd + veg', prep: 'Grocery list ready',
    m1: { chicken: 200 }, m2: { eggs: 3, paneer: 100, curd: 1, veg: 1 } },
  sun: { title: 'Review, measure, shop, prep', meal1: 'Free carnivore meal + broth', meal2: 'Fish 200 g + curd', prep: 'Big broth pot, batch-cook chicken',
    m1: { chicken: 200, broth: 1 }, m2: { fish: 200, curd: 1 } },
}

/** Protein per unit, from the spec tips where given (chicken 25 g/100 g, egg 6 g, paneer 18 g/100 g). */
const PROTEIN: Record<Food, number> = {
  chicken: 0.25, mutton: 0.25, fish: 0.22, paneer: 0.18, // per gram
  eggs: 6, curd: 4, broth: 9, isabgol: 0, veg: 2, // per item / serving
}

export const proteinOf = (p: Portion) =>
  Math.round(Object.entries(p).reduce((s, [k, v]) => s + PROTEIN[k as Food] * (v ?? 0), 0))

export const GROCERY_LABEL: Record<Food, { name: string; unit: (n: number) => string }> = {
  chicken: { name: 'Chicken (incl. keema)', unit: n => `${(n / 1000).toFixed(1)} kg` },
  mutton: { name: 'Mutton / beef', unit: n => `${(n / 1000).toFixed(1)} kg` },
  fish: { name: 'Fatty fish (bangda / mathi)', unit: n => `${(n / 1000).toFixed(1)} kg` },
  eggs: { name: 'Eggs', unit: n => `${n} eggs (${Math.ceil(n / 6)} half-dozen)` },
  paneer: { name: 'Paneer', unit: n => `${n} g` },
  curd: { name: 'Curd', unit: n => `${n} bowls (~${(n * 0.2).toFixed(1)} kg)` },
  broth: { name: 'Bones for broth (or collagen)', unit: n => `${n} cups - ~1 kg mutton/chicken bones` },
  isabgol: { name: 'Psyllium (isabgol)', unit: n => `${n} tsp` },
  veg: { name: 'Vegetables / berries', unit: n => `${n} portions` },
}

/** Totals for a whole Mon-Sun week of meals. */
export function weeklyGrocery(): { food: Food; amount: number }[] {
  const t: Portion = {}
  for (const d of Object.values(MEALS)) for (const p of [d.m1, d.m2]) for (const [k, v] of Object.entries(p)) t[k as Food] = (t[k as Food] ?? 0) + (v ?? 0)
  return (Object.keys(GROCERY_LABEL) as Food[]).filter(f => t[f]).map(f => ({ food: f, amount: t[f]! }))
}

/** Things to keep in stock that aren't in a single meal. */
export const STAPLES = ['Salt + lemons (morning water)', 'Ghee', 'Black coffee / plain tea', 'Sunscreen SPF 30+ (check stock)', 'Supplements: D3+K2, omega-3, vitamin C, magnesium (check stock)']
