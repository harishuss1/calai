// Owns all body-weight state: fetch, log, delete. Used by the Stats weight tab.

import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import {
  deleteWeightLog as deleteWeightLogRow,
  getWeightLogs,
  logWeight as logWeightRow,
} from "@/services/supabase";
import type { WeightLog } from "@/types";

export function useWeightLogs() {
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    // Fetch everything once; range toggles filter client-side (small data set).
    const { data, error: fetchError } = await getWeightLogs();
    if (fetchError) setError("Couldn't load your weight history. Check your connection.");
    else setLogs(data ?? []);
    setIsLoading(false);
  }, []);

  useFocusEffect(useCallback(() => void fetchLogs(), [fetchLogs]));

  const addWeight = useCallback(
    async (weightKg: number, note?: string): Promise<boolean> => {
      const { error: logError } = await logWeightRow(weightKg, note);
      if (logError) {
        setError("Couldn't save your weight. Try again.");
        return false;
      }
      await fetchLogs();
      return true;
    },
    [fetchLogs],
  );

  const removeWeight = useCallback(async (id: string) => {
    const previous = logs;
    setLogs((current) => current.filter((log) => log.id !== id));
    const { error: deleteError } = await deleteWeightLogRow(id);
    if (deleteError) {
      setLogs(previous);
      setError("Couldn't delete that entry. Try again.");
    }
  }, [logs]);

  return { logs, isLoading, error, addWeight, removeWeight };
}
