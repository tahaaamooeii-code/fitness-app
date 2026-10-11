import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { AppText } from "@/components/ui/AppText";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { repos } from "@/src/repositories";
import { spacing } from "@/src/theme/tokens";
import type { FoodItem } from "@/src/types/nutrition";

export default function FoodDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [food, setFood] = useState<FoodItem | null>(null);
  const [nameLocal, setNameLocal] = useState("");
  const [protein, setProtein] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    repos.foods.getFoodById(id).then((f) => {
      setFood(f);
      if (f) {
        setNameLocal(f.nameLocal);
        setProtein(String(f.proteinPer100g));
      }
    });
  }, [id]);

  async function handleSave() {
    if (!food) return;
    setSaving(true);
    await repos.foods.updateFood(food.id, {
      nameLocal,
      proteinPer100g: Number(protein) || 0,
    });
    setSaving(false);
    router.back();
  }

  if (!food) {
    return (
      <ScreenContainer>
        <AppText variant="muted">در حال بارگذاری...</AppText>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AppText variant="heading" weight="bold">
        ویرایش اطلاعات غذا
      </AppText>
      {food.source === "ai-estimated" && (
        <AppText variant="muted">
          این مقدار تخمین هوش مصنوعی بود — اگر مطمئن نیستی، اصلاحش کن
        </AppText>
      )}
      <TextField label="نام" value={nameLocal} onChangeText={setNameLocal} />
      <TextField
        label="پروتیین به‌ازای هر ۱۰۰ گرم"
        value={protein}
        onChangeText={setProtein}
        keyboardType="numeric"
      />
      <View style={{ marginTop: spacing.md }}>
        <Button label="ذخیره" onPress={handleSave} loading={saving} />
      </View>
    </ScreenContainer>
  );
}
