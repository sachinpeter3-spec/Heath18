import { DayList } from '../components/DayList'
import { FoodCard } from '../components/FoodCard'
import { dowOf, parse, programWeek, today } from '../lib/dates'
import { itemsFor } from '../lib/schedule'
import { useSettings } from '../lib/store'

export default function TodayPage() {
  const [s] = useSettings()
  const date = today()
  const items = itemsFor(date, { start: s.programStart, disabled: s.disabled })
  const dayName = parse(date).toLocaleDateString(undefined, { weekday: 'long' })
  return (
    <>
      <h2 className="m-0 font-display text-2xl uppercase">
        Today · {dayName}, Week {Math.max(1, programWeek(date, s.programStart))}
      </h2>
      <DayList items={items} dow={dowOf(date)} />
      <FoodCard dow={dowOf(date)} />
    </>
  )
}
