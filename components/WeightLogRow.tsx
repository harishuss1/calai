import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, FONT_SIZE, RADIUS, SPACING } from "@/constants/theme";
import type { WeightLog } from "@/types";
import { monthDayLabel } from "@/utils/date";

interface WeightLogRowProps {
  log: WeightLog;
  onDelete: (id: string) => void;
}

/** One weight history entry: date + weight, optional note. Swipe to delete. */
export function WeightLogRow({ log, onDelete }: WeightLogRowProps) {
  return (
    <Swipeable
      renderRightActions={() => (
        <Pressable style={styles.deleteAction} onPress={() => onDelete(log.id)}>
          <Ionicons name="trash-outline" size={22} color={COLORS.textPrimary} />
        </Pressable>
      )}
    >
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.date}>{monthDayLabel(log.logged_at)}</Text>
          {log.note ? (
            <Text style={styles.note} numberOfLines={1}>
              {log.note}
            </Text>
          ) : null}
        </View>
        <Text style={styles.weight}>{log.weight_kg} kg</Text>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  left: { flex: 1, gap: SPACING.xs },
  date: { fontSize: FONT_SIZE.md, fontWeight: "600", color: COLORS.textPrimary },
  note: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  weight: { fontSize: FONT_SIZE.lg, fontWeight: "700", color: COLORS.accent },
  deleteAction: {
    backgroundColor: COLORS.error,
    justifyContent: "center",
    alignItems: "center",
    width: 64,
    borderRadius: RADIUS.card,
    marginLeft: SPACING.sm,
  },
});
