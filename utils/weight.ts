// Pure helpers for the weight tracker: range filtering, delta, chart shaping.

import type { WeightLog } from "@/types";
import { monthDayLabel } from "@/utils/date";

export type WeightRange = "2W" | "1M" | "3M" | "All";

export const WEIGHT_RANGES: WeightRange[] = ["2W", "1M", "3M", "All"];

const RANGE_DAYS: Record<WeightRange, number | null> = {
  "2W": 14,
  "1M": 30,
  "3M": 90,
  All: null,
};

/** Keep only logs within the selected range (logs are oldest-first). */
export function filterByRange(logs: WeightLog[], range: WeightRange): WeightLog[] {
  const days = RANGE_DAYS[range];
  if (days === null) return logs;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return logs.filter((log) => new Date(log.logged_at).getTime() >= cutoff);
}

export interface WeightDelta {
  current: number;
  start: number;
  delta: number;
}

/** Current vs. first-ever weight. Null if there are no logs at all. */
export function computeDelta(allLogs: WeightLog[]): WeightDelta | null {
  if (allLogs.length === 0) return null;
  const start = allLogs[0].weight_kg;
  const current = allLogs[allLogs.length - 1].weight_kg;
  return { current, start, delta: Math.round((current - start) * 10) / 10 };
}

export interface WeightChartData {
  labels: string[];
  values: number[];
  /** Y-axis bounds padded 2kg beyond the data for headroom. */
  min: number;
  max: number;
}

/** Build labelled chart points with a 2kg padded y-range. */
export function buildChartData(logs: WeightLog[]): WeightChartData {
  const values = logs.map((log) => log.weight_kg);
  const min = values.length ? Math.floor(Math.min(...values) - 2) : 0;
  const max = values.length ? Math.ceil(Math.max(...values) + 2) : 0;
  return {
    labels: logs.map((log) => monthDayLabel(log.logged_at)),
    values,
    min,
    max,
  };
}
