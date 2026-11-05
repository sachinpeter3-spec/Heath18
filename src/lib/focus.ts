import { useEffect, useState } from 'react'
import { useLog } from './LogProvider'
import { useStored } from './store'

export const FOCUS_SECONDS = 300

interface FocusState { endAt: number | null; left: number }

/** 5-minute focus countdown shared by the header button and the focus panel. Finishing marks the Focus item done. */
export function useFocusTimer() {
  const { now, setCheck, checks } = useLog()
  const [s, set] = useStored<FocusState>('os_focus', { endAt: null, left: FOCUS_SECONDS })
  const [tick, setTick] = useState(Date.now())
  useEffect(() => {
    if (!s.endAt) return
    const t = setInterval(() => setTick(Date.now()), 250)
    return () => clearInterval(t)
  }, [s.endAt])

  const remaining = s.endAt ? Math.max(0, Math.ceil((s.endAt - tick) / 1000)) : s.left
  const finished = !!s.endAt && remaining === 0
  useEffect(() => {
    if (!finished) return
    set({ endAt: null, left: FOCUS_SECONDS })
    if (checks[now.date]?.FOCUS?.status !== 'done') setCheck(now.date, 'FOCUS', { status: 'done' })
  }, [finished]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    running: !!s.endAt,
    remaining,
    label: `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`,
    start: () => set({ endAt: Date.now() + remaining * 1000, left: remaining }),
    pause: () => set({ endAt: null, left: remaining }),
    reset: () => set({ endAt: null, left: FOCUS_SECONDS }),
  }
}

/** Today's 1-2 must-dos, picked during the focus check-in. */
export function useMustDos(date: string) {
  const [all, set] = useStored<Record<string, string[]>>('os_mustdo', {})
  const list = all[date] ?? []
  const toggle = (code: string) => set(p => {
    const cur = p[date] ?? []
    const next = cur.includes(code) ? cur.filter(c => c !== code) : [...cur, code].slice(-2)
    return { ...p, [date]: next }
  })
  return [list, toggle] as const
}

/** Weekly review sentences, keyed by the Monday of the week they are for. */
export const useReviews = () => useStored<Record<string, string>>('os_reviews', {})
