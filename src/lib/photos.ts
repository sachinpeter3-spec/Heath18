/** Progress photos live in IndexedDB (localStorage is too small for images). Nothing leaves the device. */
export const POSES = ['front', 'side', 'back'] as const
export type Pose = (typeof POSES)[number]

const DB = 'h18_photos', STORE = 'photos'
let dbp: Promise<IDBDatabase> | null = null
const db = () => (dbp ??= new Promise((res, rej) => {
  const r = indexedDB.open(DB, 1)
  r.onupgradeneeded = () => r.result.createObjectStore(STORE)
  r.onsuccess = () => res(r.result)
  r.onerror = () => rej(r.error)
}))

function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return db().then(d => new Promise<T>((res, rej) => {
    const r = fn(d.transaction(STORE, mode).objectStore(STORE))
    r.onsuccess = () => res(r.result)
    r.onerror = () => rej(r.error)
  }))
}

/** Shrink to max 1200 px JPEG so a year of photos stays small. */
async function shrink(file: Blob): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file)
    const k = Math.min(1, 1200 / Math.max(bmp.width, bmp.height))
    const c = document.createElement('canvas')
    c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k)
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
    return await new Promise(res => c.toBlob(b => res(b ?? file), 'image/jpeg', 0.85))
  } catch {
    return file
  }
}

export async function savePhoto(date: string, pose: Pose, file: Blob) {
  const small = await shrink(file)
  return tx('readwrite', s => s.put(small, `${date}:${pose}`))
}
export const deletePhoto = (date: string, pose: Pose) => tx('readwrite', s => s.delete(`${date}:${pose}`))
export const getPhoto = (date: string, pose: Pose) => tx<Blob | undefined>('readonly', s => s.get(`${date}:${pose}`))
export const photoKeys = () => tx<IDBValidKey[]>('readonly', s => s.getAllKeys()).then(k => k.map(String)).catch(() => [] as string[])

/** Dates that have at least one photo, oldest first. */
export const photoDates = async () => [...new Set((await photoKeys()).map(k => k.split(':')[0]))].sort()

/** For backup: every photo as a data URL. */
export async function exportPhotos(): Promise<Record<string, string>> {
  const out: Record<string, string> = {}
  for (const k of await photoKeys()) {
    const [d, p] = k.split(':') as [string, Pose]
    const b = await getPhoto(d, p)
    if (b) out[k] = await new Promise<string>(res => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(b) })
  }
  return out
}
export async function importPhotos(data: Record<string, string>) {
  for (const [k, url] of Object.entries(data)) {
    const blob = await (await fetch(url)).blob()
    await tx('readwrite', s => s.put(blob, k))
  }
}
