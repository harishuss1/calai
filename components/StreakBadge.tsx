import { StyleSheet, Text, View } from "react-native";

import { COLORS, FONT_SIZE, RADIUS, SPACING } from "@/constants/theme";

interface StreakBadgeProps {
  streak: number;
}

/** "🔥 N day streak" pill, or a gentle nudge when there's no streak yet. */
export function StreakBadge({ streak }: StreakBadgeProps) {
  const hasStreak = streak > 0;
  return (
    <View style={[styles.badge, hasStreak ? styles.active : null]}>
      <Text style={styles.text}>
        {hasStreak
          ? `🔥 ${streak} day${streak === 1 ? "" : "s"} streak`
          : "Hit your goal to start a streak"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  active: {
    borderColor: COLORS.accent,
  },
  text: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
});
