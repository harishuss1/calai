import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { COLORS, FONT_SIZE, SPACING } from "@/constants/theme";

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

/** Full-screen dimmed spinner shown during analysis/saving. */
export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  if (!visible) return null;
  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color={COLORS.accent} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.md,
    zIndex: 10,
  },
  message: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.md,
  },
});
