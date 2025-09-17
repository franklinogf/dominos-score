import { Stack } from "expo-router";

export default function GameLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name='index'
        options={{ title: "Home" }}
      />
      <Stack.Screen
        name='game'
        options={{ title: "Game" }}
      />
    </Stack>
  );
}
