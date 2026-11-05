import { useEffect, useRef, useState } from 'react'
import { litres } from '../lib/log'
import { useLog } from '../lib/LogProvider'
import { itemsFor } from '../lib/schedule'

/** Spec: "Reminders at 11:00, 15:00 and 18:00 if behind" on water. */
export const WATER_CHECKS = [
  { time: '11:00', ml: 1000 },
  { time: '15:00', ml: 2000 },
  { time: '18:00', ml: 2500 },
]

async function systemNotify(title: string, body: string) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  try {
    const reg = await navigator.serviceWorker?.getRegistration()
    if (reg) await reg.showNotification(title, { body, icon: '/icon-192.png', tag: title })
    else new Notification(title, { body, icon: '/icon-192.png' })
  } catch { /* not supported */ }
}

/**
 * Nudges while the app is open (a website can't wake itself up when closed).
 * Shows an in-app toast and, if allowed, a system notification.
 */
export function Reminders() {
  const { settings, now, metrics, checks, ctx } = useLog()
  const fired = useRef(new Set<string>())
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null)

  useEffect(() => {
    const out: { key: string; title: string; body: string }[] = []
    if (settings.reminders) {
      const water = metrics[now.date]?.waterMl ?? 0
      // Only the latest passed check-point, within its hour, so opening the app late doesn't spam.
      const due = WATER_CHECKS.filter(c => now.time >= c.time && now.time < `${String(+c.time.slice(0, 2) + 1).padStart(2, '0')}:00`).pop()
      if (due && water < due.ml) out.push({ key: `water-${now.date}-${due.time}`, title: 'Water check 💧', body: `${litres(water)} L so far - aim for ${due.ml / 1000} L by ${due.time}.` })
    }
    if (settings.itemReminders) {
      for (const i of itemsFor(now.date, ctx)) {
        if (!/^\d\d:\d\d$/.test(i.time) || i.section === 'allday' || i.time !== now.time) continue
        if (checks[now.date]?.[i.code]) continue
        out.push({ key: `item-${now.date}-${i.code}`, title: `${i.time} · ${i.title}`, body: i.oneLine })
      }
    }
    for (const r of out) {
      if (fired.current.has(r.key)) continue
      fired.current.add(r.key)
      setToast(r)
      void systemNotify(r.title, r.body)
    }
  }, [now.date, now.time, settings.reminders, settings.itemReminders]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 12_000)
    return () => clearTimeout(t)
  }, [toast])

  if (!toast) return null
  return (
    <div role="status" className="fixed inset-x-4 bottom-4 z-30 mx-auto flex max-w-[560px] items-start gap-3 border-[3px] border-ink bg-yellow p-3 text-black shadow-[4px_4px_0_var(--ink)]">
      <div className="flex-1"><b>{toast.title}</b><div className="text-sm">{toast.body}</div></div>
      <button type="button" aria-label="Dismiss" onClick={() => setToast(null)} className="cap cursor-pointer border-2 border-black bg-transparent px-2 py-1 text-black">✕</button>
    </div>
  )
}
