import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, FONT_SIZE, RADIUS, SPACING } from "@/constants/theme";
import type { Meal } from "@/types";
import { toWholeNumber } from "@/utils/macros";
import { MacroBadge } from "@/components/MacroBadge";

interface MealCardProps {
  meal: Meal;
  onPress: (meal: Meal) => void;
  onDelete: (id: string) => void;
}

/** A single meal row: thumbnail, name, calories, macro pills. Swipe to delete. */
export function MealCard({ meal, onPress, onDelete }: MealCardProps) {
  return (
    <Swipeable
      renderRightActions={() => (
        <Pressable style={styles.deleteAction} onPress={() => onDelete(meal.id)}>
          <Ionicons name="trash-outline" size={24} color={COLORS.textPrimary} />
        </Pressable>
      )}
    >
      <Pressable style={styles.card} onPress={() => onPress(meal)}>
        {meal.photo_url ? (
          <Image source={{ uri: meal.photo_url }} style={styles.thumb} contentFit="cover" />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]}>
            <Ionicons name="restaurant-outline" size={24} color={COLORS.textSecondary} />
          </View>
        )}
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={1}>
              {meal.name}
            </Text>
            {meal.is_manual ? (
              <View style={styles.manualPill}>
                <Text style={styles.manualText}>Manual</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.calories}>{toWholeNumber(meal.calories)} kcal</Text>
          <View style={styles.badges}>
            <MacroBadge kind="protein" grams={meal.protein_g} />
            <MacroBadge kind="carbs" grams={meal.carbs_g} />
            <MacroBadge kind="fat" grams={meal.fat_g} />
          </View>
        </View>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.border,
  },
  thumbPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    gap: SPACING.xs,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  name: {
    flexShrink: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  manualPill: {
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  manualText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  calories: {
    fontSize: FONT_SIZE.md,
    color: COLORS.accent,
    fontWeight: "600",
  },
  badges: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  deleteAction: {
    backgroundColor: COLORS.error,
    justifyContent: "center",
    alignItems: "center",
    width: 72,
    borderRadius: RADIUS.card,
    marginLeft: SPACING.sm,
  },
});
