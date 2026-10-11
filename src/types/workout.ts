export type Equipment =
  | "barbell"
  | "dumbbell"
  | "machine"
  | "cable"
  | "bodyweight"
  | "other";

export interface WorkoutExercise {
  id: string;
  name: string;
  muscleGroup?: string;
  equipment?: Equipment;
  notes?: string;
}

export interface WorkoutDay {
  id: string;
  label: string;
  exerciseIds: string[];
}

export interface WorkoutProgram {
  id: string;
  name: string;
  days: WorkoutDay[];
  exercises: WorkoutExercise[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface WorkoutSetLog {
  id: string;
  exerciseId: string;
  workoutDayId: string;
  date: string;
  loggedAt: string;
  weightKg: number;
  reps: number;
  setNumber: number;
}

export interface WorkoutDayCompletion {
  id: string;
  workoutDayId: string;
  date: string;
  completedAt: string;
}

export interface PersonalRecord {
  id: string;
  exerciseId: string;
  date: string;
  weightKg: number;
  reps: number;
  previousBestWeightKg: number | null;
  detectedAt: string;
}
