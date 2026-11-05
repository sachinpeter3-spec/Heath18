import { Link } from 'react-router-dom'
import { CategoryDot } from '../components/CategoryDot'
import { ITEMS } from '../data/items'
import { DOWS } from '../data/types'
import { addDays, mondayOf, programWeek, today } from '../lib/dates'
import { isDue } from '../lib/schedule'
import { useSettings } from '../lib/store'

const LABEL = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' }

/** Spec §2 overview grid. Phase 4 adds done/missed colours. */
export default function WeekPage() {
  const [s] = useSettings()
  const t = today()
  const dates = DOWS.map((_, i) => addDays(mondayOf(t), i))
  const opts = { start: s.programStart, disabled: s.disabled }
  const rows = [...ITEMS]
    .sort((a, b) => (a.section === 'allday' ? 0 : 1) - (b.section === 'allday' ? 0 : 1) || a.sortTime.localeCompare(b.sortTime))
    .filter(i => dates.some(d => isDue(i, d, opts)))
  return (
    <>
      <h2 className="m-0 font-display text-2xl uppercase">Week {Math.max(1, programWeek(t, s.programStart))}</h2>
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
                {dates.map(d => (
                  <td key={d} className="p-1 text-center">
                    {isDue(i, d, opts) && <span className="inline-block size-3.5 border-2 border-ink" aria-label="scheduled" />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
