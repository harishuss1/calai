# CalAI — Feature Addition Prompt

Follow all standards in CODE_QUALITY.md throughout every file you generate.
This prompt adds three features to the existing CalAI codebase. Do not break existing functionality.

---

## Feature 1 — Scientific Macro Validation in Settings

### The science (hardcode this logic, do not let the user override it)

Macronutrient calorie values are fixed by biochemistry:

- Protein: 4 kcal per gram
- Carbohydrates: 4 kcal per gram
- Fat: 9 kcal per gram

The total calories from macros cannot exceed the daily calorie goal:

```
(protein_g × 4) + (carbs_g × 4) + (fat_g × 9) ≤ calorie_goal
```

The remaining calories after protein and fat are set become the maximum available for carbs, and vice versa. This is a hard scientific constraint — if the numbers don't fit, the meal plan is physically impossible regardless of what the user wants.

### What to build

#### In `constants/macros.ts` (new file)

```ts
export const KCAL_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
} as const;

export const MACRO_LIMITS = {
  // Physiological safe minimums (WHO/ISSN guidelines)
  protein: { min: 10, max: 60 }, // % of total calories
  carbs: { min: 5, max: 75 }, // % of total calories
  fat: { min: 15, max: 60 }, // % of total calories
} as const;

export function calcCaloriesFromMacros(
  protein_g: number,
  carbs_g: number,
  fat_g: number,
): number {
  return (
    protein_g * KCAL_PER_GRAM.protein +
    carbs_g * KCAL_PER_GRAM.carbs +
    fat_g * KCAL_PER_GRAM.fat
  );
}

export function calcMaxProtein(
  calorieGoal: number,
  carbs_g: number,
  fat_g: number,
): number {
  const usedByOthers =
    carbs_g * KCAL_PER_GRAM.carbs + fat_g * KCAL_PER_GRAM.fat;
  return Math.floor((calorieGoal - usedByOthers) / KCAL_PER_GRAM.protein);
}

export function calcMaxCarbs(
  calorieGoal: number,
  protein_g: number,
  fat_g: number,
): number {
  const usedByOthers =
    protein_g * KCAL_PER_GRAM.protein + fat_g * KCAL_PER_GRAM.fat;
  return Math.floor((calorieGoal - usedByOthers) / KCAL_PER_GRAM.carbs);
}

export function calcMaxFat(
  calorieGoal: number,
  protein_g: number,
  carbs_g: number,
): number {
  const usedByOthers =
    protein_g * KCAL_PER_GRAM.protein + carbs_g * KCAL_PER_GRAM.carbs;
  return Math.floor((calorieGoal - usedByOthers) / KCAL_PER_GRAM.fat);
}

export interface MacroValidationResult {
  isValid: boolean;
  totalMacroCalories: number;
  remainingCalories: number;
  errors: string[];
  warnings: string[];
}

export function validateMacros(
  calorieGoal: number,
  protein_g: number,
  carbs_g: number,
  fat_g: number,
): MacroValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const totalMacroCalories = calcCaloriesFromMacros(protein_g, carbs_g, fat_g);
  const remainingCalories = calorieGoal - totalMacroCalories;

  if (totalMacroCalories > calorieGoal) {
    errors.push(
      `Your macros add up to ${totalMacroCalories} kcal, which exceeds your ${calorieGoal} kcal goal by ${totalMacroCalories - calorieGoal} kcal. Reduce protein, carbs, or fat.`,
    );
  }

  // Physiological warnings (not hard errors, but worth flagging)
  const proteinPct = ((protein_g * 4) / calorieGoal) * 100;
  const carbsPct = ((carbs_g * 4) / calorieGoal) * 100;
  const fatPct = ((fat_g * 9) / calorieGoal) * 100;

  if (protein_g > 0 && proteinPct > 40) {
    warnings.push(
      `Protein is ${Math.round(proteinPct)}% of calories. Above 40% is difficult to sustain and may stress kidneys long-term.`,
    );
  }
  if (fat_g > 0 && fatPct < 15) {
    warnings.push(
      `Fat is only ${Math.round(fatPct)}% of calories. Below 15% can impair hormone production and fat-soluble vitamin absorption.`,
    );
  }
  if (carbs_g > 0 && carbsPct < 5) {
    warnings.push(
      `Carbs are very low (${Math.round(carbsPct)}%). This is a ketogenic range — intentional?`,
    );
  }
  if (remainingCalories > 200 && totalMacroCalories > 0) {
    warnings.push(
      `${remainingCalories} kcal unaccounted for. Consider distributing the remaining calories across your macros.`,
    );
  }

  return {
    isValid: errors.length === 0,
    totalMacroCalories,
    remainingCalories,
    errors,
    warnings,
  };
}
```

