import { ITEMS } from '../data/items'
import type { Item, Section } from '../data/types'
import { daysBetween, dowOf, programWeek } from './dates'

export interface ScheduleOptions {
  /** Program start date (YYYY-MM-DD). Sets "Week N", every-N-weeks and every-N-days items. */
  start: string
  /** Item codes the user switched off in Settings. */
  disabled?: string[]
}

/** Does this item's schedule fall on this date? (ignores unlock week) */
export function isScheduled(item: Item, date: string, start: string): boolean {
  const s = item.schedule
  switch (s.type) {
    case 'daily':
      return true
    case 'weekdays':
      return s.days.includes(dowOf(date))
    case 'every_n_weeks': {
      if (dowOf(date) !== s.day) return false
      const w = programWeek(date, start)
      return w >= 1 && (w - 1) % s.n === 0
    }
    case 'every_n_days': {
      const d = daysBetween(start, date)
      return d >= 0 && d % s.n === 0
    }
  }
}

/** Spec §6: due = schedule matches date AND unlockWeek <= current week (and not switched off). */
export function isDue(item: Item, date: string, opts: ScheduleOptions): boolean {
  if (opts.disabled?.includes(item.code)) return false
  if (programWeek(date, opts.start) < item.unlockWeek) return false
  return isScheduled(item, date, opts.start)
}

export function itemsFor(date: string, opts: ScheduleOptions, items: Item[] = ITEMS): Item[] {
  return items
    .filter(i => isDue(i, date, opts))
    .sort((a, b) => a.sortTime.localeCompare(b.sortTime))
}

export const SECTIONS: { key: Exclude<Section, 'allday'>; label: string }[] = [
  { key: 'morning', label: 'Morning' },
  { key: 'afternoon', label: 'Afternoon' },
  { key: 'evening', label: 'Evening' },
  { key: 'night', label: 'Night' },
]

export function groupBySection(items: Item[]) {
  return {
    allday: items.filter(i => i.section === 'allday'),
    sections: SECTIONS.map(s => ({ ...s, items: items.filter(i => i.section === s.key) })),
  }
}

/** Steps target grows with program week (spec §4, Daily steps). */
export function stepsTarget(week: number): number {
  if (week <= 2) return 6000
  if (week === 3) return 7000
  if (week === 4) return 8000
  return 10000
}

/** Protein target range in grams: 1.6-2.2 g per kg body weight. */
export function proteinTarget(weightKg: number): { min: number; max: number } {
  return { min: Math.round(weightKg * 1.6), max: Math.round(weightKg * 2.2) }
}
