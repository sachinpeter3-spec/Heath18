import { FoodCard } from '../components/FoodCard'
import { MEALS } from '../data/meals'
import { DOWS } from '../data/types'
import { dowOf, today } from '../lib/dates'

/** Phase 5 adds the protein counter and the Sunday grocery list. */
export default function FoodPage() {
  const dow = dowOf(today())
  return (
    <>
      <h2 className="m-0 font-display text-2xl uppercase">Food today</h2>
      <FoodCard dow={dow} />
      <h2 className="m-0 font-display text-xl uppercase">This week</h2>
      <div className="box">
        {DOWS.map(d => (
          <div key={d} className={`grid grid-cols-[3rem_1fr] gap-3 border-b border-soft p-3 last:border-b-0 ${d === dow ? 'bg-soft' : ''}`}>
            <span className="cap pt-0.5">{d}</span>
            <div className="text-sm">
              <div><b>M1</b> {MEALS[d].meal1}</div>
              <div><b>M2</b> {MEALS[d].meal2}</div>
              <div className="text-muted">Prep: {MEALS[d].prep}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
