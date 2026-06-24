# CalAI — Code Quality & Standards

This document is the source of truth for how code is written in this project.
Every file Claude Code generates, and every edit you make manually, should follow these rules.
When in doubt: readable > clever, explicit > implicit, simple > abstract.

---

## 1. TypeScript

### Strict mode — always on

`tsconfig.json` must have:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Never use `any`

```ts
// ❌ Bad
const parse = (data: any) => data.calories;

// ✅ Good
const parse = (data: GeminiMealResponse) => data.total_calories;
```

### Define types for everything external

Every API response, every Supabase row, every component prop gets a named type or interface.
Put shared types in `types/index.ts` — do not scatter them across files.

```ts
// types/index.ts

export interface Meal {
  id: string;
  photo_url: string | null;
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  eaten_at: string;
}

export interface FoodItem {
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface GeminiMealResponse {
  items: FoodItem[];
  total_calories: number;
  meal_name: string;
  error?: string;
}

export interface MacroGoals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}
```

### Prefer `interface` over `type` for objects, `type` for unions

```ts
// Object shapes → interface
interface MealCardProps {
  meal: Meal;
  onDelete: () => void;
}

// Unions / computed types → type
type LoadingState = "idle" | "loading" | "success" | "error";
```

---

## 2. File & Folder Structure

```
calai/
├── app/                        # Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx           # Camera tab
│   │   ├── log.tsx             # Daily log
│   │   ├── stats.tsx           # Weekly stats
│   │   └── settings.tsx        # Settings
│   └── _layout.tsx
├── components/                 # Reusable UI components
│   ├── MealCard.tsx
│   ├── MacroBadge.tsx
│   ├── CalorieProgressBar.tsx
│   └── LoadingOverlay.tsx
├── services/                   # External integrations (no UI)
│   ├── gemini.ts               # Gemini API calls
│   └── supabase.ts             # Supabase client + queries
├── hooks/                      # Custom React hooks
│   ├── useMeals.ts
│   └── useSettings.ts
├── types/
│   └── index.ts                # All shared types
├── constants/
│   └── theme.ts                # Colors, spacing, typography
└── utils/
    └── macros.ts               # Pure helper functions (sum, format)
```

### One component per file

No file exports more than one component. Name the file exactly what the component is called.

### Keep screens thin

Screens (`app/`) should only handle layout and navigation. Logic goes in hooks, API calls go in services, helpers go in utils.

```ts
// ❌ Bad — screen does everything
export default function LogScreen() {
  const [meals, setMeals] = useState([]);
  useEffect(() => {
    supabase.from('meals').select('*').then(({ data }) => setMeals(data));
  }, []);
  // ... 200 more lines
}

// ✅ Good — screen just renders
export default function LogScreen() {
  const { meals, isLoading, deleteMeal } = useMeals();
  return <MealList meals={meals} isLoading={isLoading} onDelete={deleteMeal} />;
}
```

---

## 3. Naming Conventions

| Thing                   | Convention                  | Example                                    |
| ----------------------- | --------------------------- | ------------------------------------------ |
| Components              | PascalCase                  | `MealCard`, `MacroBadge`                   |
| Files (components)      | PascalCase                  | `MealCard.tsx`                             |
| Files (everything else) | camelCase                   | `gemini.ts`, `useMeals.ts`                 |
| Variables & functions   | camelCase                   | `totalCalories`, `fetchMeals`              |
| Boolean variables       | `is` / `has` / `can` prefix | `isLoading`, `hasError`, `canSave`         |
| Constants               | SCREAMING_SNAKE_CASE        | `MAX_PHOTO_SIZE_MB`                        |
| Types & Interfaces      | PascalCase                  | `Meal`, `FoodItem`                         |
| Async functions         | verb + noun                 | `fetchMeals`, `uploadPhoto`, `analyzeMeal` |
| Event handlers          | `handle` prefix             | `handleSave`, `handleDelete`               |

---

## 4. Components

### Always type props explicitly

```ts
// ❌ Bad
export function MealCard({ meal, onDelete }: any) {}

// ✅ Good
interface MealCardProps {
  meal: Meal;
  onDelete: (id: string) => void;
}
export function MealCard({ meal, onDelete }: MealCardProps) {}
```

### Prefer function declarations for components

```ts
// ✅ Good
export function MealCard({ meal }: MealCardProps) {
  return <View>...</View>;
}

// also fine for screens
export default function LogScreen() {
  return <View>...</View>;
}
```

### No inline styles — use StyleSheet or constants

```ts
// ❌ Bad
<View style={{ backgroundColor: '#1a1a1a', borderRadius: 16, padding: 12 }}>

// ✅ Good
<View style={styles.card}>

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
  },
});
```

### Theme constants go in `constants/theme.ts`

```ts
export const COLORS = {
  background: "#0a0a0a",
  card: "#1a1a1a",
  accent: "#00ff88",
  textPrimary: "#ffffff",
  textSecondary: "#888888",
  protein: "#4a9eff",
  carbs: "#ff9a3c",
  fat: "#ffd93d",
  error: "#ff4757",
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const RADIUS = {
  sm: 8,
  card: 16,
  pill: 999,
} as const;
```

---

## 5. Services (API calls)

### Gemini and Supabase calls live only in `services/`

