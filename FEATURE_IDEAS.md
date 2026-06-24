# CalAI — Potential Features

A running list of features we could add, with the reasoning behind each. The
goal is to keep CalAI fast, low-friction, and genuinely useful for daily food
tracking — every idea below is weighed against that.

Each item notes a rough **Impact** (how much it helps the user) and **Effort**
(build cost given the current Expo + Gemini + Supabase stack), so we can pick
high-impact / low-effort work first.

---

## Quick wins (low effort, high daily value)

### Edit a saved meal

Right now a meal can be viewed and deleted, but not edited. If Gemini's estimate
drifts or you add a side later, you must delete and re-log.

- **Why it adds value:** Removes the most common daily frustration — correcting a
  number shouldn't mean starting over. It also makes people trust their log,
  which is the whole point of tracking.
- **Impact:** High · **Effort:** Low (reuse `ResultsCard`/`ManualMealModal`
  fields + an `updateMeal` in `services/supabase.ts`).

### Quick-add from recent & favorite meals

Most people eat the same ~20 meals on repeat. A "Recents" and "★ Favorites" list
that re-logs a past meal in one tap (no photo, no AI call).

- **Why it adds value:** Cuts logging from ~30 seconds to one tap, which is the
  single biggest driver of whether someone keeps tracking. Also saves Gemini
  quota on repeat foods.
- **Impact:** High · **Effort:** Low–Medium (query distinct past meals; add an
  `is_favorite` flag).

### Meal type / time-of-day tagging

Tag each entry as Breakfast / Lunch / Dinner / Snack (auto-suggested from the
clock, editable).

- **Why it adds value:** Lets the Log and Calendar group meals meaningfully and
  unlocks "when do I overeat?" insights later. Cheap to add now, expensive to
  backfill later.
- **Impact:** Medium · **Effort:** Low (one nullable column + a picker).

### Units & preferences (kg/lb, cm/ft)

Let the user choose imperial vs. metric for weight/height.

- **Why it adds value:** A US user currently can't comfortably use the weight
  tracker or goal wizard. Pure conversion in `utils/`, no schema change (store
  canonical units, display converted).
- **Impact:** Medium · **Effort:** Low.

---

## Core nutrition

### Barcode scanning for packaged foods

Scan a product barcode (via `expo-camera`) and pull verified nutrition from the
**Open Food Facts** API instead of estimating from a photo.

- **Why it adds value:** Packaged-food macros are exact on the label — vision
  estimation is overkill and less accurate there. Covers the large share of food
  that comes in a wrapper, and Open Food Facts is free.
- **Impact:** High · **Effort:** Medium (new `services/openFoodFacts.ts`
  following the `{ data, error }` pattern; barcode UI on the Camera tab).

### Extended nutrients (fiber, sugar, sodium)

Capture more than the big-three macros when available.

- **Why it adds value:** Users with specific goals (low-sodium, high-fiber,
  diabetic) can't act on calories alone. The Gemini prompt and `meals` schema
  extend cleanly; UI can stay collapsed by default so it doesn't add clutter.
- **Impact:** Medium · **Effort:** Medium (prompt + schema + optional UI).

### Portion / serving adjustment

After analysis, a "×0.5 / ×2 / custom servings" control that scales all macros.

- **Why it adds value:** Vision portion estimates are the weakest part of AI
  analysis; a quick multiplier fixes the most error-prone field without retyping
  every number.
- **Impact:** Medium · **Effort:** Low (pure math over the existing results card).

### Water intake tracking

A simple daily water counter with a goal, shown alongside calories.

- **Why it adds value:** Hydration is the most-requested companion metric in
  food trackers and is trivially easy to log, giving users another reason to open
  the app daily (which reinforces the food-logging habit).
- **Impact:** Medium · **Effort:** Low (mirrors the weight-log pattern).

---

## Insights & AI (leans on what already makes CalAI special)

### Weekly AI summary & coaching

Once a week, send the last 7 days of totals to Gemini and get a short,
personalized readout: trends, what went well, one concrete suggestion.

- **Why it adds value:** Turns raw logs into guidance — the difference between a
  spreadsheet and a coach. It's a natural extension of the Gemini service we
  already have and a strong differentiator versus generic trackers.
- **Impact:** High · **Effort:** Medium (new text-only call in `services/gemini.ts`,
  cached so it runs once per week).

### Macro trends over time

Extend the Stats tab beyond calories to protein/carbs/fat charts, plus
goal-adherence percentages.

