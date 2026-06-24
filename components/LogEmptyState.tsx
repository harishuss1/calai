import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, FONT_SIZE, RADIUS, SPACING } from "@/constants/theme";

interface LogEmptyStateProps {
  onCamera: () => void;
  onManual: () => void;
}

/** Shown when the selected day has no meals: camera vs. manual entry cards. */
export function LogEmptyState({ onCamera, onManual }: LogEmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🍽️</Text>
      <Text style={styles.title}>Nothing logged yet</Text>
      <Text style={styles.subtitle}>What did you eat today?</Text>

      <View style={styles.cards}>
        <Pressable style={[styles.card, styles.cardPrimary]} onPress={onCamera}>
          <Ionicons name="camera" size={32} color={COLORS.accent} />
          <Text style={styles.cardLabel}>Log with Camera</Text>
        </Pressable>
        <Pressable style={[styles.card, styles.cardSecondary]} onPress={onManual}>
          <Ionicons name="create-outline" size={32} color={COLORS.textPrimary} />
          <Text style={styles.cardLabel}>Log Manually</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: SPACING.sm, paddingVertical: SPACING.xl },
  icon: { fontSize: 56 },
  title: { fontSize: FONT_SIZE.lg, fontWeight: "800", color: COLORS.textPrimary },
  subtitle: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  cards: { flexDirection: "row", gap: SPACING.md, width: "100%" },
  card: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,
    paddingVertical: SPACING.xl,
    alignItems: "center",
    gap: SPACING.sm,
    borderWidth: 1,
  },
  cardPrimary: { borderColor: COLORS.accent },
  cardSecondary: { borderColor: COLORS.border },
  cardLabel: { fontSize: FONT_SIZE.md, fontWeight: "700", color: COLORS.textPrimary },
});
