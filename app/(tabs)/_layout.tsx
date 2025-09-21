import useT from '@/hooks/use-translation';
import { NAV_THEME, THEME } from '@/lib/theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ThemeProvider } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const { t } = useT();
  const currentTheme = THEME[colorScheme ?? 'dark'];
  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'dark']}>
      <Tabs
        screenOptions={{
          // tabBarShowLabel: false,

          headerShown: false,
          tabBarActiveTintColor: currentTheme.primary,
          tabBarInactiveTintColor: currentTheme.mutedForeground,
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="(game)"
          options={{
            title: t('navigation.game'),
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="gamepad" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: t('navigation.history'),
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="history" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: t('navigation.settings'),
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="cog" color={color} size={size} />
            ),
          }}
        />
      </Tabs>
    </ThemeProvider>
  );
}
