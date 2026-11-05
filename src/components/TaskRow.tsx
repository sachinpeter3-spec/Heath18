import type { Item } from '../data/types'
import type { Status } from '../lib/log'
import { CategoryDot } from './CategoryDot'

const TAG: Partial<Record<Status, { text: string; cls: string }>> = {
  late: { text: 'Late', cls: 'bg-amber text-black' },
  missed: { text: 'Missed', cls: 'bg-red text-black' },
  skipped: { text: 'Skipped', cls: 'bg-soft text-muted' },
  done: { text: 'Done', cls: 'bg-green text-black' },
}

export function StatusTag({ status }: { status: Status }) {
  const t = TAG[status]
  return t ? <span className={`cap border-2 border-ink px-1.5 ${t.cls}`}>{t.text}</span> : null
}

export function TaskRow({ item, status, note, mustDo, onToggle, onOpen }: {
  item: Item
  status: Status
  note?: string
  mustDo?: boolean
  onToggle: () => void
  onOpen: () => void
}) {
  const done = status === 'done'
  const bar = status === 'late' ? 'border-l-amber' : status === 'missed' ? 'border-l-red' : 'border-l-transparent'
  return (
    <li className={`grid grid-cols-[2rem_3.75rem_1fr] items-start gap-x-2 border-b border-l-[6px] border-b-soft px-2.5 py-2.5 last:border-b-0 ${bar} ${status === 'skipped' ? 'opacity-55' : ''}`}>
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={`${done ? 'Undo' : 'Mark done'}: ${item.title}`}
        onClick={onToggle}
        className={`grid size-7 cursor-pointer place-items-center border-[3px] border-ink font-display text-sm ${done ? 'bg-green text-black' : 'bg-card text-transparent'}`}
      >
        ✓
      </button>
      <span className="cap pt-1.5">{item.time}</span>
      <button type="button" onClick={onOpen} className="min-w-0 cursor-pointer border-0 bg-transparent p-0 pt-1 text-left text-ink">
        <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <b className={`font-bold ${done ? 'text-muted line-through' : ''}`}>{mustDo && <span className="mr-1 bg-yellow px-1 text-black" title="Must-do today">★</span>}{item.title}</b>
          <span className="flex items-center gap-2">
            <StatusTag status={status === 'done' ? 'pending' : status} />
            <CategoryDot category={item.category} />
            <span className="cap border-2 border-ink px-1.5" aria-hidden>i</span>
          </span>
        </span>
        {note && <span className="mt-1 block text-sm font-bold">{note}</span>}
      </button>
    </li>
  )
}
