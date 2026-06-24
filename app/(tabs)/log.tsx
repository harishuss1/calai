import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";

import { COLORS, FONT_SIZE, RADIUS, SPACING } from "@/constants/theme";
import type { Meal } from "@/types";
import { todayString } from "@/utils/date";
import { sumMealMacros } from "@/utils/macros";
import { useMeals } from "@/hooks/useMeals";
import { useSettings } from "@/hooks/useSettings";
import { useStreak } from "@/hooks/useStreak";
import { DailyTotalsBar } from "@/components/DailyTotalsBar";
import { DatePickerBar } from "@/components/DatePickerBar";
import { LogEmptyState } from "@/components/LogEmptyState";
import { ManualMealModal } from "@/components/ManualMealModal";
import { MealCard } from "@/components/MealCard";
import { MealDetailModal } from "@/components/MealDetailModal";
import { StreakBadge } from "@/components/StreakBadge";

export default function LogScreen() {
  const router = useRouter();
  const [day, setDay] = useState(todayString());
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const { meals, isLoading, error, refetch, removeMeal } = useMeals(day);
  const { goals } = useSettings();
  const { streak } = useStreak(goals.calories);

  const totals = useMemo(() => sumMealMacros(meals), [meals]);

  // Refresh when returning to the tab (e.g. after saving from the camera).
  useFocusEffect(useCallback(() => void refetch(), [refetch]));

  return (
    <View style={styles.screen}>
      <FlatList
        data={meals}
        keyExtractor={(meal) => meal.id}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={COLORS.accent} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <StreakBadge streak={streak} />
            <DatePickerBar day={day} onChange={setDay} />
            <DailyTotalsBar totals={totals} goals={goals} />
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <LogEmptyState onCamera={() => router.push("/")} onManual={() => setIsManualOpen(true)} />
          ) : null
        }
        renderItem={({ item }) => (
          <MealCard meal={item} onPress={setSelectedMeal} onDelete={removeMeal} />
        )}
      />

      <Pressable style={styles.fab} onPress={() => setIsManualOpen(true)}>
        <Ionicons name="create-outline" size={26} color={COLORS.background} />
      </Pressable>

      <MealDetailModal
        meal={selectedMeal}
        onClose={() => setSelectedMeal(null)}
        onDelete={removeMeal}
      />
      <ManualMealModal
        visible={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        onSaved={refetch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, gap: SPACING.md },
  header: { gap: SPACING.md, marginBottom: SPACING.md },
  error: { color: COLORS.error, fontSize: FONT_SIZE.sm },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    elevation: 6,
  },
});
