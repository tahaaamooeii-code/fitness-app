export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: string;
}

export interface AiFoodEstimate {
  name: string;
  estimatedGrams: number;
  proteinPer100g: number;
  category:
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
}
