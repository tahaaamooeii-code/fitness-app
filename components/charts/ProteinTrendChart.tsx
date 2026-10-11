import React from "react";
import { View, StyleSheet } from "react-native";
import { CartesianChart, Line, Bar } from "victory-native";
import { useTheme } from "@/src/theme/ThemeProvider";
import { AppText } from "../ui/AppText";
import type { DailyProteinTotal } from "@/src/types/nutrition";

interface ProteinTrendChartProps {
  data: DailyProteinTotal[];
  goalGrams: number;
  height?: number;
}

export function ProteinTrendChart({
  data,
  goalGrams,
  height = 220,
}: ProteinTrendChartProps) {
  const { colors } = useTheme();

  if (data.length === 0) {
    return (
      <View style={[styles.empty, { height }]}>
        <AppText variant="muted">هنوز داده‌ای برای نمایش نیست</AppText>
      </View>
    );
  }

  const chartData = data.map((d, i) => ({
    x: i,
    protein: d.totalProtein,
    goal: goalGrams,
  }));

  return (
    <View style={{ height }}>
      <CartesianChart
        data={chartData}
        xKey="x"
        yKeys={["protein", "goal"]}
        domainPadding={{ left: 16, right: 16, top: 16, bottom: 4 }}
        axisOptions={{
          labelColor: colors.muted,
          lineColor: colors.border,
        }}
      >
        {({ points, chartBounds }) => (
          <>
            <Bar
              points={points.protein}
              chartBounds={chartBounds}
              color={colors.accent}
              roundedCorners={{ topLeft: 4, topRight: 4 }}
              barWidth={Math.max(8, 220 / chartData.length - 10)}
            />
            <Line
              points={points.goal}
              color={colors.secondaryAccent}
              strokeWidth={2}
              curveType="linear"
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
