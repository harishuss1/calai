// Streak logic: a day "hits the goal" when its calories land near the target.

import { toDayString } from "@/utils/date";

/** How close to the goal still counts as a hit (±10%). */
export const GOAL_TOLERANCE = 0.1;

/** How a calendar day is marked: hit the goal, or just logged something. */
export type DayMarker = "hit" | "logged";

/** True when the day's calories are within ±GOAL_TOLERANCE of the goal. */
export function isGoalHit(totalCalories: number, goalCalories: number): boolean {
  if (goalCalories <= 0 || totalCalories <= 0) return false;
  return Math.abs(totalCalories - goalCalories) <= goalCalories * GOAL_TOLERANCE;
}

/**
 * Count consecutive goal-hit days ending today. If today hasn't hit yet (still
 * in progress), counting starts at yesterday so the streak isn't reset early.
 */
export function computeStreak(hitDays: Set<string>): number {
  const cursor = new Date();
  if (!hitDays.has(toDayString(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (hitDays.has(toDayString(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
