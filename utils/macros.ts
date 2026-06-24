// Pure helpers for summing and formatting nutrition values. No side effects.

import type { FoodItem, MacroTotals, Meal } from "@/types";
import { toDayString } from "@/utils/date";

const EMPTY_TOTALS: MacroTotals = {
  calories: 0,
  protein_g: 0,
  carbs_g: 0,
  fat_g: 0,
};

/** Sum macros across a list of meals (used for daily totals). */
export function sumMealMacros(meals: Meal[]): MacroTotals {
  return meals.reduce<MacroTotals>(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein_g: acc.protein_g + meal.protein_g,
      carbs_g: acc.carbs_g + meal.carbs_g,
      fat_g: acc.fat_g + meal.fat_g,
    }),
    { ...EMPTY_TOTALS },
  );
}

/** Sum macros across detected food items (used in the results card). */
export function sumItemMacros(items: FoodItem[]): MacroTotals {
  return items.reduce<MacroTotals>(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein_g: acc.protein_g + item.protein_g,
      carbs_g: acc.carbs_g + item.carbs_g,
      fat_g: acc.fat_g + item.fat_g,
    }),
    { ...EMPTY_TOTALS },
  );
}

/** Total calories per local day across a flat list of meals. */
export function caloriesByDay(meals: Meal[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const meal of meals) {
    const day = toDayString(new Date(meal.eaten_at));
    totals.set(day, (totals.get(day) ?? 0) + meal.calories);
  }
  return totals;
}

/** Round to a whole number, treating NaN/negatives as 0. */
export function toWholeNumber(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.round(value);
}

/** Parse a user-typed numeric TextInput value safely (empty → 0). */
export function parseNumericInput(text: string): number {
  const parsed = Number.parseFloat(text);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

/** Format a gram value for display, e.g. 12.5 → "13g". */
export function formatGrams(value: number): string {
  return `${toWholeNumber(value)}g`;
}

/** Clamp a 0..1 progress ratio (guards divide-by-zero on goals). */
export function progressRatio(current: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(Math.max(current / goal, 0), 1);
}
