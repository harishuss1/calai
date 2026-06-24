// Marks which days in a month were logged, and whether each hit the goal.

import { useCallback, useEffect, useState } from "react";

import { getMealsBetween } from "@/services/supabase";
import { toDayString } from "@/utils/date";
import { caloriesByDay } from "@/utils/macros";
import { isGoalHit, type DayMarker } from "@/utils/streak";
import type { CalendarMonth } from "@/utils/calendar";

export function useMonthMeals(month: CalendarMonth, goalCalories: number) {
  const [markers, setMarkers] = useState<Map<string, DayMarker>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const firstDay = toDayString(new Date(month.year, month.month, 1));
    const lastDay = toDayString(new Date(month.year, month.month + 1, 0));

    const { data, error: fetchError } = await getMealsBetween(firstDay, lastDay);
    if (fetchError || !data) {
      setError("Couldn't load your calendar. Check your connection.");
      setIsLoading(false);
      return;
    }

    const next = new Map<string, DayMarker>();
    caloriesByDay(data).forEach((calories, day) => {
      next.set(day, isGoalHit(calories, goalCalories) ? "hit" : "logged");
    });
    setMarkers(next);
    setIsLoading(false);
  }, [month.year, month.month, goalCalories]);

  useEffect(() => {
    load();
  }, [load]);

  return { markers, isLoading, error, refetch: load };
}
