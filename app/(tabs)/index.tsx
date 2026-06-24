import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { COLORS, FONT_SIZE, RADIUS, SPACING } from "@/constants/theme";
import type { NewMeal } from "@/types";
import { useMealAnalysis } from "@/hooks/useMealAnalysis";
import { Button } from "@/components/Button";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ResultsCard } from "@/components/ResultsCard";

export default function CameraScreen() {
  const router = useRouter();
  const { photo, result, analysisState, isSaving, error, pickImage, analyze, persistMeal, reset } =
    useMealAnalysis();

  const handleSave = async (meal: Omit<NewMeal, "photo_url">) => {
    const saved = await persistMeal(meal);
    if (saved) {
      reset();
      router.push("/log");
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {photo && result ? (
          <ResultsCard
            photoUri={photo.uri}
            result={result}
            isSaving={isSaving}
            onSave={handleSave}
            onRetake={reset}
          />
        ) : photo ? (
          <View style={styles.previewBlock}>
            <Image source={{ uri: photo.uri }} style={styles.preview} contentFit="cover" />
            <Button label="Analyze" icon="sparkles" onPress={analyze} />
            <Button label="Choose Another" variant="secondary" onPress={reset} />
          </View>
        ) : (
          <View style={styles.emptyBlock}>
            <Text style={styles.heading}>What did you eat?</Text>
            <Text style={styles.subheading}>Snap a photo and let AI estimate the nutrition.</Text>
            <Button label="Take Photo" icon="camera" onPress={() => pickImage("camera")} />
            <Button
              label="Choose from Gallery"
              variant="secondary"
              icon="images-outline"
              onPress={() => pickImage("gallery")}
            />
          </View>
        )}
      </ScrollView>

      <LoadingOverlay visible={analysisState === "loading"} message="Analyzing your meal…" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  emptyBlock: {
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  heading: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  subheading: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  previewBlock: {
    gap: SPACING.md,
  },
  preview: {
    width: "100%",
    height: 320,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.card,
  },
  error: {
    color: COLORS.error,
    fontSize: FONT_SIZE.md,
    backgroundColor: `${COLORS.error}22`,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
  },
});
