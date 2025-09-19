# 🎯 Domino Score Tracker

A modern, feature-rich mobile app for tracking domino game scores, built with React Native and Expo. Perfect for tournament play or casual games with friends and family.

## ✨ Features

### 🎮 Game Modes
- **Traditional Mode**: First player to reach the score limit wins, all others lose
- **Tournament Mode**: Multi-round competitions with win/loss tracking
- **Trio Mode**: Unique scoring where the highest scorer wins, lowest scorer loses, and middle players remain unchanged

### 📊 Score Management
- **Real-time Score Tracking**: Add scores with tap or long-press for quick entry
- **Visual Feedback**: Animated score displays with winner/loser highlights
- **Flexible Player Count**: Support for 2-4 players in standard mode, 3+ in tournament mode
- **Customizable Score Limits**: Set winning score thresholds (100, 150, 200)

### 🏆 Tournament Features
- **Win/Loss Records**: Persistent tracking across multiple rounds
- **Game History**: Detailed view of past games with complete score breakdowns
- **Round Management**: Easy round completion with automatic win/loss assignment
- **Ranking System**: Smart tie handling in score displays

### ⚙️ Customization
- **Settings Panel**: Configure long-press score values and game modes
- **Theme Support**: Consistent design with light/dark mode compatibility
- **Haptic Feedback**: Tactile responses for enhanced user experience

### 💾 Data Persistence
- **SQLite Database**: Reliable local storage for all game data
- **Game History**: Complete record of all played games and rounds
- **Settings Sync**: Preferences automatically saved and loaded

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm
- Expo CLI
- iOS Simulator or Android Emulator (for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dominos-score
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on your device**
   - Scan the QR code with Expo Go app (iOS/Android)
   - Or press `i` for iOS simulator, `a` for Android emulator

### Building for Production

```bash
# Android
npm run build:android

# iOS (requires Apple Developer account)
eas build -p ios
```

## 🎯 How to Play

### Starting a Game
1. **Set Player Count**: Choose 2-4 players using the size selector
2. **Configure Settings**: Set tournament mode and trio mode as desired
3. **Add Players**: Enter player names or use default names
4. **Begin Playing**: Start adding scores as you play

### Adding Scores
- **Tap**: Add single points (typically 5)
- **Long Press**: Add configured long-press value (default: 10)
- **Custom Entry**: Use the points selection for specific values

### Game Modes Explained

#### Traditional Mode
- First player to reach the score limit wins
- All other players receive a loss
- Game ends immediately when limit is reached

#### Trio Mode
- Game ends when any player reaches the score limit
- **Winner**: Player with the highest total score (+1 win)
- **Loser**: Player with the lowest total score (+1 loss)
- **Others**: No change to win/loss record

#### Tournament Mode
- Multiple rounds with persistent win/loss tracking
- Players can be marked as playing/not playing each round
- Complete tournament statistics and history

## 🛠️ Tech Stack

### Frontend
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and build tools
- **TypeScript**: Type-safe development
- **NativeWind**: Tailwind CSS for React Native styling
- **React Native Reanimated**: Smooth animations and transitions

### State Management
- **Zustand**: Lightweight state management
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation

### Database
- **Expo SQLite**: Local database storage
- **Drizzle ORM**: Type-safe database operations


## 📱 App Structure

```
app/
├── (tabs)/                 # Tab-based navigation
│   ├── (game)/            # Game screens
│   │   ├── index.tsx      # Player setup
│   │   └── game.tsx       # Active game
│   ├── history/           # Game history
│   │   ├── index.tsx      # History list
│   │   └── rounds.tsx     # Game details
│   └── settings.tsx       # App settings
├── _layout.tsx            # Root layout
└── modal.tsx              # Tournament results

components/
├── game-*.tsx             # Game-related components
├── player-*.tsx           # Player management
└── ui/                    # Reusable UI components

db/
├── actions/               # Database operations
├── querys/                # Database queries
└── schema.ts              # Database schema

stores/
└── use-game.ts            # Game state management
```

## 🎨 Design Features

### Visual Feedback
- **Winner Animation**: Celebratory scaling and rotation effects
- **Loser Animation**: Subtle shake animation with color change
- **Score Highlights**: Green for winners, red for losers
- **Smooth Transitions**: React Native Reanimated for fluid UX

### Responsive Design
- **Flexible Layouts**: Adapts to different screen sizes
- **Touch-Friendly**: Large tap targets and gesture support
- **Accessibility**: Screen reader and keyboard navigation support

## 🔧 Configuration

### Settings
- **Long Press Score**: Customize quick-add score value (1-999)
- **Trio Mode**: Toggle alternative win/loss logic
- **Tournament Mode**: Enable multi-round gameplay

### Game Options
- **Player Count**: 2-4 players (2-6 in tournament mode)
- **Score Limit**: Customizable winning threshold
- **Player Names**: Editable player identification

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev) and [React Native](https://reactnative.dev)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com)
- Database powered by [Drizzle ORM](https://orm.drizzle.team)
- Icons by [Lucide](https://lucide.dev)

---

**Happy Gaming! 🎲**

*Track your domino games like a pro with this modern, intuitive score tracker.*
