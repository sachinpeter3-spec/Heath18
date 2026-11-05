import { useCallback, useRef, useSyncExternalStore } from 'react'
import { mondayOf, today } from './dates'

/** Typed localStorage wrapper. Shares the `h18_` prefix with the original burn planner. */
const PREFIX = 'h18_'

/** In-memory copy so every hook using the same key shares one value (and works when storage is blocked). */
const cache = new Map<string, unknown>()
const listeners = new Map<string, Set<() => void>>()

export function load<T>(key: string, fallback: T): T {
  if (cache.has(key)) return cache.get(key) as T
  let v = fallback
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw) v = JSON.parse(raw) as T
  } catch { /* blocked or corrupt: use fallback */ }
  cache.set(key, v)
  return v
}

export function save<T>(key: string, value: T) {
  cache.set(key, value)
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* storage full or blocked: keep working in memory */
  }
  listeners.get(key)?.forEach(l => l())
}

/** Drop the in-memory copy (after an import) and notify every hook. */
export function reloadAll() {
  cache.clear()
  listeners.forEach(set => set.forEach(l => l()))
}

/** Every key this app saves, for backup/export. */
export function allKeys(): string[] {
  const out: string[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith(PREFIX)) out.push(k)
    }
  } catch { /* blocked */ }
  return out
}

export function useStored<T>(key: string, fallback: T) {
  const fb = useRef(fallback)
  const subscribe = useCallback((l: () => void) => {
    let set = listeners.get(key)
    if (!set) listeners.set(key, (set = new Set()))
    set.add(l)
    return () => { set!.delete(l) }
  }, [key])
  const value = useSyncExternalStore(subscribe, () => load(key, fb.current))
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = load(key, fb.current)
      save(key, typeof next === 'function' ? (next as (p: T) => T)(prev) : next)
    },
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
  /** Water nudges at 11:00 / 15:00 / 18:00 if behind. */
  reminders?: boolean
  /** A nudge when each timed item comes due. */
  itemReminders?: boolean
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

