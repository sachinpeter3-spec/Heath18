import type { DayMeals, Dow } from './types'

/** Food plan per weekday (spec §3). */
export const MEALS: Record<Dow, DayMeals> = {
  mon: { title: 'Week start - new targets + Workout A', meal1: '4 eggs + chicken 150 g + broth', meal2: 'Mutton curry 200 g + curd + isabgol', prep: 'Thaw chicken for Tuesday' },
  tue: { title: 'Rest + fish day', meal1: 'Chicken 200 g + 2 eggs', meal2: 'Fish (bangda/mathi) 200 g + curd + veg', prep: 'Soak/start broth for Wednesday' },
  wed: { title: 'Workout B', meal1: 'Paneer 150 g + 3 eggs + broth', meal2: 'Mutton/beef 200 g + curd + isabgol', prep: 'Thaw chicken + fish' },
  thu: { title: 'Rest + fish day', meal1: 'Chicken 200 g', meal2: 'Fish 200 g + curd + veg', prep: 'Marinate mutton for Friday' },
  fri: { title: 'Workout A', meal1: 'Eggs + broth + paneer 100 g', meal2: 'Mutton 200 g + curd + isabgol', prep: 'Buy eggs, paneer' },
  sat: { title: 'Light day + mobility', meal1: 'Chicken keema 200 g', meal2: 'Eggs + paneer + curd + veg', prep: 'Grocery list ready' },
  sun: { title: 'Review, measure, shop, prep', meal1: 'Free carnivore meal + broth', meal2: 'Fish 200 g + curd', prep: 'Big broth pot, batch-cook chicken' },
}
