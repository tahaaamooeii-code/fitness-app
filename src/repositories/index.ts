import { ensureSchemaVersion } from "./AsyncStorageDriver";
import { foodRepository } from "./FoodRepository.local";
import { foodLogRepository } from "./FoodLogRepository.local";
import { workoutRepository } from "./WorkoutRepository.local";
import { workoutLogRepository } from "./WorkoutLogRepository.local";
import { profileRepository } from "./ProfileRepository.local";
import { settingsRepository } from "./SettingsRepository.local";

// Composition root: swap any of these for a remote-backed implementation
// (e.g. Supabase) here, without touching any call site.
export const repos = {
  foods: foodRepository,
  foodLog: foodLogRepository,
  workout: workoutRepository,
  workoutLog: workoutLogRepository,
  profile: profileRepository,
  settings: settingsRepository,
};

export async function initRepos(): Promise<void> {
  await ensureSchemaVersion();
}
