import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { MadeByBadge } from "@/components/credit/MadeByBadge";
import { useTheme } from "@/src/theme/ThemeProvider";
import { spacing, radii } from "@/src/theme/tokens";
import type { ThemeMode } from "@/src/types/profile";

const OPTIONS: { mode: ThemeMode; label: string }[] = [
  { mode: "light", label: "روشن" },
  { mode: "dark", label: "تیره" },
  { mode: "system", label: "پیش‌فرض سیستم" },
];

export default function SettingsScreen() {
  const { colors, mode, setMode } = useTheme();

  return (
    <ScreenContainer>
      <AppText variant="heading" weight="bold">
        تنظیمات
      </AppText>

      <Card>
        <AppText variant="title" weight="medium">
          تم برنامه
        </AppText>
        <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
          {OPTIONS.map((opt) => (
            <Pressable
              key={opt.mode}
              onPress={() => setMode(opt.mode)}
              style={[
                styles.option,
                {
                  borderColor: mode === opt.mode ? colors.accent : colors.border,
                  backgroundColor:
                    mode === opt.mode ? colors.surfaceRaised : "transparent",
                },
              ]}
            >
              <AppText weight={mode === opt.mode ? "medium" : "regular"}>
                {opt.label}
              </AppText>
            </Pressable>
          ))}
        </View>
      </Card>

      <View style={{ marginTop: spacing.xl }}>
        <MadeByBadge />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  option: {
    borderWidth: 1.5,
    borderRadius: radii.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});
