export type FoodCategory =
  | "meat"
  | "poultry"
  | "fish"
  | "egg"
  | "dairy"
  | "supplement"
  | "grain"
  | "legume"
  | "vegetable"
  | "fruit"
  | "fat"
  | "other";

export interface FoodItem {
  id: string;
  name: string;
  nameLocal: string;
  category: FoodCategory;
  proteinPer100g: number;
  caloriesPer100g?: number;
  carbsPer100g?: number;
  fatPer100g?: number;
  standardServing?: {
    label: string;
    grams: number;
  };
  source: "seed" | "custom" | "ai-estimated";
  createdAt: string;
  updatedAt: string;
}

export interface FoodLogEntry {
  id: string;
  foodId: string;
  date: string;
  grams: number;
  proteinGrams: number;
  loggedAt: string;
  note?: string;
}

export interface DailyProteinGoal {
  targetGramsPerDay: number;
  effectiveFrom: string;
}

export interface DailyProteinTotal {
  date: string;
  totalProtein: number;
}
