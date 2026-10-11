import React from "react";
import { View, StyleSheet } from "react-native";
import { CartesianChart, Line, Scatter } from "victory-native";
import { useTheme } from "@/src/theme/ThemeProvider";
import { AppText } from "../ui/AppText";
import type { WorkoutSetLog, PersonalRecord } from "@/src/types/workout";

interface WeightProgressionChartProps {
  setLogs: WorkoutSetLog[];
  personalRecords: PersonalRecord[];
  height?: number;
}

export function WeightProgressionChart({
  setLogs,
  personalRecords,
  height = 220,
}: WeightProgressionChartProps) {
  const { colors } = useTheme();

  const bestPerDate = new Map<string, number>();
  for (const log of setLogs) {
    const current = bestPerDate.get(log.date) ?? 0;
    if (log.weightKg > current) bestPerDate.set(log.date, log.weightKg);
  }
  const sortedDates = Array.from(bestPerDate.keys()).sort();

  if (sortedDates.length === 0) {
    return (
      <View style={[styles.empty, { height }]}>
        <AppText variant="muted">هنوز رکوردی ثبت نشده</AppText>
      </View>
    );
  }

  const prDates = new Set(personalRecords.map((p) => p.date));
  const chartData = sortedDates.map((date, i) => ({
    x: i,
    weight: bestPerDate.get(date) ?? 0,
    prWeight: prDates.has(date) ? bestPerDate.get(date) ?? 0 : null,
  }));

  return (
    <View style={{ height }}>
      <CartesianChart
        data={chartData}
        xKey="x"
        yKeys={["weight", "prWeight"]}
        domainPadding={{ left: 16, right: 16, top: 24, bottom: 16 }}
        axisOptions={{ labelColor: colors.muted, lineColor: colors.border }}
      >
        {({ points }) => (
          <>
            <Line
              points={points.weight}
              color={colors.accent}
              strokeWidth={2.5}
              curveType="linear"
            />
            <Scatter
              points={points.prWeight}
              shape="circle"
              radius={6}
              color={colors.secondaryAccent}
            />
          </>
        )}
      </CartesianChart>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: "center", justifyContent: "center" },
});
