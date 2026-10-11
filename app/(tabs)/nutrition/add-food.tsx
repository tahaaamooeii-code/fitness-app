import React, { useEffect, useState } from "react";
import { View, FlatList, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { AppText } from "@/components/ui/AppText";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/src/theme/ThemeProvider";
import { repos } from "@/src/repositories";
import { searchFoods } from "@/src/utils/foodMatch";
import { todayBucket } from "@/src/utils/dateBuckets";
import { estimateProteinFromText } from "@/src/services/proteinEstimation";
import { GeminiNotConfiguredError } from "@/src/services/geminiClient";
import { spacing } from "@/src/theme/tokens";
import type { FoodItem } from "@/src/types/nutrition";

export default function AddFoodScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [allFoods, setAllFoods] = useState<FoodItem[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState("100");

  const [description, setDescription] = useState("");
  const [estimating, setEstimating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [creatingCustom, setCreatingCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customProtein, setCustomProtein] = useState("");
  const [savingCustom, setSavingCustom] = useState(false);

  useEffect(() => {
    repos.foods.getAllFoods().then(setAllFoods);
  }, []);

  const results = searchFoods(query, allFoods).slice(0, 20);

  async function confirmAdd(food: FoodItem, gramsValue: number) {
    const proteinGrams = (food.proteinPer100g * gramsValue) / 100;
    await repos.foodLog.addEntry({
      foodId: food.id,
      date: todayBucket(),
      grams: gramsValue,
      proteinGrams,
    });
    router.back();
  }

  function selectFood(food: FoodItem) {
    setSelected(food);
    setGrams(String(food.standardServing?.grams ?? 100));
  }

  async function handleCreateCustomFood() {
    if (!customName.trim() || !customProtein) return;
    setSavingCustom(true);
    const food = await repos.foods.addCustomFood({
      name: customName.trim(),
      nameLocal: customName.trim(),
      category: "other",
      proteinPer100g: Number(customProtein) || 0,
      source: "custom",
    });
    setSavingCustom(false);
    setCreatingCustom(false);
    setCustomName("");
    setCustomProtein("");
    setAllFoods((prev) => [...prev, food]);
    selectFood(food);
  }

  async function handleEstimate() {
    if (!description.trim()) return;
    setEstimating(true);
    setError(null);
    try {
      const results = await estimateProteinFromText(description);
      for (const r of results) {
        await repos.foodLog.addEntry({
          foodId: r.food.id,
          date: todayBucket(),
          grams: r.grams,
          proteinGrams: r.proteinGrams,
          note: description,
        });
      }
      router.back();
    } catch (e) {
      if (e instanceof GeminiNotConfiguredError) {
        setError("کلید Gemini تنظیم نشده. اول از پروفایل > تنظیمات، یا فایل .env اضافه‌اش کن.");
      } else {
        setError("مشکلی پیش اومد، دوباره امتحان کن.");
      }
    } finally {
      setEstimating(false);
    }
  }

  if (selected) {
    return (
      <ScreenContainer>
        <AppText variant="heading" weight="bold">
          {selected.nameLocal}
        </AppText>
        <AppText variant="muted">
          {selected.proteinPer100g} گرم پروتیین به‌ازای هر ۱۰۰ گرم
        </AppText>
        <TextField
          label="مقدار مصرفی (گرم)"
          value={grams}
          onChangeText={setGrams}
          keyboardType="numeric"
        />
        <AppText variant="accent" weight="medium">
          {((selected.proteinPer100g * (Number(grams) || 0)) / 100).toFixed(1)} گرم پروتیین
        </AppText>
        <View style={{ flexDirection: "row-reverse", gap: spacing.sm, marginTop: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Button label="بازگشت" variant="secondary" onPress={() => setSelected(null)} />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              label="افزودن"
              onPress={() => confirmAdd(selected, Number(grams) || 0)}
            />
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll={false}>
      <AppText variant="heading" weight="bold">
        افزودن غذا
      </AppText>

      <Card>
        <AppText variant="title" weight="medium">
          توضیح بده چی خوردی
        </AppText>
        <View style={{ marginTop: spacing.sm }}>
          <TextField
            value={description}
            onChangeText={setDescription}
            placeholder="مثلاً: ۲ تا تخم‌مرغ آب‌پز و یه سینه مرغ"
            multiline
          />
        </View>
        {error && (
          <AppText style={{ color: colors.destructive, marginTop: spacing.xs }}>
            {error}
          </AppText>
        )}
        <View style={{ marginTop: spacing.sm }}>
          <Button
            label="تخمین با هوش مصنوعی"
            variant="secondary"
            onPress={handleEstimate}
            loading={estimating}
          />
        </View>
      </Card>

      {creatingCustom ? (
        <Card>
          <AppText variant="title" weight="medium">
            ماده غذایی جدید
          </AppText>
          <View style={{ marginTop: spacing.sm, gap: spacing.sm }}>
            <TextField
              label="نام"
              value={customName}
              onChangeText={setCustomName}
              placeholder="مثلاً کره بادام‌زمینی خونگی"
            />
            <TextField
              label="پروتیین به‌ازای هر ۱۰۰ گرم"
              value={customProtein}
              onChangeText={setCustomProtein}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flexDirection: "row-reverse", gap: spacing.sm, marginTop: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Button
                label="انصراف"
                variant="secondary"
                onPress={() => setCreatingCustom(false)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label="ذخیره"
                onPress={handleCreateCustomFood}
                loading={savingCustom}
                disabled={!customName.trim() || !customProtein}
              />
            </View>
          </View>
        </Card>
      ) : (
        <Button
          label="افزودن ماده غذایی جدید به لیست"
          variant="secondary"
          onPress={() => setCreatingCustom(true)}
        />
      )}

      <TextField
        placeholder="جستجو در دیتابیس غذاها..."
        value={query}
        onChangeText={setQuery}
      />

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: spacing.sm, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <Pressable onPress={() => selectFood(item)}>
            <Card style={styles.foodRow}>
              <AppText weight="medium">{item.nameLocal}</AppText>
              <AppText variant="muted">{item.proteinPer100g} گرم پروتیین / ۱۰۰ گرم</AppText>
            </Card>
          </Pressable>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  foodRow: { gap: 2 },
});
