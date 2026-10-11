import React, { useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { AppText } from "@/components/ui/AppText";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { repos } from "@/src/repositories";
import { spacing } from "@/src/theme/tokens";
import type { UserProfile } from "@/src/types/profile";

export default function ProteinGoalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name: string;
    photoUri: string;
    heightCm: string;
    weightKg: string;
  }>();
  const [target, setTarget] = useState("150");
  const [saving, setSaving] = useState(false);

  async function handleFinish() {
    const targetGrams = Number(target) || 0;
    if (targetGrams <= 0) return;
    setSaving(true);

    const now = new Date().toISOString();
    const profile: UserProfile = {
      name: params.name || "",
      photoUri: params.photoUri || undefined,
      heightCm: params.heightCm ? Number(params.heightCm) : undefined,
      weightKg: params.weightKg ? Number(params.weightKg) : undefined,
      dailyProteinTargetGrams: targetGrams,
      createdAt: now,
      updatedAt: now,
    };

    await repos.profile.saveProfile(profile);
    await repos.foodLog.setGoal(targetGrams);
    await repos.settings.saveSettings({ onboardingCompleted: true });

    router.replace("/(tabs)/nutrition");
  }

  return (
    <ScreenContainer>
      <AppText variant="heading" weight="bold" style={{ marginTop: spacing.lg }}>
        هدف روزانه پروتیینت چقدره؟
      </AppText>
      <AppText variant="muted">
        این عدد رو می‌تونی بعداً هم از پروفایل تغییر بدی
      </AppText>

      <TextField
        label="پروتیین هدف روزانه (گرم)"
        value={target}
        onChangeText={setTarget}
        keyboardType="numeric"
      />

      <View style={{ marginTop: spacing.lg }}>
        <Button label="بزن بریم!" onPress={handleFinish} loading={saving} />
      </View>
    </ScreenContainer>
  );
}
