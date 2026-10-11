import { repos } from "@/src/repositories";
import type { PersonalRecord } from "@/src/types/workout";

/**
 * Compares a newly logged set against every prior set for that exercise
 * (any rep count — matches "did you lift heavier", not an estimated 1RM).
 * Returns the created PersonalRecord if this is a new best weight, else null.
 */
export async function checkForPersonalRecord(
  exerciseId: string,
  newSetId: string,
  weightKg: number,
  reps: number,
  date: string
): Promise<PersonalRecord | null> {
  const priorLogs = (
    await repos.workoutLog.getSetLogsForExercise(exerciseId)
  ).filter((l) => l.id !== newSetId);

  if (priorLogs.length === 0) return null;

  const previousBestWeightKg = Math.max(...priorLogs.map((l) => l.weightKg));

  if (weightKg <= previousBestWeightKg) return null;

  return repos.workoutLog.recordPersonalRecord({
    exerciseId,
    date,
    weightKg,
    reps,
    previousBestWeightKg,
  });
}
