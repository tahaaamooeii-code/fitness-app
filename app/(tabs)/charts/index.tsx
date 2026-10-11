import React, { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { ProteinTrendChart } from "@/components/charts/ProteinTrendChart";
import { WeightProgressionChart } from "@/components/charts/WeightProgressionChart";
import { repos } from "@/src/repositories";
import { daysAgoBucket, todayBucket } from "@/src/utils/dateBuckets";
import { spacing } from "@/src/theme/tokens";
import type { DailyProteinTotal } from "@/src/types/nutrition";
import type {
  PersonalRecord,
  WorkoutExercise,
  WorkoutSetLog,
} from "@/src/types/workout";

interface ExerciseChartData {
  exercise: WorkoutExercise;
  setLogs: WorkoutSetLog[];
  personalRecords: PersonalRecord[];
}

export default function ChartsScreen() {
  const [totals, setTotals] = useState<DailyProteinTotal[]>([]);
  const [goalGrams, setGoalGrams] = useState(0);
  const [exerciseCharts, setExerciseCharts] = useState<ExerciseChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);

      async function load() {
        const start = daysAgoBucket(13);
        const end = todayBucket();
        const [dailyTotals, goal, program] = await Promise.all([
          repos.foodLog.getDailyTotals(start, end),
          repos.foodLog.getGoal(),
          repos.workout.getActiveProgram(),
        ]);
        if (!active) return;
        setTotals(dailyTotals);
        setGoalGrams(goal?.targetGramsPerDay ?? 0);

        if (program) {
          const charts = await Promise.all(
            program.exercises.map(async (exercise) => {
              const [setLogs, personalRecords] = await Promise.all([
                repos.workoutLog.getSetLogsForExercise(exercise.id),
                repos.workoutLog.getPersonalRecordsForExercise(exercise.id),
              ]);
              return { exercise, setLogs, personalRecords };
            })
          );
          if (active) {
            setExerciseCharts(charts.filter((c) => c.setLogs.length > 0));
          }
        } else if (active) {
          setExerciseCharts([]);
        }
        if (active) setLoading(false);
      }

      load();
      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <ScreenContainer>
      <AppText variant="heading" weight="bold">
        نمودارها
      </AppText>

      <AppText variant="title" weight="medium">
        روند پروتیین (۱۴ روز اخیر)
      </AppText>
      <Card>
        <ProteinTrendChart data={totals} goalGrams={goalGrams} />
      </Card>

      <AppText variant="title" weight="medium">
        پیشرفت وزنه‌ها
      </AppText>
      {!loading && exerciseCharts.length === 0 && (
        <AppText variant="muted">هنوز ستی برای هیچ حرکتی ثبت نکردی</AppText>
      )}
      {exerciseCharts.map(({ exercise, setLogs, personalRecords }) => (
        <Card key={exercise.id}>
          <AppText weight="medium">{exercise.name}</AppText>
          <WeightProgressionChart
            setLogs={setLogs}
            personalRecords={personalRecords}
            height={160}
          />
        </Card>
      ))}
    </ScreenContainer>
  );
}
