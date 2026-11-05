import { useCallback, useState } from 'react'
import { mondayOf, today } from './dates'

/** Typed localStorage wrapper. Shares the `h18_` prefix with the original burn planner. */
const PREFIX = 'h18_'

export function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(PREFIX + key)
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}

export function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* storage full or blocked: keep working in memory */
  }
}

export function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => load(key, fallback))
  const set = useCallback(
    (next: T | ((prev: T) => T)) =>
      setValue(prev => {
        const v = typeof next === 'function' ? (next as (p: T) => T)(prev) : next
        save(key, v)
        return v
      }),
    [key],
  )
  return [value, set] as const
}

export interface Settings {
  programStart: string
  wake: string
  sleep: string
  eatStart: string
  eatEnd: string
  weightKg: number
  disabled: string[]
}

/** Reuse the burn planner's current weight if it was saved. */
const legacyWeight = () => Number(load<{ w0?: string } | null>('cfg', null)?.w0) || 75

export const defaultSettings = (): Settings => ({
  programStart: mondayOf(today()),
  wake: '07:00',
  sleep: '22:30',
  eatStart: '12:00',
  eatEnd: '20:00',
  weightKg: legacyWeight(),
  disabled: [],
})

export const useSettings = () => useStored<Settings>('os_settings', defaultSettings())
