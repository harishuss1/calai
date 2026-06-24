// Aggregates the past 7 days of calories for the Stats screen.

import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { getMealsBetween } from "@/services/supabase";
import { lastNDays, toDayString, weekdayLabel } from "@/utils/date";
import { toWholeNumber } from "@/utils/macros";

const DAYS = 7;

export interface WeeklyStats {
  labels: string[];
  caloriesByDay: number[];
  average: number;
  highest: number;
  lowest: number;
}

const EMPTY: WeeklyStats = { labels: [], caloriesByDay: [], average: 0, highest: 0, lowest: 0 };

export function useWeeklyStats() {
  const [stats, setStats] = useState<WeeklyStats>(EMPTY);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const days = lastNDays(DAYS);
    const { data, error: fetchError } = await getMealsBetween(days[0], days[days.length - 1]);
    if (fetchError || !data) {
      setError("Couldn't load your stats. Check your connection.");
      setIsLoading(false);
      return;
    }

    // Bucket each meal's calories into its local day.
    const totals = new Map<string, number>(days.map((day) => [day, 0]));
    for (const meal of data) {
      const day = toDayString(new Date(meal.eaten_at));
      if (totals.has(day)) totals.set(day, (totals.get(day) ?? 0) + meal.calories);
    }

    const caloriesByDay = days.map((day) => toWholeNumber(totals.get(day) ?? 0));
    const sum = caloriesByDay.reduce((acc, value) => acc + value, 0);

    setStats({
      labels: days.map(weekdayLabel),
      caloriesByDay,
      average: toWholeNumber(sum / DAYS),
      highest: Math.max(...caloriesByDay),
      lowest: Math.min(...caloriesByDay),
    });
    setIsLoading(false);
  }, []);

  useFocusEffect(useCallback(() => void load(), [load]));

  return { stats, isLoading, error };
}
