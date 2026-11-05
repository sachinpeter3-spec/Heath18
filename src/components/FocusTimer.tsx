import { addDays, mondayOf } from '../lib/dates'
import { FOCUS_SECONDS, useFocusTimer, useMustDos, useReviews } from '../lib/focus'
import { itemStatus } from '../lib/log'
import { useLog } from '../lib/LogProvider'
import { itemsFor } from '../lib/schedule'
import { WEEKLY_BARS, weeklyBar } from '../lib/stats'
import { Button } from './ui/button'

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="border-b-2 border-soft py-3 first:pt-0 last:border-b-0">
      <h3 className="cap m-0 mb-2 text-muted">{label}</h3>
      {children}
    </section>
  )
}

/** Spec FocusTimer: 5-min countdown, yesterday's missed items, weekly progress, pick 1-2 must-dos. */
export function FocusTimer({ date }: { date: string }) {
  const log = useLog()
  const t = useFocusTimer()
  const [must, toggleMust] = useMustDos(date)
  const [reviews] = useReviews()
  const plan = reviews[mondayOf(date)]
  const y = addDays(date, -1)
  const missed = y >= log.ctx.start
    ? itemsFor(y, log.ctx).filter(i => i.section !== 'allday' && itemStatus(i, y, log.now, log, log.ctx) === 'missed')
    : []
  const today = itemsFor(date, log.ctx).filter(i => i.section !== 'allday' && i.code !== 'FOCUS')

  return (
    <div>
      <Section label="Timer">
        <div className="flex items-center gap-3">
          <div className="font-display text-5xl tabular-nums leading-none" aria-live="polite">{t.label}</div>
          <div className="flex flex-wrap gap-1.5">
            {t.running ? <Button onClick={t.pause}>Pause</Button> : <Button variant="solid" onClick={t.start}>{t.remaining < FOCUS_SECONDS ? 'Resume' : 'Start'}</Button>}
            {t.remaining < FOCUS_SECONDS && <Button onClick={t.reset}>Reset</Button>}
          </div>
        </div>
        <div className="mt-2 h-2 border-2 border-ink bg-soft"><div className="h-full bg-yellow" style={{ width: `${(1 - t.remaining / FOCUS_SECONDS) * 100}%` }} /></div>
        {plan && <p className="m-0 mt-3 border-l-4 border-yellow pl-2 text-sm">This week you said: <b>{plan}</b></p>}
      </Section>

      <Section label={`1 · Yesterday's missed (${missed.length})`}>
        {missed.length === 0 ? <p className="m-0 text-sm text-muted">Nothing missed. 👊</p> : (
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
            {missed.map(i => (
              <li key={i.code} className="flex items-center justify-between gap-2 text-sm">
                <span>{i.title}</span>
                <Button onClick={() => log.setCheck(y, i.code, { status: 'done' })}>Did it</Button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section label="2 · This week">
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {WEEKLY_BARS.map(b => {
            const { done, due } = weeklyBar(b.codes, date, log, log.ctx)
            if (!due) return null
            return (
              <li key={b.label} className="grid grid-cols-[6.5rem_1fr_3rem] items-center gap-2 text-sm">
                <span>{b.label}</span>
                <span className="h-3 border-2 border-ink bg-soft"><span className={`block h-full ${done >= due ? 'bg-green' : 'bg-yellow'}`} style={{ width: `${(done / due) * 100}%` }} /></span>
                <span className="cap text-right">{done}/{due}</span>
              </li>
            )
          })}
        </ul>
      </Section>

      <Section label={`3 · Pick 1-2 must-dos (${must.length}/2)`}>
        <div className="flex flex-wrap gap-1.5">
          {today.map(i => {
            const on = must.includes(i.code)
            return (
              <button key={i.code} type="button" aria-pressed={on} onClick={() => toggleMust(i.code)}
                className={`cursor-pointer border-2 border-ink px-2 py-1 text-sm ${on ? 'bg-yellow text-black' : 'bg-card text-ink'}`}>
                {on ? '★ ' : ''}{i.title}
              </button>
            )
          })}
        </div>
      </Section>
    </div>
  )
}

/** The "[ Focus 5:00 > ]" button in the Today header. */
export function FocusButton({ onOpen }: { onOpen: () => void }) {
  const t = useFocusTimer()
  return (
    <button type="button" onClick={onOpen} className={`cap cursor-pointer border-[3px] border-ink px-2.5 py-2 ${t.running ? 'bg-yellow text-black' : 'bg-card text-ink'}`}>
      Focus <span className="font-mono tabular-nums">{t.label}</span> ›
    </button>
  )
}
