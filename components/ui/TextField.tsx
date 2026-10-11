import React from "react";
import { TextInput, StyleSheet, View, type TextInputProps } from "react-native";
import { AppText } from "./AppText";
import { useTheme } from "@/src/theme/ThemeProvider";
import { radii, spacing } from "@/src/theme/tokens";

interface TextFieldProps extends TextInputProps {
  label?: string;
}

export function TextField({ label, style, ...rest }: TextFieldProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      {label ? (
        <AppText variant="muted" weight="medium">
          {label}
        </AppText>
      ) : null}
      <TextInput
        placeholderTextColor={colors.muted}
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.heading,
          },
          style,
        ]}
        textAlign="right"
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  input: {
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
  },
});
