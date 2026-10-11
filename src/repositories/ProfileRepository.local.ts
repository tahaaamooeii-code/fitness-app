import type { UserProfile } from "@/src/types/profile";
import { readJson, writeJson, STORAGE_KEYS } from "./AsyncStorageDriver";
import type { IProfileRepository } from "./types";

class ProfileRepositoryLocal implements IProfileRepository {
  async getProfile(): Promise<UserProfile | null> {
    return readJson<UserProfile | null>(STORAGE_KEYS.profile, null);
  }

  async saveProfile(profile: UserProfile): Promise<UserProfile> {
    await writeJson(STORAGE_KEYS.profile, profile);
    return profile;
  }
}

export const profileRepository = new ProfileRepositoryLocal();
