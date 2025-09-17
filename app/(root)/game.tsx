import { GameEndingButtons } from "@/components/game-ending-buttons";
import { GameScore } from "@/components/game-score";
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
  const tournamentMode = useGame((state) => state.tournamentMode);

  if (activePlayersCount === 0 || gameStatus === GameStatus.NotStarted) {
    router.replace("/");
    return null;
  }

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className='flex-1 bg-background px-2'
    >
      <View className='py-3'>
        <Text
          variant='h2'
          className='text-center mb-3 '
        >
          {tournamentMode ? "Tournament in Progress" : "Game in Progress"}
        </Text>
        <GameEndingButtons />
      </View>

      <PlayersButtons />

      <Separator className='mt-2' />

      <View className='flex-1'>
        <GameScore />
      </View>

      <Separator className='my-2' />

      <View className='h-16'>
        <GameTotal />
      </View>
    </SafeAreaView>
  );
}
