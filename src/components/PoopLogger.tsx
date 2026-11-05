import { addDays } from '../lib/dates'
import { needsGutFix } from '../lib/log'
import { useLog } from '../lib/LogProvider'
import { GutFixPanel, RedFlagPanel } from './GutPanels'

const BRISTOL = [
  'Separate hard lumps', 'Lumpy sausage', 'Cracked sausage', 'Smooth soft sausage',
  'Soft blobs', 'Mushy', 'Watery',
]

/** Bristol 1-7 picker + red-flag box (spec §4, §5). Logging a type marks the poop item done. */
export function PoopLogger({ date }: { date: string }) {
  const { metrics, setMetric, setCheck } = useLog()
  const m = metrics[date] ?? {}
  const pick = (n: number) => {
    setMetric(date, 'bristol', n)
    setCheck(date, 'POOP', { status: 'done', value: `Type ${n}` })
  }
  const hardDays = [0, 1, 2].filter(k => (metrics[addDays(date, -k)]?.bristol ?? 9) <= 2).length
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-7 gap-1" role="radiogroup" aria-label="Bristol stool type">
        {BRISTOL.map((label, i) => {
          const n = i + 1
          const on = m.bristol === n
          const tone = n <= 2 ? 'bg-amber' : n <= 4 ? 'bg-green' : 'bg-blue'
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={on}
              title={label}
              onClick={() => pick(n)}
              className={`cursor-pointer border-2 border-ink py-2 font-display text-lg ${on ? `${tone} text-black` : 'bg-card text-ink'}`}
            >
              {n}
            </button>
          )
        })}
      </div>
      <p className="m-0 text-xs text-muted">
        {m.bristol ? `Type ${m.bristol}: ${BRISTOL[m.bristol - 1]}. ` : ''}3-4 is ideal; 1-2 means constipation.
        {hardDays > 0 && hardDays < 3 && ` Hard days in a row: ${hardDays}/3.`}
      </p>
      <label className="flex items-center gap-2 text-sm font-bold">
        <input type="checkbox" className="size-4 accent-red-600" checked={!!m.redFlag} onChange={e => setMetric(date, 'redFlag', e.target.checked)} />
        Blood in stool, black stool or strong pain
      </label>
      {m.redFlag && <RedFlagPanel />}
      {needsGutFix(date, metrics) && <GutFixPanel />}
    </div>
  )
}
