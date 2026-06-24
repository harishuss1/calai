import { Dimensions, StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-chart-kit";

import { COLORS, FONT_SIZE, RADIUS, SPACING } from "@/constants/theme";
import { useWeeklyStats } from "@/hooks/useWeeklyStats";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { StatTile } from "@/components/StatTile";

const CHART_WIDTH = Dimensions.get("window").width - SPACING.lg * 2;

/** Weekly calorie overview: average/highest/lowest tiles + 7-day bar chart. */
export function CalorieStatsSection() {
  const { stats, isLoading, error } = useWeeklyStats();
  const hasData = stats.caloriesByDay.some((value) => value > 0);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Last 7 days</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.summaryRow}>
        <StatTile label="Average" value={stats.average} />
        <StatTile label="Highest" value={stats.highest} />
        <StatTile label="Lowest" value={stats.lowest} />
      </View>

      {hasData ? (
        <BarChart
          data={{ labels: stats.labels, datasets: [{ data: stats.caloriesByDay }] }}
          width={CHART_WIDTH}
          height={240}
          fromZero
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundGradientFrom: COLORS.card,
            backgroundGradientTo: COLORS.card,
            decimalPlaces: 0,
            color: () => COLORS.accent,
            labelColor: () => COLORS.textSecondary,
            barPercentage: 0.6,
          }}
          style={styles.chart}
        />
      ) : (
        <Text style={styles.empty}>Log some meals to see your weekly chart.</Text>
      )}

      <LoadingOverlay visible={isLoading && !hasData} message="Loading stats…" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: SPACING.lg },
  heading: { fontSize: FONT_SIZE.xl, fontWeight: "800", color: COLORS.textPrimary },
  summaryRow: { flexDirection: "row", gap: SPACING.sm },
  chart: { borderRadius: RADIUS.card },
  error: { color: COLORS.error, fontSize: FONT_SIZE.md },
  empty: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    textAlign: "center",
    marginTop: SPACING.xl,
  },
});
