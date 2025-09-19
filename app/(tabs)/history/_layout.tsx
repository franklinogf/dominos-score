import { Stack } from 'expo-router';

export default function HistoryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'History',
          headerTitle: 'Game History',
        }}
      />
      <Stack.Screen
        name="rounds"
        options={{ title: 'Rounds', headerShown: true }}
      />
    </Stack>
  );
}
