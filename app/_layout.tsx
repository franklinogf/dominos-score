import '@/global.css';
import '@/lib/i18n';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';

import { initializeDatabase } from '@/db/database';
import { getUnfinishedGame } from '@/db/querys/game';
import { getThemeSetting } from '@/db/querys/settings';
import { GameType } from '@/lib/enums';
import { Player } from '@/lib/types';
import { useGame } from '@/stores/use-game';
import { PortalHost } from '@rn-primitives/portal';
import { useEffect } from 'react';
import { Platform, useColorScheme as useSystemColorScheme } from 'react-native';

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const systemColorScheme = useSystemColorScheme();
  const loadSettings = useGame((state) => state.loadSettings);
  const restoreGame = useGame((state) => state.restoreGame);

  useEffect(() => {
    const initialize = async () => {
      await initializeDatabase();
      // Load settings after database is initialized
      await loadSettings();
      // Restore any in-progress game from a previous session
      const unfinished = await getUnfinishedGame();
      if (unfinished) {
        const players: Player[] = unfinished.players.map((p) => ({
          id: String(p.id),
          name: p.name,
          wins: p.wins,
          losses: p.losses,
          isPlaying: false,
          score: [],
        }));
        restoreGame(
          unfinished.id,
          players,
          unfinished.type === GameType.TOURNAMENT,
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
    };

    initialize();
  }, [loadSettings, setColorScheme, systemColorScheme, restoreGame]);

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
