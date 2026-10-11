import type { AppSettings } from "@/src/types/profile";
import { readJson, writeJson, STORAGE_KEYS } from "./AsyncStorageDriver";
import type { ISettingsRepository } from "./types";

const DEFAULT_SETTINGS: AppSettings = {
  themeMode: "system",
  onboardingCompleted: false,
};

class SettingsRepositoryLocal implements ISettingsRepository {
  async getSettings(): Promise<AppSettings> {
    return readJson<AppSettings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  }

  async saveSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...patch };
    await writeJson(STORAGE_KEYS.settings, updated);
    return updated;
  }
}

export const settingsRepository = new SettingsRepositoryLocal();
