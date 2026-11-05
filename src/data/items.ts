import type { Item } from './types'

const daily = { type: 'daily' } as const

/**
 * The 30 items of Lean & Healthy OS.
 * Text is copied from the spec: §2 (schedule), §3 (one-line why) and §4 (detail cards).
 * BLOOD-TEST has no card in the spec; its text is written in the same style.
 */
export const ITEMS: Item[] = [
  // ── All-day goals ────────────────────────────────────────────────
  {
    code: 'FAST', title: '16:8 fasting window', category: 'Fasting', time: '20:00 - 12:00', sortTime: '00:00',
    section: 'allday', schedule: daily, unlockWeek: 1,
    oneLine: 'Eating only in an 8-hour window makes it easy to eat less.',
    detail: {
      why: 'Eating only in an 8-hour window makes it easy to eat less without counting much. Insulin stays low for longer, which helps the body use stored fat.',
      fixes: 'Constant snacking, high insulin all day, belly fat, overeating at night.',
      how: 'Last food by 20:00, first meal at 12:00. Water, black coffee, plain tea and electrolytes are allowed while fasting.',
      tip: 'If you feel dizzy or weak, add salt water. Stop and eat if it continues.',
    },
  },
  {
    code: 'STEPS', title: 'Daily steps', category: 'Fitness', time: 'All day', sortTime: '00:00',
    section: 'allday', schedule: daily, unlockWeek: 1,
    oneLine: 'Walking burns fat without making you hungry or tired.',
    detail: {
      why: 'Walking burns fat without making you hungry or tired, and improves insulin sensitivity and heart health.',
      fixes: 'Belly fat, love handles, low fitness, insulin resistance.',
      how: 'Target grows: Week 1-2 6,000; Week 3 7,000; Week 4 8,000; Month 2 10,000. Log from your phone step counter.',
      tip: 'Walk during calls, park further, take stairs.',
    },
  },
  {
    code: 'WATER', title: 'Water 3 litres', category: 'Hydration', time: 'All day', sortTime: '00:00',
    section: 'allday', schedule: daily, unlockWeek: 1,
    oneLine: 'Fasting and a meat-heavy diet both increase water needs.',
    detail: {
      why: 'Fasting and a meat-heavy diet both increase water needs. Water keeps stools soft and skin hydrated.',
      fixes: 'Hard stools, headaches, tiredness, dry skin.',
      how: 'Tap +250 ml each glass. Reminders at 11:00, 15:00 and 18:00 if behind.',
      tip: 'Use a 1-litre bottle and finish it 3 times.',
    },
  },
  {
    code: 'PROTEIN', title: 'Protein target', category: 'Nutrition', time: 'All day', sortTime: '00:00',
    section: 'allday', schedule: daily, unlockWeek: 1,
    oneLine: 'Protein is the raw material for muscle.',
    detail: {
      why: 'Protein is the raw material for muscle. Skinny-fat bodies need more muscle, so this is the most important food number.',
      fixes: 'Low muscle, slow metabolism, constant hunger, muscle loss on a diet.',
      how: 'Target = 1.6-2.2 g per kg of body weight (75 kg = 120-165 g). Log each meal; the bar fills up.',
      tip: '100 g chicken ~ 25 g protein, 1 egg ~ 6 g, 100 g paneer ~ 18 g.',
    },
  },
  {
    code: 'NO-PROC', title: 'No processed meat today', category: 'Nutrition', time: 'All day', sortTime: '00:00',
    section: 'allday', schedule: daily, unlockWeek: 1,
    oneLine: 'Processed meats are linked to colon cancer.',
    detail: {
      why: 'Processed meats like bacon, sausage, ham and salami are linked to colon cancer. Fresh meat, eggs and fish are better choices.',
      fixes: 'Lowers colon-cancer risk and salt/chemical load.',
      how: "Tick 'yes' if you avoided processed meat today. Max 1-2 servings per week.",
      tip: 'Cook fresh keema instead of sausages.',
    },
  },

  // ── Morning ──────────────────────────────────────────────────────
  {
    code: 'AM-WATER', title: 'Morning water + electrolytes', category: 'Hydration', time: '07:00', sortTime: '07:00',
    section: 'morning', schedule: daily, unlockWeek: 1,
    oneLine: 'After 8 hours of sleep and an overnight fast you wake up dehydrated.',
    detail: {
      why: 'After 8 hours of sleep and an overnight fast you wake up dehydrated. On carnivore and fasting the body also flushes out sodium faster.',
      fixes: 'Morning headache, low energy, hard stools, dull skin, cramps.',
      how: 'Drink 500 ml water with a pinch of salt (and a squeeze of lemon if you like). Do it before tea/coffee.',
      tip: 'Keep a filled bottle next to the bed at night.',
    },
  },
  {
    code: 'SUNLIGHT', title: 'Morning sunlight (10 min)', category: 'Sleep', time: '07:10', sortTime: '07:10',
    section: 'morning', schedule: daily, unlockWeek: 1,
    oneLine: 'Morning light sets your body clock.',
    detail: {
      why: 'Morning light sets your body clock. A correct body clock means you feel sleepy at night, sleep deeper and recover better. It also helps vitamin D.',
      fixes: 'Poor sleep, late-night cravings, low mood, low vitamin D.',
      how: 'Step outside or on the balcony for 10 minutes within 1 hour of waking. No sunglasses. Combine with a short walk.',
      tip: 'Do it while drinking your morning water.',
    },
  },
  {
    code: 'WEIGH', title: 'Weigh-in', category: 'Tracking', time: '07:15', sortTime: '07:15',
    section: 'morning', schedule: daily, unlockWeek: 1,
    oneLine: 'Daily weight jumps up and down because of water and food.',
    detail: {
      why: 'Daily weight jumps up and down because of water and food. The weekly average shows the real trend.',
      fixes: 'Guessing whether the plan is working; giving up because of one bad day.',
      how: 'Weigh after toilet, before eating, same clothes. The website shows the 7-day average, not just today.',
      tip: 'Ignore single days. Only judge the weekly average.',
    },
  },
  {
    code: 'WAIST', title: 'Waist measurement', category: 'Tracking', time: '07:15', sortTime: '07:16',
    section: 'morning', schedule: { type: 'weekdays', days: ['sun'] }, unlockWeek: 1,
    oneLine: 'Waist is the best number for skinny-fat.',
    detail: {
      why: 'Waist is the best number for skinny-fat. It shrinks as belly fat goes down even when weight stays the same because muscle is growing.',
      fixes: 'Not seeing progress, quitting too early.',
      how: 'Measure at belly-button level, relaxed, after toilet, before eating. Enter in cm.',
      tip: 'Same tape, same time, every Sunday.',
    },
  },
  {
    code: 'PHOTO', title: 'Progress photo', category: 'Tracking', time: '07:15', sortTime: '07:17',
    section: 'morning', schedule: { type: 'every_n_weeks', n: 4, day: 'sun' }, unlockWeek: 1,
    oneLine: 'Muscle gain + fat loss is easier to see than to weigh.',
    detail: {
      why: 'Muscle gain + fat loss is easier to see than to weigh. Photos keep you motivated.',
      fixes: 'Not noticing body change.',
      how: 'Front, side, back. Same place, same light, same clothes.',
      tip: 'The website shows photos side by side.',
    },
  },
  {
    code: 'BLOOD', title: 'Blood test', category: 'Tracking', time: '08:00', sortTime: '08:00',
    section: 'morning', schedule: { type: 'every_n_days', n: 90 }, unlockWeek: 1,
    oneLine: 'Blood numbers show what the mirror and scale cannot.',
    detail: {
      why: 'Blood numbers show what the mirror and scale cannot: sugar control, cholesterol, vitamin D and B12. They also set your vitamin D dose.',
      fixes: 'Guessing supplement doses; missing early signs of high sugar or cholesterol.',
      how: 'Fasting sample in the morning: HbA1c, fasting glucose, lipid profile, vitamin D, B12, thyroid (TSH), liver and kidney panel. Enter key numbers after.',
      tip: 'Book it on a fasting morning so the 16:8 window does the work. Show results to your doctor.',
    },
  },
  {
    code: 'AM-SKIN', title: 'Morning skin routine', category: 'Skin', time: '07:20', sortTime: '07:20',
    section: 'morning', schedule: daily, unlockWeek: 1,
    oneLine: 'UV light breaks down collagen and is the biggest cause of skin aging and skin cancer.',
    detail: {
      why: 'UV light breaks down collagen and is the biggest cause of skin aging and skin cancer. Sunscreen blocks most of it. Vitamin C serum and moisturizer protect and repair.',
      fixes: 'Tanning, dark spots, early wrinkles, dryness; lowers skin-cancer risk.',
      how: '1) Gentle face wash 2) Vitamin C serum (optional) 3) Moisturizer 4) Sunscreen SPF 30+ on face and neck.',
      tip: 'Use SPF even indoors near windows. Reapply if outside long.',
    },
  },
  {
    code: 'FOCUS', title: 'Focus timer (5 min)', category: 'Mind', time: '07:30', sortTime: '07:30',
    section: 'morning', schedule: daily, unlockWeek: 1,
    oneLine: 'A 5-minute daily check-in keeps the whole plan in your head.',
    detail: {
      why: "A 5-minute daily check-in keeps the whole plan in your head. You see what is done, what is left this week, and choose today's most important 1-2 things.",
      fixes: 'Forgetting habits, losing motivation, falling behind on weekly targets.',
      how: "Start the timer. Tick yesterday's missed items, look at the weekly progress bars, pick 1-2 must-dos for today.",
      tip: 'Open the website at the same time every morning.',
    },
  },
  {
    code: 'POOP', title: 'Poop log (Bristol scale)', category: 'Gut', time: 'Morning', sortTime: '07:45',
    section: 'morning', schedule: daily, unlockWeek: 1,
    oneLine: 'Stool type tells you if your gut is getting enough water, salt, fiber and magnesium.',
    detail: {
      why: 'Stool type tells you if your gut is getting enough water, salt, fiber and magnesium. Type 3-4 is ideal; 1-2 means constipation.',
      fixes: 'Hard stools, straining, bloating; catches problems early.',
      how: 'Tap one number 1-7 on the scale picture. If you saw blood or have strong pain, tick the red-flag box.',
      tip: '3 hard days in a row automatically shows the gut-fix steps.',
    },
  },
  {
    code: 'GROCERY', title: 'Weekly grocery + meal prep', category: 'Nutrition', time: '11:00', sortTime: '11:00',
    section: 'morning', schedule: { type: 'weekdays', days: ['sun'] }, unlockWeek: 1,
    oneLine: 'One shopping trip for the week means no excuses and no junk orders.',
    detail: {
      why: 'One shopping trip for the week means no excuses and no junk orders.',
      fixes: 'Missing meals, eating processed food, overspending.',
      how: "Website auto-generates a list from next week's food plan: meat, fish, eggs, paneer, curd, psyllium, vegetables.",
      tip: 'Buy meat in bulk and freeze in meal-size packs.',
    },
  },

  // ── Afternoon ────────────────────────────────────────────────────
  {
    code: 'MEAL-1', title: 'Meal 1 - break fast with protein', category: 'Nutrition', time: '12:00', sortTime: '12:00',
    section: 'afternoon', schedule: daily, unlockWeek: 1,
    oneLine: 'The first meal sets your hunger for the day.',
    detail: {
      why: 'The first meal sets your hunger for the day. A high-protein start protects muscle and keeps you full until the next meal.',
      fixes: 'Muscle loss while dieting, cravings, overeating later.',
      how: 'Eat your planned protein (see Food plan for today) - aim for half of your daily protein target. Take supplements with this meal.',
      tip: 'Eat protein first, then anything else on the plate.',
    },
  },
  {
    code: 'SUPPS', title: 'Day supplements: D3+K2, Omega-3, Vitamin C', category: 'Supplements', time: '12:00', sortTime: '12:01',
    section: 'afternoon', schedule: daily, unlockWeek: 1,
    oneLine: 'Vitamin D is low in most Indians and supports immunity.',
    detail: {
      why: 'Vitamin D is low in most Indians and supports immunity. Omega-3 lowers inflammation. Vitamin C is almost absent on carnivore and is needed to make collagen.',
      fixes: 'Low immunity, frequent colds, inflammation, weak skin and joints.',
      how: 'Take with Meal 1 (needs fat to absorb). Vitamin D dose should follow your blood test / doctor. Skip omega-3 on fish days.',
      tip: 'Keep the bottles next to where you eat.',
    },
    dayNotes: { tue: 'Fish day: skip the omega-3 capsule today.', thu: 'Fish day: skip the omega-3 capsule today.' },
  },
  {
    code: 'BROTH', title: 'Bone broth / collagen', category: 'Gut', time: 'Meal 1', sortTime: '12:02',
    section: 'afternoon', schedule: { type: 'weekdays', days: ['mon', 'wed', 'fri', 'sun'] }, unlockWeek: 1,
    oneLine: 'Bone broth gives gelatin and collagen, which support the gut lining, joints and skin elasticity.',
    detail: {
      why: 'Bone broth gives gelatin and collagen, which support the gut lining, joints and skin elasticity.',
      fixes: 'Gut irritation, joint pain, loss of skin firmness.',
      how: '1 cup bone broth (mutton/chicken bones simmered 6+ hours) or ~10 g collagen powder.',
      tip: 'Make a big pot on Sunday, freeze in cups.',
    },
  },
  {
    code: 'WALK', title: '10-min walk after meal', category: 'Fitness', time: 'After meals', sortTime: '12:30',
    section: 'afternoon', schedule: daily, unlockWeek: 1,
    oneLine: 'Working muscles pull sugar out of the blood.',
    detail: {
      why: 'Working muscles pull sugar out of the blood. A short walk after eating makes the insulin spike smaller.',
      fixes: 'Insulin spikes, insulin resistance, sleepiness after meals, fat storage.',
      how: 'Walk for 10 minutes within 30 minutes of finishing Meal 1 and Meal 2. Slow pace is fine.',
      tip: 'Take a phone call while walking.',
    },
  },
  {
    code: 'STRESS', title: 'Stress break (5 min)', category: 'Mind', time: '16:00', sortTime: '16:00',
    section: 'afternoon', schedule: { type: 'weekdays', days: ['mon', 'tue', 'wed', 'thu', 'fri'] }, unlockWeek: 1,
    oneLine: 'Long-term stress keeps cortisol high, which stores belly fat and weakens immunity.',
    detail: {
      why: 'Long-term stress keeps cortisol high, which stores belly fat and weakens immunity.',
      fixes: 'Stress eating, belly fat, poor sleep, low immunity.',
      how: 'Box breathing: in 4 s, hold 4 s, out 4 s, hold 4 s - for 5 minutes. Or a slow walk without the phone.',
      tip: 'Set it right after work meetings.',
    },
  },

  // ── Evening ──────────────────────────────────────────────────────
  {
    code: 'LIFT-A', title: 'Strength workout - Day A', category: 'Fitness', time: '17:30', sortTime: '17:30',
    section: 'evening', schedule: { type: 'weekdays', days: ['mon', 'fri'] }, unlockWeek: 1,
    oneLine: 'Muscle is the cure for skinny-fat.',
    detail: {
      why: 'Muscle is the cure for skinny-fat. It raises your resting metabolism, absorbs blood sugar and tightens the waist and love handles.',
      fixes: 'Low muscle, skinny-fat look, insulin resistance, weak posture.',
      how: 'Goblet squat 3x8-12 | Push-up or bench press 3x8-12 | Dumbbell row 3x10 | Plank 3x30 s. Log weight and reps for every set.',
      tip: 'When you hit 12 reps on all sets, add a little weight next time.',
    },
  },
  {
    code: 'LIFT-B', title: 'Strength workout - Day B', category: 'Fitness', time: '17:30', sortTime: '17:30',
    section: 'evening', schedule: { type: 'weekdays', days: ['wed'] }, unlockWeek: 1,
    oneLine: 'Day B trains the back chain (hips, back, shoulders) and the side core that sits under the love handles.',
    detail: {
      why: 'Day B trains the back chain (hips, back, shoulders) and the side core that sits under the love handles.',
      fixes: 'Weak back and hips, poor posture, love handles.',
      how: 'Romanian deadlift 3x8-12 | Overhead press 3x8-12 | Lat pulldown or band pull 3x10 | Side plank 2x20 s each side.',
      tip: 'Keep your back straight; lighter weight with good form beats heavy.',
    },
  },
  {
    code: 'MOBILITY', title: 'Mobility / stretch (5 min)', category: 'Fitness', time: '17:30', sortTime: '17:30',
    section: 'evening', schedule: { type: 'weekdays', days: ['tue', 'thu', 'sat'] }, unlockWeek: 1,
    oneLine: 'Rest days let muscles grow.',
    detail: {
      why: 'Rest days let muscles grow. Light stretching keeps joints moving so you can lift without injury.',
      fixes: 'Stiffness, back pain, injury risk.',
      how: 'Hip flexor stretch, cat-cow, hamstring stretch, shoulder circles - 1 min each.',
      tip: 'Do it while watching something.',
    },
  },
  {
    code: 'REVIEW', title: 'Weekly review', category: 'Mind', time: '19:00', sortTime: '19:00',
    section: 'evening', schedule: { type: 'weekdays', days: ['sun'] }, unlockWeek: 1,
    oneLine: "Looking back at the week shows what worked and what to fix, and unlocks next week's habits.",
    detail: {
      why: "Looking back at the week shows what worked and what to fix, and unlocks next week's habits.",
      fixes: 'Repeating the same mistakes, losing direction.',
      how: "See weekly score, streaks, weight average, waist change. Write one sentence: 'Next week I will...'.",
      tip: 'Celebrate any streak, even a small one.',
    },
  },
  {
    code: 'MEAL-2', title: 'Meal 2 + curd + fiber', category: 'Nutrition', time: '19:30', sortTime: '19:30',
    section: 'evening', schedule: daily, unlockWeek: 1,
    oneLine: 'Second protein meal completes your daily target.',
    detail: {
      why: 'Second protein meal completes your daily target. Curd adds probiotics; a little fiber stops constipation on carnivore.',
      fixes: 'Missing protein target, hard stools, poor gut bacteria.',
      how: 'Eat planned protein + 1 bowl curd. Add 1 tsp psyllium (isabgol) in a glass of water OR a small portion of cooked vegetables/berries.',
      tip: 'Finish by 20:00 so the fast starts on time.',
    },
  },
  {
    code: 'FISH', title: 'Fatty fish meal', category: 'Nutrition', time: 'Meal 2', sortTime: '19:31',
    section: 'evening', schedule: { type: 'weekdays', days: ['tue', 'thu'] }, unlockWeek: 1,
    oneLine: 'Fatty fish (salmon, mackerel/bangda, sardine/mathi) gives omega-3 fats that fight inflammation and help skin, heart and brain.',
    detail: {
      why: 'Fatty fish (salmon, mackerel/bangda, sardine/mathi) gives omega-3 fats that fight inflammation and help skin, heart and brain.',
      fixes: 'Inflammation, dry skin, low omega-3.',
      how: 'Use fish as the protein in Meal 2 on these days. Skip the omega-3 capsule that day.',
      tip: 'Sardines and mackerel are cheap and very rich in omega-3.',
    },
  },

  // ── Night ────────────────────────────────────────────────────────
  {
    code: 'PREP', title: "Prepare tomorrow's food", category: 'Nutrition', time: '21:00', sortTime: '21:00',
    section: 'night', schedule: daily, unlockWeek: 1,
    oneLine: 'Lazy days fail because there is no food ready.',
    detail: {
      why: 'Lazy days fail because there is no food ready. Preparing tonight makes tomorrow automatic.',
      fixes: 'Skipping meals, ordering junk, missing protein.',
      how: "Read tomorrow's food card: thaw/marinate meat, boil eggs, set curd. Tick done.",
      tip: 'Batch-cook 2 days of chicken at once.',
    },
  },
  {
    code: 'PM-SKIN', title: 'Night skin routine', category: 'Skin', time: '22:00', sortTime: '22:00',
    section: 'night', schedule: daily, unlockWeek: 1,
    oneLine: 'Skin repairs at night.',
    detail: {
      why: 'Skin repairs at night. Retinol boosts collagen and speeds skin renewal; moisturizer repairs the barrier.',
      fixes: 'Pimples, wrinkles, uneven skin, dryness.',
      how: '1) Face wash 2) Retinol on retinol nights only (Mon/Thu at start, more later) 3) Moisturizer. Other nights: wash + moisturizer.',
      tip: 'Use a pea-size amount of retinol; dryness at start is normal.',
    },
    dayNotes: { mon: 'Retinol night.', thu: 'Retinol night.' },
  },
  {
    code: 'MAGNESIUM', title: 'Magnesium at night', category: 'Supplements', time: '22:00', sortTime: '22:01',
    section: 'night', schedule: daily, unlockWeek: 1,
    oneLine: 'Carnivore is low in magnesium.',
    detail: {
      why: 'Carnivore is low in magnesium. It relaxes muscles, improves sleep and (citrate form) softens stools.',
      fixes: 'Poor sleep, cramps, constipation, insulin resistance.',
      how: '200-400 mg. Use citrate if stools are hard, glycinate if sleep is the main problem.',
      tip: 'Too-loose stools = lower the dose.',
    },
  },
  {
    code: 'SLEEP', title: 'Sleep 7-8 hours', category: 'Sleep', time: '22:30', sortTime: '22:30',
    section: 'night', schedule: daily, unlockWeek: 1,
    oneLine: 'Short sleep raises hunger hormones and cortisol (belly fat), weakens immunity and slows muscle recovery.',
    detail: {
      why: 'Short sleep raises hunger hormones and cortisol (belly fat), weakens immunity and slows muscle recovery.',
      fixes: 'Cravings, belly fat, frequent illness, weak workouts, dull skin.',
      how: 'Lights off by 22:30. Phone away 30 minutes before. Log sleep hours in the morning.',
      tip: 'Same bedtime even on weekends.',
    },
  },
]

export const ITEM_BY_CODE: Record<string, Item> = Object.fromEntries(ITEMS.map(i => [i.code, i]))
