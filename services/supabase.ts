// Supabase client + every meal query/storage call. The ONLY place Supabase is touched.

import { decode } from "base64-arraybuffer";
import { createClient } from "@supabase/supabase-js";

import type { Meal, NewMeal, Result, WeightLog } from "@/types";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase env vars. Check your .env file.");
}

const PHOTO_BUCKET = "meal-photos";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

/**
 * Upload a resized JPEG (as base64) to the public meal-photos bucket and
 * return its public URL. Storage failures are non-fatal — the caller can
 * still save the meal with a null photo_url.
 */
export async function uploadMealPhoto(base64Jpeg: string): Promise<Result<string>> {
  try {
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
    const { error } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(path, decode(base64Jpeg), { contentType: "image/jpeg", upsert: false });

    if (error) {
      if (__DEV__) console.error("[uploadMealPhoto]", error);
      return { data: null, error: error.message };
    }

    const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
    return { data: data.publicUrl, error: null };
  } catch (err) {
    if (__DEV__) console.error("[uploadMealPhoto] Raw error:", err);
    return { data: null, error: "Failed to upload photo." };
  }
}

/** Insert a meal row and return the saved record. */
export async function saveMeal(meal: NewMeal): Promise<Result<Meal>> {
  const { data, error } = await supabase.from("meals").insert(meal).select().single();
  if (error) {
    if (__DEV__) console.error("[saveMeal]", error);
    return { data: null, error: error.message };
  }
  return { data: data as Meal, error: null };
}

/** All meals eaten on a given local day ("YYYY-MM-DD"), newest first. */
export async function getMealsForDate(dayString: string): Promise<Result<Meal[]>> {
  const start = new Date(`${dayString}T00:00:00`).toISOString();
  const end = new Date(`${dayString}T23:59:59.999`).toISOString();

  const { data, error } = await supabase
    .from("meals")
    .select("*")
    .gte("eaten_at", start)
    .lte("eaten_at", end)
    .order("eaten_at", { ascending: false });

  if (error) {
    if (__DEV__) console.error("[getMealsForDate]", error);
    return { data: null, error: error.message };
  }
  return { data: data as Meal[], error: null };
}

/** All meals between two local days inclusive (used by the Stats screen). */
export async function getMealsBetween(
  startDay: string,
  endDay: string,
): Promise<Result<Meal[]>> {
  const start = new Date(`${startDay}T00:00:00`).toISOString();
  const end = new Date(`${endDay}T23:59:59.999`).toISOString();

  const { data, error } = await supabase
    .from("meals")
    .select("*")
    .gte("eaten_at", start)
    .lte("eaten_at", end)
    .order("eaten_at", { ascending: true });

  if (error) {
    if (__DEV__) console.error("[getMealsBetween]", error);
    return { data: null, error: error.message };
  }
  return { data: data as Meal[], error: null };
}

/** Delete a meal by id. */
export async function deleteMeal(id: string): Promise<Result<true>> {
  const { error } = await supabase.from("meals").delete().eq("id", id);
  if (error) {
    if (__DEV__) console.error("[deleteMeal]", error);
    return { data: null, error: error.message };
  }
  return { data: true, error: null };
}

/** Record a body-weight entry. */
export async function logWeight(weight_kg: number, note?: string): Promise<Result<WeightLog>> {
  const { data, error } = await supabase
    .from("weight_logs")
    .insert({ weight_kg, note: note?.trim() || null })
    .select()
    .single();
  if (error) {
    if (__DEV__) console.error("[logWeight]", error);
    return { data: null, error: error.message };
  }
  return { data: data as WeightLog, error: null };
}

/** Weight logs (oldest first for charting), optionally limited to recent days. */
export async function getWeightLogs(limitDays?: number): Promise<Result<WeightLog[]>> {
  let query = supabase.from("weight_logs").select("*").order("logged_at", { ascending: true });

  if (limitDays && limitDays > 0) {
    const since = new Date();
    since.setDate(since.getDate() - limitDays);
    query = query.gte("logged_at", since.toISOString());
  }

  const { data, error } = await query;
  if (error) {
    if (__DEV__) console.error("[getWeightLogs]", error);
    return { data: null, error: error.message };
  }
  return { data: data as WeightLog[], error: null };
}

/** Delete a weight log by id. */
export async function deleteWeightLog(id: string): Promise<Result<true>> {
  const { error } = await supabase.from("weight_logs").delete().eq("id", id);
  if (error) {
    if (__DEV__) console.error("[deleteWeightLog]", error);
    return { data: null, error: error.message };
  }
  return { data: true, error: null };
}
