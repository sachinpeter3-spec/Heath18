import { ITEMS } from '../data/items'
import type { Item } from '../data/types'
import { addDays, mondayOf, programWeek } from './dates'
import { isDue, proteinTarget, stepsTarget, type ScheduleOptions } from './schedule'

export interface Check {
  status: 'done' | 'skipped'
  at: number
  /** Free value logged with the item, e.g. "squat 12 kg x 12". */
  value?: string
}
export type Checks = Record<string, Record<string, Check>>

export interface DayMetrics {
  waterMl?: number
  steps?: number
  proteinG?: number
  noProcessed?: boolean
  fastKept?: boolean
  weightKg?: number
  waistCm?: number
  sleepH?: number
  bristol?: number
  redFlag?: boolean
}
export type Metrics = Record<string, DayMetrics>

export interface LogState {
  checks: Checks
  metrics: Metrics
}

export interface Ctx extends ScheduleOptions {
  weightKg: number
}

export const WATER_TARGET_ML = 3000

/** 0 → "0", 250 → "0.25", 1500 → "1.5" */
export const litres = (ml: number) => String(+(ml / 1000).toFixed(2))

/** Item codes whose value is a number stored in the day's metrics. */
export const METRIC_FIELD: Record<string, { key: keyof DayMetrics; unit: string; step: number }> = {
  WEIGH: { key: 'weightKg', unit: 'kg', step: 0.1 },
  WAIST: { key: 'waistCm', unit: 'cm', step: 0.5 },
  SLEEP: { key: 'sleepH', unit: 'h', step: 0.5 },
}
/** Item codes that take a free-text log (workout sets, blood numbers). */
export const TEXT_VALUE = new Set(['LIFT-A', 'LIFT-B', 'BLOOD'])

/** Progress (0-1) and label for an all-day goal. */
export function allDayProgress(item: Item, date: string, m: DayMetrics, ctx: Ctx): { pct: number; label: string; met: boolean } {
  switch (item.code) {
    case 'STEPS': {
      const t = stepsTarget(Math.max(1, programWeek(date, ctx.start)))
      const v = m.steps ?? 0
      return { pct: v / t, label: `${v.toLocaleString()} / ${t.toLocaleString()}`, met: v >= t }
    }
    case 'WATER': {
      const v = m.waterMl ?? 0
      return { pct: v / WATER_TARGET_ML, label: `${litres(v)} / 3 L`, met: v >= WATER_TARGET_ML }
    }
    case 'PROTEIN': {
      const { min, max } = proteinTarget(ctx.weightKg)
      const v = m.proteinG ?? 0
      return { pct: v / min, label: `${v} / ${min}-${max} g`, met: v >= min }
    }
    case 'NO-PROC':
      return { pct: m.noProcessed ? 1 : 0, label: m.noProcessed ? 'Yes' : 'Not yet', met: !!m.noProcessed }
    case 'FAST':
      return { pct: m.fastKept ? 1 : 0, label: m.fastKept ? 'Kept' : 'Not yet', met: !!m.fastKept }
    default:
      return { pct: 0, label: '', met: false }
  }
}

export function isDone(item: Item, date: string, log: LogState, ctx: Ctx): boolean {
  if (item.section === 'allday') return allDayProgress(item, date, log.metrics[date] ?? {}, ctx).met
  return log.checks[date]?.[item.code]?.status === 'done'
}

export type Status = 'done' | 'skipped' | 'late' | 'missed' | 'pending'

/**
 * Spec §1: items past their time and not done turn amber ("late");
 * after midnight they become "missed".
 */
export function itemStatus(item: Item, date: string, now: { date: string; time: string }, log: LogState, ctx: Ctx): Status {
  if (isDone(item, date, log, ctx)) return 'done'
  if (log.checks[date]?.[item.code]?.status === 'skipped') return 'skipped'
  if (date < now.date) return 'missed'
  if (date === now.date && item.section !== 'allday' && now.time >= item.sortTime) return 'late'
  return 'pending'
}

/** Daily score: done / (due - skipped), as a whole percent. */
export function dayScore(items: Item[], date: string, log: LogState, ctx: Ctx): number {
  let done = 0, count = 0
  for (const i of items) {
    if (log.checks[date]?.[i.code]?.status === 'skipped') continue
    count++
    if (isDone(i, date, log, ctx)) done++
  }
  return count ? Math.round((done / count) * 100) : 0
}

export interface ItemContext {
  weekDone: number
  weekDue: number
  streak: number
  last?: { date: string; value: string }
}

/** "Your context" in the detail panel: weekly count, streak, last logged value. */
export function itemContext(item: Item, date: string, log: LogState, ctx: Ctx): ItemContext {
  const mon = mondayOf(date)
  let weekDone = 0, weekDue = 0
  for (let k = 0; k < 7; k++) {
    const d = addDays(mon, k)
    if (!isDue(item, d, ctx)) continue
    weekDue++
    if (isDone(item, d, log, ctx)) weekDone++
  }

  // Streak: consecutive due days done, counting back from today (today only counts if done).
  let streak = 0
  let d = isDone(item, date, log, ctx) ? date : addDays(date, -1)
  for (let guard = 0; guard < 400 && d >= ctx.start; guard++, d = addDays(d, -1)) {
    if (!isDue(item, d, ctx)) continue
    if (!isDone(item, d, log, ctx)) break
    streak++
  }

  return { weekDone, weekDue, streak, last: lastValue(item, date, log) }
}

function lastValue(item: Item, date: string, log: LogState): ItemContext['last'] {
  const mf = METRIC_FIELD[item.code]
  if (mf) {
    const d = Object.keys(log.metrics).filter(k => k < date && log.metrics[k][mf.key] != null).sort().pop()
    return d ? { date: d, value: `${log.metrics[d][mf.key]} ${mf.unit}` } : undefined
  }
  if (item.code === 'POOP') {
    const d = Object.keys(log.metrics).filter(k => k < date && log.metrics[k].bristol != null).sort().pop()
    return d ? { date: d, value: `Type ${log.metrics[d].bristol}` } : undefined
  }
  const d = Object.keys(log.checks).filter(k => k < date && log.checks[k][item.code]?.value).sort().pop()
  return d ? { date: d, value: log.checks[d][item.code].value! } : undefined
}

/** Spec §5: gut-fix panel shows after 3 days in a row of Bristol type 1-2 (ending on `date`). */
export function needsGutFix(date: string, metrics: Metrics): boolean {
  for (let k = 0; k < 3; k++) {
    const b = metrics[addDays(date, -k)]?.bristol
    if (b == null || b > 2) return false
  }
  return true
}

export const ALL_DAY_ITEMS = ITEMS.filter(i => i.section === 'allday')
