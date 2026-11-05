import { useEffect, useState } from 'react'
import { parse } from '../lib/dates'
import { useLog } from '../lib/LogProvider'
import { deletePhoto, getPhoto, photoDates, POSES, savePhoto, type Pose } from '../lib/photos'

function useBlobUrl(date: string | undefined, pose: Pose, version: number) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    let u: string | null = null, live = true
    if (date) getPhoto(date, pose).then(b => { if (live && b) setUrl(u = URL.createObjectURL(b)); else if (live) setUrl(null) }).catch(() => setUrl(null))
    else setUrl(null)
    return () => { live = false; if (u) URL.revokeObjectURL(u) }
  }, [date, pose, version])
  return url
}

function Slot({ date, pose, version, onChange }: { date: string; pose: Pose; version: number; onChange: () => void }) {
  const url = useBlobUrl(date, pose, version)
  return (
    <div className="flex flex-col gap-1">
      <label className="relative grid aspect-[3/4] cursor-pointer place-items-center overflow-hidden border-2 border-dashed border-ink bg-soft">
        {url ? <img src={url} alt={`${pose} photo`} className="absolute inset-0 size-full object-cover" /> : <span className="cap text-muted">+ {pose}</span>}
        <input type="file" accept="image/*" capture="user" className="sr-only" aria-label={`Add ${pose} photo`}
          onChange={async e => { const f = e.target.files?.[0]; if (f) { await savePhoto(date, pose, f); onChange() } e.target.value = '' }} />
      </label>
      <div className="flex justify-between">
        <span className="cap">{pose}</span>
        {url && <button type="button" className="cap cursor-pointer border-0 bg-transparent p-0 text-muted underline" onClick={async () => { await deletePhoto(date, pose); onChange() }}>Remove</button>}
      </div>
    </div>
  )
}

/** Take/upload front, side and back. All three marks the photo item done. */
export function PhotoCapture({ date }: { date: string }) {
  const { setCheck, checks } = useLog()
  const [v, setV] = useState(0)
  useEffect(() => {
    Promise.all(POSES.map(p => getPhoto(date, p))).then(bs => {
      const n = bs.filter(Boolean).length
      const done = checks[date]?.PHOTO?.status === 'done'
      if (n === 3 && !done) setCheck(date, 'PHOTO', { status: 'done', value: '3 photos' })
    }).catch(() => {})
  }, [v]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">{POSES.map(p => <Slot key={p} date={date} pose={p} version={v} onChange={() => setV(x => x + 1)} />)}</div>
      <p className="m-0 text-xs text-muted">Photos stay on this device only.</p>
    </div>
  )
}

function Shot({ date, pose }: { date?: string; pose: Pose }) {
  const url = useBlobUrl(date, pose, 0)
  return url ? <img src={url} alt={`${pose} on ${date}`} className="aspect-[3/4] w-full border-2 border-ink object-cover" />
    : <div className="grid aspect-[3/4] place-items-center border-2 border-dashed border-ink bg-soft"><span className="cap text-muted">no {pose}</span></div>
}

/** Side-by-side comparison of two photo dates (default: first vs latest). */
export function PhotoCompare() {
  const [dates, setDates] = useState<string[]>([])
  const [a, setA] = useState<string>()
  const [b, setB] = useState<string>()
  useEffect(() => { photoDates().then(d => { setDates(d); setA(d[0]); setB(d[d.length - 1]) }) }, [])
  if (!dates.length) return <p className="m-0 text-sm text-muted">No photos yet. They are due every 4th Sunday; add them from the Progress photo item.</p>
  const fmt = (d: string) => parse(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  const sel = (v: string | undefined, set: (d: string) => void, label: string) => (
    <select aria-label={label} value={v} onChange={e => set(e.target.value)} className="border-2 border-ink bg-card px-2 py-1 font-mono text-xs text-ink">
      {dates.map(d => <option key={d} value={d}>{fmt(d)}</option>)}
    </select>
  )
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">{sel(a, setA, 'Before date')}{sel(b, setB, 'After date')}</div>
      {POSES.map(p => (
        <div key={p} className="grid grid-cols-2 gap-2"><Shot date={a} pose={p} /><Shot date={b} pose={p} /></div>
      ))}
    </div>
  )
}
