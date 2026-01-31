import { Link, Stack } from 'expo-router';
import { InfoIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Pressable } from 'react-native';

export default function GameLayout() {
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#fff' : '#000';

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
          headerRight: () => (
            <Link href="/info-modal" asChild>
              <Pressable className="p-2">
                <InfoIcon size={22} color={iconColor} />
              </Pressable>
            </Link>
          ),
          title: 'Game',
          headerTitleStyle: { fontWeight: 'condensed', fontSize: 20 },
        }}
      />
    </Stack>
  );
}