#### In `app/(tabs)/settings.tsx` — update the macro inputs section

Each macro input field must:

1. Show a label with current grams AND the equivalent calories in grey beneath it:
   - e.g. "Protein — 150g = 600 kcal"
2. Have a real-time calorie budget bar below all three inputs showing:
   - Filled segments: protein (blue) / carbs (orange) / fat (yellow)
   - Remaining: empty/dimmed segment
   - Total kcal used vs goal shown as text: "1800 / 2000 kcal"
3. When a value is changed, immediately re-run `validateMacros()` and:
   - Show errors in a red box with an ❌ icon above the Save button — Save is DISABLED until all errors are resolved
   - Show warnings in a yellow box with a ⚠️ icon — Save is still ENABLED (warnings are advisory)
4. On each field, show a helper text in grey:
   - "Max [X]g with current carbs & fat" — recalculated live using `calcMaxProtein()` etc.
   - This updates in real time as the user types in other fields
5. The Save button shows "Macros don't fit your calorie goal" as disabled label when invalid

The calorie budget bar component should be extracted as `components/CalorieBudgetBar.tsx`.

#### Example UX flow to implement:

- User sets 2000 kcal goal
- Types 300g protein (= 1200 kcal)
- Types 200g carbs (= 800 kcal)
- Types 100g fat (= 900 kcal)
- Total = 2900 kcal → error fires, budget bar overflows in red, Save disabled
- User reduces protein to 150g → total = 2500 kcal → still error
- User reduces carbs to 100g → total = 1700 kcal → valid, 300 kcal remaining warning shown, Save enabled

---

## Feature 2 — Weight Tracker in Stats Tab

### Supabase schema addition

Add this to `supabase-schema.sql`:

```sql
CREATE TABLE weight_logs (
  id uuid primary key default gen_random_uuid(),
  weight_kg numeric NOT NULL,
  note text,
  logged_at timestamptz default now()
);
```

Add a corresponding type to `types/index.ts`:

```ts
export interface WeightLog {
  id: string;
  weight_kg: number;
  note: string | null;
  logged_at: string;
}
```

Add these functions to `services/supabase.ts`:

```ts
export async function logWeight(weight_kg: number, note?: string);
export async function getWeightLogs(
  limitDays?: number,
): Promise<{ data: WeightLog[] | null; error: string | null }>;
export async function deleteWeightLog(id: string);
```

### Stats tab layout

Split `app/(tabs)/stats.tsx` into two sections with a segmented control at the top:

- **Calories** (existing content — weekly bar chart)
- **Weight** (new section)

#### Weight section UI

**Header row:**

- Current weight (most recent log) shown large, e.g. "78.4 kg"
- Starting weight (first ever log) shown smaller in grey, e.g. "Started: 85.0 kg"
- Delta shown with arrow: "↓ 6.6 kg" in green if loss, "↑ X kg" in red if gain, "— " if no change

**Chart:**

- Line chart showing weight over time
- X-axis: dates (formatted as "Jun 10", "Jun 12" etc.)
- Y-axis: weight in kg, range auto-scaled with 2kg padding above and below min/max
- Use the same chart library already installed in the project
- Show a dot on each logged data point
- If fewer than 2 entries: show "Log at least 2 weights to see your trend" instead of the chart

**Time range toggle below chart:**

- 2W / 1M / 3M / All — filters the chart data
- Default: 1M

**Log Weight button:**

