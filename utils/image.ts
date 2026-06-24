// Image preparation. Photos are resized + recompressed before hitting Gemini
// to keep requests fast and comfortably inside the free tier (CODE_QUALITY §10).

import * as ImageManipulator from "expo-image-manipulator";

import type { Result } from "@/types";

const MAX_DIMENSION_PX = 1024;
const JPEG_QUALITY = 0.7;

export interface PreparedImage {
  /** Local file URI of the resized JPEG (used for upload + preview). */
  uri: string;
  /** Base64 of the resized JPEG (used for the Gemini inline_data payload). */
  base64: string;
}

/**
 * Resize to <=1024px on the longest edge and re-encode as JPEG q0.7.
 * Returns both the new URI and its base64 so callers avoid a second read.
 */
export async function prepareImageForAnalysis(uri: string): Promise<Result<PreparedImage>> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: MAX_DIMENSION_PX } }],
      {
        compress: JPEG_QUALITY,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      },
    );

    if (!result.base64) {
      return { data: null, error: "Couldn't read the photo. Try a different image." };
    }

    return { data: { uri: result.uri, base64: result.base64 }, error: null };
  } catch (err) {
    if (__DEV__) console.error("[prepareImageForAnalysis] Raw error:", err);
    return { data: null, error: "Couldn't process the photo. Try a different image." };
  }
}
