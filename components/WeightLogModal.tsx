import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput } from "react-native";

import { COLORS, FONT_SIZE, RADIUS, SPACING } from "@/constants/theme";
import { dateTimeLabel } from "@/utils/date";
import { parseNumericInput } from "@/utils/macros";
import { Button } from "@/components/Button";

interface WeightLogModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (weightKg: number, note?: string) => Promise<boolean>;
}

const MIN_KG = 20;
const MAX_KG = 500;

/** Bottom-sheet form for logging a body-weight entry. */
export function WeightLogModal({ visible, onClose, onSubmit }: WeightLogModalProps) {
  const [weightText, setWeightText] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const reset = () => {
    setWeightText("");
    setNote("");
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    const weight = parseNumericInput(weightText);
    if (weight < MIN_KG || weight > MAX_KG) {
      setError(`Enter a weight between ${MIN_KG} and ${MAX_KG} kg.`);
      return;
    }
    setIsSaving(true);
    const ok = await onSubmit(weight, note);
    setIsSaving(false);
    if (ok) handleClose();
    else setError("Couldn't save your weight. Try again.");
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>Log Weight</Text>
          <Text style={styles.timestamp}>Logging for: {dateTimeLabel(new Date())}</Text>

          <TextInput
            style={styles.input}
            value={weightText}
            onChangeText={setWeightText}
            keyboardType="decimal-pad"
            placeholder="Weight in kg"
            placeholderTextColor={COLORS.textSecondary}
            autoFocus
          />
          <TextInput
            style={styles.input}
            value={note}
            onChangeText={setNote}
            placeholder="e.g. After morning weigh-in"
            placeholderTextColor={COLORS.textSecondary}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button label="Log Weight" icon="checkmark" onPress={handleSubmit} isLoading={isSaving} />
          <Pressable onPress={handleClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
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
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  title: { fontSize: FONT_SIZE.xl, fontWeight: "800", color: COLORS.textPrimary },
  timestamp: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
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
  error: { color: COLORS.error, fontSize: FONT_SIZE.sm },
  cancel: { alignItems: "center", paddingVertical: SPACING.sm },
  cancelText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.md, fontWeight: "600" },
});
