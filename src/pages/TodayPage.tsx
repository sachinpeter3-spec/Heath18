import { DayList } from '../components/DayList'
import { FoodCard } from '../components/FoodCard'
import { dowOf, parse, programWeek } from '../lib/dates'
import { dayScore } from '../lib/log'
import { useLog } from '../lib/LogProvider'
import { itemsFor } from '../lib/schedule'

export default function TodayPage() {
  const log = useLog()
  const date = log.now.date
  const items = itemsFor(date, log.ctx)
  const score = dayScore(items, date, log, log.ctx)
  const dayName = parse(date).toLocaleDateString(undefined, { weekday: 'long' })
  return (
    <>
      <div className="flex items-end justify-between gap-3">
        <h2 className="m-0 font-display text-2xl uppercase leading-tight">
          Today · {dayName}<br />Week {Math.max(1, programWeek(date, log.ctx.start))}
        </h2>
        <div className="box shrink-0 px-3 py-1.5 text-center">
          <div className="cap text-muted">Score</div>
          <div className="font-display text-2xl leading-none">{score}%</div>
        </div>
      </div>
      <DayList items={items} date={date} />
      <FoodCard dow={dowOf(date)} />
    </>
  )
}
