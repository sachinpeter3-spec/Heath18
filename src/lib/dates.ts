import { DOWS, type Dow } from '../data/types'

/** All dates are local "YYYY-MM-DD" strings. */
export const parse = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export const iso = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
export const today = () => iso(new Date())
export const addDays = (s: string, n: number) => {
  const d = parse(s)
  d.setDate(d.getDate() + n)
  return iso(d)
}
/** Whole days from a to b (b - a), safe across DST. */
export const daysBetween = (a: string, b: string) =>
  Math.round((Date.UTC(...ymd(b)) - Date.UTC(...ymd(a))) / 86_400_000)
const ymd = (s: string): [number, number, number] => {
  const [y, m, d] = s.split('-').map(Number)
  return [y, m - 1, d]
}

export const dowOf = (s: string): Dow => DOWS[(parse(s).getDay() + 6) % 7]
/** Monday of the week containing s. */
export const mondayOf = (s: string) => addDays(s, -DOWS.indexOf(dowOf(s)))

/** Program week number (1-based). Weeks run Monday-Sunday; week 1 contains the start date. */
export const programWeek = (date: string, start: string) =>
  Math.floor(daysBetween(mondayOf(start), date) / 7) + 1