- **Why it adds value:** People set macro goals in Settings but currently can't
  see whether they hit them over time. Closes the loop between goal-setting and
  feedback.
- **Impact:** Medium · **Effort:** Low–Medium (reuse chart components + the
  per-day aggregation already in `utils/macros.ts`).

### Smart goal re-evaluation

When logged weight changes meaningfully, prompt: "Your weight changed — want to
recompute your calorie goal?" (re-runs the goal wizard with fresh numbers).

- **Why it adds value:** TDEE shifts as weight changes; static goals slowly
  become wrong. This keeps the plan accurate with zero effort from the user and
  ties together the weight tracker + goal wizard we already built.
- **Impact:** Medium · **Effort:** Low (compare latest weight to the value used
  when the goal was set).

---

## Engagement & habit-building

### Streak milestones & achievements

Build on the existing streak: celebrate 7/30/100-day milestones, track a
**longest-ever** streak, and add a gentle "freeze" for one missed day.

- **Why it adds value:** Streaks already exist; milestones and a safety net are
  proven retention mechanics that reward consistency without punishing a single
  slip (which is what usually makes people quit).
- **Impact:** Medium–High · **Effort:** Low (extends `utils/streak.ts`).

### Reminders / notifications

Optional local notifications (`expo-notifications`) to nudge logging at meal
times or a daily weigh-in.

- **Why it adds value:** Forgetting to log is the #1 reason tracking lapses. A
  well-timed, opt-in nudge is the highest-leverage retention feature there is.
- **Impact:** High · **Effort:** Medium (permissions + scheduling; needs care on
  web vs. native).

### Home-screen widget / quick log

A widget or share-sheet entry to log a photo without fully opening the app.

- **Why it adds value:** The lower the friction at the moment of eating, the more
  complete the log. Meets users where they are.
- **Impact:** Medium · **Effort:** High (native widget work; best after EAS build).

---

## Health tracking breadth

### Recipes & multi-serving meals

Define a recipe once (ingredients → total macros), then log a serving of it.

- **Why it adds value:** Home cooks currently re-analyze the same dish nightly.
  Recipes make repeat home meals as fast as packaged foods.
- **Impact:** Medium · **Effort:** Medium–High (new tables + UI).

### Fasting / eating-window tracker

Track the time between first and last meal of the day.

- **Why it adds value:** Intermittent fasting is popular and CalAI already knows
  meal timestamps — this is mostly a derived metric, very cheap to surface.
- **Impact:** Low–Medium · **Effort:** Low (derive from existing `eaten_at`).

---

## Technical foundations (invisible to users, protect the experience)

### Offline-first logging with sync

Cache meals locally and queue writes when offline, syncing to Supabase when the
connection returns.

- **Why it adds value:** Today every action needs the network; logging on a
  plane or in a dead-zone restaurant fails. Offline support makes the log
  trustworthy and the app feel instant.
- **Impact:** High · **Effort:** High (local store + sync/conflict handling).

### Data export & backup (CSV / JSON)

One-tap export of all meals and weights.

- **Why it adds value:** Gives users ownership of their data, eases trust, and
  enables analysis elsewhere. Also a cheap insurance policy before bigger
  migrations.
- **Impact:** Medium · **Effort:** Low.

### Authentication for multi-device use

If this ever grows past a single user, add Supabase Auth and scope rows per
user (the current RLS policy is intentionally open for one person).

- **Why it adds value:** Unlocks safe multi-device and multi-user use and lets us
  tighten the database from "anyone with the key" to "only the owner."
- **Impact:** Situational · **Effort:** Medium (the schema/services are already
  Supabase-native).

### Automated tests for pure logic

Unit-test the high-value pure functions: `validateMacros`, `autofillMacros`,
`computeStreak`, `buildMonthGrid`, macro/date utils.

- **Why it adds value:** This logic encodes real rules (biochemistry, streaks,
  calendars). Tests catch regressions for free as features land and document the
  intended behavior — high return for low effort since the functions are already
  pure.
- **Impact:** Medium · **Effort:** Low.

---

## Suggested near-term order

1. **Edit a saved meal** + **Quick-add favorites** — biggest daily friction, lowest cost.
2. **Barcode scanning** — large accuracy + coverage gain.
3. **Weekly AI summary** — leans on our Gemini edge, high perceived value.
4. **Streak milestones** + **Reminders** — retention.
5. **Offline-first** + **tests** — foundation, once the feature set settles.
