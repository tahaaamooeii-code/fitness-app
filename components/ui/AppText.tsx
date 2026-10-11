import React from "react";
import { Text, type TextProps, StyleSheet } from "react-native";
import { useTheme } from "@/src/theme/ThemeProvider";

interface AppTextProps extends TextProps {
  variant?: "body" | "heading" | "title" | "muted" | "accent";
  weight?: "regular" | "medium" | "bold";
}

export function AppText({
  variant = "body",
  weight = "regular",
  style,
  ...rest
}: AppTextProps) {
  const { colors } = useTheme();

  const colorMap = {
    body: colors.body,
    heading: colors.heading,
    title: colors.heading,
    muted: colors.muted,
    accent: colors.accent,
  };

  const sizeMap = {
    body: 15,
    heading: 22,
    title: 17,
    muted: 13,
    accent: 15,
  };

  const isDisplay = variant === "heading" || variant === "title";

  const fontFamilyMap = isDisplay
    ? {
        regular: "MarkaziText_400Regular",
        medium: "MarkaziText_500Medium",
        bold: "MarkaziText_700Bold",
      }
    : {
        regular: "Vazirmatn_400Regular",
        medium: "Vazirmatn_600SemiBold",
        bold: "Vazirmatn_700Bold",
      };

  return (
    <Text
      style={[
        styles.base,
        {
          color: colorMap[variant],
          fontSize: sizeMap[variant],
          fontFamily: fontFamilyMap[weight],
        },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    textAlign: "right",
    writingDirection: "rtl",
  },
});
