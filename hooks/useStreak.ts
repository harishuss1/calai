// Computes the current goal-hit streak from recent meal history.

import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";

import { getMealsBetween } from "@/services/supabase";
import type { Meal } from "@/types";
import { lastNDays, todayString } from "@/utils/date";
import { caloriesByDay } from "@/utils/macros";
import { computeStreak, isGoalHit } from "@/utils/streak";

const STREAK_WINDOW_DAYS = 120;

export function useStreak(goalCalories: number) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    const days = lastNDays(STREAK_WINDOW_DAYS);
    const { data } = await getMealsBetween(days[0], todayString());
    setMeals(data ?? []);
    setIsLoading(false);
  }, []);

  useFocusEffect(useCallback(() => void load(), [load]));

  // Recompute (without refetching) whenever meals or the goal change.
  const streak = useMemo(() => {
    const hitDays = new Set<string>();
    caloriesByDay(meals).forEach((calories, day) => {
      if (isGoalHit(calories, goalCalories)) hitDays.add(day);
    });
    return computeStreak(hitDays);
  }, [meals, goalCalories]);

  return { streak, isLoading };
}
