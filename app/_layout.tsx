import '@/global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';

import { initializeDatabase } from '@/db/database';
import { useEffect } from 'react';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  useEffect(() => {
    initializeDatabase();
  }, []);

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
    </>
  );
}
