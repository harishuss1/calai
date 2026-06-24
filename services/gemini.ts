// Gemini 2.5 Flash multimodal calls. The ONLY place Gemini is contacted.

import { autofillMacros } from "@/constants/macros";
import type { CalorieGoalEstimate, GeminiMealResponse, GoalProfile, Result } from "@/types";

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("Missing EXPO_PUBLIC_GEMINI_API_KEY. Check your .env file.");
}

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent" +
  `?key=${GEMINI_API_KEY}`;

const ANALYSIS_PROMPT =
  'You are a precise nutrition estimator. Analyze this food image and identify all visible food items. Return ONLY a valid JSON object with no markdown, no explanation, just the JSON: {"items": [{"name": string, "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number}], "total_calories": number, "meal_name": string}. Estimate realistic portion sizes from visual cues. If you cannot identify food, return {"error": "No food detected"}.';

/** Pull the model's text out of the nested candidates structure. */
function extractText(json: unknown): string | null {
  const candidates = (json as { candidates?: unknown }).candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) return null;
  const parts = (candidates[0] as { content?: { parts?: unknown } }).content?.parts;
  if (!Array.isArray(parts) || parts.length === 0) return null;
  const text = (parts[0] as { text?: unknown }).text;
  return typeof text === "string" ? text : null;
}

/** Gemini sometimes wraps JSON in ```json fences despite instructions. */
function stripJsonFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

/**
 * Send a base64 JPEG to Gemini and parse the nutrition JSON.
 * Returns a friendly error string on any network/parse failure.
 */
export async function analyzeMealPhoto(base64Image: string): Promise<Result<GeminiMealResponse>> {
  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: ANALYSIS_PROMPT },
              { inline_data: { mime_type: "image/jpeg", data: base64Image } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (__DEV__) console.error("[analyzeMealPhoto] HTTP", response.status);
      return { data: null, error: "The analysis service is unavailable. Try again shortly." };
    }

    const json: unknown = await response.json();
    const text = extractText(json);
    if (!text) {
      return { data: null, error: "Couldn't read the analysis. Try a clearer photo." };
    }

    const parsed = JSON.parse(stripJsonFences(text)) as GeminiMealResponse;

    if (parsed.error || !Array.isArray(parsed.items) || parsed.items.length === 0) {
      return { data: null, error: "Couldn't detect food, try a clearer photo." };
    }

    return { data: parsed, error: null };
  } catch (err) {
    if (__DEV__) console.error("[analyzeMealPhoto] Raw error:", err);
    return { data: null, error: "Failed to analyze photo. Check your connection and try again." };
  }
}

/** Build the dietitian prompt from a user's profile. */
function buildGoalPrompt(profile: GoalProfile): string {
  return (
    "You are a registered dietitian. Estimate a recommended daily calorie intake for this person. " +
    `Profile: sex ${profile.sex}, age ${profile.age}, height ${profile.heightCm} cm, ` +
    `weight ${profile.weightKg} kg, activity level ${profile.activity}, goal: ${profile.goal} weight. ` +
    "Use the Mifflin-St Jeor equation for BMR, apply a standard activity multiplier for total daily " +
    "energy expenditure, then adjust about -500 kcal/day to lose, +300 kcal/day to gain, or 0 to maintain. " +
    "Set a daily protein target around 1.6-2.2 g per kg of bodyweight, then distribute the remaining " +
    "calories into carbs and fat so the macros add up to the calorie total (protein & carbs 4 kcal/g, fat 9 kcal/g). " +
    'Return ONLY valid JSON, no markdown, no explanation: {"calories": number, "protein_g": number, "carbs_g": number, "fat_g": number, "rationale": string}. ' +
    "Keep rationale to one short sentence."
  );
}

/**
 * Ask Gemini to estimate a daily calorie + protein goal from a profile.
 * Text-only request (no image). Returns a friendly error on any failure.
 */
export async function estimateCalorieGoal(
  profile: GoalProfile,
): Promise<Result<CalorieGoalEstimate>> {
  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildGoalPrompt(profile) }] }],
      }),
    });

    if (!response.ok) {
      if (__DEV__) console.error("[estimateCalorieGoal] HTTP", response.status);
      return { data: null, error: "The goal estimator is unavailable. Try again shortly." };
    }

    const json: unknown = await response.json();
    const text = extractText(json);
    if (!text) {
      return { data: null, error: "Couldn't read the estimate. Try again." };
    }

    const parsed = JSON.parse(stripJsonFences(text)) as Partial<CalorieGoalEstimate>;
    const calories = Math.round(parsed.calories ?? 0);
    if (!Number.isFinite(calories) || calories <= 0) {
      return { data: null, error: "Couldn't calculate a goal from those answers. Try again." };
    }

    const protein_g = Math.round(Number.isFinite(parsed.protein_g) ? (parsed.protein_g as number) : 0);
    // If the model omits carbs/fat, fill the remaining calories ourselves.
    const hasMacros = Number.isFinite(parsed.carbs_g) && Number.isFinite(parsed.fat_g);
    const macros = hasMacros
      ? { protein_g, carbs_g: Math.round(parsed.carbs_g as number), fat_g: Math.round(parsed.fat_g as number) }
      : autofillMacros(calories, protein_g);

    return {
      data: { calories, ...macros, rationale: parsed.rationale ?? "" },
      error: null,
    };
  } catch (err) {
    if (__DEV__) console.error("[estimateCalorieGoal] Raw error:", err);
    return { data: null, error: "Failed to estimate your goal. Check your connection and try again." };
  }
}
