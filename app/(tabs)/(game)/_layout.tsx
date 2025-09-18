import { Stack } from 'expo-router';

export default function GameLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: 'Home',
        }}
      />
      <Stack.Screen
        name="game"
        options={{
          title: 'Game',
          headerTitleStyle: { fontWeight: 'bold', fontSize: 30 },
        }}
      />
    </Stack>
  );
}
