# Digital Ghanti — Workspace Guide

A standalone mobile app: **shake the device → the bell rings.** Built on the same stack and
conventions as `ibiz_v2/ibiz_mobile_v2` (see that repo for the reference implementation).

**Product:** "Digital Ghanti" — a digital temple/school bell. Accent is saffron `#F59E0B`
(strong `#FBBF24`, soft `#92400E`). No backend, no auth, no tenancy — 100% client-side.

## Stack

Expo SDK 57 (dev-client/prebuild) + React Native 0.86 + TypeScript ~6 + expo-router
+ NativeWind 4.2. Forget the monorepo — this is a single Expo app at the repo root.

## Commands

- `npm run start` — Expo dev server (dev-client / Expo Go / web)
- `npm run android` / `npm run ios` / `npm run web`
- `npm run lint` — `tsc --noEmit` typecheck (no ESLint)
- `npx expo export --platform web|android` — smoke-test the Metro bundle
- `node scripts/generate-bell-tone.js` — regenerate the bundled bell WAV tones

## Code search — use the MCP FIRST

The workspace is indexed in the **codebase-memory MCP** (see `.codebase-memory/`). Prefer
`search_graph` / `get_code_snippet` / `trace_path` over `grep`/`glob`. Re-index with
`codebase-memory_index_repository` after significant changes.

## Structure (follow)

```
scripts/
  generate-bell-tone.js      # synthesizes assets/sounds/*.wav (no external audio)
assets/
  sounds/                    # bundled bell tones (temple.wav, school.wav, ding.wav)
  images/                    # icon + splash
src/
  app/                       # expo-router routes (file-based)
    _layout.tsx              # root: PreferenceProvider + Stack; imports global.css
    index.tsx                # thin re-export of modules/home/homeScreen
  components/
    ui/<Component>/          # shared atomic UI, folder-per-component
  context/PreferenceContext.tsx   # settings state (sensitivity, tone, haptics) + async-storage
  lib/
    shake.ts                 # accelerometer shake detection
    sound/bellPlayer.ts      # expo-audio playback helpers
    hooks/useShakeDetect.ts  # shake hook (wires shake.ts -> callback)
    hooks/useBellPlayer.ts   # bell playback hook
    audio.ts                 # setAudioMode global config
  modules/
    home/homeScreen.tsx      # bell screen
    settings/settingsScreen.tsx  # sensitivity / tone / haptics
  styles/tokens.ts           # saffron palette (matches tailwind.config.js)
  global.css                 # Tailwind directives (NativeWind entry)
```

## Rules

1. **Folder-per-component** — every component/screen gets its own folder named after it
   (`components/ui/Button/Button.tsx`, `modules/home/homeScreen.tsx`). No loose `.tsx`
   files in category folders.
2. **Imports: `@/` absolute only** (`@/lib/shake`, `@/context/PreferenceContext`). No deep
   relative imports.
3. **Hooks & services separation** — screens consume hooks; hooks wrap services. Shared
   hooks live in `lib/hooks/`, never per screen.
4. **Sensor lifecycle** — the Accelerometer must be unsubscribed on unmount and when the
   app is backgrounded (AppState). Guard with `Accelerometer.isAvailableAsync()` so web/dev
   degrade gracefully. Debounce rings (~700ms minimum interval). Never leak listeners.
5. **Audio** — use `expo-audio` (expo-av is deprecated). Configure
   `setAudioModeAsync({ playsInSilentMode: true })` so the bell rings even in silent mode.
   Replay via `seekTo(0)` then `play()`.
6. **Styling** — NativeWind utility classes using the **CSS-variable token form**:
   `bg-[var(--accent)]`, `text-[var(--text-primary)]`, `border-[var(--line)]`,
   `bg-[var(--surface)]`, `bg-[var(--elevated)]`. **CRITICAL:** NativeWind 4.2 compiles
   with Tailwind v3 — the v4 paren syntax `bg-(--accent)` is **silently dropped** (works on
   web by luck, breaks native). Always bracket form with `var(...)`. Do not use alpha
   modifiers on var classes (`bg-[var(--accent)]/10` unsupported). Icons via
   `lucide-react-native` with colors from `useTheme()`, never hardcoded hexes.
7. **No new dependencies without asking** — packages already approved: `nativewind`,
   `tailwindcss@^3.4.17`, `lucide-react-native`, `react-native-svg`,
   `react-native-reanimated`, `expo-sensors` (accelerometer), `expo-audio` (bell sound),
   `expo-haptics`, `@react-native-async-storage/async-storage` (settings persistence),
   `expo-*` modules in package.json.
8. **Sound assets are generated, never binary-committed from the web** — the bell tones in
   `assets/sounds/` come from `scripts/generate-bell-tone.js`. If you change the script,
   regenerate the WAVs in the same change.
9. **No secrets** — never commit `.env`, keys, or tokens. (Nothing here talks to a server.)

## Definition of Done

- `npm run lint` (tsc --noEmit) — zero errors
- `npx expo export --platform web` (and `--platform android`) — bundle succeeds
- Sensor + audio verified on a **physical device** (shake cannot be felt in the simulator/web)