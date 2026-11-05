import { describe, expect, it } from 'vitest'
import { MEALS, proteinOf, weeklyGrocery } from '../data/meals'
import { DOWS } from '../data/types'
import type { Ctx, LogState } from './log'
import { avgOver, rolling, topStreaks, weekScore, weeklyBar } from './stats'

const ctx: Ctx = { start: '2026-11-02', weightKg: 75 }

describe('food', () => {
  it('protein estimates use the spec numbers', () => {
    expect(proteinOf({ chicken: 100 })).toBe(25)
    expect(proteinOf({ eggs: 1 })).toBe(6)
    expect(proteinOf({ paneer: 100 })).toBe(18)
    expect(proteinOf(MEALS.mon.m1)).toBe(71) // 4 eggs 24 + chicken 150 g 37.5 + broth 9 = 70.5
  })
  it('every day hits roughly the 120 g minimum with both meals', () => {
    for (const d of DOWS) expect(proteinOf(MEALS[d].m1) + proteinOf(MEALS[d].m2)).toBeGreaterThanOrEqual(80)
  })
  it('grocery list totals the whole week', () => {
    const g = Object.fromEntries(weeklyGrocery().map(x => [x.food, x.amount]))
    expect(g).toMatchObject({ chicken: 950, mutton: 600, fish: 600, eggs: 15, paneer: 350, curd: 7, broth: 4, isabgol: 3, veg: 3 })
  })
})

describe('stats', () => {
  const log: LogState = {
    checks: {},
    metrics: { '2026-11-01': { weightKg: 80 }, '2026-11-03': { weightKg: 79 }, '2026-11-05': { weightKg: 78 }, '2026-11-09': { weightKg: 77 } },
  }
  it('7-day average uses only days with values', () => {
    expect(avgOver(log.metrics, 'weightKg', '2026-11-05')).toBeCloseTo(79)
    expect(avgOver(log.metrics, 'weightKg', '2026-11-09')).toBeCloseTo(78)
    expect(avgOver(log.metrics, 'weightKg', '2026-10-01')).toBeNull()
  })
  it('rolling average per logged day', () => {
    expect(rolling(log.metrics, 'weightKg', '2026-11-03').map(p => +p[1].toFixed(2))).toEqual([79.5, 79, 78])
  })
  it('week score, weekly bars and streaks', () => {
    const l: LogState = { checks: { '2026-11-02': { 'LIFT-A': { status: 'done', at: 0 } } }, metrics: {} }
    expect(weeklyBar(['LIFT-A', 'LIFT-B'], '2026-11-05', l, ctx)).toEqual({ done: 1, due: 3 })
    expect(weekScore('2026-11-05', '2026-11-05', l, ctx)).toBe(1) // 1 of ~25 on Monday, 0 after
    expect(topStreaks('2026-11-05', l, ctx)[0]).toMatchObject({ streak: 1, item: { code: 'LIFT-A' } })
  })
})
