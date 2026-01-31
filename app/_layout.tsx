import '@/global.css';
import '@/lib/i18n';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';

import { initializeDatabase } from '@/db/database';
import { getThemeSetting } from '@/db/querys/settings';
import { useGame } from '@/stores/use-game';
import { PortalHost } from '@rn-primitives/portal';
import { useEffect } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const systemColorScheme = useSystemColorScheme();
  const loadSettings = useGame((state) => state.loadSettings);

  useEffect(() => {
    const initialize = async () => {
      await initializeDatabase();
      // Load settings after database is initialized
      await loadSettings();
      // Load and apply theme
      const theme = await getThemeSetting();
      if (theme === 'system') {
        setColorScheme(systemColorScheme ?? 'light');
      } else {
        setColorScheme(theme);
      }
    };

    initialize();
  }, [loadSettings, setColorScheme, systemColorScheme]);

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="modal"
          options={{ presentation: 'containedModal' }}
        />
        <Stack.Screen name="info-modal" options={{ presentation: 'modal' }} />
      </Stack>
      <PortalHost />
    </>
  );
}
