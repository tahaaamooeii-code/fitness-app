import { z } from "zod";
import { repos } from "@/src/repositories";
import { findBestFoodMatch } from "@/src/utils/foodMatch";
import { generateText } from "./geminiClient";
import type { FoodItem } from "@/src/types/nutrition";
import type { AiFoodEstimate } from "@/src/types/ai";

const AiEstimateSchema = z.array(
  z.object({
    name: z.string(),
    estimatedGrams: z.number().positive(),
    proteinPer100g: z.number().min(0).max(100),
    category: z.enum([
      "meat",
      "poultry",
      "fish",
      "egg",
      "dairy",
      "supplement",
      "grain",
      "legume",
      "vegetable",
      "fruit",
      "fat",
      "other",
    ]),
  })
);

const JSON_SCHEMA = {
  type: "array",
  items: {
    type: "object",
    properties: {
      name: { type: "string" },
      estimatedGrams: { type: "number" },
      proteinPer100g: { type: "number" },
      category: {
        type: "string",
        enum: [
          "meat",
          "poultry",
          "fish",
          "egg",
          "dairy",
          "supplement",
          "grain",
          "legume",
          "vegetable",
          "fruit",
          "fat",
          "other",
        ],
      },
    },
    required: ["name", "estimatedGrams", "proteinPer100g", "category"],
  },
};

export interface EstimationResult {
  food: FoodItem;
  grams: number;
  proteinGrams: number;
  matchedLocally: boolean;
}

/**
 * Resolves a free-text food description into concrete FoodItem + grams,
 * using the local food DB first. Falls back to Gemini only if nothing matches,
 * and saves any AI-derived food so it never needs to ask again.
 */
export async function estimateProteinFromText(
  description: string
): Promise<EstimationResult[]> {
  const allFoods = await repos.foods.getAllFoods();
  const localMatch = findBestFoodMatch(description, allFoods);

  if (localMatch) {
    return [
      {
        food: localMatch,
        grams: localMatch.standardServing?.grams ?? 100,
        proteinGrams:
          (localMatch.proteinPer100g *
            (localMatch.standardServing?.grams ?? 100)) /
          100,
        matchedLocally: true,
      },
    ];
  }

  const raw = await generateText(
    `Analyze this food description and break it into individual food items with their estimated protein content: "${description}". ` +
      `Respond with a JSON array only.`,
    {
      systemInstruction:
        "You are a nutrition assistant. Given a free-text meal description (possibly in Persian), " +
        "identify each distinct food, estimate a realistic eaten portion in grams, and give an accurate " +
        "protein grams per 100g for that food. Be precise and realistic, not overly generous.",
      jsonSchema: JSON_SCHEMA,
    }
  );

  const parsed = AiEstimateSchema.parse(JSON.parse(raw)) as AiFoodEstimate[];

  const results: EstimationResult[] = [];
  for (const item of parsed) {
    const saved = await repos.foods.addCustomFood({
      name: item.name,
      nameLocal: item.name,
      category: item.category,
      proteinPer100g: item.proteinPer100g,
      source: "ai-estimated",
    });
    results.push({
      food: saved,
      grams: item.estimatedGrams,
      proteinGrams: (saved.proteinPer100g * item.estimatedGrams) / 100,
      matchedLocally: false,
    });
  }
  return results;
}
