import React from "react";
import {
  Pressable,
  StyleSheet,
  ActivityIndicator,
  type PressableProps,
} from "react-native";
import { AppText } from "./AppText";
import { useTheme } from "@/src/theme/ThemeProvider";
import { radii, spacing } from "@/src/theme/tokens";

interface ButtonProps extends Omit<PressableProps, "style"> {
  label: string;
  variant?: "primary" | "secondary" | "destructive";
  loading?: boolean;
}

export function Button({
  label,
  variant = "primary",
  loading = false,
  disabled,
  ...rest
}: ButtonProps) {
  const { colors } = useTheme();

  const bg =
    variant === "primary"
      ? colors.accent
      : variant === "destructive"
      ? colors.destructive
      : "transparent";

  const textColor = variant === "secondary" ? colors.accent : "#ffffff";

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          borderColor: variant === "secondary" ? colors.accent : "transparent",
          borderWidth: variant === "secondary" ? 1.5 : 0,
          opacity: pressed || disabled ? 0.7 : 1,
        },
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <AppText weight="medium" style={{ color: textColor }}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
  },
});
