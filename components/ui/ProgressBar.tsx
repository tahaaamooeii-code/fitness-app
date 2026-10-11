import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/src/theme/ThemeProvider";

interface ProgressBarProps {
  progress: number; // 0..1
  height?: number;
}

export function ProgressBar({ progress, height = 10 }: ProgressBarProps) {
  const { colors } = useTheme();
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View
      style={[
        styles.track,
        { backgroundColor: colors.border, height, borderRadius: height / 2 },
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            backgroundColor:
              clamped >= 1 ? colors.success : colors.accent,
            width: `${clamped * 100}%`,
            height,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: "100%", overflow: "hidden" },
  fill: {},
});
