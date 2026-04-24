# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start dev server
npm start

# Run on device/emulator
npm run android
npm run ios

# Lint (auto-fix)
npm run lint

# Format
npm run format

# Production builds via EAS
npm run build:android           # production
npm run build:android:preview   # preview
```

### Database migrations

After modifying `db/schema.ts`, generate a new migration:

```bash
npx drizzle-kit generate
```

Migrations live in `drizzle/` and are bundled via `drizzle/migrations.js`. The app runs them automatically on startup via `initializeDatabase()` in `db/database.ts`, which also seeds default settings into the `settings` table if they don't exist.

## Architecture

React Native / Expo app (SDK 55, React 19) using Expo Router for tracking domino game scores.

### Navigation

Expo Router file-based routing with three tabs (`app/(tabs)/`):
- `(game)/` — game setup (`index.tsx`) and active game (`game.tsx`)
- `history/` — past games list and round details
- `settings.tsx` — app settings

Stack modals: `modal.tsx` (tournament player selection / round results), `info-modal.tsx`.

### State Management

Three Zustand v5 stores:
- `stores/use-game.ts` — all in-memory game state (players, scores, game status, mode flags). The `GameStatus` enum drives the UI: `NotStarted → Ready → InProgress → Finished`, then back to `Ready` after `endRound()` or `NotStarted` after `endGame()`.
- `stores/use-score-modal.ts` — Android score entry dialog visibility + target player ID
- `stores/use-add-player-dialog.ts` — tournament add-player dialog visibility

Always access Zustand with a selector: `useGame(state => state.field)`. Avoid `useGame()` without a selector (subscribes to full store).

Settings (`trioMode`, `multiLose`) are loaded from the DB into `use-game` on app startup via `loadSettings()` in `_layout.tsx`. When settings are changed in the Settings screen, they are saved to the DB **and** pushed into the store via `setTrioMode` / `setMultiLose`.

### Score Entry Flow

- **iOS**: tapping a player button opens a native `Alert.prompt`
- **Android**: tapping opens `ScoreModal` (Dialog), controlled by `use-score-modal`
- Double-tap adds `DEFAULT_DOUBLE_PRESS_SCORE` (60 pts); long-press adds `longPressScore` (configurable, default 30 pts)
- `addScoreToPlayer` / `removeScoreFromPlayer` in the store call `checkWinnerWhenUpdatingScore()` **synchronously** after the Zustand `set()` — never wrap these in `setTimeout`, as that causes React 19 warnings about state updates on not-yet-mounted components.

### Database (Drizzle + expo-sqlite)

Schema in `db/schema.ts` — five tables: `games`, `rounds`, `players`, `players_rounds`, `settings`.

- `db/actions/` — write operations (insert/update/delete)
- `db/querys/` — read operations
- `players_rounds.scores` is stored as JSON (`text({ mode: 'json' })`)
- `settings` is a simple key/value string table; all values are stored as strings and parsed on read

### Styling

NativeWind (Tailwind CSS for React Native). Config in `tailwind.config.js`. Theme tokens in `lib/theme.ts`. Global styles in `global.css`. Use `className` props — no inline `StyleSheet` objects.

UI primitives in `components/ui/` are shadcn-style components built on `@rn-primitives/*`.

### Internationalization

i18next with device locale detection. Translations in `locales/en.json` and `locales/es.json`. Always use the `useT()` hook from `hooks/use-translation.ts` (wraps `useTranslation()`), never call `useTranslation()` directly.

### Game Modes

- **Normal**: first player to reach `winningLimit` wins; all others lose
- **Tournament**: multi-round; `modal.tsx` used between rounds to select active players; wins/losses tracked across rounds on the `Player` type in memory and persisted to `playersTable`
- **Trio mode** (setting, default on): exactly 3 active players — highest scorer wins (+1 win), lowest scorer loses (+1 loss), middle player unchanged
- **Multi-lose** (setting, default off): players with zero score in the losing group receive +2 losses instead of +1

### Platform Differences

- `ScoreModal` renders only on Android; iOS uses `Alert.prompt`
- Tab bar uses SF Symbols on iOS and FontAwesome on Android
- Use `Platform.OS` / `Platform.select()` for any platform-specific branches
