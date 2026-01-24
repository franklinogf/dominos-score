# Copilot Instructions for Domino Score Tracker

## Project Overview

A mobile app for tracking domino game scores with support for 2-10 players. Built with Expo SDK 54 and React Native.

### Game Modes
- **Normal Mode**: First player to reach the winning score limit wins
- **Tournament Mode**: Multi-round competition tracking wins/losses across rounds
- **Trio Mode**: Highest scorer wins, lowest loses, middle players unchanged

### Key Features
- Tap to add 5 points, long-press to add configurable points (default: 30)
- Long-press on score items to remove them
- Haptic feedback on interactions
- Complete game history with round breakdowns
- English and Spanish localization

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Expo SDK 54, React Native 0.81, React 19 |
| Routing | Expo Router 6 (file-based, typed routes) |
| State | Zustand 5 |
| Database | Drizzle ORM + expo-sqlite |
| Styling | NativeWind 4 (Tailwind CSS for RN) |
| Forms | react-hook-form + Zod |
| i18n | i18next + expo-localization |
| UI Primitives | @rn-primitives/* (accessible components) |
| Icons | lucide-react-native |
| Animations | react-native-reanimated |

---

## Project Structure

```
app/                    # File-based routing (screens)
├── _layout.tsx         # Root layout (DB init, providers)
├── modal.tsx           # Tournament player selection
└── (tabs)/
    ├── _layout.tsx     # Tab navigation
    ├── settings.tsx    # App settings
    ├── (game)/         # Game flow screens
    │   ├── index.tsx   # Game setup (home)
    │   └── game.tsx    # Active game
    └── history/        # Game history screens
        ├── index.tsx   # Game list
        └── rounds.tsx  # Round details

components/             # React components
├── *.tsx               # Feature components (game-score, players-form, etc.)
└── ui/                 # Reusable UI primitives (button, input, dialog, etc.)

stores/                 # Zustand stores
├── use-game.ts         # Main game state (players, scores, game status)
├── use-score-modal.ts  # Score modal UI state
└── use-add-player-dialog.ts

db/                     # Database layer (Drizzle ORM)
├── database.ts         # DB initialization & migrations
├── schema.ts           # Table definitions & relations
├── actions/            # Write operations (mutations)
│   ├── game.ts         # addNewGame, removeGame
│   ├── round.ts        # newRoundWithResults
│   └── settings.ts     # saveSettings
└── querys/             # Read operations
    ├── game.ts         # getAllGames, getGameById
    ├── player.ts       # insertPlayer, incrementWins
    ├── round.ts        # insertRound
    └── settings.ts     # getSetting

hooks/                  # Custom React hooks
├── use-translation.ts  # i18n wrapper (useT)
└── use-tournament-title.ts

lib/                    # Utilities & constants
├── constants.ts        # POINTS, MAX_PLAYERS, etc.
├── enums.ts            # GameStatus, GameType
├── types.d.ts          # Player, Score, Point types
├── utils.ts            # cn() utility for class merging
├── theme.ts            # Theme colors (light/dark)
└── i18n.ts             # i18next configuration

locales/                # Translation files
├── en.json
└── es.json

drizzle/                # Database migrations
```

---

## Code Patterns

### Component Pattern (CVA + NativeWind)

UI components use `class-variance-authority` for variants:

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-md',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        destructive: 'bg-destructive',
        outline: 'border border-input bg-background',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-9 px-3',
        lg: 'h-11 px-6',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  className?: string;
}

function Button({ variant, size, className, ...props }: ButtonProps) {
  return <Pressable className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
```

### Zustand Store Pattern

Use selector pattern to prevent unnecessary re-renders:

```tsx
// ✅ Good - only re-renders when players change
const players = useGame((state) => state.players);

// ❌ Avoid - re-renders on any state change
const { players } = useGame();
```

Store structure with actions:

```tsx
export const useGame = create<GameState>((set, get) => ({
  players: [],
  gameStatus: GameStatus.NotStarted,
  
  // Simple setter
  updateGameSize: (size) => set({ gameSize: size }),
  
  // Complex action using get()
  addScoreToPlayer: (playerId, score) => {
    const { players } = get();
    // ... update logic
    set({ players: updatedPlayers });
  },
}));
```

### Database Access Pattern

Always use `db/actions/` for writes and `db/querys/` for reads:

```tsx
// Reading data
import { getAllGames } from '@/db/querys/game';
const games = await getAllGames();

// Writing data
import { addNewGame } from '@/db/actions/game';
await addNewGame({ gameSize: 4, type: GameType.NORMAL });
```

Type inference from Drizzle:

```tsx
// Infer types from schema
export type Game = typeof gamesTable.$inferSelect;
export type NewGame = typeof gamesTable.$inferInsert;

// Infer from query result
export type GameWithRounds = Awaited<ReturnType<typeof getGameById>>;
```

### Form Validation Pattern

Use Zod with i18n for error messages:

```tsx
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useT } from '@/hooks/use-translation';

const createSchema = (t: TFunction) => z.object({
  playerName: z.string().min(1, t('validation.nameRequired')),
});

function MyForm() {
  const { t } = useT();
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(createSchema(t)),
  });
}
```

### Translation Pattern

Use the `useT()` hook (wrapper around react-i18next):

```tsx
import { useT } from '@/hooks/use-translation';

function MyComponent() {
  const { t } = useT();
  
  return (
    <Text>{t('game.score')}</Text>
    <Text>{t('game.playerWins', { name: 'John' })}</Text>
  );
}
```

Translation keys are organized by feature in `locales/*.json`:
- `common.*` - Shared strings (save, cancel, etc.)
- `game.*` - Game-related strings
- `settings.*` - Settings screen
- `history.*` - History screens
- `validation.*` - Form validation errors
- `modal.*` - Modal content

### Haptic Feedback Pattern

Use expo-haptics for tactile feedback on interactions:

```tsx
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';

// On button press
await impactAsync(ImpactFeedbackStyle.Medium);

// On success
await impactAsync(ImpactFeedbackStyle.Heavy);
```

### Platform-Specific Styling

Use `Platform.select()` for web vs native differences:

```tsx
import { Platform } from 'react-native';

const styles = cn(
  'rounded-md',
  Platform.select({
    web: 'focus-visible:ring-2 cursor-pointer',
    native: 'active:opacity-80',
  })
);
```

---

## Styling Guidelines

### Use NativeWind (Tailwind) Classes

```tsx
// ✅ Good
<View className="flex-1 p-4 bg-background">
  <Text className="text-lg font-semibold text-foreground">Hello</Text>
</View>

// ❌ Avoid inline styles
<View style={{ flex: 1, padding: 16 }}>
```

### Theme Colors (HSL CSS Variables)

Use semantic color tokens from `global.css`:

| Token | Usage |
|-------|-------|
| `background` / `foreground` | Main bg/text |
| `primary` / `primary-foreground` | Buttons, links |
| `secondary` / `secondary-foreground` | Secondary actions |
| `muted` / `muted-foreground` | Disabled, hints |
| `destructive` | Delete actions |
| `accent` | Highlights |
| `card` | Card backgrounds |
| `border` / `input` / `ring` | Borders, focus |

### Class Merging Utility

Always use `cn()` for conditional/merged classes:

```tsx
import { cn } from '@/lib/utils';

<View className={cn(
  'rounded-md p-4',
  isActive && 'bg-primary',
  className
)} />
```

---

## Development Commands

```bash
# Install dependencies
pnpm install

# Start dev server
npx expo start

# Run on specific platform
npx expo run:ios
npx expo run:android

# Generate DB migrations after schema changes
npx drizzle-kit generate

# Build for production
eas build --platform android
eas build --platform ios
```

---

## Do's and Don'ts

### ✅ Do

- Use `@/` path alias for imports (e.g., `import { cn } from '@/lib/utils'`)
- Place new UI primitives in `components/ui/`
- Place feature components in `components/`
- Use Zustand selectors to access state
- Add translations for all user-facing strings
- Use `impactAsync()` for interactive feedback
- Infer types from Drizzle schema
- Keep DB reads in `db/querys/` and writes in `db/actions/`

### ❌ Don't

- Access database directly outside `db/` folder
- Use inline styles instead of Tailwind classes
- Destructure entire Zustand store (causes unnecessary re-renders)
- Hardcode strings (use translations)
- Create new state management patterns (use existing Zustand stores)
- Skip type safety (always type props and state)

---

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | kebab-case | `game-score.tsx` |
| Hooks | `use-*.ts` | `use-translation.ts` |
| Stores | `use-*.ts` | `use-game.ts` |
| Types | PascalCase | `Player`, `GameStatus` |
| Routes | kebab-case | `app/game.tsx` |

---

## References

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [NativeWind](https://www.nativewind.dev/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [react-hook-form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)