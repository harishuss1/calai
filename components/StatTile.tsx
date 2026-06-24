import { StyleSheet, Text, View } from "react-native";

import { COLORS, FONT_SIZE, RADIUS, SPACING } from "@/constants/theme";

interface StatTileProps {
  label: string;
  value: number;
  unit?: string;
}

/** Compact stat readout used in the weekly summary row. */
export function StatTile({ label, value, unit = "kcal" }: StatTileProps) {
  return (
    <View style={styles.tile}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.unit}>{unit}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    alignItems: "center",
    gap: SPACING.xs,
  },
  value: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "800",
    color: COLORS.accent,
  },
  unit: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
});
