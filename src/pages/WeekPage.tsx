import { Link } from 'react-router-dom'
import { CategoryDot } from '../components/CategoryDot'
import { ITEMS } from '../data/items'
import { DOWS } from '../data/types'
import { addDays, mondayOf, programWeek } from '../lib/dates'
import { dayScore, itemStatus, type Status } from '../lib/log'
import { useLog } from '../lib/LogProvider'
import { isDue, itemsFor } from '../lib/schedule'

const LABEL = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' }

const CELL: Record<Status, { cls: string; mark: string }> = {
  done: { cls: 'bg-green text-black', mark: '✓' },
  missed: { cls: 'bg-red text-black', mark: '✕' },
  late: { cls: 'bg-amber text-black', mark: '!' },
  skipped: { cls: 'bg-soft text-muted', mark: '–' },
  pending: { cls: 'bg-card', mark: '' },
}

/** Spec §2 overview grid with done/missed colours. */
export default function WeekPage() {
  const log = useLog()
  const t = log.now.date
  const dates = DOWS.map((_, i) => addDays(mondayOf(t), i))
  const rows = [...ITEMS]
    .sort((a, b) => (a.section === 'allday' ? 0 : 1) - (b.section === 'allday' ? 0 : 1) || a.sortTime.localeCompare(b.sortTime))
    .filter(i => dates.some(d => isDue(i, d, log.ctx)))
  return (
    <>
      <h2 className="m-0 font-display text-2xl uppercase">Week {Math.max(1, programWeek(t, log.ctx.start))}</h2>
      <div className="flex flex-wrap gap-3">
        {(['done', 'late', 'missed', 'skipped'] as Status[]).map(s => (
          <span key={s} className="cap inline-flex items-center gap-1">
            <span className={`grid size-4 place-items-center border-2 border-ink text-[10px] ${CELL[s].cls}`}>{CELL[s].mark}</span>{s}
          </span>
        ))}
      </div>
      <div className="box overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-soft">
              <th className="cap border-b-[3px] border-ink p-2 text-left">Item</th>
              {DOWS.map((d, i) => (
                <th key={d} className={`cap border-b-[3px] border-ink p-1 ${dates[i] === t ? 'bg-yellow text-black' : ''}`}>
                  <Link to={`/day/${d}`} className="text-inherit">{LABEL[d]}</Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(i => (
              <tr key={i.code} className="border-b border-soft">
                <td className="p-2">
                  <div className="flex items-center gap-1.5"><CategoryDot category={i.category} label={false} />{i.title}</div>
                  <div className="cap text-muted">{i.time}</div>
                </td>
                {dates.map(d => {
                  if (!isDue(i, d, log.ctx)) return <td key={d} />
                  const c = CELL[itemStatus(i, d, log.now, log, log.ctx)]
                  return (
                    <td key={d} className="p-1 text-center">
                      <span className={`inline-grid size-5 place-items-center border-2 border-ink text-[11px] font-bold ${c.cls}`}>{c.mark}</span>
                    </td>
                  )
                })}
              </tr>
            ))}
            <tr className="bg-soft">
              <td className="cap p-2">Score</td>
              {dates.map(d => (
                <td key={d} className="cap p-1 text-center">{d <= t ? `${dayScore(itemsFor(d, log.ctx), d, log, log.ctx)}%` : ''}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}
