import { StyleSheet, Text, View } from "react-native";

import { COLORS, FONT_SIZE, SPACING } from "@/constants/theme";
import type { WeightDelta } from "@/utils/weight";

interface WeightHeaderProps {
  summary: WeightDelta;
}

/** Current weight (large), starting weight, and the change since the start. */
export function WeightHeader({ summary }: WeightHeaderProps) {
  const { current, start, delta } = summary;
  const isLoss = delta < 0;
  const noChange = delta === 0;
  const arrow = noChange ? "—" : isLoss ? "↓" : "↑";
  const deltaColor = noChange ? COLORS.textSecondary : isLoss ? COLORS.accent : COLORS.error;

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.current}>{current} kg</Text>
        <Text style={styles.start}>Started: {start} kg</Text>
      </View>
      <Text style={[styles.delta, { color: deltaColor }]}>
        {arrow} {noChange ? "" : `${Math.abs(delta)} kg`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  current: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  start: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  delta: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
  },
});
