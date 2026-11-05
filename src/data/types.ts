export type Dow = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
export const DOWS: Dow[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export type Category =
  | 'Fasting' | 'Fitness' | 'Hydration' | 'Nutrition' | 'Sleep'
  | 'Tracking' | 'Skin' | 'Mind' | 'Gut' | 'Supplements'

export type Section = 'allday' | 'morning' | 'afternoon' | 'evening' | 'night'

export type Schedule =
  | { type: 'daily' }
  | { type: 'weekdays'; days: Dow[] }
  | { type: 'every_n_weeks'; n: number; day: Dow }
  | { type: 'every_n_days'; n: number }

export interface ItemDetail {
  why: string
  fixes: string
  how: string
  tip: string
}

export interface Item {
  code: string
  title: string
  category: Category
  /** Label shown to the user: "07:00", "All day", "Morning", "Meal 1", "After meals"… */
  time: string
  /** HH:MM used for ordering and late/missed status. */
  sortTime: string
  section: Section
  schedule: Schedule
  unlockWeek: number
  /** Short line shown in the day tables (spec §3). */
  oneLine: string
  detail: ItemDetail
  /** Extra how-to line that applies only on certain weekdays. */
  dayNotes?: Partial<Record<Dow, string>>
}

export interface DayMeals {
  title: string
  meal1: string
  meal2: string
  prep: string
}
