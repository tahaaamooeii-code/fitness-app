import seedFoodsRaw from "@/src/data/seedFoods.json";
import type { FoodItem } from "@/src/types/nutrition";
import { uuid } from "@/src/utils/uuid";
import { readJson, writeJson, STORAGE_KEYS } from "./AsyncStorageDriver";
import type { IFoodRepository } from "./types";

const SEED_TIMESTAMP = "2026-01-01T00:00:00.000Z";

const seedFoods: FoodItem[] = (
  seedFoodsRaw as Omit<FoodItem, "source" | "createdAt" | "updatedAt">[]
).map((f) => ({
  ...f,
  source: "seed",
  createdAt: SEED_TIMESTAMP,
  updatedAt: SEED_TIMESTAMP,
}));

class FoodRepositoryLocal implements IFoodRepository {
  private async getCustomFoods(): Promise<FoodItem[]> {
    return readJson<FoodItem[]>(STORAGE_KEYS.customFoods, []);
  }

  private async setCustomFoods(foods: FoodItem[]): Promise<void> {
    await writeJson(STORAGE_KEYS.customFoods, foods);
  }

  async getAllFoods(): Promise<FoodItem[]> {
    const custom = await this.getCustomFoods();
    const merged = new Map<string, FoodItem>();
    for (const f of seedFoods) merged.set(f.id, f);
    // Custom/AI-estimated items win on id collision, so a user correction sticks.
    for (const f of custom) merged.set(f.id, f);
    return Array.from(merged.values());
  }

  async getFoodById(id: string): Promise<FoodItem | null> {
    const all = await this.getAllFoods();
    return all.find((f) => f.id === id) ?? null;
  }

  async addCustomFood(
    food: Omit<FoodItem, "id" | "createdAt" | "updatedAt">
  ): Promise<FoodItem> {
    const now = new Date().toISOString();
    const newFood: FoodItem = {
      ...food,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
    };
    const custom = await this.getCustomFoods();
    custom.push(newFood);
    await this.setCustomFoods(custom);
    return newFood;
  }

  async updateFood(
    id: string,
    patch: Partial<FoodItem>
  ): Promise<FoodItem | null> {
    const custom = await this.getCustomFoods();
    const idx = custom.findIndex((f) => f.id === id);
    const now = new Date().toISOString();

    if (idx >= 0) {
      custom[idx] = { ...custom[idx], ...patch, id, updatedAt: now };
      await this.setCustomFoods(custom);
      return custom[idx];
    }

    // Editing a seed food: fork it into a custom override with the same id.
    const seed = seedFoods.find((f) => f.id === id);
    if (!seed) return null;
    const overridden: FoodItem = {
      ...seed,
      ...patch,
      id,
      source: "custom",
      updatedAt: now,
    };
    custom.push(overridden);
    await this.setCustomFoods(custom);
    return overridden;
  }

  async deleteCustomFood(id: string): Promise<void> {
    const custom = await this.getCustomFoods();
    await this.setCustomFoods(custom.filter((f) => f.id !== id));
  }
}

export const foodRepository = new FoodRepositoryLocal();
