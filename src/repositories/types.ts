import type {
  DailyProteinGoal,
  DailyProteinTotal,
  FoodItem,
  FoodLogEntry,
} from "@/src/types/nutrition";
import type {
  PersonalRecord,
  WorkoutDayCompletion,
  WorkoutExercise,
  WorkoutProgram,
  WorkoutSetLog,
} from "@/src/types/workout";
import type { AppSettings, UserProfile } from "@/src/types/profile";

export interface IFoodRepository {
  getAllFoods(): Promise<FoodItem[]>;
  getFoodById(id: string): Promise<FoodItem | null>;
  addCustomFood(
    food: Omit<FoodItem, "id" | "createdAt" | "updatedAt">
  ): Promise<FoodItem>;
  updateFood(id: string, patch: Partial<FoodItem>): Promise<FoodItem | null>;
  deleteCustomFood(id: string): Promise<void>;
}

export interface IFoodLogRepository {
  getEntriesForDate(date: string): Promise<FoodLogEntry[]>;
  getEntriesInRange(
    startDate: string,
    endDate: string
  ): Promise<FoodLogEntry[]>;
  addEntry(
    entry: Omit<FoodLogEntry, "id" | "loggedAt">
  ): Promise<FoodLogEntry>;
  removeEntry(id: string): Promise<void>;
  getDailyTotals(
    startDate: string,
    endDate: string
  ): Promise<DailyProteinTotal[]>;
  getGoal(): Promise<DailyProteinGoal | null>;
  setGoal(targetGramsPerDay: number): Promise<DailyProteinGoal>;
}

export interface IWorkoutRepository {
  getActiveProgram(): Promise<WorkoutProgram | null>;
  saveProgram(
    program: Omit<WorkoutProgram, "id" | "createdAt" | "updatedAt" | "isActive">
  ): Promise<WorkoutProgram>;
  getExerciseById(id: string): Promise<WorkoutExercise | null>;
}

export interface IWorkoutLogRepository {
  getSetLogsForExercise(exerciseId: string): Promise<WorkoutSetLog[]>;
  getSetLogsForDate(date: string): Promise<WorkoutSetLog[]>;
  addSetLog(log: Omit<WorkoutSetLog, "id" | "loggedAt">): Promise<WorkoutSetLog>;
  getDayCompletion(
    workoutDayId: string,
    date: string
  ): Promise<WorkoutDayCompletion | null>;
  markDayCompleted(
    workoutDayId: string,
    date: string
  ): Promise<WorkoutDayCompletion>;
  unmarkDayCompleted(workoutDayId: string, date: string): Promise<void>;
  recordPersonalRecord(
    pr: Omit<PersonalRecord, "id" | "detectedAt">
  ): Promise<PersonalRecord>;
  getPersonalRecordsForExercise(exerciseId: string): Promise<PersonalRecord[]>;
}

export interface IProfileRepository {
  getProfile(): Promise<UserProfile | null>;
  saveProfile(profile: UserProfile): Promise<UserProfile>;
}

export interface ISettingsRepository {
  getSettings(): Promise<AppSettings>;
  saveSettings(patch: Partial<AppSettings>): Promise<AppSettings>;
}