- Fixed at the bottom of the weight section
- Accent green, full width
- Opens a bottom sheet modal (use React Native's built-in Modal, not a third-party sheet library) with:
  - Numeric input for weight in kg (keyboard type numeric, decimal allowed)
  - Optional note TextInput ("e.g. After morning weigh-in")
  - Date/time: defaults to now, show it as text "Logging for: Today, Jun 22 · 8:14 AM" (not editable for simplicity)
  - "Log Weight" confirm button — validates weight is between 20kg and 500kg, shows inline error if not
  - "Cancel" link

**Weight log history list** below the chart:

- Most recent 10 entries
- Each row: date on left, weight on right, small note below if present
- Swipe to delete (same pattern as meal deletion)
- "Show all" button if more than 10 entries

**Empty state** (no weight logs yet):

- Icon (a scale emoji or simple SVG scale icon)
- "No weight logged yet"
- Subtext: "Log your starting weight to begin tracking your progress."
- Large "Log Your Weight" button in accent green

---

## Feature 3 — Manual Meal Logging + Empty State

### Empty state on Log tab

When there are no meals for the selected day, show a full-screen empty state (replacing the empty list):

```
         🍽️

    Nothing logged yet

  What did you eat today?

  [📷  Log with Camera]      ← navigates to Camera tab

  [✏️  Log Manually]         ← opens manual log modal
```

Both options as large tappable cards side by side (not small buttons). Each card:

- Icon centered at top
- Short label below
- Accent green border on the camera option (primary action)
- White/grey border on manual (secondary action)

### Manual Log button — always visible

In the Log tab, add a **floating action button (FAB)** in the bottom-right corner that is ALWAYS visible regardless of whether meals exist:

- Circle, accent green background, white ✏️ icon
- Position: `position: 'absolute', bottom: 24, right: 24`
- z-index above the list
- Tapping opens the same Manual Log modal as above

This means the user can always add a manual meal without switching tabs, even when the list has meals in it.

### Manual Log modal

Use React Native's built-in Modal. Extract as `components/ManualMealModal.tsx`.

Fields:

```
Meal Name*          [TextInput — e.g. "Chicken breast & rice"]
Calories*           [numeric TextInput]
Protein (g)         [numeric TextInput]
Carbs (g)           [numeric TextInput]
Fat (g)             [numeric TextInput]
```

Validation on submit:

- Meal name: required, max 100 chars
- Calories: required, must be 1–9999
- Protein/carbs/fat: optional individually, but if all three are provided, run `validateMacros()` against the entered calorie value (NOT the daily goal — against what the user said this meal has). Show a warning (not a block) if macros don't match the stated calories by more than 15%. Example: user says 500 kcal but macros add to 300 kcal → warning "Your macros only add up to 300 kcal. The calorie field will be used as-is."
- No photo required — `photo_url` is null for manual entries

On save:

- Insert to Supabase `meals` table with `photo_url: null`
- Show a small visual indicator on the meal card in the log (e.g. a grey "Manual" pill badge) so the user can distinguish camera-analyzed meals from hand-typed ones
- Close modal, refresh log

### Add `is_manual` column to meals table

Add to `supabase-schema.sql`:

```sql
ALTER TABLE meals ADD COLUMN is_manual boolean default false;
```

Add to `types/index.ts`:

```ts
export interface Meal {
  // ... existing fields
  is_manual: boolean;
}
```

---

## Summary of files to create or modify

### New files

- `constants/macros.ts`
- `components/CalorieBudgetBar.tsx`
- `components/ManualMealModal.tsx`

### Modified files

- `app/(tabs)/settings.tsx` — macro validation UI
- `app/(tabs)/stats.tsx` — add weight section + segmented control
- `app/(tabs)/log.tsx` — empty state + FAB + manual log trigger
- `services/supabase.ts` — weight log functions
- `types/index.ts` — WeightLog type, is_manual field on Meal
- `supabase-schema.sql` — weight_logs table, is_manual column

### Do not modify

- `app/(tabs)/index.tsx` (camera tab) — untouched
- `services/gemini.ts` — untouched
- `constants/theme.ts` — untouched unless adding new color tokens needed by these features (add, don't change existing)

---

## Standards reminder

- All new components: typed props, no inline styles, use `COLORS`/`SPACING`/`RADIUS` from `constants/theme.ts`
- All new Supabase calls: `{ data, error }` tuple pattern
- All user-facing errors: plain English, no raw API errors
- No `any` types anywhere
- Keep each new component file under 150 lines — split if needed
