import type { Dow, Item } from '../data/types'
import { groupBySection } from '../lib/schedule'
import { CategoryDot } from './CategoryDot'

/** Read-only list of a day's items. Phase 2 adds checkboxes, status and the detail sheet. */
export function DayList({ items, dow }: { items: Item[]; dow: Dow }) {
  const { allday, sections } = groupBySection(items)
  return (
    <>
      <section className="box p-3">
        <div className="cap mb-2">All-day goals</div>
        <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0">
          {allday.map(i => (
            <li key={i.code} className="inline-flex items-center gap-1.5">
              <CategoryDot category={i.category} label={false} />
              {i.title}
            </li>
          ))}
        </ul>
      </section>
      {sections.filter(s => s.items.length).map(s => (
        <section key={s.key} className="box">
          <h2 className="cap m-0 border-b-[3px] border-ink bg-soft px-3 py-2">{s.label}</h2>
          <ul className="m-0 list-none p-0">
            {s.items.map(i => (
              <li key={i.code} className="grid grid-cols-[4.5rem_1fr] gap-x-3 border-b border-soft px-3 py-2.5 last:border-b-0">
                <span className="cap pt-0.5">{i.time}</span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <b className="font-bold">{i.title}</b>
                    <CategoryDot category={i.category} />
                  </div>
                  <p className="m-0 mt-0.5 text-sm text-muted">{i.oneLine}</p>
                  {i.dayNotes?.[dow] && <p className="m-0 mt-1 text-sm font-bold">{i.dayNotes[dow]}</p>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  )
}
