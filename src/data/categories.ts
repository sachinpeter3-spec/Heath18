import type { Category } from './types'

/** Category colour dots, taken from the item card headers in the spec (§4). */
export const CATEGORY_COLOR: Record<Category, string> = {
  Fasting: '#6a1b9a',
  Fitness: '#2e7d32',
  Hydration: '#1565c0',
  Nutrition: '#c62828',
  Sleep: '#283593',
  Tracking: '#00838f',
  Skin: '#ad1457',
  Mind: '#558b2f',
  Gut: '#6d4c41',
  Supplements: '#ef6c00',
}
