import { StyleSheet, Text, View } from "react-native";

import { COLORS, FONT_SIZE, RADIUS, SPACING } from "@/constants/theme";
import type { MacroKind } from "@/types";
import { formatGrams } from "@/utils/macros";

interface MacroBadgeProps {
  kind: MacroKind;
  grams: number;
}

const LABEL: Record<MacroKind, string> = {
  protein: "P",
  carbs: "C",
  fat: "F",
};

const COLOR: Record<MacroKind, string> = {
  protein: COLORS.protein,
  carbs: COLORS.carbs,
  fat: COLORS.fat,
};

/** Colored pill showing a macro letter + gram value. */
export function MacroBadge({ kind, grams }: MacroBadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: `${COLOR[kind]}22`, borderColor: COLOR[kind] }]}>
      <Text style={[styles.label, { color: COLOR[kind] }]}>{LABEL[kind]}</Text>
      <Text style={styles.value}>{formatGrams(grams)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "700",
  },
  value: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
});
