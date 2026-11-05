import { GUT_FIX_STEPS, RED_FLAG_TEXT } from '../data/gutfix'

export function GutFixPanel() {
  return (
    <section className="box border-[#6d4c41]! p-3">
      <h3 className="cap m-0 mb-2">Gut fix · 3 hard days in a row</h3>
      <ol className="m-0 flex list-none flex-col gap-2 p-0">
        {GUT_FIX_STEPS.map((s, i) => (
          <li key={s.action} className="grid grid-cols-[1.5rem_1fr] gap-2 text-sm">
            <b className="font-mono">{i + 1}</b>
            <span><b>{s.action}</b><br /><span className="text-muted">{s.why}</span></span>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function RedFlagPanel() {
  return (
    <section role="alert" className="border-[3px] border-red bg-red p-3 text-black">
      <h3 className="cap m-0 mb-1">Red flag</h3>
      <p className="m-0 text-sm font-medium">{RED_FLAG_TEXT}</p>
    </section>
  )
}
