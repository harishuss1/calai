import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { COLORS, FONT_SIZE, RADIUS, SPACING } from "@/constants/theme";
import { parseNumericInput } from "@/utils/macros";

interface FoodItemRowProps {
  name: string;
  calories: number;
  onChangeName: (name: string) => void;
  onChangeCalories: (calories: number) => void;
}

/** One editable detected food item: name + its calorie estimate. */
export function FoodItemRow({
  name,
  calories,
  onChangeName,
  onChangeCalories,
}: FoodItemRowProps) {
  const [caloriesText, setCaloriesText] = useState(String(calories));

  const handleCalories = (next: string) => {
    setCaloriesText(next);
    onChangeCalories(parseNumericInput(next));
  };

  return (
    <View style={styles.row}>
      <TextInput
        style={styles.nameInput}
        value={name}
        onChangeText={onChangeName}
        placeholder="Food item"
        placeholderTextColor={COLORS.textSecondary}
      />
      <TextInput
        style={styles.calInput}
        value={caloriesText}
        onChangeText={handleCalories}
        keyboardType="numeric"
        selectTextOnFocus
      />
      <Text style={styles.unit}>kcal</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  nameInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.md,
  },
  calInput: {
    width: 72,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.md,
    textAlign: "right",
  },
  unit: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    width: 32,
  },
});
