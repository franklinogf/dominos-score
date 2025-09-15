import { Text } from "@/components/ui/text";
import { useLocalSearchParams } from "expo-router";
// import { router, useRouter } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function Game() {
  const { gameSize, players: playersJson } = useLocalSearchParams<{
    gameSize: string;
    players: string;
  }>();
  const players = JSON.parse(playersJson) as Record<string, string>;
  return (
    <SafeAreaView className='flex-1 bg-background'>
      <Text variant={"h1"}>Game</Text>
      <View className='px-4 mt-4'>
        {Object.entries(players).map(([key, name]) => (
          <Text key={key}>{name}</Text>
        ))}
      </View>
    </SafeAreaView>
  );
}
