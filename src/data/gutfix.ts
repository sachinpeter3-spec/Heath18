/** Gut-fix panel: shown after 3 days in a row of Bristol type 1-2 (spec §5). */
export const GUT_FIX_STEPS: { action: string; why: string }[] = [
  { action: 'Water up to 3.5 L + extra salt', why: 'Water softens stool; salt holds water in the gut' },
  { action: 'Psyllium 1-2 tsp in a big glass of water, daily', why: 'Soluble fiber makes stool soft and easy to pass' },
  { action: 'Magnesium citrate at night', why: 'Draws water into the bowel' },
  { action: 'More fat (ghee, fatty cuts), less very lean meat', why: 'Fat helps stool move' },
  { action: 'Curd/kefir daily + cooked veg', why: 'Probiotics and some fiber for gut bacteria' },
  { action: '10-min walks after meals', why: 'Movement wakes up the bowel' },
]

/** Red-flag panel: shown when the red-flag box is ticked in the poop log. */
export const RED_FLAG_TEXT =
  'Please see a doctor if you have: blood in stool or black stool, strong or constant belly pain, ' +
  'no bowel movement for 3+ days with bloating or vomiting, unexplained weight loss, ' +
  'dizziness or fainting while fasting, chest pain.'

export const DISCLAIMER =
  'General wellness information, not medical advice. Check with a doctor before starting supplements or fasting.'
