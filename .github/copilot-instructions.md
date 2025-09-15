# Copilot Instructions for AI Agents

## Project Overview
- This is an [Expo](https://expo.dev) React Native project, created with `create-expo-app`.
- The main application code is in the `app/` directory, using [file-based routing](https://docs.expo.dev/router/introduction).
- Components are organized under `components/`, with reusable UI elements in `components/ui/`.
- The project uses TypeScript (`tsconfig.json`), and linting is configured via `eslint.config.js`.
- Assets (images, icons) are in `assets/images/`.

## Key Workflows
- **Install dependencies:** `npm install` or `pnpm install`
- **Start development server:** `npx expo start`
- **Reset to a fresh project:** `npm run reset-project` (runs `scripts/reset-project.js`)
- **Edit app:** Modify files in `app/` for routes/screens, and `components/` for UI logic.

## Project Conventions
- **Routing:** Each file in `app/` (and subfolders) defines a route. Use `_layout.tsx` for shared layouts.
- **Tabs:** The `app/(tabs)/` directory contains tabbed navigation screens and their layout.
- **Theming:** Use hooks from `hooks/` (e.g., `use-theme-color.ts`) and constants from `constants/theme.ts` for consistent theming.
- **Component Structure:** Prefer functional components. Place shared UI in `components/ui/`.
- **Assets:** Reference images from `assets/images/` using relative imports.

## Integration & Dependencies
- Uses Expo and React Native libraries (see `package.json` and `pnpm-lock.yaml`).
- Linting via `eslint.config.js` and `eslint-config-expo`.
- TypeScript for type safety.

## Examples
- To add a new screen: create a new file in `app/`, e.g., `app/profile.tsx`.
- To add a new tab: update `app/(tabs)/_layout.tsx` and add a new file in `app/(tabs)/`.
- To use a theme color: `import { useThemeColor } from '../hooks/use-theme-color'`.

## References
- [Expo Docs](https://docs.expo.dev/)
- [File-based Routing](https://docs.expo.dev/router/introduction/)

---

**AI agents:** Follow these conventions and workflows for best results. If unsure about a pattern, check the referenced files or Expo documentation.