import { useState } from 'react'
import { DayList } from '../components/DayList'
import { FocusButton } from '../components/FocusTimer'
import { FoodCard } from '../components/FoodCard'
import { ITEM_BY_CODE } from '../data/items'
import type { Item } from '../data/types'
import { dowOf, parse, programWeek } from '../lib/dates'
import { useMustDos } from '../lib/focus'
import { dayScore, isDone } from '../lib/log'
import { useLog } from '../lib/LogProvider'
import { itemsFor } from '../lib/schedule'

export default function TodayPage() {
  const log = useLog()
  const date = log.now.date
  const [open, setOpen] = useState<Item | null>(null)
  const [must] = useMustDos(date)
  const items = itemsFor(date, log.ctx)
  const score = dayScore(items, date, log, log.ctx)
  const dayName = parse(date).toLocaleDateString(undefined, { weekday: 'long' })
  const mustItems = must.map(c => ITEM_BY_CODE[c]).filter(i => i && items.includes(i))
  return (
    <>
      <div className="flex items-end justify-between gap-3">
        <h2 className="m-0 font-display text-2xl uppercase leading-tight">
          Today · {dayName}<br />Week {Math.max(1, programWeek(date, log.ctx.start))}
        </h2>
        <div className="flex shrink-0 items-stretch gap-2">
          {!log.ctx.disabled?.includes('FOCUS') && <FocusButton onOpen={() => setOpen(ITEM_BY_CODE['FOCUS'])} />}
          <div className="box px-3 py-1.5 text-center">
            <div className="cap text-muted">Score</div>
            <div className="font-display text-2xl leading-none">{score}%</div>
          </div>
        </div>
      </div>
      {mustItems.length > 0 && (
        <section className="border-[3px] border-ink bg-yellow p-3 text-black">
          <div className="cap mb-1">Today's must-dos</div>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {mustItems.map(i => (
              <li key={i.code}>
                <button type="button" onClick={() => setOpen(i)} className={`cursor-pointer border-0 bg-transparent p-0 text-left font-bold text-black ${isDone(i, date, log, log.ctx) ? 'line-through' : ''}`}>
                  ★ {i.title} <span className="cap">{i.time}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      <DayList items={items} date={date} open={open} setOpen={setOpen} />
      <FoodCard dow={dowOf(date)} date={date} />
    </>
  )
}
