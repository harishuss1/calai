// All shared types live here. Check this file before defining a new type.

/** A meal row as stored in Supabase. */
export interface Meal {
  id: string;
  photo_url: string | null;
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  eaten_at: string;
  /** True when hand-entered rather than analyzed from a photo. */
  is_manual: boolean;
}

/**
 * A meal ready to insert (DB fills id + eaten_at). `is_manual` is optional so
 * existing camera-save callers needn't set it — the DB default (false) applies.
 */
export type NewMeal = Omit<Meal, "id" | "eaten_at" | "is_manual"> & { is_manual?: boolean };

/** A body-weight entry as stored in Supabase. */
export interface WeightLog {
  id: string;
  weight_kg: number;
  note: string | null;
  logged_at: string;
}

/** A single food item detected within one photo. */
export interface FoodItem {
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

/** Raw shape returned by the Gemini analysis prompt. */
export interface GeminiMealResponse {
  items: FoodItem[];
  total_calories: number;
  meal_name: string;
  error?: string;
}

/** User-configurable daily targets, persisted in AsyncStorage. */
export interface MacroGoals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

/** Sum of macros across a set of meals or food items. */
export interface MacroTotals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

/** Generic async result returned by every service function. */
export interface Result<T> {
  data: T | null;
  error: string | null;
}

/** Finite-state of any async UI flow. */
export type LoadingState = "idle" | "loading" | "success" | "error";

/** Which macro a badge represents (drives its color). */
export type MacroKind = "protein" | "carbs" | "fat";

/** Inputs for the "help me find my goal" calorie estimator. */
export type Sex = "Male" | "Female";
export type ActivityLevel = "Sedentary" | "Light" | "Moderate" | "Active";
export type WeightGoal = "Lose" | "Maintain" | "Gain";

export interface GoalProfile {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  goal: WeightGoal;
}

/** Gemini's recommended daily targets from a GoalProfile. */
export interface CalorieGoalEstimate {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  rationale: string;
}
