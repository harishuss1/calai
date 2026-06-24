import { Dimensions, StyleSheet, Text } from "react-native";
import { LineChart } from "react-native-chart-kit";

import { COLORS, FONT_SIZE, RADIUS, SPACING } from "@/constants/theme";
import type { WeightLog } from "@/types";
import { buildChartData } from "@/utils/weight";

interface WeightChartProps {
  logs: WeightLog[];
}

const CHART_WIDTH = Dimensions.get("window").width - SPACING.lg * 2;

/** Line chart of weight over time. Needs >= 2 points to render a trend. */
export function WeightChart({ logs }: WeightChartProps) {
  if (logs.length < 2) {
    return <Text style={styles.hint}>Log at least 2 weights to see your trend.</Text>;
  }

  const { labels, values, min, max } = buildChartData(logs);

  // A transparent helper dataset pins the y-axis to a 2kg-padded range,
  // since react-native-chart-kit has no direct min/max props.
  const padding = values.map((_, index) => (index === 0 ? min : max));

  return (
    <LineChart
      data={{
        labels,
        datasets: [
          { data: values, color: () => COLORS.accent },
          { data: padding, color: () => "transparent", withDots: false },
        ],
      }}
      width={CHART_WIDTH}
      height={240}
      yAxisSuffix=" kg"
      segments={4}
      formatYLabel={(value) => `${Math.round(Number(value))}`}
      chartConfig={{
        backgroundGradientFrom: COLORS.card,
        backgroundGradientTo: COLORS.card,
        decimalPlaces: 0,
        color: () => COLORS.accent,
        labelColor: () => COLORS.textSecondary,
        propsForDots: { r: "4", strokeWidth: "2", stroke: COLORS.accent },
      }}
      bezier
      style={styles.chart}
    />
  );
}

const styles = StyleSheet.create({
  chart: { borderRadius: RADIUS.card },
  hint: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    textAlign: "center",
    paddingVertical: SPACING.xl,
  },
});
