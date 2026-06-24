import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { COLORS, SPACING } from "@/constants/theme";
import { CalorieStatsSection } from "@/components/CalorieStatsSection";
import { SegmentedControl } from "@/components/SegmentedControl";
import { WeightStatsSection } from "@/components/WeightStatsSection";

const TABS = ["Calories", "Weight"] as const;
type StatsTab = (typeof TABS)[number];

export default function StatsScreen() {
  const [tab, setTab] = useState<StatsTab>("Calories");

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <SegmentedControl options={TABS} value={tab} onChange={setTab} />
        {tab === "Calories" ? <CalorieStatsSection /> : <WeightStatsSection />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, gap: SPACING.lg },
});
