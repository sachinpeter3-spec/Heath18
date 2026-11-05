import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { iso } from './dates'
import type { Check, Checks, Ctx, DayMetrics, LogState, Metrics } from './log'
import { defaultSettings, useStored, type Settings } from './store'

interface LogApi extends LogState {
  settings: Settings
  setSettings: (next: Settings | ((prev: Settings) => Settings)) => void
  ctx: Ctx
  now: { date: string; time: string }
  setCheck: (date: string, code: string, check: Omit<Check, 'at'> | null) => void
  setMetric: <K extends keyof DayMetrics>(date: string, key: K, value: DayMetrics[K]) => void
}

const LogContext = createContext<LogApi | null>(null)

const clock = () => {
  const d = new Date()
  return { date: iso(d), time: d.toTimeString().slice(0, 5) }
}

/** Shared log state (checks + metrics) so every page sees the same data; ticks every 30 s for late/missed. */
export function LogProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useStored<Settings>('os_settings', defaultSettings())
  const [checks, setChecks] = useStored<Checks>('os_checks', {})
  const [metrics, setMetrics] = useStored<Metrics>('os_metrics', {})
  const [now, setNow] = useState(clock)

  useEffect(() => {
    const t = setInterval(() => setNow(prev => {
      const n = clock()
      return n.date === prev.date && n.time === prev.time ? prev : n
    }), 30_000)
    return () => clearInterval(t)
  }, [])

  const setCheck = useCallback<LogApi['setCheck']>((date, code, check) =>
    setChecks(prev => {
      const day = { ...(prev[date] ?? {}) }
      if (check) day[code] = { ...check, at: Date.now() }
      else delete day[code]
      return { ...prev, [date]: day }
    }), [setChecks])

  const setMetric = useCallback<LogApi['setMetric']>((date, key, value) =>
    setMetrics(prev => ({ ...prev, [date]: { ...(prev[date] ?? {}), [key]: value } })), [setMetrics])

  const ctx = useMemo<Ctx>(
    () => ({ start: settings.programStart, disabled: settings.disabled, weightKg: settings.weightKg }),
    [settings.programStart, settings.disabled, settings.weightKg],
  )

  return (
    <LogContext.Provider value={{ settings, setSettings, checks, metrics, ctx, now, setCheck, setMetric }}>
      {children}
    </LogContext.Provider>
  )
}

export function useLog() {
  const v = useContext(LogContext)
  if (!v) throw new Error('useLog must be used inside <LogProvider>')
  return v
}

/** Settings live in the provider so a change on the Settings page updates every page at once. */
export function useSettings() {
  const { settings, setSettings } = useLog()
  return [settings, setSettings] as const
}
