import type { WorkoutExercise, WorkoutProgram } from "@/src/types/workout";
import { uuid } from "@/src/utils/uuid";
import { readJson, writeJson, STORAGE_KEYS } from "./AsyncStorageDriver";
import type { IWorkoutRepository } from "./types";

class WorkoutRepositoryLocal implements IWorkoutRepository {
  async getActiveProgram(): Promise<WorkoutProgram | null> {
    return readJson<WorkoutProgram | null>(STORAGE_KEYS.workoutProgram, null);
  }

  async saveProgram(
    program: Omit<
      WorkoutProgram,
      "id" | "createdAt" | "updatedAt" | "isActive"
    >
  ): Promise<WorkoutProgram> {
    const existing = await this.getActiveProgram();
    const now = new Date().toISOString();
    const saved: WorkoutProgram = {
      ...program,
      id: existing?.id ?? uuid(),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      isActive: true,
    };
    await writeJson(STORAGE_KEYS.workoutProgram, saved);
    return saved;
  }

  async getExerciseById(id: string): Promise<WorkoutExercise | null> {
    const program = await this.getActiveProgram();
    return program?.exercises.find((e) => e.id === id) ?? null;
  }
}

export const workoutRepository = new WorkoutRepositoryLocal();
