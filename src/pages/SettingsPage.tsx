import { CategoryDot } from '../components/CategoryDot'
import { ITEMS } from '../data/items'
import { mondayOf } from '../lib/dates'
import { useSettings } from '../lib/LogProvider'
import type { Settings } from '../lib/store'

const FIELDS: { key: keyof Settings; label: string; type: string }[] = [
  { key: 'programStart', label: 'Program start', type: 'date' },
  { key: 'weightKg', label: 'Body weight (kg)', type: 'number' },
  { key: 'wake', label: 'Wake time', type: 'time' },
  { key: 'sleep', label: 'Sleep time', type: 'time' },
  { key: 'eatStart', label: 'Eating window start', type: 'time' },
  { key: 'eatEnd', label: 'Eating window end', type: 'time' },
]

export default function SettingsPage() {
  const [s, set] = useSettings()
  const update = (k: keyof Settings, v: string) =>
    set(p => ({ ...p, [k]: k === 'weightKg' ? Number(v) : k === 'programStart' ? mondayOf(v) : v }))
  const toggle = (code: string) =>
    set(p => ({ ...p, disabled: p.disabled.includes(code) ? p.disabled.filter(c => c !== code) : [...p.disabled, code] }))
  return (
    <>
      <h2 className="m-0 font-display text-2xl uppercase">Settings</h2>
      <section className="box grid grid-cols-1 gap-3 p-3 sm:grid-cols-2">
        {FIELDS.map(f => (
          <label key={f.key} className="flex flex-col gap-1">
            <span className="cap text-muted">{f.label}</span>
            <input
              type={f.type}
              value={String(s[f.key])}
              onChange={e => update(f.key, e.target.value)}
              className="border-2 border-ink bg-card px-2 py-1.5 font-mono text-ink"
            />
          </label>
        ))}
        <p className="m-0 text-xs text-muted sm:col-span-2">Program start snaps to a Monday. It sets Week N, the steps target and when photos and blood tests are due.</p>
      </section>
      <section className="box">
        <h3 className="cap m-0 border-b-[3px] border-ink bg-soft px-3 py-2">Items on/off</h3>
        {ITEMS.map(i => (
          <label key={i.code} className="flex items-center justify-between gap-3 border-b border-soft px-3 py-2 last:border-b-0">
            <span className="flex items-center gap-2"><CategoryDot category={i.category} label={false} />{i.title}</span>
            <input type="checkbox" checked={!s.disabled.includes(i.code)} onChange={() => toggle(i.code)} className="size-4 accent-black" />
          </label>
        ))}
      </section>
    </>
  )
}
