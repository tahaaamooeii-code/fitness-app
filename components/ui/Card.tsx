import React from "react";
import { View, StyleSheet, type ViewProps } from "react-native";
import { useTheme } from "@/src/theme/ThemeProvider";
import { radii, spacing } from "@/src/theme/tokens";

export function Card({ style, ...rest }: ViewProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.base,
        { backgroundColor: colors.surface, borderColor: colors.border },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
  },
});
