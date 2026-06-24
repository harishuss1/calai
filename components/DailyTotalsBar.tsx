import { StyleSheet, View } from "react-native";

import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import type { MacroGoals, MacroTotals } from "@/types";
import { CalorieProgressBar } from "@/components/CalorieProgressBar";
import { MacroBadge } from "@/components/MacroBadge";

interface DailyTotalsBarProps {
  totals: MacroTotals;
  goals: MacroGoals;
}

/** Sticky summary above the meal log: calories vs goal + macro totals. */
export function DailyTotalsBar({ totals, goals }: DailyTotalsBarProps) {
  return (
    <View style={styles.container}>
      <CalorieProgressBar consumed={totals.calories} goal={goals.calories} />
      <View style={styles.badges}>
        <MacroBadge kind="protein" grams={totals.protein_g} />
        <MacroBadge kind="carbs" grams={totals.carbs_g} />
        <MacroBadge kind="fat" grams={totals.fat_g} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  badges: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
});
