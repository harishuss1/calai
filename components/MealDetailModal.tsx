import { Image } from "expo-image";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { COLORS, FONT_SIZE, RADIUS, SPACING } from "@/constants/theme";
import type { Meal } from "@/types";
import { toWholeNumber } from "@/utils/macros";
import { Button } from "@/components/Button";
import { MacroBadge } from "@/components/MacroBadge";

interface MealDetailModalProps {
  meal: Meal | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

/** Full-detail view for a tapped meal, with a delete action. */
export function MealDetailModal({ meal, onClose, onDelete }: MealDetailModalProps) {
  if (!meal) return null;

  const handleDelete = () => {
    onDelete(meal.id);
    onClose();
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <ScrollView contentContainerStyle={styles.content}>
            {meal.photo_url ? (
              <Image source={{ uri: meal.photo_url }} style={styles.photo} contentFit="cover" />
            ) : null}
            <Text style={styles.name}>{meal.name}</Text>
            <Text style={styles.calories}>{toWholeNumber(meal.calories)} kcal</Text>
            <View style={styles.badges}>
              <MacroBadge kind="protein" grams={meal.protein_g} />
              <MacroBadge kind="carbs" grams={meal.carbs_g} />
              <MacroBadge kind="fat" grams={meal.fat_g} />
            </View>
            <View style={styles.actions}>
              <Button label="Delete Meal" variant="secondary" icon="trash-outline" onPress={handleDelete} />
              <Button label="Close" onPress={onClose} />
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.card,
    borderTopRightRadius: RADIUS.card,
    maxHeight: "85%",
  },
  content: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  photo: {
    width: "100%",
    height: 240,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.border,
  },
  name: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  calories: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.accent,
    fontWeight: "700",
  },
  badges: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  actions: {
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
});
