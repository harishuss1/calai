import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, FONT_SIZE, RADIUS, SPACING } from "@/constants/theme";

interface SegmentedControlProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}

/** Pill-style segmented selector. Reused for stats tabs and weight ranges. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.track}>
      {options.map((option) => {
        const isActive = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[styles.segment, isActive ? styles.segmentActive : null]}
          >
            <Text style={[styles.label, isActive ? styles.labelActive : null]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.pill,
    padding: SPACING.xs,
    gap: SPACING.xs,
  },
  segment: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: COLORS.accent,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  labelActive: {
    color: COLORS.background,
  },
});
