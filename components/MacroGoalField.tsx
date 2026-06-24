import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { COLORS, FONT_SIZE, RADIUS, SPACING } from "@/constants/theme";
import { KCAL_PER_GRAM } from "@/constants/macros";
import type { MacroKind } from "@/types";
import { parseNumericInput, toWholeNumber } from "@/utils/macros";

interface MacroGoalFieldProps {
  kind: MacroKind;
  label: string;
  grams: number;
  /** Grey helper line below the field (caller computes the text). */
  helper: string;
  /** When false, the value is shown read-only (e.g. auto-filled macros). */
  editable?: boolean;
  /** Required when editable; ignored otherwise. */
  onChangeGrams?: (grams: number) => void;
  /** Highlights the field red (e.g. value exceeds what the budget allows). */
  hasError?: boolean;
}

const ACCENT: Record<MacroKind, string> = {
  protein: COLORS.protein,
  carbs: COLORS.carbs,
  fat: COLORS.fat,
};

/** One macro goal row: "Protein — 150g = 600 kcal" + editable or read-only value. */
export function MacroGoalField({
  kind,
  label,
  grams,
  helper,
  editable = true,
  onChangeGrams,
  hasError = false,
}: MacroGoalFieldProps) {
  // Local text mirror lets an editable field be cleared mid-typing without
  // snapping back to 0. Read-only fields render straight from props instead.
  const [text, setText] = useState(String(grams));
  const kcal = toWholeNumber(grams * KCAL_PER_GRAM[kind]);

  // Resync when grams change externally (protein auto-fill, goal wizard) but
  // not from this field's own keystrokes, so typing is never interrupted.
  useEffect(() => {
    if (parseNumericInput(text) !== grams) setText(String(grams));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grams]);

  const handleChange = (next: string) => {
    setText(next);
    onChangeGrams?.(parseNumericInput(next));
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: ACCENT[kind] }]}>
        {label} — {toWholeNumber(grams)}g = {kcal} kcal
      </Text>
      {editable ? (
        <TextInput
          style={[styles.input, hasError ? styles.inputError : null]}
          value={text}
          onChangeText={handleChange}
          keyboardType="numeric"
          selectTextOnFocus
        />
      ) : (
        <View style={[styles.input, styles.readonly]}>
          <Text style={styles.readonlyValue}>{toWholeNumber(grams)}g</Text>
        </View>
      )}
      <Text style={styles.helper}>{helper}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: SPACING.xs },
  label: { fontSize: FONT_SIZE.sm, fontWeight: "700" },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.md,
  },
  inputError: { borderColor: COLORS.error },
  readonly: { backgroundColor: COLORS.card, justifyContent: "center" },
  readonlyValue: { color: COLORS.textSecondary, fontSize: FONT_SIZE.md },
  helper: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
});
