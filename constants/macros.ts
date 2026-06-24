// Fixed biochemical constants for macronutrient energy + validation logic.
// These are NOT user-configurable — they are physical facts.

export const KCAL_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
} as const;

export const MACRO_LIMITS = {
  // Physiological safe ranges (WHO/ISSN guidelines), % of total calories.
  protein: { min: 10, max: 60 },
  carbs: { min: 5, max: 75 },
  fat: { min: 15, max: 60 },
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

export function calcMaxProtein(calorieGoal: number, carbs_g: number, fat_g: number): number {
  const usedByOthers = carbs_g * KCAL_PER_GRAM.carbs + fat_g * KCAL_PER_GRAM.fat;
  return Math.max(0, Math.floor((calorieGoal - usedByOthers) / KCAL_PER_GRAM.protein));
}

export function calcMaxCarbs(calorieGoal: number, protein_g: number, fat_g: number): number {
  const usedByOthers = protein_g * KCAL_PER_GRAM.protein + fat_g * KCAL_PER_GRAM.fat;
  return Math.max(0, Math.floor((calorieGoal - usedByOthers) / KCAL_PER_GRAM.carbs));
}

export function calcMaxFat(calorieGoal: number, protein_g: number, carbs_g: number): number {
  const usedByOthers = protein_g * KCAL_PER_GRAM.protein + carbs_g * KCAL_PER_GRAM.carbs;
  return Math.max(0, Math.floor((calorieGoal - usedByOthers) / KCAL_PER_GRAM.fat));
}

// Recommended split of the NON-protein calorie budget into carbs vs. fat.
// Protein is user-chosen; the rest is auto-distributed so nothing is left over.
export const REMAINDER_SPLIT = { carbs: 0.6, fat: 0.4 } as const;

export interface FilledMacros {
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

/**
 * Given a calorie goal and a chosen protein target, fill carbs + fat so the
 * entire budget is allocated. Fat is rounded first, then carbs absorb the
 * remainder so the total lands as close to the goal as whole grams allow.
 */
export function autofillMacros(calorieGoal: number, protein_g: number): FilledMacros {
  const proteinKcal = protein_g * KCAL_PER_GRAM.protein;
  const remainingKcal = Math.max(0, calorieGoal - proteinKcal);
  const fat_g = Math.round((remainingKcal * REMAINDER_SPLIT.fat) / KCAL_PER_GRAM.fat);
  const carbsKcal = Math.max(0, remainingKcal - fat_g * KCAL_PER_GRAM.fat);
  const carbs_g = Math.round(carbsKcal / KCAL_PER_GRAM.carbs);
  return { protein_g, carbs_g, fat_g };
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

  // Physiological warnings (advisory, not hard errors).
  const proteinPct = ((protein_g * KCAL_PER_GRAM.protein) / calorieGoal) * 100;
  const carbsPct = ((carbs_g * KCAL_PER_GRAM.carbs) / calorieGoal) * 100;
  const fatPct = ((fat_g * KCAL_PER_GRAM.fat) / calorieGoal) * 100;

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
