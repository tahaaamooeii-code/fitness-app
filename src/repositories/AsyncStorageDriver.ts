import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFIX = "fitness:";

export const STORAGE_KEYS = {
  customFoods: `${PREFIX}customFoods`,
  foodLog: `${PREFIX}foodLog`,
  proteinGoalHistory: `${PREFIX}proteinGoalHistory`,
  workoutProgram: `${PREFIX}workoutProgram`,
  setLogs: `${PREFIX}setLogs`,
  dayCompletions: `${PREFIX}dayCompletions`,
  personalRecords: `${PREFIX}personalRecords`,
  profile: `${PREFIX}profile`,
  settings: `${PREFIX}settings`,
  schemaVersion: `${PREFIX}schemaVersion`,
} as const;

export const CURRENT_SCHEMA_VERSION = 1;

export async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function ensureSchemaVersion(): Promise<void> {
  const current = await AsyncStorage.getItem(STORAGE_KEYS.schemaVersion);
  if (!current) {
    await AsyncStorage.setItem(
      STORAGE_KEYS.schemaVersion,
      String(CURRENT_SCHEMA_VERSION)
    );
  }
}
