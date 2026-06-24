Build me a personal calorie tracking mobile app called CalAI using Expo (React Native) with TypeScript. This is for personal use only — single user, no authentication needed.

## Tech Stack

- Expo SDK (latest) with TypeScript
- React Native for UI
- Gemini 2.5 Flash API for food vision analysis (multimodal)
- Supabase for cloud database (Postgres) and photo storage
- expo-image-picker for camera/gallery access
- @supabase/supabase-js for database client
- expo-file-system for file handling

## Environment Variables

Create a .env file and use these keys (I will fill in the values):

- EXPO_PUBLIC_GEMINI_API_KEY
- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY

## Supabase Schema

Create a SQL setup file called supabase-schema.sql with:

CREATE TABLE meals (
id uuid primary key default gen_random_uuid(),
photo_url text,
name text,
calories int,
protein_g numeric,
carbs_g numeric,
fat_g numeric,
eaten_at timestamptz default now()
);

Also include instructions in the README for how to create a Supabase Storage bucket called "meal-photos" set to public.

## App Structure

Use Expo Router with tab navigation. Four screens:

1. **Camera Tab (index)** — Main screen
   - Large "Take Photo" button and "Choose from Gallery" button
   - Uses expo-image-picker
   - After picking/taking a photo, show a preview and an "Analyze" button
   - On analyze: show a loading spinner and call the Gemini API
   - Show results in an editable card (see Gemini section below)
   - "Save Meal" button saves to Supabase and navigates to the Log tab

2. **Log Tab** — Daily meal log
   - Shows today's meals as a list of cards (photo thumbnail, name, calories, macros)
   - At the top: daily totals bar showing calories / goal with a progress bar, plus protein/carbs/fat totals
   - Tap a meal to see full details
   - Swipe to delete a meal
   - Date picker to view past days

3. **Stats Tab** — Simple weekly overview
   - Bar chart of daily calories for the past 7 days using react-native-chart-kit or Victory Native
   - Average calories, highest day, lowest day

4. **Settings Tab**
   - Set daily calorie goal (default 2000)
   - Set macro goals (protein, carbs, fat in grams)
   - Store these in AsyncStorage

## Gemini API Integration

POST to: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=APIKEY

Send the image as base64 inline_data with mime_type "image/jpeg".

Use this exact prompt:
"You are a precise nutrition estimator. Analyze this food image and identify all visible food items. Return ONLY a valid JSON object with no markdown, no explanation, just the JSON: {\"items\": [{\"name\": string, \"calories\": number, \"protein_g\": number, \"carbs_g\": number, \"fat_g\": number}], \"total_calories\": number, \"meal_name\": string}. Estimate realistic portion sizes from visual cues. If you cannot identify food, return {\"error\": \"No food detected\"}."

Parse the JSON response. Handle errors gracefully.

## Results Card (editable)

After Gemini returns results, show:

- The meal photo
- Detected meal name (editable TextInput)
- A list of food items found, each showing name + calories (editable)
- Total calories (auto-summed from items, also shown large)
- Protein / Carbs / Fat totals in a row
- "Save Meal" button
- "Retake" button

All calorie and macro values should be editable TextInputs so the user can correct wrong estimates.

## Saving a Meal

1. Upload the photo to Supabase Storage bucket "meal-photos" as a JPEG
2. Get the public URL
3. Insert a row into the meals table with all macro data and the photo_url
4. Navigate to the Log tab and refresh

## Design

- Dark theme throughout (background #0a0a0a, cards #1a1a1a)
- Accent color: vibrant green #00ff88
- Large readable typography, generous padding
- Smooth loading states with ActivityIndicator
- Clean card components with rounded corners (borderRadius 16)
- Show macro breakdown as colored pill badges: protein=blue, carbs=orange, fat=yellow

## Error Handling

- No internet connection: show friendly error
- Gemini returns no food: show "Couldn't detect food, try a clearer photo"
- Supabase save fails: show error but keep results on screen so user doesn't lose data

## README

Include a clear README.md with:

1. How to clone and install (npm install)
2. How to fill in .env variables
3. How to run the Supabase schema SQL
4. How to start with npx expo start
5. Note that the app is developed on Windows — iOS build will be done later via EAS Build

## Windows Compatibility

Make sure nothing in the setup assumes macOS. Use cross-platform paths and commands. The app will be tested in the Expo web browser preview (npx expo start --web) and via EAS Build for iOS later.

Do not use local SQLite. All data goes to Supabase. Do not add authentication — single user app, no login screen needed.
