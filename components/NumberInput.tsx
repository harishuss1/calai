import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { COLORS, FONT_SIZE, RADIUS, SPACING } from "@/constants/theme";
import { parseNumericInput } from "@/utils/macros";

interface NumberInputProps {
  label: string;
  value: number;
  onChangeValue: (value: number) => void;
  accentColor?: string;
}

/** Labeled numeric TextInput for correcting calorie/macro estimates. */
export function NumberInput({ label, value, onChangeValue, accentColor }: NumberInputProps) {
  // Local text mirror lets the user clear the field mid-edit without it
  // snapping back to 0 on every keystroke.
  const [text, setText] = useState(String(value));

  // Resync only when the value changes for an EXTERNAL reason (auto-fill,
  // wizard) — not from the user's own keystrokes, so in-progress text is kept.
  useEffect(() => {
    if (parseNumericInput(text) !== value) setText(String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (next: string) => {
    setText(next);
    onChangeValue(parseNumericInput(next));
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, accentColor ? { color: accentColor } : null]}>{label}</Text>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={handleChange}
        keyboardType="numeric"
        selectTextOnFocus
        placeholderTextColor={COLORS.textSecondary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
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
});
