import { StyleSheet, Text, View } from "react-native";

import { COLORS, FONT_SIZE, RADIUS, SPACING } from "@/constants/theme";

type NoticeKind = "error" | "warning";

interface ValidationNoticeProps {
  kind: NoticeKind;
  messages: string[];
}

const ICON: Record<NoticeKind, string> = { error: "❌", warning: "⚠️" };
const TINT: Record<NoticeKind, string> = { error: COLORS.error, warning: COLORS.warning };

/** Red (blocking) or yellow (advisory) box listing validation messages. */
export function ValidationNotice({ kind, messages }: ValidationNoticeProps) {
  if (messages.length === 0) return null;
  const color = TINT[kind];

  return (
    <View style={[styles.box, { borderColor: color, backgroundColor: `${color}1a` }]}>
      {messages.map((message) => (
        <Text key={message} style={styles.message}>
          {ICON[kind]} {message}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  message: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
});
