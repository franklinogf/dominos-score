import "@/global.css";
import { NAV_THEME, THEME } from "@/lib/theme";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const currentTheme = THEME[colorScheme ?? "dark"];
  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? "dark"]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarActiveTintColor: currentTheme.primary,
          tabBarInactiveTintColor: currentTheme.mutedForeground,
        }}
      >
        <Tabs.Screen
          name='(root)'
          options={{
            title: "Game",
            tabBarIcon: ({ color, size }) => (
              <FontAwesome
                name='gamepad'
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Tabs.Screen
          name='history'
          options={{
            title: "History",
            tabBarIcon: ({ color, size }) => (
              <FontAwesome
                name='history'
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Tabs.Screen
          name='settings'
          options={{
            title: "Settings",
            tabBarIcon: ({ color, size }) => (
              <FontAwesome
                name='cog'
                color={color}
                size={size}
              />
            ),
          }}
        />
      </Tabs>
      <PortalHost />
    </ThemeProvider>
  );
}
