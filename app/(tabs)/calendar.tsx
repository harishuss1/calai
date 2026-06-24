import { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { COLORS, FONT_SIZE, SPACING } from "@/constants/theme";
import type { Meal } from "@/types";
import { friendlyDayLabel, todayString } from "@/utils/date";
import { currentMonth } from "@/utils/calendar";
import { sumMealMacros } from "@/utils/macros";
import { useMeals } from "@/hooks/useMeals";
import { useMonthMeals } from "@/hooks/useMonthMeals";
import { useSettings } from "@/hooks/useSettings";
import { DailyTotalsBar } from "@/components/DailyTotalsBar";
import { MealCard } from "@/components/MealCard";
import { MealDetailModal } from "@/components/MealDetailModal";
import { MonthCalendar } from "@/components/MonthCalendar";

export default function CalendarScreen() {
  const [month, setMonth] = useState(currentMonth());
  const [selectedDay, setSelectedDay] = useState(todayString());
  const [detail, setDetail] = useState<Meal | null>(null);
  const { goals } = useSettings();
  const { markers, refetch: refetchMonth } = useMonthMeals(month, goals.calories);
  const { meals, removeMeal } = useMeals(selectedDay);

  const totals = useMemo(() => sumMealMacros(meals), [meals]);

  const handleDelete = (id: string) => {
    removeMeal(id);
    refetchMonth();
  };

  return (
    <View style={styles.screen}>
      <FlatList
        data={meals}
        keyExtractor={(meal) => meal.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <MonthCalendar
              month={month}
              markers={markers}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
              onChangeMonth={setMonth}
            />
            <Text style={styles.dayLabel}>{friendlyDayLabel(selectedDay)}</Text>
            <DailyTotalsBar totals={totals} goals={goals} />
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>Nothing logged on this day.</Text>}
        renderItem={({ item }) => (
          <MealCard meal={item} onPress={setDetail} onDelete={handleDelete} />
        )}
      />

      <MealDetailModal meal={detail} onClose={() => setDetail(null)} onDelete={handleDelete} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, gap: SPACING.md },
  header: { gap: SPACING.md, marginBottom: SPACING.sm },
  dayLabel: { fontSize: FONT_SIZE.lg, fontWeight: "800", color: COLORS.textPrimary },
  empty: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    textAlign: "center",
    marginTop: SPACING.lg,
  },
});
