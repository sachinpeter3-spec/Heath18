import { MEALS } from '../data/meals'
import type { Dow } from '../data/types'

export function FoodCard({ dow }: { dow: Dow }) {
  const m = MEALS[dow]
  const cells = [
    { k: 'Meal 1 · 12:00', v: m.meal1 },
    { k: 'Meal 2 · 19:30', v: m.meal2 },
    { k: "Tonight's prep", v: m.prep },
  ]
  return (
    <section className="box grid grid-cols-1 sm:grid-cols-3">
      {cells.map((c, i) => (
        <div key={c.k} className={`p-3 ${i ? 'border-t-[3px] border-ink sm:border-t-0 sm:border-l-[3px]' : ''}`}>
          <div className="cap text-muted">{c.k}</div>
          <div className="mt-1 font-medium">{c.v}</div>
        </div>
      ))}
    </section>
  )
}
