import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, FONT_SIZE, RADIUS, SPACING } from "@/constants/theme";

type ButtonVariant = "primary" | "secondary";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  isLoading?: boolean;
  disabled?: boolean;
}

/** App-wide button. `primary` is the green accent; `secondary` is outlined. */
export function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  isLoading = false,
  disabled = false,
}: ButtonProps) {
  const isPrimary = variant === "primary";
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={isPrimary ? COLORS.background : COLORS.accent} />
      ) : (
        <View style={styles.content}>
          {icon ? (
            <Ionicons
              name={icon}
              size={20}
              color={isPrimary ? COLORS.background : COLORS.accent}
            />
          ) : null}
          <Text style={[styles.label, isPrimary ? styles.labelPrimary : styles.labelSecondary]}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.card,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  primary: {
    backgroundColor: COLORS.accent,
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.4,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
  },
  labelPrimary: {
    color: COLORS.background,
  },
  labelSecondary: {
    color: COLORS.accent,
  },
});
