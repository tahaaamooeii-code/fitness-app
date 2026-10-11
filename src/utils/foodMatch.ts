import type { FoodItem } from "@/src/types/nutrition";

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

/** Simple substring/token overlap match — good enough for a small personal food DB. */
export function findBestFoodMatch(
  query: string,
  foods: FoodItem[]
): FoodItem | null {
  const q = normalize(query);
  if (!q) return null;

  const exact = foods.find(
    (f) => normalize(f.name) === q || normalize(f.nameLocal) === q
  );
  if (exact) return exact;

  const contains = foods.find(
    (f) => normalize(f.name).includes(q) || normalize(f.nameLocal).includes(q)
  );
  if (contains) return contains;

  const qTokens = new Set(q.split(/\s+/).filter(Boolean));
  let best: { food: FoodItem; score: number } | null = null;
  for (const food of foods) {
    const nameTokens = new Set([
      ...normalize(food.name).split(/\s+/),
      ...normalize(food.nameLocal).split(/\s+/),
    ]);
    let score = 0;
    for (const t of qTokens) {
      if (nameTokens.has(t)) score += 1;
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { food, score };
    }
  }
  return best?.food ?? null;
}

export function searchFoods(query: string, foods: FoodItem[]): FoodItem[] {
  const q = normalize(query);
  if (!q) return foods;
  return foods.filter(
    (f) => normalize(f.name).includes(q) || normalize(f.nameLocal).includes(q)
  );
}
