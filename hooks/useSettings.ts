// Owns all daily-goal state, persisted in AsyncStorage.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

import type { MacroGoals } from "@/types";

const STORAGE_KEY = "calai.macroGoals";

export const DEFAULT_GOALS: MacroGoals = {
  calories: 2000,
  protein_g: 150,
  carbs_g: 200,
  fat_g: 65,
};

export function useSettings() {
  const [goals, setGoals] = useState<MacroGoals>(DEFAULT_GOALS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (active && stored) setGoals({ ...DEFAULT_GOALS, ...JSON.parse(stored) });
      } catch (err) {
        if (__DEV__) console.error("[useSettings] load", err);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const saveGoals = useCallback(async (next: MacroGoals) => {
    setGoals(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (err) {
      if (__DEV__) console.error("[useSettings] save", err);
    }
  }, []);

  return { goals, isLoading, saveGoals };
}
