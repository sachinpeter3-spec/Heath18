import { useState } from 'react'
import { CategoryDot } from '../components/CategoryDot'
import { Button } from '../components/ui/button'
import { ITEMS } from '../data/items'
import { exportBackup, importBackup } from '../lib/backup'
import { mondayOf } from '../lib/dates'
import { useSettings } from '../lib/LogProvider'
import { proteinTarget } from '../lib/schedule'
import type { Settings } from '../lib/store'

const FIELDS: { key: keyof Settings; label: string; type: string }[] = [
  { key: 'programStart', label: 'Program start', type: 'date' },
  { key: 'weightKg', label: 'Body weight (kg)', type: 'number' },
  { key: 'wake', label: 'Wake time', type: 'time' },
  { key: 'sleep', label: 'Sleep time', type: 'time' },
  { key: 'eatStart', label: 'Eating window start', type: 'time' },
  { key: 'eatEnd', label: 'Eating window end', type: 'time' },
]

const canNotify = typeof Notification !== 'undefined'

export default function SettingsPage() {
  const [s, set] = useSettings()
  const [msg, setMsg] = useState('')
  const [withPhotos, setWithPhotos] = useState(true)
  const update = (k: keyof Settings, v: string) =>
    set(p => ({ ...p, [k]: k === 'weightKg' ? Number(v) : k === 'programStart' ? (v ? mondayOf(v) : p.programStart) : v }))
  const toggle = (code: string) =>
    set(p => ({ ...p, disabled: p.disabled.includes(code) ? p.disabled.filter(c => c !== code) : [...p.disabled, code] }))
  const setReminder = async (k: 'reminders' | 'itemReminders', on: boolean) => {
    if (on && canNotify && Notification.permission === 'default') await Notification.requestPermission().catch(() => {})
    set(p => ({ ...p, [k]: on }))
  }
  const doExport = async () => {
    const blob = await exportBackup(withPhotos)
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `heath18-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
    setMsg('Backup downloaded.')
  }
  const doImport = async (f: File) => {
    if (!confirm('Restore this backup? Saved data in the file will replace what is on this device.')) return
    try {
      const r = await importBackup(f)
      setMsg(`Restored ${r.keys} data sets and ${r.photos} photos.`)
    } catch (e) {
      setMsg(`Could not restore: ${e instanceof Error ? e.message : 'invalid file'}`)
    }
  }
  const protein = proteinTarget(s.weightKg)
  const perm = canNotify ? Notification.permission : 'unsupported'

  return (
    <>
      <h2 className="m-0 font-display text-2xl uppercase">Settings</h2>
      <section className="box grid grid-cols-1 gap-3 p-3 sm:grid-cols-2">
        {FIELDS.map(f => (
          <label key={f.key} className="flex flex-col gap-1">
            <span className="cap text-muted">{f.label}</span>
            <input
              type={f.type}
              value={String(s[f.key] ?? '')}
              onChange={e => update(f.key, e.target.value)}
              className="border-2 border-ink bg-card px-2 py-1.5 font-mono text-ink"
            />
          </label>
        ))}
        <p className="m-0 text-xs text-muted sm:col-span-2">
          Program start snaps to a Monday. It sets Week N, the steps target and when photos and blood tests are due.
          Protein target at {s.weightKg} kg: <b>{protein.min}-{protein.max} g</b>.
        </p>
      </section>

      <section className="box flex flex-col gap-2 p-3">
        <h3 className="cap m-0">Reminders</h3>
        <label className="flex items-center justify-between gap-3">
          <span>Water nudges at 11:00, 15:00, 18:00 if behind</span>
          <input type="checkbox" className="size-4 accent-black" checked={!!s.reminders} onChange={e => setReminder('reminders', e.target.checked)} />
        </label>
        <label className="flex items-center justify-between gap-3">
          <span>Nudge when each timed item is due</span>
          <input type="checkbox" className="size-4 accent-black" checked={!!s.itemReminders} onChange={e => setReminder('itemReminders', e.target.checked)} />
        </label>
        <p className="m-0 text-xs text-muted">
          Reminders work while Heath18 is open (a tab or the installed app).
          {perm === 'denied' && ' Phone notifications are blocked for this site, so you will only see in-app banners.'}
          {perm === 'unsupported' && ' This browser has no notifications, so you will see in-app banners.'}
        </p>
      </section>

      <section className="box flex flex-col gap-2 p-3">
        <h3 className="cap m-0">Backup</h3>
        <p className="m-0 text-sm text-muted">Everything is saved on this device only. Download a backup to move to a new phone or keep it safe.</p>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="size-4 accent-black" checked={withPhotos} onChange={e => setWithPhotos(e.target.checked)} /> Include progress photos
        </label>
        <div className="flex flex-wrap gap-2">
          <Button variant="solid" onClick={doExport}>Download backup</Button>
          <label className="cap cursor-pointer border-2 border-ink bg-card px-3 py-2 text-ink">
            Restore backup
            <input type="file" accept="application/json,.json" className="sr-only" onChange={e => { const f = e.target.files?.[0]; if (f) void doImport(f); e.target.value = '' }} />
          </label>
        </div>
        {msg && <p role="status" className="m-0 text-sm font-bold">{msg}</p>}
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
