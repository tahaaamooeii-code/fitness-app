import React, { useCallback, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { repos } from "@/src/repositories";
import { todayBucket } from "@/src/utils/dateBuckets";
import { spacing } from "@/src/theme/tokens";
import type { FoodItem, FoodLogEntry } from "@/src/types/nutrition";

interface EntryWithFood {
  entry: FoodLogEntry;
  food: FoodItem | null;
}

export default function NutritionHomeScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<EntryWithFood[]>([]);
  const [goalGrams, setGoalGrams] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const today = todayBucket();
    const [todayEntries, allFoods, goal] = await Promise.all([
      repos.foodLog.getEntriesForDate(today),
      repos.foods.getAllFoods(),
      repos.foodLog.getGoal(),
    ]);
    const foodMap = new Map(allFoods.map((f) => [f.id, f]));
    setEntries(
      todayEntries.map((entry) => ({
        entry,
        food: foodMap.get(entry.foodId) ?? null,
      }))
    );
    setGoalGrams(goal?.targetGramsPerDay ?? 0);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleRemove(id: string) {
    await repos.foodLog.removeEntry(id);
    load();
  }

  const totalProtein = entries.reduce((sum, e) => sum + e.entry.proteinGrams, 0);
  const progress = goalGrams > 0 ? totalProtein / goalGrams : 0;

  return (
    <ScreenContainer scroll={false}>
      <AppText variant="heading" weight="bold">
        امروز
      </AppText>

      <Card>
        <AppText variant="title" weight="medium">
          پروتیین دریافتی
        </AppText>
        <AppText variant="heading" weight="bold" style={{ marginTop: spacing.xs }}>
          {totalProtein.toFixed(0)} / {goalGrams || "—"} گرم
        </AppText>
        <View style={{ marginTop: spacing.sm }}>
          <ProgressBar progress={progress} />
        </View>
      </Card>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.entry.id}
        contentContainerStyle={{ gap: spacing.sm, paddingBottom: 100 }}
        ListEmptyComponent={
          !loading ? (
            <AppText variant="muted" style={{ textAlign: "center", marginTop: spacing.lg }}>
              هنوز چیزی امروز ثبت نکردی
            </AppText>
          ) : null
        }
        renderItem={({ item }) => (
          <Card style={styles.row}>
            <Checkbox checked onToggle={() => handleRemove(item.entry.id)} />
            <View style={{ flex: 1 }}>
              <AppText weight="medium">
                {item.food?.nameLocal ?? item.food?.name ?? "غذا"}
              </AppText>
              <AppText variant="muted">
                {item.entry.grams} گرم — {item.entry.proteinGrams.toFixed(1)} گرم پروتیین
              </AppText>
            </View>
          </Card>
        )}
      />

      <View style={styles.actions}>
        <Button
          label="افزودن غذا"
          onPress={() => router.push("/(tabs)/nutrition/add-food")}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
  },
  actions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
});
