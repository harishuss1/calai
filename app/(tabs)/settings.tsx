import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { COLORS, FONT_SIZE, RADIUS, SPACING } from "@/constants/theme";
import {
  autofillMacros,
  calcMaxCarbs,
  calcMaxFat,
  calcMaxProtein,
  validateMacros,
} from "@/constants/macros";
import type { CalorieGoalEstimate, MacroGoals } from "@/types";
import { useSettings } from "@/hooks/useSettings";
import { Button } from "@/components/Button";
import { CalorieBudgetBar } from "@/components/CalorieBudgetBar";
import { GoalWizardModal } from "@/components/GoalWizardModal";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { MacroGoalField } from "@/components/MacroGoalField";
import { NumberInput } from "@/components/NumberInput";
import { ValidationNotice } from "@/components/ValidationNotice";

export default function SettingsScreen() {
  const { goals, isLoading, saveGoals } = useSettings();
  const [draft, setDraft] = useState<MacroGoals | null>(null);
  const [savedAt, setSavedAt] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  useEffect(() => {
    if (!isLoading) setDraft(goals);
  }, [isLoading, goals]);

  // Changing protein or the calorie goal redistributes carbs + fat to use the
  // full budget; carbs and fat can still be overridden directly below.
  const setProtein = (protein_g: number) => {
    setDraft((d) => (d ? { ...d, ...autofillMacros(d.calories, protein_g) } : d));
    setSavedAt(false);
  };
  const setCalories = (calories: number) => {
    setDraft((d) => (d ? { calories, ...autofillMacros(calories, d.protein_g) } : d));
    setSavedAt(false);
  };
  const setMacro = (patch: Partial<MacroGoals>) => {
    setDraft((d) => (d ? { ...d, ...patch } : d));
    setSavedAt(false);
  };
  const applyEstimate = (e: CalorieGoalEstimate) => {
    setDraft({ calories: e.calories, protein_g: e.protein_g, carbs_g: e.carbs_g, fat_g: e.fat_g });
    setSavedAt(false);
  };

  const validation = useMemo(
    () => (draft ? validateMacros(draft.calories, draft.protein_g, draft.carbs_g, draft.fat_g) : null),
    [draft],
  );

  const handleSave = async () => {
    if (!draft || !validation?.isValid) return;
    await saveGoals(draft);
    setSavedAt(true);
  };

  if (!draft || !validation) return <LoadingOverlay visible message="Loading settings…" />;

  const maxProtein = calcMaxProtein(draft.calories, draft.carbs_g, draft.fat_g);
  const maxCarbs = calcMaxCarbs(draft.calories, draft.protein_g, draft.fat_g);
  const maxFat = calcMaxFat(draft.calories, draft.protein_g, draft.carbs_g);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Daily Goals</Text>

      <Button
        label="Help me find my goal"
        variant="secondary"
        icon="help-circle-outline"
        onPress={() => setIsWizardOpen(true)}
      />

      <View style={styles.card}>
        <NumberInput label="Calorie goal (kcal)" value={draft.calories} onChangeValue={setCalories} />
        <MacroGoalField
          kind="protein"
          label="Protein"
          grams={draft.protein_g}
          helper={`Max ${maxProtein}g with current carbs & fat`}
          hasError={draft.protein_g > maxProtein}
          onChangeGrams={setProtein}
        />
        <MacroGoalField
          kind="carbs"
          label="Carbs"
          grams={draft.carbs_g}
          helper={`Max ${maxCarbs}g with current protein & fat`}
          hasError={draft.carbs_g > maxCarbs}
          onChangeGrams={(carbs_g) => setMacro({ carbs_g })}
        />
        <MacroGoalField
          kind="fat"
          label="Fat"
          grams={draft.fat_g}
          helper={`Max ${maxFat}g with current protein & carbs`}
          hasError={draft.fat_g > maxFat}
          onChangeGrams={(fat_g) => setMacro({ fat_g })}
        />
        <CalorieBudgetBar
          proteinG={draft.protein_g}
          carbsG={draft.carbs_g}
          fatG={draft.fat_g}
          calorieGoal={draft.calories}
        />
      </View>

      <ValidationNotice kind="error" messages={validation.errors} />
      <ValidationNotice kind="warning" messages={validation.warnings} />

      <Button
        label={validation.isValid ? "Save Goals" : "Macros don't fit your calorie goal"}
        icon="save-outline"
        onPress={handleSave}
        disabled={!validation.isValid}
      />
      {savedAt ? <Text style={styles.saved}>Goals saved.</Text> : null}

      <GoalWizardModal
        visible={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onApply={applyEstimate}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, gap: SPACING.lg },
  heading: { fontSize: FONT_SIZE.xl, fontWeight: "800", color: COLORS.textPrimary },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  saved: { color: COLORS.accent, fontSize: FONT_SIZE.md, textAlign: "center" },
});
