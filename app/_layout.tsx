import '@/global.css';
import '@/lib/i18n';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';

import { initializeDatabase } from '@/db/database';
import { useGame } from '@/stores/use-game';
import { PortalHost } from '@rn-primitives/portal';
import { useEffect } from 'react';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const loadSettings = useGame((state) => state.loadSettings);

  useEffect(() => {
    const initialize = async () => {
      await initializeDatabase();
      // Load settings after database is initialized
      await loadSettings();
    };

    initialize();
  }, [loadSettings]);

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="modal"
          options={{ presentation: 'containedModal' }}
        />
      </Stack>
      <PortalHost />
    </>
  );
}
