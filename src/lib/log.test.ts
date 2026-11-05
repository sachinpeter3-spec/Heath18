import { describe, expect, it } from 'vitest'
import { fastStatus } from '../components/AllDayGoals'
import { ITEM_BY_CODE } from '../data/items'
import { addDays } from './dates'
import { allDayProgress, dayScore, itemContext, itemStatus, needsGutFix, type Ctx, type LogState } from './log'
import { itemsFor } from './schedule'

const START = '2026-11-02' // Monday, week 1
const ctx: Ctx = { start: START, weightKg: 75 }
const empty = (): LogState => ({ checks: {}, metrics: {} })
const SUN = ITEM_BY_CODE['SUNLIGHT'] // 07:10 daily
const LIFT = ITEM_BY_CODE['LIFT-A'] // Mon, Fri

describe('item status', () => {
  const now = { date: '2026-11-05', time: '09:00' }
  it('pending before its time, late after, missed after midnight', () => {
    expect(itemStatus(ITEM_BY_CODE['SLEEP'], now.date, now, empty(), ctx)).toBe('pending')
    expect(itemStatus(SUN, now.date, now, empty(), ctx)).toBe('late')
    expect(itemStatus(SUN, '2026-11-04', now, empty(), ctx)).toBe('missed')
    expect(itemStatus(SUN, '2026-11-06', now, empty(), ctx)).toBe('pending')
  })
  it('done and skipped override the clock', () => {
    const log = empty()
    log.checks['2026-11-04'] = { SUNLIGHT: { status: 'done', at: 0 }, WEIGH: { status: 'skipped', at: 0 } }
    expect(itemStatus(SUN, '2026-11-04', now, log, ctx)).toBe('done')
    expect(itemStatus(ITEM_BY_CODE['WEIGH'], '2026-11-04', now, log, ctx)).toBe('skipped')
  })
  it('all-day goals are done when their target is met, never late', () => {
    const log = empty()
    expect(itemStatus(ITEM_BY_CODE['WATER'], now.date, now, log, ctx)).toBe('pending')
    log.metrics[now.date] = { waterMl: 3000 }
    expect(itemStatus(ITEM_BY_CODE['WATER'], now.date, now, log, ctx)).toBe('done')
  })
})

describe('all-day targets', () => {
  it('protein uses 1.6 g/kg as the minimum', () => {
    const p = allDayProgress(ITEM_BY_CODE['PROTEIN'], START, { proteinG: 119 }, ctx)
    expect(p.met).toBe(false)
    expect(p.label).toBe('119 / 120-165 g')
    expect(allDayProgress(ITEM_BY_CODE['PROTEIN'], START, { proteinG: 120 }, ctx).met).toBe(true)
  })
  it('steps target follows program week', () => {
    expect(allDayProgress(ITEM_BY_CODE['STEPS'], START, { steps: 6000 }, ctx).met).toBe(true)
    expect(allDayProgress(ITEM_BY_CODE['STEPS'], addDays(START, 14), { steps: 6000 }, ctx).met).toBe(false)
  })
})

describe('score and context', () => {
  it('score = done / (due - skipped)', () => {
    const date = '2026-11-03'
    const items = itemsFor(date, ctx)
    const log = empty()
    expect(dayScore(items, date, log, ctx)).toBe(0)
    log.checks[date] = Object.fromEntries(items.map(i => [i.code, { status: 'done' as const, at: 0 }]))
    log.metrics[date] = { waterMl: 3000, steps: 6000, proteinG: 120, noProcessed: true, fastKept: true }
    expect(dayScore(items, date, log, ctx)).toBe(100)
    log.checks[date]['SUNLIGHT'] = { status: 'skipped', at: 0 }
    expect(dayScore(items, date, log, ctx)).toBe(100)
  })
  it('weekly count, streak and last value', () => {
    const log = empty()
    log.checks['2026-11-02'] = { 'LIFT-A': { status: 'done', at: 0, value: 'squat 12 kg x 12' } }
    const fri = itemContext(LIFT, '2026-11-06', log, ctx)
    expect(fri).toMatchObject({ weekDone: 1, weekDue: 2, streak: 1, last: { date: '2026-11-02', value: 'squat 12 kg x 12' } })

    for (const d of ['2026-11-02', '2026-11-03', '2026-11-04']) log.checks[d] = { ...log.checks[d], SUNLIGHT: { status: 'done', at: 0 } }
    expect(itemContext(SUN, '2026-11-05', log, ctx).streak).toBe(3) // today not done yet: streak still counts to yesterday
    log.checks['2026-11-05'] = { SUNLIGHT: { status: 'done', at: 0 } }
    expect(itemContext(SUN, '2026-11-05', log, ctx).streak).toBe(4)
  })
  it('weigh-in last value comes from metrics', () => {
    const log = empty()
    log.metrics['2026-11-03'] = { weightKg: 79.4 }
    expect(itemContext(ITEM_BY_CODE['WEIGH'], '2026-11-05', log, ctx).last).toEqual({ date: '2026-11-03', value: '79.4 kg' })
  })
})

describe('gut fix and fasting', () => {
  it('gut fix shows after 3 days in a row of type 1-2', () => {
    const m = { '2026-11-03': { bristol: 2 }, '2026-11-04': { bristol: 1 }, '2026-11-05': { bristol: 2 } }
    expect(needsGutFix('2026-11-05', m)).toBe(true)
    expect(needsGutFix('2026-11-05', { ...m, '2026-11-04': { bristol: 4 } })).toBe(false)
    expect(needsGutFix('2026-11-04', m)).toBe(false)
  })
  it('fast status from the eating window', () => {
    expect(fastStatus('08:00', '12:00', '20:00')).toEqual({ pct: 0.75, label: 'Fasting 12h 00m of 16h' })
    expect(fastStatus('14:00', '12:00', '20:00').label).toBe('Eating window until 20:00')
    expect(fastStatus('21:30', '12:00', '20:00').label).toBe('Fasting 1h 30m of 16h')
  })
})
