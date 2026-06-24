import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { COLORS, FONT_SIZE, RADIUS, SPACING } from "@/constants/theme";
import { estimateCalorieGoal } from "@/services/gemini";
import type {
  ActivityLevel,
  CalorieGoalEstimate,
  Sex,
  WeightGoal,
} from "@/types";
import { parseNumericInput } from "@/utils/macros";
import { Button } from "@/components/Button";
import { SegmentedControl } from "@/components/SegmentedControl";
import { ValidationNotice } from "@/components/ValidationNotice";

interface GoalWizardModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (estimate: CalorieGoalEstimate) => void;
}

const SEXES: Sex[] = ["Male", "Female"];
const ACTIVITIES: ActivityLevel[] = ["Sedentary", "Light", "Moderate", "Active"];
const GOALS: WeightGoal[] = ["Lose", "Maintain", "Gain"];

/** Guided questionnaire that asks Gemini for a recommended calorie goal. */
export function GoalWizardModal({ visible, onClose, onApply }: GoalWizardModalProps) {
  const [sex, setSex] = useState<Sex>("Male");
  const [activity, setActivity] = useState<ActivityLevel>("Moderate");
  const [goal, setGoal] = useState<WeightGoal>("Maintain");
  const [ageText, setAgeText] = useState("");
  const [heightText, setHeightText] = useState("");
  const [weightText, setWeightText] = useState("");
  const [estimate, setEstimate] = useState<CalorieGoalEstimate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const close = () => {
    setEstimate(null);
    setError(null);
    onClose();
  };

  const handleCalculate = async () => {
    const age = parseNumericInput(ageText);
    const heightCm = parseNumericInput(heightText);
    const weightKg = parseNumericInput(weightText);
    if (age < 1 || age > 120 || heightCm < 50 || heightCm > 260 || weightKg < 20 || weightKg > 500) {
      setError("Enter a realistic age, height (cm), and weight (kg).");
      return;
    }
    setError(null);
    setIsLoading(true);
    const { data, error: estimateError } = await estimateCalorieGoal({
      sex,
      age,
      heightCm,
      weightKg,
      activity,
      goal,
    });
    setIsLoading(false);
    if (estimateError || !data) setError(estimateError ?? "Couldn't estimate your goal.");
    else setEstimate(data);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Find your goal</Text>

            <Text style={styles.fieldLabel}>Sex</Text>
            <SegmentedControl options={SEXES} value={sex} onChange={setSex} />

            <View style={styles.row}>
              <TextInput style={styles.input} value={ageText} onChangeText={setAgeText} placeholder="Age" placeholderTextColor={COLORS.textSecondary} keyboardType="numeric" />
              <TextInput style={styles.input} value={heightText} onChangeText={setHeightText} placeholder="Height cm" placeholderTextColor={COLORS.textSecondary} keyboardType="numeric" />
              <TextInput style={styles.input} value={weightText} onChangeText={setWeightText} placeholder="Weight kg" placeholderTextColor={COLORS.textSecondary} keyboardType="numeric" />
            </View>

            <Text style={styles.fieldLabel}>Activity level</Text>
            <SegmentedControl options={ACTIVITIES} value={activity} onChange={setActivity} />

            <Text style={styles.fieldLabel}>Goal</Text>
            <SegmentedControl options={GOALS} value={goal} onChange={setGoal} />

            <ValidationNotice kind="error" messages={error ? [error] : []} />

            {estimate ? (
              <View style={styles.result}>
                <Text style={styles.resultCalories}>{estimate.calories} kcal/day</Text>
                <Text style={styles.resultProtein}>
                  Protein {estimate.protein_g}g · Carbs {estimate.carbs_g}g · Fat {estimate.fat_g}g
                </Text>
                <Text style={styles.resultRationale}>{estimate.rationale}</Text>
                <Button label="Use this goal" icon="checkmark" onPress={() => { onApply(estimate); close(); }} />
              </View>
            ) : (
              <Button label="Calculate" icon="sparkles" onPress={handleCalculate} isLoading={isLoading} />
            )}

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
  fieldLabel: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, fontWeight: "600" },
  row: { flexDirection: "row", gap: SPACING.sm },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.md,
  },
  result: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.card,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  resultCalories: { fontSize: FONT_SIZE.xl, fontWeight: "800", color: COLORS.accent },
  resultProtein: { fontSize: FONT_SIZE.md, color: COLORS.textPrimary, fontWeight: "600" },
  resultRationale: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  cancel: { alignItems: "center", paddingVertical: SPACING.sm },
  cancelText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.md, fontWeight: "600" },
});
