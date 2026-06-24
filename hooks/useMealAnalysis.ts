// Drives the Camera tab flow: pick/take → resize → analyze → save.
// Keeps the screen thin (CODE_QUALITY §2).

import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";

import { analyzeMealPhoto } from "@/services/gemini";
import { saveMeal, uploadMealPhoto } from "@/services/supabase";
import type { GeminiMealResponse, LoadingState, NewMeal } from "@/types";
import { prepareImageForAnalysis, type PreparedImage } from "@/utils/image";

type PickSource = "camera" | "gallery";

export function useMealAnalysis() {
  const [photo, setPhoto] = useState<PreparedImage | null>(null);
  const [result, setResult] = useState<GeminiMealResponse | null>(null);
  const [analysisState, setAnalysisState] = useState<LoadingState>("idle");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setPhoto(null);
    setResult(null);
    setAnalysisState("idle");
    setIsSaving(false);
    setError(null);
  }, []);

  const pickImage = useCallback(async (source: PickSource) => {
    setError(null);
    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Permission denied. Enable camera/photo access in your device settings.");
      return;
    }

    const picker =
      source === "camera" ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
    const picked = await picker({ mediaTypes: ["images"], quality: 1 });
    if (picked.canceled || picked.assets.length === 0) return;

    const prepared = await prepareImageForAnalysis(picked.assets[0].uri);
    if (prepared.error || !prepared.data) {
      setError(prepared.error ?? "Couldn't process the photo.");
      return;
    }
    setResult(null);
    setAnalysisState("idle");
    setPhoto(prepared.data);
  }, []);

  const analyze = useCallback(async () => {
    if (!photo) return;
    setAnalysisState("loading");
    setError(null);
    const { data, error: analyzeError } = await analyzeMealPhoto(photo.base64);
    if (analyzeError || !data) {
      setAnalysisState("error");
      setError(analyzeError ?? "Couldn't analyze the photo.");
      return;
    }
    setResult(data);
    setAnalysisState("success");
  }, [photo]);

  /** Upload the photo (best-effort) then insert the edited meal row. */
  const persistMeal = useCallback(
    async (meal: Omit<NewMeal, "photo_url">): Promise<boolean> => {
      if (!photo) return false;
      setIsSaving(true);
      setError(null);

      const upload = await uploadMealPhoto(photo.base64);
      // Photo upload is non-fatal — keep going with a null URL if it fails.
      const { error: saveError } = await saveMeal({ ...meal, photo_url: upload.data });

      setIsSaving(false);
      if (saveError) {
        setError("Couldn't save the meal. Your edits are still here — try again.");
        return false;
      }
      return true;
    },
    [photo],
  );

  return { photo, result, analysisState, isSaving, error, pickImage, analyze, persistMeal, reset };
}
