# CalAI 🥗

A personal, single-user calorie tracker built with **Expo (React Native) + TypeScript**.
Snap a photo of your meal, let **Gemini 2.5 Flash** estimate the nutrition, correct anything
that looks off, and save it to **Supabase**. No accounts, no login — it's just for you.

## Features

- 📷 **Camera tab** — take/choose a photo, analyze it with AI, edit the results, save.
- 📋 **Log tab** — today's meals with daily calorie/macro totals, a progress bar, date picker, swipe-to-delete, and tap-for-details.
- 📊 **Stats tab** — a 7-day calorie bar chart plus average / highest / lowest.
- ⚙️ **Settings tab** — set your daily calorie and macro goals (stored on-device).

---

## 1. Clone & install

```bash
git clone https://github.com/harishuss1/calai.git
cd calai
npm install
```

> Works on **Windows** and **macOS** — all commands below are cross-platform. You'll need
> **Node.js (LTS)** installed (`brew install node` on macOS, or [nodejs.org](https://nodejs.org)).
> You can preview in the browser (`--web`) or run on a real device with **Expo Go** (see §4).

## 2. Configure environment variables

Copy the example file and fill in your own keys:

```bash
cp .env.example .env       # macOS / Linux
copy .env.example .env     # Windows (PowerShell/CMD)
```

Then edit `.env`:

```
EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-key
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

- **Gemini key** — from [Google AI Studio](https://aistudio.google.com/app/apikey).
- **Supabase URL & anon key** — Supabase dashboard → Project Settings → API.

> `.env` is git-ignored and must never be committed — only `.env.example` is tracked. This also
> means your keys **don't** travel through `git clone`: on a new machine (e.g. moving from
> Windows to a Mac), recreate `.env` and paste the same key values in.

## 3. Set up Supabase

### a) Create the table

In your Supabase project: **SQL Editor → New query**, paste the contents of
[`supabase-schema.sql`](./supabase-schema.sql), and **Run**.

### b) Create the photo storage bucket

1. Go to **Storage** in the Supabase dashboard.
2. Click **New bucket**.
3. Name it exactly **`meal-photos`**.
4. Toggle **Public bucket** ON (so saved meal photos render in the app).
5. Click **Create bucket**.

## 4. Run the app

```bash
npx expo start          # starts Metro + shows a QR code
npx expo start --web    # open the browser preview directly
```

From the running dev server, press `w` for the web preview, or scan the QR code to run on a
phone (next section).

### Run on your phone (Expo Go)

1. Install **Expo Go** on your phone (App Store / Play Store).
2. Make sure the phone and computer are on the **same Wi-Fi network**.
3. Run `npx expo start`, then scan the QR code:
   - **iPhone** — open the **Camera** app, point it at the QR, tap the Expo banner.
   - **Android** — open **Expo Go** → "Scan QR code".
4. The app loads on your device and hot-reloads as you edit.

> On locked-down / corporate Wi-Fi where the phone can't reach the dev server, use
> `npx expo start --tunnel` instead (slightly slower, but routes around network restrictions).

Type-check at any time:

```bash
npm run typecheck
```

---

## Project structure

```
calai/
├── app/(tabs)/        # Screens: index (camera), log, stats, settings
├── components/        # Reusable UI (MealCard, MacroBadge, ResultsCard, …)
├── services/          # gemini.ts, supabase.ts — all external I/O
├── hooks/             # useMeals, useSettings, useMealAnalysis, useWeeklyStats
├── types/index.ts     # All shared types
├── constants/theme.ts # Colors, spacing, radii, font sizes
└── utils/             # Pure helpers (macros, date, image)
```

Coding standards for this project live in [`CODE_QUALITY.md`](./CODE_QUALITY.md).

## iOS build (later)

```bash
npm install -g eas-cli
eas login
eas build --platform ios
```

EAS builds in the cloud, so no macOS machine is required.

---

## Notes

- This is a **single-user app with no authentication** by design. The Supabase RLS policy in
  `supabase-schema.sql` grants the anon key full access — fine for a personal project, **not**
  suitable for a multi-user/public deployment.
- Photos are resized to ≤1024px and re-compressed (JPEG q0.7) before analysis to keep Gemini
  requests fast and within the free tier.
- All data lives in Supabase (Postgres + Storage). There is **no** local SQLite database.
```
