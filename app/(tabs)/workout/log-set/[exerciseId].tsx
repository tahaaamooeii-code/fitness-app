import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { AppText } from "@/components/ui/AppText";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { PRCelebration } from "@/components/workout/PRCelebration";
import { repos } from "@/src/repositories";
import { todayBucket } from "@/src/utils/dateBuckets";
import { checkForPersonalRecord } from "@/src/services/prDetection";
import { spacing } from "@/src/theme/tokens";
import type {
  PersonalRecord,
  WorkoutExercise,
  WorkoutSetLog,
} from "@/src/types/workout";

export default function LogSetScreen() {
  const { exerciseId, workoutDayId } = useLocalSearchParams<{
    exerciseId: string;
    workoutDayId: string;
  }>();
  const router = useRouter();
  const [exercise, setExercise] = useState<WorkoutExercise | null>(null);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [saving, setSaving] = useState(false);
  const [pr, setPr] = useState<PersonalRecord | null>(null);
  const [setLogs, setSetLogs] = useState<WorkoutSetLog[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);

  useEffect(() => {
    if (!exerciseId) return;
    repos.workout.getExerciseById(exerciseId).then(setExercise);
  }, [exerciseId]);

  async function handleSave() {
    if (!exerciseId || !workoutDayId) return;
    const weightKg = Number(weight);
    const repsValue = Number(reps);
    if (!weightKg || !repsValue) return;

    setSaving(true);
    const today = todayBucket();
    const todaysLogs = await repos.workoutLog.getSetLogsForExercise(exerciseId);
    const setNumber =
      todaysLogs.filter((l) => l.date === today).length + 1;

    const newLog = await repos.workoutLog.addSetLog({
      exerciseId,
      workoutDayId,
      date: today,
      weightKg,
      reps: repsValue,
      setNumber,
    });

    const foundPr = await checkForPersonalRecord(
      exerciseId,
      newLog.id,
      weightKg,
      repsValue,
      today
    );

    setSaving(false);

    if (foundPr) {
      const [logs, prs] = await Promise.all([
        repos.workoutLog.getSetLogsForExercise(exerciseId),
        repos.workoutLog.getPersonalRecordsForExercise(exerciseId),
      ]);
      setSetLogs(logs);
      setPersonalRecords(prs);
      setPr(foundPr);
    } else {
      router.back();
    }
  }

  return (
    <ScreenContainer>
      <AppText variant="heading" weight="bold">
        {exercise?.name ?? "ثبت ست"}
      </AppText>

      <TextField
        label="وزنه (کیلوگرم)"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        autoFocus
      />
      <TextField
        label="تعداد تکرار"
        value={reps}
        onChangeText={setReps}
        keyboardType="numeric"
      />

      <View style={{ marginTop: spacing.md }}>
        <Button label="ثبت ست" onPress={handleSave} loading={saving} />
      </View>

      {pr && exercise && (
        <PRCelebration
          visible={!!pr}
          exerciseName={exercise.name}
          pr={pr}
          setLogs={setLogs}
          personalRecords={personalRecords}
          onClose={() => {
            setPr(null);
            router.back();
          }}
        />
      )}
    </ScreenContainer>
  );
}
