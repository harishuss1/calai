import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { COLORS, FONT_SIZE, RADIUS, SPACING } from "@/constants/theme";
import { calcCaloriesFromMacros } from "@/constants/macros";
import { saveMeal } from "@/services/supabase";
import { parseNumericInput, toWholeNumber } from "@/utils/macros";
import { Button } from "@/components/Button";
import { ValidationNotice } from "@/components/ValidationNotice";

interface ManualMealModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const MAX_NAME = 100;
const MISMATCH_THRESHOLD = 0.15;

/** Hand-enter a meal (no photo). Calories drive the row; macros are advisory. */
export function ManualMealModal({ visible, onClose, onSaved }: ManualMealModalProps) {
  const [name, setName] = useState("");
  const [caloriesText, setCaloriesText] = useState("");
  const [proteinText, setProteinText] = useState("");
  const [carbsText, setCarbsText] = useState("");
  const [fatText, setFatText] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const calories = parseNumericInput(caloriesText);
  const protein = parseNumericInput(proteinText);
  const carbs = parseNumericInput(carbsText);
  const fat = parseNumericInput(fatText);

  // Advisory only: warn if all macros are given but disagree with the calorie
  // field by more than 15%. The entered calories are always saved as-is.
  const warnings = useMemo(() => {
    if (protein <= 0 || carbs <= 0 || fat <= 0 || calories <= 0) return [];
    const macroKcal = toWholeNumber(calcCaloriesFromMacros(protein, carbs, fat));
    if (Math.abs(macroKcal - calories) / calories <= MISMATCH_THRESHOLD) return [];
    return [
      `Your macros add up to ${macroKcal} kcal but you entered ${calories} kcal. The calorie field will be used as-is.`,
    ];
  }, [protein, carbs, fat, calories]);

  const close = () => {
    setName("");
    setCaloriesText("");
    setProteinText("");
    setCarbsText("");
    setFatText("");
    setErrors([]);
    onClose();
  };

  const handleSubmit = async () => {
    const found: string[] = [];
    if (!name.trim()) found.push("Meal name is required.");
    else if (name.trim().length > MAX_NAME) found.push(`Meal name must be ${MAX_NAME} characters or fewer.`);
    if (calories < 1 || calories > 9999) found.push("Calories must be between 1 and 9999.");
    if (found.length > 0) {
      setErrors(found);
      return;
    }

    setIsSaving(true);
    const { error } = await saveMeal({
      name: name.trim(),
      calories: toWholeNumber(calories),
      protein_g: protein,
      carbs_g: carbs,
      fat_g: fat,
      photo_url: null,
      is_manual: true,
    });
    setIsSaving(false);

    if (error) {
      setErrors(["Couldn't save the meal. Check your connection and try again."]);
      return;
    }
    onSaved();
    close();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Log Manually</Text>

            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Meal name *" placeholderTextColor={COLORS.textSecondary} maxLength={MAX_NAME} />
            <TextInput style={styles.input} value={caloriesText} onChangeText={setCaloriesText} placeholder="Calories *" placeholderTextColor={COLORS.textSecondary} keyboardType="numeric" />
            <View style={styles.macroRow}>
              <TextInput style={[styles.input, styles.macroInput]} value={proteinText} onChangeText={setProteinText} placeholder="Protein g" placeholderTextColor={COLORS.textSecondary} keyboardType="numeric" />
              <TextInput style={[styles.input, styles.macroInput]} value={carbsText} onChangeText={setCarbsText} placeholder="Carbs g" placeholderTextColor={COLORS.textSecondary} keyboardType="numeric" />
              <TextInput style={[styles.input, styles.macroInput]} value={fatText} onChangeText={setFatText} placeholder="Fat g" placeholderTextColor={COLORS.textSecondary} keyboardType="numeric" />
            </View>

            <ValidationNotice kind="error" messages={errors} />
            <ValidationNotice kind="warning" messages={warnings} />

            <Button label="Save Meal" icon="checkmark" onPress={handleSubmit} isLoading={isSaving} />
            <Pressable onPress={close} style={styles.cancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.card,
    borderTopRightRadius: RADIUS.card,
    maxHeight: "90%",
  },
  content: { padding: SPACING.lg, gap: SPACING.md },
  title: { fontSize: FONT_SIZE.xl, fontWeight: "800", color: COLORS.textPrimary },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.md,
  },
  macroRow: { flexDirection: "row", gap: SPACING.sm },
  macroInput: { flex: 1 },
  cancel: { alignItems: "center", paddingVertical: SPACING.sm },
  cancelText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.md, fontWeight: "600" },
});
