import { exportPhotos, importPhotos } from './photos'
import { allKeys, reloadAll } from './store'

interface Backup { app: 'heath18'; version: 1; exportedAt: string; storage: Record<string, string>; photos: Record<string, string> }

/** Everything this app saved (incl. the burn planner and photos) as one JSON file. */
export async function exportBackup(includePhotos: boolean): Promise<Blob> {
  const storage: Record<string, string> = {}
  for (const k of allKeys()) storage[k] = localStorage.getItem(k) ?? ''
  const data: Backup = { app: 'heath18', version: 1, exportedAt: new Date().toISOString(), storage, photos: includePhotos ? await exportPhotos() : {} }
  return new Blob([JSON.stringify(data)], { type: 'application/json' })
}

/** Restore a backup. Keys in the file overwrite current ones; other keys are kept. */
export async function importBackup(file: File): Promise<{ keys: number; photos: number }> {
  const data = JSON.parse(await file.text()) as Partial<Backup>
  if (data.app !== 'heath18' || typeof data.storage !== 'object' || !data.storage) throw new Error('This is not a Heath18 backup file.')
  const entries = Object.entries(data.storage).filter(([k, v]) => k.startsWith('h18_') && typeof v === 'string')
  entries.forEach(([, v]) => JSON.parse(v)) // validate everything before writing anything
  for (const [k, v] of entries) localStorage.setItem(k, v)
  const photos = data.photos && typeof data.photos === 'object' ? Object.entries(data.photos).filter(([k, v]) => /^\d{4}-\d\d-\d\d:(front|side|back)$/.test(k) && typeof v === 'string' && v.startsWith('data:image/')) : []
  await importPhotos(Object.fromEntries(photos))
  reloadAll()
  return { keys: entries.length, photos: photos.length }
}
