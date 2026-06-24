import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, FONT_SIZE, RADIUS, SPACING } from "@/constants/theme";
import { todayString } from "@/utils/date";
import {
  WEEKDAY_LABELS,
  addMonths,
  buildMonthGrid,
  currentMonth,
  dayOfMonth,
  monthTitle,
  type CalendarMonth,
} from "@/utils/calendar";
import type { DayMarker } from "@/utils/streak";

interface MonthCalendarProps {
  month: CalendarMonth;
  markers: Map<string, DayMarker>;
  selectedDay: string;
  onSelectDay: (day: string) => void;
  onChangeMonth: (month: CalendarMonth) => void;
}

/** A tappable month grid. Days are dotted green (goal hit) or grey (logged). */
export function MonthCalendar({
  month,
  markers,
  selectedDay,
  onSelectDay,
  onChangeMonth,
}: MonthCalendarProps) {
  const cells = buildMonthGrid(month);
  const now = currentMonth();
  const atCurrentMonth = month.year === now.year && month.month === now.month;
  const today = todayString();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => onChangeMonth(addMonths(month, -1))} hitSlop={SPACING.sm}>
          <Ionicons name="chevron-back" size={24} color={COLORS.accent} />
        </Pressable>
        <Text style={styles.title}>{monthTitle(month)}</Text>
        <Pressable
          onPress={() => onChangeMonth(addMonths(month, 1))}
          hitSlop={SPACING.sm}
          disabled={atCurrentMonth}
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color={atCurrentMonth ? COLORS.textSecondary : COLORS.accent}
          />
        </Pressable>
      </View>

      <View style={styles.grid}>
        {WEEKDAY_LABELS.map((label, index) => (
          <Text key={`wd-${index}`} style={[styles.cell, styles.weekday]}>
            {label}
          </Text>
        ))}
        {cells.map((day, index) =>
          day === null ? (
            <View key={`blank-${index}`} style={styles.cell} />
          ) : (
            <Pressable
              key={day}
              style={[styles.cell, day === selectedDay ? styles.selected : null]}
              onPress={() => onSelectDay(day)}
            >
              <Text style={[styles.dayText, day === today ? styles.todayText : null]}>
                {dayOfMonth(day)}
              </Text>
              <View
                style={[
                  styles.dot,
                  markers.get(day) === "hit"
                    ? styles.dotHit
                    : markers.get(day) === "logged"
                      ? styles.dotLogged
                      : null,
                ]}
              />
            </Pressable>
          ),
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.sm,
  },
  title: { fontSize: FONT_SIZE.lg, fontWeight: "800", color: COLORS.textPrimary },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  weekday: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, fontWeight: "700" },
  selected: {
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: RADIUS.sm,
  },
  dayText: { fontSize: FONT_SIZE.md, color: COLORS.textPrimary },
  todayText: { color: COLORS.accent, fontWeight: "800" },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotHit: { backgroundColor: COLORS.accent },
  dotLogged: { backgroundColor: COLORS.textSecondary },
});
