import { Image } from "expo-image";
import { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { COLORS, FONT_SIZE, RADIUS, SPACING } from "@/constants/theme";
import type { FoodItem, GeminiMealResponse, NewMeal } from "@/types";
import { sumItemMacros, toWholeNumber } from "@/utils/macros";
import { Button } from "@/components/Button";
import { FoodItemRow } from "@/components/FoodItemRow";
import { NumberInput } from "@/components/NumberInput";

interface ResultsCardProps {
  photoUri: string;
  result: GeminiMealResponse;
  isSaving: boolean;
  onSave: (meal: Omit<NewMeal, "photo_url">) => void;
  onRetake: () => void;
}

/** Editable nutrition card shown after Gemini analysis. All values correctable. */
export function ResultsCard({ photoUri, result, isSaving, onSave, onRetake }: ResultsCardProps) {
  const [mealName, setMealName] = useState(result.meal_name || "Meal");
  const [items, setItems] = useState<FoodItem[]>(result.items);
  const initialMacros = useMemo(() => sumItemMacros(result.items), [result.items]);
  const [protein, setProtein] = useState(toWholeNumber(initialMacros.protein_g));
  const [carbs, setCarbs] = useState(toWholeNumber(initialMacros.carbs_g));
  const [fat, setFat] = useState(toWholeNumber(initialMacros.fat_g));

  // Total calories are always derived from the (editable) per-item calories.
  const totalCalories = useMemo(() => toWholeNumber(sumItemMacros(items).calories), [items]);

  const updateItem = (index: number, patch: Partial<FoodItem>) => {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const handleSave = () => {
    onSave({
      name: mealName.trim() || "Meal",
      calories: totalCalories,
      protein_g: protein,
      carbs_g: carbs,
      fat_g: fat,
    });
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: photoUri }} style={styles.photo} contentFit="cover" />

      <Text style={styles.fieldLabel}>Meal name</Text>
      <TextInput style={styles.nameInput} value={mealName} onChangeText={setMealName} />

      <Text style={styles.fieldLabel}>Detected items</Text>
      <View style={styles.items}>
        {items.map((item, index) => (
          <FoodItemRow
            key={`${item.name}-${index}`}
            name={item.name}
            calories={item.calories}
            onChangeName={(name) => updateItem(index, { name })}
            onChangeCalories={(calories) => updateItem(index, { calories })}
          />
        ))}
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{totalCalories} kcal</Text>
      </View>

      <View style={styles.macroRow}>
        <NumberInput label="Protein (g)" value={protein} onChangeValue={setProtein} accentColor={COLORS.protein} />
        <NumberInput label="Carbs (g)" value={carbs} onChangeValue={setCarbs} accentColor={COLORS.carbs} />
        <NumberInput label="Fat (g)" value={fat} onChangeValue={setFat} accentColor={COLORS.fat} />
      </View>

      <View style={styles.actions}>
        <Button label="Save Meal" icon="checkmark" onPress={handleSave} isLoading={isSaving} />
        <Button label="Retake" variant="secondary" icon="camera-reverse-outline" onPress={onRetake} disabled={isSaving} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  photo: {
    width: "100%",
    height: 220,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.border,
  },
  fieldLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  nameInput: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
  },
  items: {
    gap: SPACING.sm,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  totalLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  totalValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "800",
    color: COLORS.accent,
  },
  macroRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  actions: {
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
});
