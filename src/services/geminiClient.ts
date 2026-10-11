import Constants from "expo-constants";

// Google's current free-tier "flash" model. If Google renames/retires this,
// this is the single place to update it.
const MODEL = "gemini-3.8-flash";
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

function getApiKey(): string | null {
  return (Constants.expoConfig?.extra?.geminiApiKey as string | null) ?? null;
}

export class GeminiNotConfiguredError extends Error {
  constructor() {
    super("Gemini API key is not set. Add it to .env as EXPO_PUBLIC_GEMINI_API_KEY.");
  }
}

interface GenerateOptions {
  systemInstruction?: string;
  jsonSchema?: Record<string, unknown>;
}

export async function generateText(
  prompt: string,
  options: GenerateOptions = {}
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new GeminiNotConfiguredError();

  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  };

  if (options.systemInstruction) {
    body.systemInstruction = { parts: [{ text: options.systemInstruction }] };
  }

  if (options.jsonSchema) {
    body.generationConfig = {
      responseMimeType: "application/json",
      responseSchema: options.jsonSchema,
    };
  }

  const res = await fetch(
    `${BASE_URL}/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini request failed (${res.status}): ${errText}`);
  }

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") {
    throw new Error("Gemini returned an unexpected response shape.");
  }
  return text;
}
