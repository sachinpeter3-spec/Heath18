import { CATEGORY_COLOR } from '../data/categories'
import type { Category } from '../data/types'

export function CategoryDot({ category, label = true }: { category: Category; label?: boolean }) {
  return (
    <span className="cap inline-flex items-center gap-1.5 whitespace-nowrap text-muted">
      <span className="inline-block size-2.5 rounded-full" style={{ background: CATEGORY_COLOR[category] }} />
      {label && category}
    </span>
  )
}
