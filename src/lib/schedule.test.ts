import { describe, expect, it } from 'vitest'
import { ITEMS } from '../data/items'
import { MEALS } from '../data/meals'
import { DOWS, type Dow } from '../data/types'
import { addDays, programWeek } from './dates'
import { isDue, itemsFor, stepsTarget } from './schedule'

// Program starts Monday 2026-11-02. Week 2 = 9-15 Nov (photo not due, blood test not due).
const START = '2026-11-02'
const WEEK2: Record<Dow, string> = Object.fromEntries(
  DOWS.map((d, i) => [d, addDays('2026-11-09', i)]),
) as Record<Dow, string>

const DAILY = [
  'Morning water + electrolytes', 'Morning sunlight (10 min)', 'Weigh-in', 'Morning skin routine',
  'Focus timer (5 min)', 'Poop log (Bristol scale)', 'Meal 1 - break fast with protein',
  'Day supplements: D3+K2, Omega-3, Vitamin C', '10-min walk after meal', 'Meal 2 + curd + fiber',
  "Prepare tomorrow's food", 'Night skin routine', 'Magnesium at night', 'Sleep 7-8 hours',
]

// "Special to <day>" lines from spec §3.
const SPECIAL: Record<Dow, string[]> = {
  mon: ['Bone broth / collagen', 'Stress break (5 min)', 'Strength workout - Day A'],
  tue: ['Stress break (5 min)', 'Mobility / stretch (5 min)', 'Fatty fish meal'],
  wed: ['Bone broth / collagen', 'Stress break (5 min)', 'Strength workout - Day B'],
  thu: ['Stress break (5 min)', 'Mobility / stretch (5 min)', 'Fatty fish meal'],
  fri: ['Bone broth / collagen', 'Stress break (5 min)', 'Strength workout - Day A'],
  sat: ['Mobility / stretch (5 min)'],
  sun: ['Waist measurement', 'Weekly grocery + meal prep', 'Bone broth / collagen', 'Weekly review'],
}

const ALL_DAY = ['16:8 fasting window', 'Daily steps', 'Water 3 litres', 'Protein target', 'No processed meat today']

describe('item library', () => {
  it('has 30 items with unique codes and full detail', () => {
    expect(ITEMS).toHaveLength(30)
    expect(new Set(ITEMS.map(i => i.code)).size).toBe(30)
    for (const i of ITEMS) for (const v of Object.values(i.detail)) expect(v.length).toBeGreaterThan(5)
  })
  it('has a food card for every weekday', () => {
    for (const d of DOWS) expect(MEALS[d].meal1 && MEALS[d].meal2 && MEALS[d].prep).toBeTruthy()
  })
})

describe('day lists match spec §3', () => {
  for (const dow of DOWS) {
    it(dow, () => {
      const got = itemsFor(WEEK2[dow], { start: START }).map(i => i.title)
      expect(new Set(got)).toEqual(new Set([...ALL_DAY, ...DAILY, ...SPECIAL[dow]]))
    })
  }
  it('lists are sorted by time', () => {
    const times = itemsFor(WEEK2.mon, { start: START }).map(i => i.sortTime)
    expect(times).toEqual([...times].sort())
  })
})

describe('repeating items', () => {
  const photo = ITEMS.find(i => i.code === 'PHOTO')!
  const blood = ITEMS.find(i => i.code === 'BLOOD')!
  it('progress photo is due every 4th Sunday', () => {
    const due = [0, 1, 2, 3, 4, 5, 8].map(w => isDue(photo, addDays('2026-11-08', w * 7), { start: START }))
    expect(due).toEqual([true, false, false, false, true, false, true])
    expect(isDue(photo, '2026-11-07', { start: START })).toBe(false) // Saturday
  })
  it('blood test is due every 90 days from start', () => {
    expect(isDue(blood, START, { start: START })).toBe(true)
    expect(isDue(blood, addDays(START, 89), { start: START })).toBe(false)
    expect(isDue(blood, addDays(START, 90), { start: START })).toBe(true)
    expect(isDue(blood, addDays(START, -90), { start: START })).toBe(false)
  })
  it('respects unlock week and disabled items', () => {
    const lockedLift = { ...ITEMS.find(i => i.code === 'LIFT-A')!, unlockWeek: 3 }
    expect(isDue(lockedLift, WEEK2.mon, { start: START })).toBe(false)
    expect(isDue(lockedLift, addDays(WEEK2.mon, 7), { start: START })).toBe(true)
    expect(itemsFor(WEEK2.mon, { start: START, disabled: ['LIFT-A'] }).some(i => i.code === 'LIFT-A')).toBe(false)
  })
})

describe('targets', () => {
  it('program week counts Monday-Sunday weeks', () => {
    expect(programWeek('2026-11-08', START)).toBe(1)
    expect(programWeek('2026-11-09', START)).toBe(2)
    expect(programWeek('2026-11-05', '2026-11-04')).toBe(1)
  })
  it('steps target grows by week', () => {
    expect([1, 2, 3, 4, 5, 9].map(stepsTarget)).toEqual([6000, 6000, 7000, 8000, 10000, 10000])
  })
})
