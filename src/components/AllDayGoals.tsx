import { useState } from 'react'
import type { Item } from '../data/types'
import { ALL_DAY_ITEMS, allDayProgress } from '../lib/log'
import { useLog } from '../lib/LogProvider'
import { CategoryDot } from './CategoryDot'
import { Button } from './ui/button'

const mins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }

/** Live 16:8 status from the eating window in Settings. */
export function fastStatus(now: string, eatStart: string, eatEnd: string): { pct: number; label: string } {
  const n = mins(now), s = mins(eatStart), e = mins(eatEnd)
  const fastLen = (s - e + 1440) % 1440
  if (n >= s && n < e) return { pct: 1, label: `Eating window until ${eatEnd}` }
  const fasted = (n - e + 1440) % 1440
  const h = Math.floor(fasted / 60), m = fasted % 60
  return { pct: fasted / fastLen, label: `Fasting ${h}h ${String(m).padStart(2, '0')}m of ${Math.round(fastLen / 60)}h` }
}

function Bar({ pct }: { pct: number }) {
  const p = Math.max(0, Math.min(1, pct))
  return (
    <div className="h-3 border-2 border-ink bg-soft" role="progressbar" aria-valuenow={Math.round(p * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full ${p >= 1 ? 'bg-green' : 'bg-yellow'}`} style={{ width: `${p * 100}%` }} />
    </div>
  )
}

/** The input for one all-day goal. Used in the goals box and in the detail sheet. */
export function AllDayControl({ item, date }: { item: Item; date: string }) {
  const { metrics, setMetric, ctx, now, settings } = useLog()
  const m = metrics[date] ?? {}
  const prog = allDayProgress(item, date, m, ctx)
  const [protein, setProtein] = useState('')

  const numInput = (value: number | undefined, onChange: (v: number) => void, label: string, step = 1) => (
    <input
      type="number" inputMode="numeric" min={0} step={step} aria-label={label}
      value={value ?? ''} placeholder="0"
      onChange={e => onChange(Math.max(0, Number(e.target.value) || 0))}
      className="w-24 border-2 border-ink bg-card px-2 py-1 font-mono text-ink"
    />
  )

  switch (item.code) {
    case 'FAST': {
      const live = date === now.date ? fastStatus(now.time, settings.eatStart, settings.eatEnd) : null
      return (
        <div className="flex flex-col gap-1.5">
          {live && <><Bar pct={live.pct} /><span className="cap text-muted">{live.label}</span></>}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4 accent-black" checked={!!m.fastKept} onChange={e => setMetric(date, 'fastKept', e.target.checked)} />
            Kept the fast ({settings.eatEnd} - {settings.eatStart})
          </label>
        </div>
      )
    }
    case 'WATER':
      return (
        <div className="flex flex-col gap-1.5">
          <Bar pct={prog.pct} />
          <div className="flex items-center gap-2">
            <Button variant="yellow" onClick={() => setMetric(date, 'waterMl', (m.waterMl ?? 0) + 250)}>+250 ml</Button>
            <Button onClick={() => setMetric(date, 'waterMl', Math.max(0, (m.waterMl ?? 0) - 250))} disabled={!m.waterMl}>−250</Button>
            <span className="cap ml-auto">{prog.label}</span>
          </div>
        </div>
      )
    case 'STEPS':
      return (
        <div className="flex flex-col gap-1.5">
          <Bar pct={prog.pct} />
          <div className="flex items-center gap-2">
            {numInput(m.steps, v => setMetric(date, 'steps', v), 'Steps today', 100)}
            <span className="cap ml-auto">{prog.label}</span>
          </div>
        </div>
      )
    case 'PROTEIN': {
      const add = (g: number) => setMetric(date, 'proteinG', Math.max(0, (m.proteinG ?? 0) + g))
      return (
        <div className="flex flex-col gap-1.5">
          <Bar pct={prog.pct} />
          <div className="flex flex-wrap items-center gap-1.5">
            <Button onClick={() => add(25)} title="100 g chicken">+25 chicken</Button>
            <Button onClick={() => add(6)} title="1 egg">+6 egg</Button>
            <Button onClick={() => add(18)} title="100 g paneer">+18 paneer</Button>
            <form className="flex gap-1" onSubmit={e => { e.preventDefault(); add(Number(protein) || 0); setProtein('') }}>
              <input type="number" inputMode="numeric" placeholder="g" aria-label="Add protein grams" value={protein}
                onChange={e => setProtein(e.target.value)} className="w-16 border-2 border-ink bg-card px-2 py-1 font-mono text-ink" />
              <Button type="submit" disabled={!protein}>Add</Button>
            </form>
            <span className="cap ml-auto">{prog.label}</span>
          </div>
          {!!m.proteinG && <button type="button" className="cap self-start cursor-pointer text-muted underline" onClick={() => setMetric(date, 'proteinG', 0)}>Reset</button>}
        </div>
      )
    }
    case 'NO-PROC':
      return (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="size-4 accent-black" checked={!!m.noProcessed} onChange={e => setMetric(date, 'noProcessed', e.target.checked)} />
          Yes, no processed meat today
        </label>
      )
    default:
      return null
  }
}

export function AllDayGoals({ date, onOpen }: { date: string; onOpen: (item: Item) => void }) {
  const { ctx } = useLog()
  const items = ALL_DAY_ITEMS.filter(i => !ctx.disabled?.includes(i.code))
  return (
    <section className="box">
      <h2 className="cap m-0 border-b-[3px] border-ink bg-soft px-3 py-2">All-day goals</h2>
      {items.map(i => (
        <div key={i.code} className="flex flex-col gap-1.5 border-b border-soft px-3 py-2.5 last:border-b-0">
          <button type="button" onClick={() => onOpen(i)} className="flex cursor-pointer items-center justify-between gap-2 border-0 bg-transparent p-0 text-left text-ink">
            <span className="flex items-center gap-1.5 font-bold"><CategoryDot category={i.category} label={false} />{i.title}</span>
            <span className="cap border-2 border-ink px-1.5" aria-label={`About ${i.title}`}>i</span>
          </button>
          <AllDayControl item={i} date={date} />
        </div>
      ))}
    </section>
  )
}
