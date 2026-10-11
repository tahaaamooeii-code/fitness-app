import type {
  PersonalRecord,
  WorkoutDayCompletion,
  WorkoutSetLog,
} from "@/src/types/workout";
import { uuid } from "@/src/utils/uuid";
import { readJson, writeJson, STORAGE_KEYS } from "./AsyncStorageDriver";
import type { IWorkoutLogRepository } from "./types";

class WorkoutLogRepositoryLocal implements IWorkoutLogRepository {
  private async getAllSetLogs(): Promise<WorkoutSetLog[]> {
    return readJson<WorkoutSetLog[]>(STORAGE_KEYS.setLogs, []);
  }

  private async setAllSetLogs(logs: WorkoutSetLog[]): Promise<void> {
    await writeJson(STORAGE_KEYS.setLogs, logs);
  }

  async getSetLogsForExercise(exerciseId: string): Promise<WorkoutSetLog[]> {
    const all = await this.getAllSetLogs();
    return all
      .filter((l) => l.exerciseId === exerciseId)
      .sort((a, b) => a.loggedAt.localeCompare(b.loggedAt));
  }

  async getSetLogsForDate(date: string): Promise<WorkoutSetLog[]> {
    const all = await this.getAllSetLogs();
    return all.filter((l) => l.date === date);
  }

  async addSetLog(
    log: Omit<WorkoutSetLog, "id" | "loggedAt">
  ): Promise<WorkoutSetLog> {
    const newLog: WorkoutSetLog = {
      ...log,
      id: uuid(),
      loggedAt: new Date().toISOString(),
    };
    const all = await this.getAllSetLogs();
    all.push(newLog);
    await this.setAllSetLogs(all);
    return newLog;
  }

  async getDayCompletion(
    workoutDayId: string,
    date: string
  ): Promise<WorkoutDayCompletion | null> {
    const all = await readJson<WorkoutDayCompletion[]>(
      STORAGE_KEYS.dayCompletions,
      []
    );
    return (
      all.find((c) => c.workoutDayId === workoutDayId && c.date === date) ??
      null
    );
  }

  async markDayCompleted(
    workoutDayId: string,
    date: string
  ): Promise<WorkoutDayCompletion> {
    const all = await readJson<WorkoutDayCompletion[]>(
      STORAGE_KEYS.dayCompletions,
      []
    );
    const existing = all.find(
      (c) => c.workoutDayId === workoutDayId && c.date === date
    );
    if (existing) return existing;

    const completion: WorkoutDayCompletion = {
      id: uuid(),
      workoutDayId,
      date,
      completedAt: new Date().toISOString(),
    };
    all.push(completion);
    await writeJson(STORAGE_KEYS.dayCompletions, all);
    return completion;
  }

  async unmarkDayCompleted(workoutDayId: string, date: string): Promise<void> {
    const all = await readJson<WorkoutDayCompletion[]>(
      STORAGE_KEYS.dayCompletions,
      []
    );
    await writeJson(
      STORAGE_KEYS.dayCompletions,
      all.filter((c) => !(c.workoutDayId === workoutDayId && c.date === date))
    );
  }

  async recordPersonalRecord(
    pr: Omit<PersonalRecord, "id" | "detectedAt">
  ): Promise<PersonalRecord> {
    const all = await readJson<PersonalRecord[]>(
      STORAGE_KEYS.personalRecords,
      []
    );
    const newPr: PersonalRecord = {
      ...pr,
      id: uuid(),
      detectedAt: new Date().toISOString(),
    };
    all.push(newPr);
    await writeJson(STORAGE_KEYS.personalRecords, all);
    return newPr;
  }

  async getPersonalRecordsForExercise(
    exerciseId: string
  ): Promise<PersonalRecord[]> {
    const all = await readJson<PersonalRecord[]>(
      STORAGE_KEYS.personalRecords,
      []
    );
    return all
      .filter((p) => p.exerciseId === exerciseId)
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}

export const workoutLogRepository = new WorkoutLogRepositoryLocal();
