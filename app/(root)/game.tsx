import { GameTotal } from "@/components/game-total";
import { PlayersButtons } from "@/components/players-buttons";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { GameStatus } from "@/lib/enums";
import { useGame } from "@/stores/use-game";
import { router } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Game() {
  const players = useGame((state) => state.players);
  const activePlayersCount = players.filter((p) => p.isPlaying).length;
  const gameStatus = useGame((state) => state.gameStatus);

  if (activePlayersCount === 0 || gameStatus === GameStatus.NotStarted) {
    router.replace("/");
    return null;
  }
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className='flex-1 bg-background'
    >
      <Text
        variant='h1'
        className='mb-4'
      >
        Game
      </Text>

      <View className='flex-1'>
        <PlayersButtons />
      </View>

      <Separator className='my-2' />

      <View className='h-16'>
        <GameTotal />
      </View>
    </SafeAreaView>
  );
}
