import { StyleSheet, Text, View } from "react-native";

import { COLORS, FONT_SIZE, RADIUS, SPACING } from "@/constants/theme";
import { progressRatio, toWholeNumber } from "@/utils/macros";

interface CalorieProgressBarProps {
  consumed: number;
  goal: number;
}

/** Calories consumed vs. goal with a filled progress track. */
export function CalorieProgressBar({ consumed, goal }: CalorieProgressBarProps) {
  const ratio = progressRatio(consumed, goal);
  const isOver = consumed > goal && goal > 0;

  return (
    <View>
      <View style={styles.labelRow}>
        <Text style={styles.consumed}>{toWholeNumber(consumed)}</Text>
        <Text style={styles.goal}> / {toWholeNumber(goal)} kcal</Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${ratio * 100}%`, backgroundColor: isOver ? COLORS.error : COLORS.accent },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: SPACING.sm,
  },
  consumed: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  goal: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  track: {
    height: 10,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.border,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: RADIUS.pill,
  },
});
