import { StyleSheet, Text, View } from "react-native";

import { COLORS, FONT_SIZE, RADIUS, SPACING } from "@/constants/theme";
import { KCAL_PER_GRAM } from "@/constants/macros";
import { toWholeNumber } from "@/utils/macros";

interface CalorieBudgetBarProps {
  proteinG: number;
  carbsG: number;
  fatG: number;
  calorieGoal: number;
}

/** Stacked bar showing how protein/carbs/fat fill the daily calorie budget. */
export function CalorieBudgetBar({ proteinG, carbsG, fatG, calorieGoal }: CalorieBudgetBarProps) {
  const proteinKcal = proteinG * KCAL_PER_GRAM.protein;
  const carbsKcal = carbsG * KCAL_PER_GRAM.carbs;
  const fatKcal = fatG * KCAL_PER_GRAM.fat;
  const usedKcal = proteinKcal + carbsKcal + fatKcal;
  const isOver = usedKcal > calorieGoal && calorieGoal > 0;

  // Segments are sized relative to the larger of (goal, used) so an overflow
  // visibly fills the whole bar in red rather than silently clipping.
  const denominator = Math.max(calorieGoal, usedKcal, 1);
  const pct = (value: number): `${number}%` => `${(value / denominator) * 100}%`;

  return (
    <View>
      <View style={styles.track}>
        <View style={[styles.segment, { width: pct(proteinKcal), backgroundColor: COLORS.protein }]} />
        <View style={[styles.segment, { width: pct(carbsKcal), backgroundColor: COLORS.carbs }]} />
        <View style={[styles.segment, { width: pct(fatKcal), backgroundColor: COLORS.fat }]} />
      </View>
      <Text style={[styles.label, isOver ? styles.labelOver : null]}>
        {toWholeNumber(usedKcal)} / {toWholeNumber(calorieGoal)} kcal
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    height: 14,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.border,
    overflow: "hidden",
  },
  segment: {
    height: "100%",
  },
  label: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
    color: COLORS.textSecondary,
    textAlign: "right",
  },
  labelOver: {
    color: COLORS.error,
  },
});
