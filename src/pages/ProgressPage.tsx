import { useState } from 'react'
import { ChartCard, Columns, Legend, TimeChart, type Series } from '../components/charts'
import { PhotoCompare } from '../components/Photos'
import { ITEM_BY_CODE } from '../data/items'
import { addDays, daysBetween, mondayOf, parse } from '../lib/dates'
import { useLog } from '../lib/LogProvider'
import { avgOver, rolling, series, topStreaks, weekScore, weeklyBar } from '../lib/stats'

const RANGES = [
  { key: 30, label: '30 days' },
  { key: 90, label: '90 days' },
  { key: 0, label: 'All' },
] as const

const fmtD = (d: string) => parse(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
const signed = (n: number, unit: string) => `${n > 0 ? '+' : ''}${n.toFixed(1)} ${unit}`

export default function ProgressPage() {
  const log = useLog()
  const { metrics, ctx, now, checks } = log
  const today = now.date
  const [range, setRange] = useState<number>(30)
  const firstData = Object.keys(metrics).sort()[0] ?? ctx.start
  const from = range ? addDays(today, -range + 1) : [firstData, ctx.start].sort()[0]

  // Weight: daily dots + 7-day average line
  const wDaily = series(metrics, 'weightKg', from, today)
  const wAvg = rolling(metrics, 'weightKg', from, today)
  const avgNow = avgOver(metrics, 'weightKg', today)
  const avgPrev = avgOver(metrics, 'weightKg', addDays(today, -7))
  const weightSeries: Series[] = [
    { name: 'Daily', color: 'var(--muted)', points: wDaily, kind: 'dots', unit: 'kg' },
    { name: '7-day avg', color: 'var(--ink)', points: wAvg, kind: 'line', unit: 'kg' },
  ]

  const waist = series(metrics, 'waistCm', from, today)
  const waistAll = series(metrics, 'waistCm')

  // Bristol: one dot per day, grouped hard / ideal / loose
  const bristol = series(metrics, 'bristol', from, today)
  const bristolSeries: Series[] = [
    { name: 'Hard (1-2)', color: '#c2410c', points: bristol.filter(p => p[1] <= 2), kind: 'dots' },
    { name: 'Ideal (3-4)', color: '#0d9488', points: bristol.filter(p => p[1] >= 3 && p[1] <= 4), kind: 'dots' },
    { name: 'Loose (5-7)', color: '#6d28d9', points: bristol.filter(p => p[1] >= 5), kind: 'dots' },
  ]
  const ideal = bristol.length ? Math.round((bristol.filter(p => p[1] >= 3 && p[1] <= 4).length / bristol.length) * 100) : null

  // Last 8 weeks (not before program start)
  const weeks: string[] = []
  for (let k = 7; k >= 0; k--) {
    const mon = addDays(mondayOf(today), -7 * k)
    if (addDays(mon, 6) >= ctx.start) weeks.push(mon)
  }
  const workoutCols = weeks.map(mon => {
    const end = mon === mondayOf(today) ? today : addDays(mon, 6)
    const b = weeklyBar(['LIFT-A', 'LIFT-B'], end, log, ctx)
    return { key: mon, label: fmtD(mon), value: b.done, max: b.due }
  })
  const scoreCols = weeks.map(mon => ({
    key: mon, label: fmtD(mon),
    value: weekScore(mon, mon === mondayOf(today) ? today : addDays(mon, 6), log, ctx) ?? 0,
  }))
  const streaks = topStreaks(today, log, ctx, 10)

  // Blood tests: logged results + next due date (every 90 days from program start)
  const blood = Object.keys(checks).filter(d => checks[d].BLOOD?.status === 'done').sort().reverse()
  const sinceStart = Math.max(0, daysBetween(ctx.start, today))
  const nextBlood = addDays(ctx.start, Math.ceil(sinceStart / 90) * 90 + (sinceStart % 90 === 0 && checks[today]?.BLOOD ? 90 : 0))

  const empty = (what: string) => <p className="m-0 text-sm text-muted">No {what} logged in this range yet.</p>

  return (
    <>
      <h2 className="m-0 font-display text-2xl uppercase">Progress</h2>
      <div className="flex gap-1.5" role="group" aria-label="Date range">
        {RANGES.map(r => (
          <button key={r.key} type="button" aria-pressed={range === r.key} onClick={() => setRange(r.key)}
            className={`cap cursor-pointer border-2 border-ink px-2.5 py-1.5 ${range === r.key ? 'bg-ink text-bg' : 'bg-card text-ink'}`}>
            {r.label}
          </button>
        ))}
      </div>

      <ChartCard
        title="Weight"
        value={avgNow != null ? <>{avgNow.toFixed(1)} <span className="cap">kg 7-day avg</span></> : '–'}
        sub={avgNow != null && avgPrev != null ? `${signed(avgNow - avgPrev, 'kg')} vs last week` : undefined}
        table={{ head: ['Date', 'Weight', '7-day avg'], rows: wDaily.map(([d, v], i) => [fmtD(d), v, wAvg[i][1].toFixed(1)]).reverse() }}
      >
        {wDaily.length ? <><Legend items={[{ name: 'Daily', color: 'var(--muted)', kind: 'dots' }, { name: '7-day average', color: 'var(--ink)', kind: 'line' }]} />
          <TimeChart series={weightSeries} from={from} to={today} label="Weight over time" /></> : empty('weigh-ins')}
        <p className="m-0 text-xs text-muted">{ITEM_BY_CODE['WEIGH'].detail.tip}</p>
      </ChartCard>

      <ChartCard
        title="Waist"
        value={waistAll.length ? <>{waistAll[waistAll.length - 1][1]} <span className="cap">cm</span></> : '–'}
        sub={waistAll.length > 1 ? `${signed(waistAll[waistAll.length - 1][1] - waistAll[0][1], 'cm')} since ${fmtD(waistAll[0][0])}` : undefined}
        table={{ head: ['Date', 'Waist (cm)'], rows: waist.map(([d, v]) => [fmtD(d), v]).reverse() }}
      >
        {waist.length ? <TimeChart series={[{ name: 'Waist', color: 'var(--ink)', points: waist, kind: 'line', unit: 'cm' }]} from={from} to={today} label="Waist over time" /> : empty('waist measurements')}
      </ChartCard>

      <ChartCard title="Strength workouts per week" sub="tick = planned" table={{ head: ['Week of', 'Done', 'Planned'], rows: workoutCols.map(c => [c.label, c.value, c.max]) }}>
        <Columns data={workoutCols} label="Workouts done per week" unit="workouts" />
      </ChartCard>

      <ChartCard title="Weekly score" table={{ head: ['Week of', 'Score %'], rows: scoreCols.map(c => [c.label, c.value]) }}>
        <Columns data={scoreCols} label="Average daily score per week" unit="%" />
      </ChartCard>

      <ChartCard
        title="Poop log (Bristol)"
        value={ideal != null ? <>{ideal}% <span className="cap">ideal days</span></> : '–'}
        table={{ head: ['Date', 'Type'], rows: bristol.map(([d, v]) => [fmtD(d), v]).reverse() }}
      >
        {bristol.length ? <><Legend items={bristolSeries.map(s => ({ name: s.name, color: s.color, kind: 'dots' as const }))} />
          <TimeChart series={bristolSeries} from={from} to={today} label="Bristol stool type per day" /></> : empty('poop logs')}
      </ChartCard>

      <ChartCard title="Streaks">
        {streaks.length ? (
          <ul className="m-0 flex list-none flex-col p-0">
            {streaks.map(s => (
              <li key={s.item.code} className="flex justify-between border-b border-soft py-1.5 text-sm last:border-b-0">
                <span>{s.item.title}</span><b className="font-mono">{s.streak} 🔥</b>
              </li>
            ))}
          </ul>
        ) : <p className="m-0 text-sm text-muted">Tick items to start streaks.</p>}
      </ChartCard>

      <ChartCard title="Progress photos" sub="every 4th Sunday">
        <PhotoCompare />
      </ChartCard>

      <ChartCard title="Blood tests" sub={`next due ${fmtD(nextBlood)}`}>
        {blood.length ? (
          <ul className="m-0 flex list-none flex-col p-0">
            {blood.map(d => <li key={d} className="border-b border-soft py-1.5 text-sm last:border-b-0"><b className="cap mr-2">{fmtD(d)}</b>{checks[d].BLOOD.value}</li>)}
          </ul>
        ) : <p className="m-0 text-sm text-muted">No results yet. Log the key numbers in the Blood test item when it's due.</p>}
      </ChartCard>

      <details className="box p-3">
        <summary className="cap cursor-pointer">Burn planner (calorie goal &amp; fast days)</summary>
        <p className="m-0 my-2 text-sm text-muted">Your original planner, same saved data. <a href="/burn/" className="text-ink">Open full screen</a></p>
        <iframe src="/burn/" title="Burn planner" className="h-[1400px] w-full border-0" />
      </details>
    </>
  )
}
