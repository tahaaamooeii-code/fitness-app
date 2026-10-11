import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/theme/ThemeProvider";
import { radii } from "@/src/theme/tokens";

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
}

export function Checkbox({ checked, onToggle }: CheckboxProps) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onToggle} hitSlop={8}>
      <View
        style={[
          styles.box,
          {
            backgroundColor: checked ? colors.accent : "transparent",
            borderColor: checked ? colors.accent : colors.muted,
          },
        ]}
      >
        {checked && <Ionicons name="checkmark" size={16} color="#ffffff" />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 24,
    height: 24,
    borderRadius: radii.sm - 2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
