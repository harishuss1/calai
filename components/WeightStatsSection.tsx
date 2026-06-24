import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, FONT_SIZE, SPACING } from "@/constants/theme";
import { useWeightLogs } from "@/hooks/useWeightLogs";
import { WEIGHT_RANGES, computeDelta, filterByRange, type WeightRange } from "@/utils/weight";
import { Button } from "@/components/Button";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { SegmentedControl } from "@/components/SegmentedControl";
import { ValidationNotice } from "@/components/ValidationNotice";
import { WeightChart } from "@/components/WeightChart";
import { WeightHeader } from "@/components/WeightHeader";
import { WeightLogModal } from "@/components/WeightLogModal";
import { WeightLogRow } from "@/components/WeightLogRow";

const HISTORY_PREVIEW_COUNT = 10;

/** Weight tab: trend header, chart, range toggle, history list, log sheet. */
export function WeightStatsSection() {
  const { logs, isLoading, error, addWeight, removeWeight } = useWeightLogs();
  const [range, setRange] = useState<WeightRange>("1M");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const summary = computeDelta(logs);
  const rangedLogs = useMemo(() => filterByRange(logs, range), [logs, range]);
  const history = useMemo(() => [...logs].reverse(), [logs]);
  const visibleHistory = showAll ? history : history.slice(0, HISTORY_PREVIEW_COUNT);

  if (isLoading && logs.length === 0) {
    return <LoadingOverlay visible message="Loading weight…" />;
  }

  if (!summary) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>⚖️</Text>
        <Text style={styles.emptyTitle}>No weight logged yet</Text>
        <Text style={styles.emptySub}>Log your starting weight to begin tracking your progress.</Text>
        <Button label="Log Your Weight" icon="add" onPress={() => setIsModalOpen(true)} />
        <WeightLogModal visible={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={addWeight} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ValidationNotice kind="error" messages={error ? [error] : []} />
      <WeightHeader summary={summary} />
      <WeightChart logs={rangedLogs} />
      <SegmentedControl options={WEIGHT_RANGES} value={range} onChange={setRange} />

      <View style={styles.history}>
        {visibleHistory.map((log) => (
          <WeightLogRow key={log.id} log={log} onDelete={removeWeight} />
        ))}
        {history.length > HISTORY_PREVIEW_COUNT ? (
          <Button
            label={showAll ? "Show less" : `Show all (${history.length})`}
            variant="secondary"
            onPress={() => setShowAll((value) => !value)}
          />
        ) : null}
      </View>

      <Button label="Log Weight" icon="add" onPress={() => setIsModalOpen(true)} />
      <WeightLogModal visible={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={addWeight} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: SPACING.lg },
  history: { gap: SPACING.sm },
  empty: { alignItems: "center", gap: SPACING.md, paddingVertical: SPACING.xl },
  emptyIcon: { fontSize: 56 },
  emptyTitle: { fontSize: FONT_SIZE.lg, fontWeight: "800", color: COLORS.textPrimary },
  emptySub: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
});
