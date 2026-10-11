import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { repos } from "@/src/repositories";
import { useTheme } from "@/src/theme/ThemeProvider";

export default function Index() {
  const { colors } = useTheme();
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    repos.settings.getSettings().then((s) => {
      setTarget(s.onboardingCompleted ? "/(tabs)/nutrition" : "/onboarding/welcome");
    });
  }, []);

  if (!target) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return <Redirect href={target as any} />;
}
