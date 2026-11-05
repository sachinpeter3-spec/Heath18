import { useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { daysBetween, parse } from '../lib/dates'

const shortDate = (d: string) => parse(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })

export interface Series {
  name: string
  /** CSS colour (a token like var(--ink) works). */
  color: string
  points: [string, number][]
  kind: 'line' | 'dots'
  unit?: string
}

const W = 600, H = 220, PAD = { l: 40, r: 12, t: 12, b: 26 }

function niceTicks(min: number, max: number, count = 4) {
  if (min === max) { min -= 1; max += 1 }
  const raw = (max - min) / count
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= raw) ?? raw
  const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step
  const ticks: number[] = []
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(+v.toFixed(6))
  return { lo, hi, ticks }
}

export function Legend({ items }: { items: { name: string; color: string; kind: 'line' | 'dots' | 'rect' }[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
      {items.map(i => (
        <span key={i.name} className="inline-flex items-center gap-1.5">
          {i.kind === 'line' && <span className="inline-block h-0.5 w-4" style={{ background: i.color }} />}
          {i.kind === 'dots' && <span className="inline-block size-2.5 rounded-full" style={{ background: i.color }} />}
          {i.kind === 'rect' && <span className="inline-block size-2.5 rounded-sm" style={{ background: i.color }} />}
          {i.name}
        </span>
      ))}
    </div>
  )
}

/** Time-series chart: one y-axis, hairline grid, crosshair + tooltip listing every series at the hovered date. */
export function TimeChart({ series, from, to, label }: { series: Series[]; from: string; to: string; label: string }) {
  const ref = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<string | null>(null)
  const span = Math.max(1, daysBetween(from, to))
  const all = series.flatMap(s => s.points.map(p => p[1]))
  const { lo, hi, ticks } = useMemo(() => niceTicks(Math.min(...all), Math.max(...all)), [all.join()]) // eslint-disable-line react-hooks/exhaustive-deps
  const x = (d: string) => PAD.l + (daysBetween(from, d) / span) * (W - PAD.l - PAD.r)
  const y = (v: number) => PAD.t + (1 - (v - lo) / (hi - lo || 1)) * (H - PAD.t - PAD.b)
  const dates = [...new Set(series.flatMap(s => s.points.map(p => p[0])))].sort()

  const pick = (clientX: number) => {
    const r = ref.current!.getBoundingClientRect()
    const px = ((clientX - r.left) / r.width) * W
    let best: string | null = null, bd = Infinity
    for (const d of dates) { const dd = Math.abs(x(d) - px); if (dd < bd) { bd = dd; best = d } }
    setHover(best)
  }
  const hx = hover ? x(hover) : 0
  const rows = hover ? series.map(s => ({ s, v: s.points.find(p => p[0] === hover)?.[1] })).filter(r => r.v != null) : []

  return (
    <div className="relative">
      <svg
        ref={ref} viewBox={`0 0 ${W} ${H}`} className="block w-full touch-pan-y" role="img" aria-label={label}
        onPointerMove={e => pick(e.clientX)} onPointerDown={e => pick(e.clientX)} onPointerLeave={() => setHover(null)}
        tabIndex={0}
        onKeyDown={e => {
          if (!dates.length) return
          const i = hover ? dates.indexOf(hover) : dates.length
          if (e.key === 'ArrowLeft') setHover(dates[Math.max(0, i - 1)])
          if (e.key === 'ArrowRight') setHover(dates[Math.min(dates.length - 1, i + 1)])
        }}
        onBlur={() => setHover(null)}
      >
        {ticks.map(t => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="var(--soft)" strokeWidth={1} />
            <text x={PAD.l - 6} y={y(t)} dy="0.32em" textAnchor="end" fontSize={11} fill="var(--muted)" fontFamily="var(--font-mono)">{t}</text>
          </g>
        ))}
        <text x={PAD.l} y={H - 6} fontSize={11} fill="var(--muted)" fontFamily="var(--font-mono)">{shortDate(from)}</text>
        <text x={W - PAD.r} y={H - 6} textAnchor="end" fontSize={11} fill="var(--muted)" fontFamily="var(--font-mono)">{shortDate(to)}</text>
        {series.map(s => s.kind === 'line' && s.points.length > 1 && (
          <polyline key={s.name} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"
            points={s.points.map(([d, v]) => `${x(d)},${y(v)}`).join(' ')} />
        ))}
        {series.map(s => s.points.map(([d, v]) => (s.kind === 'dots' || s.points.length === 1) && (
          <circle key={s.name + d} cx={x(d)} cy={y(v)} r={4} fill={s.color} stroke="var(--card)" strokeWidth={2} />
        )))}
        {hover && (
          <g pointerEvents="none">
            <line x1={hx} x2={hx} y1={PAD.t} y2={H - PAD.b} stroke="var(--ink)" strokeWidth={1} />
            {rows.map(({ s, v }) => <circle key={s.name} cx={hx} cy={y(v!)} r={5} fill={s.color} stroke="var(--card)" strokeWidth={2} />)}
          </g>
        )}
      </svg>
      {hover && (
        <div className="pointer-events-none absolute top-1 border-2 border-ink bg-card px-2 py-1 text-xs shadow-[2px_2px_0_var(--ink)]"
          style={{ left: `${(hx / W) * 100}%`, transform: `translateX(${hx > W / 2 ? 'calc(-100% - 8px)' : '8px'})` }}>
          <div className="cap text-muted">{shortDate(hover)}</div>
          {rows.map(({ s, v }) => (
            <div key={s.name} className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="inline-block h-0.5 w-3" style={{ background: s.color }} />
              <b>{+v!.toFixed(1)}{s.unit ? ` ${s.unit}` : ''}</b><span className="text-muted">{s.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** Simple column chart (one series) with a per-bar hover tooltip. */
export function Columns({ data, label, unit }: { data: { key: string; label: string; value: number; max?: number }[]; label: string; unit: string }) {
  const [hover, setHover] = useState<number | null>(null)
  const id = useId()
  const top = Math.max(1, ...data.map(d => Math.max(d.value, d.max ?? 0)))
  const BH = 140, slot = W / data.length, bw = Math.min(24, slot * 0.6)
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${BH + 24}`} className="block w-full" role="img" aria-labelledby={id}>
        <title id={id}>{label}</title>
        <line x1={0} x2={W} y1={BH} y2={BH} stroke="var(--muted)" strokeWidth={1} />
        {data.map((d, i) => {
          const h = (d.value / top) * (BH - 8), cx = slot * i + slot / 2
          return (
            <g key={d.key} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0}>
              <rect x={cx - slot / 2} y={0} width={slot} height={BH} fill="transparent" />
              {d.max != null && <line x1={cx - bw / 2 - 3} x2={cx + bw / 2 + 3} y1={BH - (d.max / top) * (BH - 8)} y2={BH - (d.max / top) * (BH - 8)} stroke="var(--muted)" strokeWidth={1} />}
              {h > 0 && <path d={`M${cx - bw / 2},${BH} V${BH - h + 4} q0,-4 4,-4 h${bw - 8} q4,0 4,4 V${BH} Z`} fill={hover === i ? 'var(--muted)' : 'var(--ink)'} />}
              <text x={cx} y={BH + 16} textAnchor="middle" fontSize={11} fill="var(--muted)" fontFamily="var(--font-mono)">{d.label}</text>
            </g>
          )
        })}
      </svg>
      {hover != null && (
        <div className="pointer-events-none absolute top-0 border-2 border-ink bg-card px-2 py-1 text-xs"
          style={{ left: `${((slot * hover + slot / 2) / W) * 100}%`, transform: 'translateX(-50%)' }}>
          <b>{data[hover].value}{data[hover].max != null ? ` / ${data[hover].max}` : ''} {unit}</b> <span className="text-muted">week of {data[hover].label}</span>
        </div>
      )}
    </div>
  )
}

export function ChartCard({ title, value, sub, children, table }: {
  title: string
  value?: ReactNode
  sub?: ReactNode
  children: ReactNode
  table?: { head: string[]; rows: (string | number)[][] }
}) {
  return (
    <section className="box flex flex-col gap-2 p-3">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="cap m-0">{title}</h3>
        {sub && <span className="cap text-muted">{sub}</span>}
      </div>
      {value != null && <div className="font-display text-3xl leading-none">{value}</div>}
      {children}
      {table && table.rows.length > 0 && (
        <details className="text-sm">
          <summary className="cap cursor-pointer text-muted">Table</summary>
          <table className="mt-1 w-full border-collapse font-mono text-xs">
            <thead><tr>{table.head.map(h => <th key={h} className="border-b border-ink py-1 text-left">{h}</th>)}</tr></thead>
            <tbody>{table.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="border-b border-soft py-1">{c}</td>)}</tr>)}</tbody>
          </table>
        </details>
      )}
    </section>
  )
}
