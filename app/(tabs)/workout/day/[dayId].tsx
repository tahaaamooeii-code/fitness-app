import React, { useCallback, useState } from "react";
import { View, FlatList, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { useTheme } from "@/src/theme/ThemeProvider";
import { repos } from "@/src/repositories";
import { todayBucket } from "@/src/utils/dateBuckets";
import { spacing } from "@/src/theme/tokens";
import type { WorkoutDay, WorkoutExercise } from "@/src/types/workout";

export default function WorkoutDayScreen() {
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const [day, setDay] = useState<WorkoutDay | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [completed, setCompleted] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      repos.workout.getActiveProgram().then(async (program) => {
        if (!active || !program) return;
        const foundDay = program.days.find((d) => d.id === dayId) ?? null;
        setDay(foundDay);
        setExercises(
          program.exercises.filter((e) => foundDay?.exerciseIds.includes(e.id))
        );
        if (foundDay) {
          const c = await repos.workoutLog.getDayCompletion(foundDay.id, todayBucket());
          setCompleted(!!c);
        }
      });
      return () => {
        active = false;
      };
    }, [dayId])
  );

  async function toggleCompleted() {
    if (!day) return;
    const today = todayBucket();
    if (completed) {
      await repos.workoutLog.unmarkDayCompleted(day.id, today);
    } else {
      await repos.workoutLog.markDayCompleted(day.id, today);
    }
    setCompleted(!completed);
  }

  if (!day) {
    return <ScreenContainer><AppText variant="muted">در حال بارگذاری...</AppText></ScreenContainer>;
  }

  return (
    <ScreenContainer scroll={false}>
      <AppText variant="heading" weight="bold">
        {day.label}
      </AppText>

      <Pressable onPress={toggleCompleted}>
        <Card style={styles.completeRow}>
          <Checkbox checked={completed} onToggle={toggleCompleted} />
          <AppText weight="medium">امروز این روز رو تمرین کردم</AppText>
        </Card>
      </Pressable>

      <FlatList
        data={exercises}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ gap: spacing.sm, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <Card style={styles.exerciseRow}>
            <View style={{ flex: 1 }}>
              <AppText weight="medium">{item.name}</AppText>
            </View>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/workout/exercise-history/[exerciseId]",
                  params: { exerciseId: item.id },
                })
              }
              hitSlop={8}
            >
              <Ionicons name="stats-chart-outline" size={20} color={colors.muted} />
            </Pressable>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/workout/log-set/[exerciseId]",
                  params: { exerciseId: item.id, workoutDayId: day.id },
                })
              }
              hitSlop={8}
            >
              <Ionicons name="add-circle" size={26} color={colors.accent} />
            </Pressable>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  completeRow: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.sm },
  exerciseRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md,
  },
});
