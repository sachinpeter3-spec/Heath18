import { useState } from 'react'
import type { Item } from '../data/types'
import { dowOf } from '../lib/dates'
import { itemStatus } from '../lib/log'
import { useLog } from '../lib/LogProvider'
import { groupBySection } from '../lib/schedule'
import { AllDayGoals } from './AllDayGoals'
import { ItemDetailSheet } from './ItemDetailSheet'
import { TaskRow } from './TaskRow'

/** Items that need a value, so tapping the box opens the sheet instead of ticking. */
const NEEDS_SHEET = new Set(['POOP'])

export function DayList({ items, date }: { items: Item[]; date: string }) {
  const log = useLog()
  const [open, setOpen] = useState<Item | null>(null)
  const { sections } = groupBySection(items)
  const dow = dowOf(date)

  const toggle = (i: Item) => {
    if (NEEDS_SHEET.has(i.code) && log.checks[date]?.[i.code]?.status !== 'done') return setOpen(i)
    const cur = log.checks[date]?.[i.code]
    log.setCheck(date, i.code, cur?.status === 'done' ? null : { status: 'done', value: cur?.value })
  }

  return (
    <>
      <AllDayGoals date={date} onOpen={setOpen} />
      {sections.filter(s => s.items.length).map(s => (
        <section key={s.key} className="box">
          <h2 className="cap m-0 border-b-[3px] border-ink bg-soft px-3 py-2">{s.label}</h2>
          <ul className="m-0 list-none p-0">
            {s.items.map(i => (
              <TaskRow
                key={i.code}
                item={i}
                status={itemStatus(i, date, log.now, log, log.ctx)}
                note={i.dayNotes?.[dow]}
                onToggle={() => toggle(i)}
                onOpen={() => setOpen(i)}
              />
            ))}
          </ul>
        </section>
      ))}
      <ItemDetailSheet item={open} date={date} onClose={() => setOpen(null)} />
    </>
  )
}
