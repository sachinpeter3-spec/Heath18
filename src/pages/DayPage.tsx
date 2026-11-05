import { Link, useParams } from 'react-router-dom'
import { DayList } from '../components/DayList'
import { FoodCard } from '../components/FoodCard'
import { MEALS } from '../data/meals'
import { DOWS, type Dow } from '../data/types'
import { addDays, mondayOf, today } from '../lib/dates'
import { itemsFor } from '../lib/schedule'
import { useSettings } from '../lib/store'

export default function DayPage() {
  const { dow } = useParams()
  const [s] = useSettings()
  if (!DOWS.includes(dow as Dow)) return <p>Unknown day. <Link to="/week">Back to week</Link></p>
  const d = dow as Dow
  const date = addDays(mondayOf(today()), DOWS.indexOf(d))
  const items = itemsFor(date, { start: s.programStart, disabled: s.disabled })
  const name = new Date(`${date}T12:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })
  return (
    <>
      <Link to="/week" className="cap text-ink">‹ Week</Link>
      <h2 className="m-0 font-display text-2xl uppercase">{name} · {MEALS[d].title}</h2>
      <FoodCard dow={d} />
      <DayList items={items} dow={d} />
    </>
  )
}
