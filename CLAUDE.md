# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start dev server
npm start

# Run on device/emulator
npm run android
npm run ios

# Lint
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

Migrations are stored in `drizzle/` and bundled via `drizzle/migrations.js`. The app applies migrations automatically on startup via `initializeDatabase()` in `db/database.ts`.

## Architecture

This is a React Native / Expo app (Expo Router) for tracking domino game scores.

### Navigation

Expo Router file-based routing with three tabs (`app/(tabs)/`):
- `(game)/` — game setup (`index.tsx`) and active game (`game.tsx`)
- `history/` — past games list and round details
- `settings.tsx` — app settings

Stack modals: `modal.tsx` (tournament results), `info-modal.tsx`.

### State Management

Global game state lives in **Zustand** (`stores/use-game.ts`). It holds all in-memory game state: players, scores, game status, mode flags (tournament, trio, multiLose). Components access it via `useGame(state => state.field)`.

Three separate Zustand stores existed for: game state (`use-game`), score modal visibility (`use-score-modal`), and add-player dialog (`use-add-player-dialog`).

### Database (Drizzle + expo-sqlite)

Schema in `db/schema.ts` — four tables: `games`, `rounds`, `players`, `players_rounds`.

- `db/actions/` — write operations (insert/update/delete)
- `db/querys/` — read operations
- `db/database.ts` — initializes DB, runs migrations, seeds default settings

`players_rounds.scores` is stored as JSON (`text({ mode: 'json' })`).

### Styling

NativeWind (Tailwind CSS for React Native). Config in `tailwind.config.js`. Theme tokens defined in `lib/theme.ts`. Global styles in `global.css`. Use `className` props — no inline StyleSheet objects.

UI primitives are in `components/ui/` (shadcn-style components built on `@rn-primitives/*`).

### Internationalization

i18next with device locale detection. Translations in `locales/en.json` and `locales/es.json`. Access via the `useT()` hook (`hooks/use-translation.ts`), which wraps `useTranslation()`.

### Game Modes

- **Normal**: first to reach score limit wins, all others lose
- **Tournament**: multi-round; wins/losses tracked per player across rounds
- **Trio mode** (setting): highest scorer wins (+1 win), lowest loses (+1 loss), middle players unchanged
- **Multi-lose** (setting): all players except the winner receive a loss

### Platform Differences

iOS and Android have conditional behavior throughout — use `Platform.OS` / `Platform.select()`. The score modal (`ScoreModal`) renders only on Android. Tab bar uses SF Symbols on iOS and FontAwesome on Android.
