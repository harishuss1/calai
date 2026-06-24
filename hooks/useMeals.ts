// Owns the meal list for a single day, with loading + error state.

import { useCallback, useEffect, useState } from "react";

import { deleteMeal as deleteMealRow, getMealsForDate } from "@/services/supabase";
import type { Meal } from "@/types";

export function useMeals(dayString: string) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMeals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: fetchError } = await getMealsForDate(dayString);
    if (fetchError) setError("Couldn't load your meals. Pull to refresh or check your connection.");
    else setMeals(data ?? []);
    setIsLoading(false);
  }, [dayString]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  const removeMeal = useCallback(async (id: string) => {
    // Optimistic: drop it immediately, restore on failure.
    const previous = meals;
    setMeals((current) => current.filter((meal) => meal.id !== id));
    const { error: deleteError } = await deleteMealRow(id);
    if (deleteError) {
      setMeals(previous);
      setError("Couldn't delete that meal. Try again.");
    }
  }, [meals]);

  return { meals, isLoading, error, refetch: fetchMeals, removeMeal };
}
