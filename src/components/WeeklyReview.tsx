import { useEffect, useState } from 'react'
import { addDays, mondayOf } from '../lib/dates'
import { useReviews } from '../lib/focus'
import { useLog } from '../lib/LogProvider'
import { avgOver, lastMetric, topStreaks, weekScore } from '../lib/stats'
import { Button } from './ui/button'

const f1 = (n: number | null) => (n == null ? '–' : n.toFixed(1))
const signed = (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(1)}`

/** Sunday weekly review: score, streaks, weight average, waist change, "Next week I will…". */
export function WeeklyReview({ date }: { date: string }) {
  const log = useLog()
  const [reviews, setReviews] = useReviews()
  const nextWeek = addDays(mondayOf(date), 7)
  const [text, setText] = useState(reviews[nextWeek] ?? '')
  useEffect(() => setText(reviews[nextWeek] ?? ''), [nextWeek]) // eslint-disable-line react-hooks/exhaustive-deps

  const score = weekScore(date, date, log, log.ctx)
  const lastScore = weekScore(addDays(date, -7), addDays(date, -7), log, log.ctx)
  const wNow = avgOver(log.metrics, 'weightKg', date)
  const wPrev = avgOver(log.metrics, 'weightKg', addDays(date, -7))
  const waist = lastMetric(log.metrics, 'waistCm', date)
  const waistPrev = waist ? lastMetric(log.metrics, 'waistCm', addDays(waist[0], -1)) : null
  const streaks = topStreaks(date, log, log.ctx)

  const save = () => {
    setReviews(p => ({ ...p, [nextWeek]: text.trim() }))
    log.setCheck(date, 'REVIEW', { status: 'done', value: text.trim() })
  }

  const Stat = ({ k, v, sub }: { k: string; v: string; sub?: string }) => (
    <div className="border-2 border-ink bg-card p-2">
      <div className="cap text-muted">{k}</div>
      <div className="font-display text-xl leading-tight">{v}</div>
      {sub && <div className="cap text-muted">{sub}</div>}
    </div>
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        <Stat k="Week score" v={score == null ? '–' : `${score}%`} sub={lastScore == null ? undefined : `last week ${lastScore}%`} />
        <Stat k="Weight avg" v={`${f1(wNow)}`} sub={wNow != null && wPrev != null ? `${signed(wNow - wPrev)} kg` : 'kg'} />
        <Stat k="Waist" v={waist ? `${waist[1]}` : '–'} sub={waist && waistPrev ? `${signed(waist[1] - waistPrev[1])} cm` : 'cm'} />
      </div>
      <div>
        <div className="cap mb-1 text-muted">Streaks to celebrate</div>
        {streaks.length ? (
          <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
            {streaks.map(s => <li key={s.item.code} className="border-2 border-ink bg-yellow px-2 py-0.5 text-sm text-black">🔥 {s.streak} · {s.item.title}</li>)}
          </ul>
        ) : <p className="m-0 text-sm text-muted">No streaks yet. Start one tomorrow.</p>}
      </div>
      <form className="flex flex-col gap-2" onSubmit={e => { e.preventDefault(); if (text.trim()) save() }}>
        <label className="cap text-muted" htmlFor="review-text">Next week I will…</label>
        <textarea id="review-text" rows={2} value={text} onChange={e => setText(e.target.value)}
          placeholder="…walk after every meal and hit 3 workouts."
          className="border-2 border-ink bg-card p-2 font-body text-ink" />
        <Button type="submit" variant="solid" disabled={!text.trim()} className="self-start">Save review</Button>
      </form>
    </div>
  )
}
