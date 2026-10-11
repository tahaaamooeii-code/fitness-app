import React, { useCallback, useState } from "react";
import { View, FlatList, Pressable, StyleSheet } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/src/theme/ThemeProvider";
import { repos } from "@/src/repositories";
import { todayBucket } from "@/src/utils/dateBuckets";
import { spacing } from "@/src/theme/tokens";
import type { WorkoutDay, WorkoutProgram } from "@/src/types/workout";

export default function WorkoutHomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [program, setProgram] = useState<WorkoutProgram | null>(null);
  const [completedDayIds, setCompletedDayIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      repos.workout.getActiveProgram().then(async (p) => {
        if (!active) return;
        setProgram(p);
        if (p) {
          const today = todayBucket();
          const completions = await Promise.all(
            p.days.map(async (d) => {
              const c = await repos.workoutLog.getDayCompletion(d.id, today);
              return c ? d.id : null;
            })
          );
          setCompletedDayIds(new Set(completions.filter(Boolean) as string[]));
        }
        setLoading(false);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  if (loading) return <ScreenContainer><AppText variant="muted">در حال بارگذاری...</AppText></ScreenContainer>;

  if (!program) {
    return (
      <ScreenContainer>
        <AppText variant="heading" weight="bold">
          هنوز برنامه‌ای نساختی
        </AppText>
        <AppText variant="muted">
          برنامه تمرینیت رو یه‌بار بساز، بعد هر روز فقط تیک بزن و وزنه‌هات رو ثبت کن
        </AppText>
        <Button
          label="ساخت برنامه تمرینی"
          onPress={() => router.push("/(tabs)/workout/program-setup")}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll={false}>
      <View style={styles.header}>
        <AppText variant="heading" weight="bold">
          {program.name}
        </AppText>
        <Pressable onPress={() => router.push("/(tabs)/workout/program-setup")}>
          <Ionicons name="create-outline" size={22} color={colors.muted} />
        </Pressable>
      </View>

      <FlatList
        data={program.days}
        keyExtractor={(d: WorkoutDay) => d.id}
        contentContainerStyle={{ gap: spacing.sm, paddingBottom: 40 }}
        renderItem={({ item }) => {
          const done = completedDayIds.has(item.id);
          return (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/workout/day/[dayId]",
                  params: { dayId: item.id },
                })
              }
            >
              <Card style={styles.dayRow}>
                <Ionicons
                  name={done ? "checkmark-circle" : "chevron-back-circle-outline"}
                  size={24}
                  color={done ? colors.success : colors.muted}
                />
                <View style={{ flex: 1 }}>
                  <AppText weight="medium">{item.label}</AppText>
                  <AppText variant="muted">
                    {item.exerciseIds.length} حرکت
                  </AppText>
                </View>
              </Card>
            </Pressable>
          );
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dayRow: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.sm },
});
