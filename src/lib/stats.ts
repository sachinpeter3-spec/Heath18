import { ITEMS } from '../data/items'
import { addDays, mondayOf } from './dates'
import { dayScore, itemContext, type Ctx, type DayMetrics, type LogState, type Metrics } from './log'
import { itemsFor } from './schedule'

/** Average of a metric over the `days` days ending on `end` (only days with a value). */
export function avgOver(metrics: Metrics, key: keyof DayMetrics, end: string, days = 7): number | null {
  const vals: number[] = []
  for (let k = 0; k < days; k++) {
    const v = metrics[addDays(end, -k)]?.[key]
    if (typeof v === 'number') vals.push(v)
  }
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

/** Series of [date, value] for one metric, sorted by date. */
export function series(metrics: Metrics, key: keyof DayMetrics, from?: string, to?: string): [string, number][] {
  return Object.keys(metrics)
    .filter(d => (!from || d >= from) && (!to || d <= to) && typeof metrics[d][key] === 'number')
    .sort()
    .map(d => [d, metrics[d][key] as number])
}

/** 7-day rolling average for each day that has a value. */
export function rolling(metrics: Metrics, key: keyof DayMetrics, from?: string, to?: string): [string, number][] {
  return series(metrics, key, from, to).map(([d]) => [d, avgOver(metrics, key, d, 7)!])
}

/** Average daily score for the week containing `date`, counting days up to `upTo`. */
export function weekScore(date: string, upTo: string, log: LogState, ctx: Ctx): number | null {
  const mon = mondayOf(date)
  const scores: number[] = []
  for (let k = 0; k < 7; k++) {
    const d = addDays(mon, k)
    if (d > upTo || d < ctx.start) continue
    scores.push(dayScore(itemsFor(d, ctx), d, log, ctx))
  }
  return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
}

/** Items ranked by current streak (only streaks of 1+). */
export function topStreaks(date: string, log: LogState, ctx: Ctx, n = 5) {
  return ITEMS.filter(i => !ctx.disabled?.includes(i.code))
    .map(i => ({ item: i, streak: itemContext(i, date, log, ctx).streak }))
    .filter(s => s.streak > 0)
    .sort((a, b) => b.streak - a.streak)
    .slice(0, n)
}

/** Weekly progress bars for the focus timer: done / due this week. */
export const WEEKLY_BARS: { label: string; codes: string[] }[] = [
  { label: 'Workouts', codes: ['LIFT-A', 'LIFT-B'] },
  { label: 'Mobility', codes: ['MOBILITY'] },
  { label: 'Steps', codes: ['STEPS'] },
  { label: 'Water 3 L', codes: ['WATER'] },
  { label: 'Protein', codes: ['PROTEIN'] },
  { label: 'Sleep 7-8 h', codes: ['SLEEP'] },
  { label: 'Fish meals', codes: ['FISH'] },
]

export function weeklyBar(codes: string[], date: string, log: LogState, ctx: Ctx) {
  let done = 0, due = 0
  for (const c of codes) {
    const it = ITEMS.find(i => i.code === c)
    if (!it || ctx.disabled?.includes(c)) continue
    const x = itemContext(it, date, log, ctx)
    done += x.weekDone
    due += x.weekDue
  }
  return { done, due }
}

/** Last value of a metric on or before `date`. */
export function lastMetric(metrics: Metrics, key: keyof DayMetrics, before: string): [string, number] | null {
  const s = series(metrics, key, undefined, before)
  return s.length ? s[s.length - 1] : null
}
