import React, { useEffect, useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { AppText } from "@/components/ui/AppText";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/src/theme/ThemeProvider";
import { repos } from "@/src/repositories";
import { uuid } from "@/src/utils/uuid";
import { spacing } from "@/src/theme/tokens";
import type { WorkoutDay, WorkoutExercise } from "@/src/types/workout";

export default function ProgramSetupScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [programName, setProgramName] = useState("برنامه من");
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [days, setDays] = useState<WorkoutDay[]>([]);
  const [newExerciseName, setNewExerciseName] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    repos.workout.getActiveProgram().then((p) => {
      if (p) {
        setProgramName(p.name);
        setExercises(p.exercises);
        setDays(p.days);
      }
    });
  }, []);

  function addDay() {
    setDays((prev) => [
      ...prev,
      { id: uuid(), label: `روز ${prev.length + 1}`, exerciseIds: [] },
    ]);
  }

  function removeDay(dayId: string) {
    setDays((prev) => prev.filter((d) => d.id !== dayId));
  }

  function updateDayLabel(dayId: string, label: string) {
    setDays((prev) => prev.map((d) => (d.id === dayId ? { ...d, label } : d)));
  }

  function addExerciseToDay(dayId: string) {
    const name = (newExerciseName[dayId] ?? "").trim();
    if (!name) return;
    const exercise: WorkoutExercise = { id: uuid(), name };
    setExercises((prev) => [...prev, exercise]);
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? { ...d, exerciseIds: [...d.exerciseIds, exercise.id] }
          : d
      )
    );
    setNewExerciseName((prev) => ({ ...prev, [dayId]: "" }));
  }

  function removeExerciseFromDay(dayId: string, exerciseId: string) {
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? { ...d, exerciseIds: d.exerciseIds.filter((id) => id !== exerciseId) }
          : d
      )
    );
  }

  async function handleSave() {
    setSaving(true);
    await repos.workout.saveProgram({ name: programName, days, exercises });
    setSaving(false);
    router.back();
  }

  return (
    <ScreenContainer>
      <AppText variant="heading" weight="bold">
        برنامه تمرینی
      </AppText>
      <TextField label="نام برنامه" value={programName} onChangeText={setProgramName} />

      {days.map((day) => (
        <Card key={day.id}>
          <View style={styles.dayHeader}>
            <Pressable onPress={() => removeDay(day.id)}>
              <Ionicons name="trash-outline" size={20} color={colors.destructive} />
            </Pressable>
            <View style={{ flex: 1 }}>
              <TextField
                value={day.label}
                onChangeText={(t) => updateDayLabel(day.id, t)}
              />
            </View>
          </View>

          {day.exerciseIds.map((exId) => {
            const ex = exercises.find((e) => e.id === exId);
            if (!ex) return null;
            return (
              <View key={exId} style={styles.exerciseRow}>
                <Pressable onPress={() => removeExerciseFromDay(day.id, exId)}>
                  <Ionicons name="close-circle-outline" size={18} color={colors.muted} />
                </Pressable>
                <AppText>{ex.name}</AppText>
              </View>
            );
          })}

          <View style={styles.addExerciseRow}>
            <View style={{ flex: 1 }}>
              <TextField
                placeholder="نام حرکت (مثلاً پرس سینه)"
                value={newExerciseName[day.id] ?? ""}
                onChangeText={(t) =>
                  setNewExerciseName((prev) => ({ ...prev, [day.id]: t }))
                }
              />
            </View>
            <Pressable onPress={() => addExerciseToDay(day.id)} style={styles.addBtn}>
              <Ionicons name="add-circle" size={30} color={colors.accent} />
            </Pressable>
          </View>
        </Card>
      ))}

      <Button label="افزودن روز جدید" variant="secondary" onPress={addDay} />

      <View style={{ marginTop: spacing.md }}>
        <Button label="ذخیره برنامه" onPress={handleSave} loading={saving} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  dayHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  exerciseRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  addExerciseRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  addBtn: { paddingTop: 4 },
});
