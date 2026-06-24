import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, FONT_SIZE, RADIUS, SPACING } from "@/constants/theme";
import { friendlyDayLabel, toDayString, todayString } from "@/utils/date";

interface DatePickerBarProps {
  day: string;
  onChange: (day: string) => void;
}

/** Prev/next day arrows + a tappable label that opens the native date picker. */
export function DatePickerBar({ day, onChange }: DatePickerBarProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const isToday = day === todayString();

  const shiftDay = (deltaDays: number) => {
    const date = new Date(`${day}T00:00:00`);
    date.setDate(date.getDate() + deltaDays);
    const next = toDayString(date);
    if (next <= todayString()) onChange(next);
  };

  const handlePicked = (event: DateTimePickerEvent, picked?: Date) => {
    setIsPickerOpen(false);
    if (event.type === "set" && picked) onChange(toDayString(picked));
  };

  return (
    <View style={styles.bar}>
      <Pressable onPress={() => shiftDay(-1)} hitSlop={SPACING.sm}>
        <Ionicons name="chevron-back" size={24} color={COLORS.accent} />
      </Pressable>

      <Pressable onPress={() => setIsPickerOpen(true)}>
        <Text style={styles.label}>{friendlyDayLabel(day)}</Text>
      </Pressable>

      <Pressable onPress={() => shiftDay(1)} hitSlop={SPACING.sm} disabled={isToday}>
        <Ionicons
          name="chevron-forward"
          size={24}
          color={isToday ? COLORS.textSecondary : COLORS.accent}
        />
      </Pressable>

      {isPickerOpen && Platform.OS !== "web" ? (
        <DateTimePicker
          value={new Date(`${day}T00:00:00`)}
          mode="date"
          maximumDate={new Date()}
          onChange={handlePicked}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
});
