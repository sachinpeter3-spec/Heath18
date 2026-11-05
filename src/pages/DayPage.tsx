import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DayList } from '../components/DayList'
import { FoodCard } from '../components/FoodCard'
import { MEALS } from '../data/meals'
import { DOWS, type Dow, type Item } from '../data/types'
import { addDays, mondayOf, parse } from '../lib/dates'
import { dayScore } from '../lib/log'
import { useLog } from '../lib/LogProvider'
import { itemsFor } from '../lib/schedule'

export default function DayPage() {
  const { dow } = useParams()
  const log = useLog()
  const [open, setOpen] = useState<Item | null>(null)
  if (!DOWS.includes(dow as Dow)) return <p>Unknown day. <Link to="/week">Back to week</Link></p>
  const d = dow as Dow
  const date = addDays(mondayOf(log.now.date), DOWS.indexOf(d))
  const items = itemsFor(date, log.ctx)
  const name = parse(date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })
  return (
    <>
      <Link to="/week" className="cap text-ink">‹ Week</Link>
      <div className="flex items-end justify-between gap-3">
        <h2 className="m-0 font-display text-2xl uppercase leading-tight">{name} · {MEALS[d].title}</h2>
        <span className="cap shrink-0">Score {dayScore(items, date, log, log.ctx)}%</span>
      </div>
      <FoodCard dow={d} date={date} />
      <DayList items={items} date={date} open={open} setOpen={setOpen} />
    </>
  )
}
