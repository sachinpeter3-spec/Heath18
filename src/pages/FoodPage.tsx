import { AllDayControl } from '../components/AllDayGoals'
import { FoodCard } from '../components/FoodCard'
import { GroceryList } from '../components/GroceryList'
import { ITEM_BY_CODE } from '../data/items'
import { MEALS, proteinOf } from '../data/meals'
import { DOWS } from '../data/types'
import { addDays, dowOf } from '../lib/dates'
import { useLog } from '../lib/LogProvider'

export default function FoodPage() {
  const { now } = useLog()
  const date = now.date
  const dow = dowOf(date)
  const tomorrow = MEALS[dowOf(addDays(date, 1))]
  return (
    <>
      <h2 className="m-0 font-display text-2xl uppercase">Food today</h2>
      <FoodCard dow={dow} date={date} />
      <section className="box p-3">
        <h3 className="cap m-0 mb-2">Protein counter</h3>
        <AllDayControl item={ITEM_BY_CODE['PROTEIN']} date={date} />
        <p className="m-0 mt-2 text-xs text-muted">"Ate it" adds the meal's estimate. Use the buttons for anything extra.</p>
      </section>
      <section className="box p-3">
        <h3 className="cap m-0 mb-1">Tomorrow</h3>
        <div className="text-sm"><b>M1</b> {tomorrow.meal1} · <b>M2</b> {tomorrow.meal2}</div>
        <div className="mt-1 text-sm font-bold">Tonight: {MEALS[dow].prep}</div>
      </section>
      <GroceryList date={date} />
      <h2 className="m-0 font-display text-xl uppercase">This week</h2>
      <div className="box">
        {DOWS.map(d => (
          <div key={d} className={`grid grid-cols-[3rem_1fr] gap-3 border-b border-soft p-3 last:border-b-0 ${d === dow ? 'bg-soft' : ''}`}>
            <span className="cap pt-0.5">{d}</span>
            <div className="text-sm">
              <div><b>M1</b> {MEALS[d].meal1} <span className="cap text-muted">~{proteinOf(MEALS[d].m1)} g</span></div>
              <div><b>M2</b> {MEALS[d].meal2} <span className="cap text-muted">~{proteinOf(MEALS[d].m2)} g</span></div>
              <div className="text-muted">Prep: {MEALS[d].prep}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
