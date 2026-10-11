import React, { useEffect, useState } from "react";
import { FlatList } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { WeightProgressionChart } from "@/components/charts/WeightProgressionChart";
import { repos } from "@/src/repositories";
import { spacing } from "@/src/theme/tokens";
import type {
  PersonalRecord,
  WorkoutExercise,
  WorkoutSetLog,
} from "@/src/types/workout";

export default function ExerciseHistoryScreen() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const [exercise, setExercise] = useState<WorkoutExercise | null>(null);
  const [setLogs, setSetLogs] = useState<WorkoutSetLog[]>([]);
  const [prs, setPrs] = useState<PersonalRecord[]>([]);

  useEffect(() => {
    if (!exerciseId) return;
    repos.workout.getExerciseById(exerciseId).then(setExercise);
    repos.workoutLog.getSetLogsForExercise(exerciseId).then(setSetLogs);
    repos.workoutLog.getPersonalRecordsForExercise(exerciseId).then(setPrs);
  }, [exerciseId]);

  const bestWeight = setLogs.reduce((max, l) => Math.max(max, l.weightKg), 0);

  return (
    <ScreenContainer>
      <AppText variant="heading" weight="bold">
        {exercise?.name ?? "تاریخچه"}
      </AppText>

      <Card>
        <AppText variant="muted">بهترین رکورد</AppText>
        <AppText variant="title" weight="bold">
          {bestWeight || "—"} کیلوگرم
        </AppText>
      </Card>

      <Card>
        <WeightProgressionChart setLogs={setLogs} personalRecords={prs} />
      </Card>

      <AppText variant="title" weight="medium">
        رکوردها
      </AppText>
      <FlatList
        data={[...prs].reverse()}
        keyExtractor={(p) => p.id}
        scrollEnabled={false}
        contentContainerStyle={{ gap: spacing.sm }}
        renderItem={({ item }) => (
          <Card>
            <AppText weight="medium">{item.weightKg} کیلوگرم × {item.reps}</AppText>
            <AppText variant="muted">{item.date}</AppText>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}
