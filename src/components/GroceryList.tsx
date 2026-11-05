import { useState } from 'react'
import { GROCERY_LABEL, STAPLES, weeklyGrocery } from '../data/meals'
import { addDays, mondayOf, parse } from '../lib/dates'
import { useStored } from '../lib/store'
import { Button } from './ui/button'

/** Shopping list built from the Mon-Sun food plan (spec: Weekly grocery + meal prep). Ticks are kept per week. */
export function GroceryList({ date }: { date: string }) {
  // On Sunday you shop for the coming week; other days show the current week.
  const week = mondayOf(addDays(date, 1))
  const [ticked, setTicked] = useStored<Record<string, string[]>>('os_grocery', {})
  const [copied, setCopied] = useState(false)
  const rows = [
    ...weeklyGrocery().map(g => ({ key: g.food, name: GROCERY_LABEL[g.food].name, amount: GROCERY_LABEL[g.food].unit(g.amount) })),
    ...STAPLES.map(s => ({ key: s, name: s, amount: '' })),
  ]
  const on = new Set(ticked[week] ?? [])
  const toggle = (k: string) => setTicked(p => {
    const s = new Set(p[week] ?? [])
    if (s.has(k)) s.delete(k); else s.add(k)
    return { ...p, [week]: [...s] }
  })
  const copy = async () => {
    const text = rows.filter(r => !on.has(r.key)).map(r => `- ${r.name}${r.amount ? `: ${r.amount}` : ''}`).join('\n')
    try { await navigator.clipboard.writeText(`Grocery list\n${text}`); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* clipboard blocked */ }
  }
  const label = parse(week).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
  return (
    <section className="box" id="grocery">
      <div className="flex items-center justify-between gap-2 border-b-[3px] border-ink bg-soft px-3 py-2">
        <h3 className="cap m-0">Grocery list · week of {label}</h3>
        <span className="cap">{on.size}/{rows.length}</span>
      </div>
      <ul className="m-0 list-none p-0">
        {rows.map(r => (
          <li key={r.key} className="border-b border-soft last:border-b-0">
            <label className={`flex cursor-pointer items-start gap-2.5 px-3 py-2 ${on.has(r.key) ? 'text-muted line-through' : ''}`}>
              <input type="checkbox" className="mt-0.5 size-4 accent-black" checked={on.has(r.key)} onChange={() => toggle(r.key)} />
              <span className="flex flex-1 flex-wrap justify-between gap-x-3">
                <span className="font-medium">{r.name}</span>
                {r.amount && <span className="cap pt-0.5">{r.amount}</span>}
              </span>
            </label>
          </li>
        ))}
      </ul>
      <div className="flex gap-2 border-t-[3px] border-ink p-3">
        <Button onClick={copy}>{copied ? 'Copied ✓' : 'Copy what is left'}</Button>
        {on.size > 0 && <Button onClick={() => setTicked(p => ({ ...p, [week]: [] }))}>Clear ticks</Button>}
      </div>
    </section>
  )
}
