export interface UserProfile {
  name: string;
  photoUri?: string;
  heightCm?: number;
  weightKg?: number;
  dailyProteinTargetGrams: number;
  createdAt: string;
  updatedAt: string;
}

export type ThemeMode = "light" | "dark" | "system";

export interface AppSettings {
  themeMode: ThemeMode;
  onboardingCompleted: boolean;
}
