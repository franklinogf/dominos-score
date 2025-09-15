# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a **Dominos Score** Expo React Native application built with TypeScript. The project uses Expo Router for file-based routing and follows modern React Native development patterns with support for iOS, Android, and web platforms.

## Common Development Commands

### Setup & Dependencies
```bash
pnpm install          # Install dependencies (preferred package manager)
npm install           # Alternative package manager
```

### Development Server
```bash
npx expo start        # Start development server with QR code
npx expo start --android    # Start with Android emulator
npx expo start --ios        # Start with iOS simulator  
npx expo start --web        # Start web version
```

### Code Quality
```bash
npx expo lint         # Run ESLint checks
```

### Project Management
```bash
npm run reset-project # Reset to blank project (moves current code to app-example/)
```

## Architecture & Code Organization

### Routing Structure
- **File-based routing**: Each file in `app/` automatically becomes a route
- **Tab Navigation**: Main app uses tab-based navigation defined in `app/(tabs)/`
- **Layouts**: Shared layouts using `_layout.tsx` files at each directory level
- **Modal**: Modal screens configured in the root layout with stack navigation

### Component Architecture
- **Themed Components**: Custom themed components (`ThemedView`, `ThemedText`) that adapt to light/dark modes
- **UI Components**: Reusable UI elements in `components/ui/` (IconSymbol, Collapsible)
- **Interactive Components**: Haptic feedback integration with `HapticTab`
- **Hooks**: Custom hooks for theming (`use-theme-color`, `use-color-scheme`)

### Theming System
- **Colors**: Centralized theme colors in `constants/theme.ts` with light/dark mode support
- **Fonts**: Platform-specific font configurations (iOS system fonts, web fallbacks)
- **Theme Provider**: React Navigation's ThemeProvider manages app-wide theming
- **Dynamic Theming**: Automatic color scheme detection and theme switching

### Development Patterns
- **TypeScript**: Strict mode enabled with path aliases (`@/*` maps to project root)
- **Cross-platform**: Platform-specific code using `.ios.tsx` extensions when needed
- **New Architecture**: Expo's new architecture enabled for performance improvements
- **Experiments**: React Compiler and typed routes enabled for enhanced development experience

## Key Development Guidelines

### Adding New Screens
1. Create new file in `app/` directory (e.g., `app/profile.tsx`)
2. For tab screens: Add to `app/(tabs)/` and update `_layout.tsx`
3. Use `ThemedView` and `ThemedText` components for consistent theming

### Component Development
- Place shared UI components in `components/ui/`
- Use functional components with TypeScript
- Leverage theme hooks: `useThemeColor()`, `useColorScheme()`
- Follow existing component patterns for consistency

### Asset Management
- Images and icons stored in `assets/images/`
- Use relative imports for assets
- Platform-specific assets supported (adaptive icons for Android)

### Platform Considerations
- Web output configured as static build
- iOS supports tablets and new architecture features
- Android uses edge-to-edge display with adaptive icons
- Predictive back gestures disabled on Android

## Dependencies & Tools

- **Core**: Expo SDK 54, React 19, React Native 0.81
- **Navigation**: React Navigation with bottom tabs
- **UI**: Expo Vector Icons, React Native Reanimated, Gesture Handler
- **Development**: TypeScript, ESLint with Expo config
- **Package Management**: pnpm workspace with hoisted node linker