No `fetch` calls in components or screens. Ever. The screen asks the service; the service does the work.

### Always return a typed result — never throw naked

```ts
// services/gemini.ts

interface AnalyzeResult {
  data: GeminiMealResponse | null;
  error: string | null;
}

export async function analyzeMealPhoto(base64Image: string): Promise<AnalyzeResult> {
  try {
    const response = await fetch(GEMINI_URL, { ... });
    if (!response.ok) {
      return { data: null, error: `Gemini error: ${response.status}` };
    }
    const json = await response.json();
    const parsed: GeminiMealResponse = JSON.parse(json.candidates[0].content.parts[0].text);
    return { data: parsed, error: null };
  } catch (err) {
    return { data: null, error: 'Failed to analyze photo. Try again.' };
  }
}
```

### Supabase queries follow the same pattern

```ts
// services/supabase.ts

export async function saveMeal(meal: Omit<Meal, "id" | "eaten_at">) {
  const { data, error } = await supabase
    .from("meals")
    .insert(meal)
    .select()
    .single();
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function getMealsForDate(date: string) {
  const start = `${date}T00:00:00.000Z`;
  const end = `${date}T23:59:59.999Z`;
  const { data, error } = await supabase
    .from("meals")
    .select("*")
    .gte("eaten_at", start)
    .lte("eaten_at", end)
    .order("eaten_at", { ascending: false });
  if (error) return { data: null, error: error.message };
  return { data: data as Meal[], error: null };
}
```

---

## 6. Hooks

### One hook per domain

`useMeals` handles all meal state. `useSettings` handles all settings state. No overlap.

### Always expose a clean loading + error interface

```ts
// hooks/useMeals.ts

export function useMeals(date: string) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMeals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await getMealsForDate(date);
    if (error) setError(error);
    else setMeals(data ?? []);
    setIsLoading(false);
  }, [date]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  return { meals, isLoading, error, refetch: fetchMeals };
}
```

---

## 7. Error Handling

### Every error shown to the user must be human-readable

```ts
// ❌ Bad — raw API error shown to user
setError(err.message); // "JSON.parse: unexpected character at line 1..."

// ✅ Good — translated into plain language
setError('Couldn't read the photo. Try a clearer image with better lighting.');
```

### Never silently swallow errors

```ts
// ❌ Bad
try {
  await saveMeal(data);
} catch {}

// ✅ Good
try {
  await saveMeal(data);
} catch (err) {
  console.error("[saveMeal]", err);
  setError("Meal saved locally but failed to sync. Check your connection.");
}
```

### Log errors with context in development

```ts
if (__DEV__) {
  console.error("[analyzeMealPhoto] Raw error:", err);
}
```

---

## 8. Environment Variables

### Never hardcode keys

```ts
// ❌ Bad
const key = "AIzaSy...";

// ✅ Good
const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
```

### Validate env vars at app startup

```ts
// services/supabase.ts — top of file
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase env vars. Check your .env file.");
}
```

### `.env` is never committed

`.gitignore` must include:

```
.env
.env.local
.env*.local
```

Commit a `.env.example` with empty values so others know what keys are needed.

---

## 9. Git Hygiene

### Commit message format

```
type: short description (under 60 chars)

Types: feat | fix | refactor | style | chore | docs
```

Examples:

```
feat: add Gemini image analysis
fix: handle empty Gemini response gracefully
refactor: move meal queries to supabase service
chore: add CODE_QUALITY.md
```

### Never commit broken code to main

Work in a branch for anything non-trivial. Even solo, this habit matters once the project grows.

### `.gitignore` must include

```
node_modules/
.env
.expo/
ios/
android/
*.log
```

---

## 10. Performance Rules

### Memoize callbacks passed to child components

```ts
// If onDelete is passed as a prop to a list of MealCards:
const handleDelete = useCallback(
  (id: string) => {
    deleteMeal(id);
  },
  [deleteMeal],
);
```

### Don't fetch inside render

All data fetching happens inside `useEffect` or event handlers — never directly in the render body of a component or hook.

### Images

- Resize photos before sending to Gemini (max 1024px, quality 0.7 JPEG) — keeps API fast and free tier comfortable.
- Use `expo-image` (not core `Image`) for cached rendering of meal photos in the log list.

---

## 11. Code Review Checklist

Before considering any feature done, verify:

- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No `any` types
- [ ] All API calls are in `services/`, not in components
- [ ] All shared types are in `types/index.ts`
- [ ] All colors/spacing use constants from `theme.ts`
- [ ] Every loading state shows a spinner
- [ ] Every error state shows a readable message
- [ ] `.env` is in `.gitignore`
- [ ] No `console.log` left in code (only `console.error` wrapped in `__DEV__`)
- [ ] Component files are under ~150 lines — if longer, split it

---

## 12. What Claude Code Should Always Do

When generating any new file or edit for this project:

1. Follow the folder structure above exactly — no new top-level folders without a reason.
2. Check `types/index.ts` before defining a new type — reuse existing ones.
3. Check `constants/theme.ts` before using a color or spacing value inline.
4. Return `{ data, error }` tuples from every service function.
5. Keep screens under 100 lines by extracting logic into hooks.
6. Add a comment above any non-obvious logic explaining _why_, not _what_.
7. Never leave TODOs without a comment explaining what's needed and why it's deferred.
