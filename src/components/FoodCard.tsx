import { MEALS, proteinOf } from '../data/meals'
import type { Dow } from '../data/types'
import { useLog } from '../lib/LogProvider'
import { Button } from './ui/button'

/** Meal 1, Meal 2 and tonight's prep. With a date, each meal gets an "Ate it" button that ticks it and adds protein. */
export function FoodCard({ dow, date }: { dow: Dow; date?: string }) {
  const log = useLog()
  const m = MEALS[dow]
  const meal = (code: 'MEAL-1' | 'MEAL-2', label: string, text: string, g: number) => {
    const done = !!date && log.checks[date]?.[code]?.status === 'done'
    return (
      <div className="flex flex-col gap-2 p-3">
        <div className="cap text-muted">{label}</div>
        <div className="font-medium">{text}</div>
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="cap">~{g} g protein</span>
          {date && (
            <Button variant={done ? 'solid' : 'yellow'} onClick={() => log.setCheck(date, code, done ? null : { status: 'done' })} aria-pressed={done}>
              {done ? '✓ Eaten' : 'Ate it'}
            </Button>
          )}
        </div>
      </div>
    )
  }
  return (
    <section className="box grid grid-cols-1 sm:grid-cols-3 [&>*+*]:border-t-[3px] [&>*+*]:border-ink sm:[&>*+*]:border-t-0 sm:[&>*+*]:border-l-[3px]">
      {meal('MEAL-1', 'Meal 1 · 12:00', m.meal1, proteinOf(m.m1))}
      {meal('MEAL-2', 'Meal 2 · 19:30', m.meal2, proteinOf(m.m2))}
      <div className="p-3">
        <div className="cap text-muted">Tonight's prep</div>
        <div className="mt-2 font-medium">{m.prep}</div>
      </div>
    </section>
  )
}
