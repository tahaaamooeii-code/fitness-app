import type {
  DailyProteinGoal,
  DailyProteinTotal,
  FoodLogEntry,
} from "@/src/types/nutrition";
import { uuid } from "@/src/utils/uuid";
import { bucketsInRange } from "@/src/utils/dateBuckets";
import { readJson, writeJson, STORAGE_KEYS } from "./AsyncStorageDriver";
import type { IFoodLogRepository } from "./types";

class FoodLogRepositoryLocal implements IFoodLogRepository {
  private async getAllEntries(): Promise<FoodLogEntry[]> {
    return readJson<FoodLogEntry[]>(STORAGE_KEYS.foodLog, []);
  }

  private async setAllEntries(entries: FoodLogEntry[]): Promise<void> {
    await writeJson(STORAGE_KEYS.foodLog, entries);
  }

  async getEntriesForDate(date: string): Promise<FoodLogEntry[]> {
    const all = await this.getAllEntries();
    return all.filter((e) => e.date === date);
  }

  async getEntriesInRange(
    startDate: string,
    endDate: string
  ): Promise<FoodLogEntry[]> {
    const all = await this.getAllEntries();
    return all.filter((e) => e.date >= startDate && e.date <= endDate);
  }

  async addEntry(
    entry: Omit<FoodLogEntry, "id" | "loggedAt">
  ): Promise<FoodLogEntry> {
    const newEntry: FoodLogEntry = {
      ...entry,
      id: uuid(),
      loggedAt: new Date().toISOString(),
    };
    const all = await this.getAllEntries();
    all.push(newEntry);
    await this.setAllEntries(all);
    return newEntry;
  }

  async removeEntry(id: string): Promise<void> {
    const all = await this.getAllEntries();
    await this.setAllEntries(all.filter((e) => e.id !== id));
  }

  async getDailyTotals(
    startDate: string,
    endDate: string
  ): Promise<DailyProteinTotal[]> {
    const entries = await this.getEntriesInRange(startDate, endDate);
    const totals = new Map<string, number>();
    for (const day of bucketsInRange(startDate, endDate)) totals.set(day, 0);
    for (const e of entries) {
      totals.set(e.date, (totals.get(e.date) ?? 0) + e.proteinGrams);
    }
    return Array.from(totals.entries()).map(([date, totalProtein]) => ({
      date,
      totalProtein: Math.round(totalProtein * 10) / 10,
    }));
  }

  async getGoal(): Promise<DailyProteinGoal | null> {
    const history = await readJson<DailyProteinGoal[]>(
      STORAGE_KEYS.proteinGoalHistory,
      []
    );
    if (history.length === 0) return null;
    return history[history.length - 1];
  }

  async setGoal(targetGramsPerDay: number): Promise<DailyProteinGoal> {
    const history = await readJson<DailyProteinGoal[]>(
      STORAGE_KEYS.proteinGoalHistory,
      []
    );
    const goal: DailyProteinGoal = {
      targetGramsPerDay,
      effectiveFrom: new Date().toISOString(),
    };
    history.push(goal);
    await writeJson(STORAGE_KEYS.proteinGoalHistory, history);
    return goal;
  }
}

export const foodLogRepository = new FoodLogRepositoryLocal();
