import '@/global.css';
import '@/lib/i18n';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';

import { Text } from '@/components/ui/text';
import { expoDB, initializeDatabase } from '@/db/database';
import { getUnfinishedGame } from '@/db/querys/game';
import { getThemeSetting } from '@/db/querys/settings';
import { buildRestoredGameState } from '@/lib/game-restore';
import { useGame } from '@/stores/use-game';
import { PortalHost } from '@rn-primitives/portal';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import { useEffect, useState } from 'react';
import {
  Platform,
  View,
  useColorScheme as useSystemColorScheme,
} from 'react-native';

export default function RootLayout() {
  useDrizzleStudio(expoDB);
  const { colorScheme, setColorScheme } = useColorScheme();
  const systemColorScheme = useSystemColorScheme();
  const loadSettings = useGame((state) => state.loadSettings);
  const restoreGame = useGame((state) => state.restoreGame);
  const [isDbReady, setIsDbReady] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        await initializeDatabase();
        // Load settings after database is initialized
        await loadSettings();
        // Restore any in-progress game from a previous session
        const unfinished = await getUnfinishedGame();
        if (unfinished) {
          const { trioMode } = useGame.getState();
          restoreGame(
            unfinished.id,
            buildRestoredGameState(unfinished, trioMode),
          );
        }
        // Load and apply theme
        const theme = await getThemeSetting();
        if (theme === 'system') {
          setColorScheme(
            systemColorScheme === 'unspecified' ? 'system' : systemColorScheme,
          );
        } else {
          setColorScheme(theme);
        }

        if (isMounted) {
          setIsDbReady(true);
        }
      } catch (error) {
        console.error('App initialization failed:', error);
        if (isMounted) {
          setInitError(
            error instanceof Error ? error : new Error(String(error)),
          );
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [loadSettings, setColorScheme, systemColorScheme, restoreGame]);

  if (!isDbReady) {
    return (
      <>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <View className="flex-1 items-center justify-center bg-background px-6">
          <Text className="text-center text-muted-foreground">
            {initError ? 'Unable to initialize app data.' : 'Loading...'}
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="modal"
          options={{ presentation: 'containedModal' }}
        />
        <Stack.Screen
          name="info-modal"
          options={{
            presentation: Platform.OS === 'ios' ? 'modal' : 'formSheet',
          }}
        />
      </Stack>
      <PortalHost />
    </>
  );
}
