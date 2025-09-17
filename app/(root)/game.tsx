import { GameScore } from "@/components/game-score";
import { GameTotal } from "@/components/game-total";
import { PlayersButtons } from "@/components/players-buttons";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { GameStatus } from "@/lib/enums";
import { useGame } from "@/stores/use-game";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { router } from "expo-router";
import { Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Game() {
  const players = useGame((state) => state.players);
  const activePlayersCount = players.filter((p) => p.isPlaying).length;
  const gameStatus = useGame((state) => state.gameStatus);
  const updateGameStatus = useGame((state) => state.updateGameStatus);
  const tournamentMode = useGame((state) => state.tournamentMode);

  if (activePlayersCount === 0 || gameStatus === GameStatus.NotStarted) {
    router.replace("/");
    return null;
  }

  const handleEndRound = () => {
    impactAsync(ImpactFeedbackStyle.Medium);
    Alert.alert("End Round", "Are you sure you want to end this round?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "End Round",
        style: "destructive",
        onPress: () => {
          impactAsync(ImpactFeedbackStyle.Heavy);
          // Logic to end round - maybe navigate to tournament modal for next round
          router.push("/");
        },
      },
    ]);
  };

  const handleEndGame = () => {
    impactAsync(ImpactFeedbackStyle.Medium);
    Alert.alert(
      "End Game",
      "Are you sure you want to end the entire game? This will reset all scores.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "End Game",
          style: "destructive",
          onPress: () => {
            impactAsync(ImpactFeedbackStyle.Heavy);
            updateGameStatus(GameStatus.NotStarted);
            router.replace("/");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className='flex-1 bg-background'
    >
      {/* Sticky Header */}
      <View className='px-2 py-3 bg-background'>
        <Text
          variant='h2'
          className='text-center mb-3 font-semibold'
        >
          {tournamentMode ? "Tournament in Progress" : "Game in Progress"}
        </Text>

        <View className='flex-row gap-3'>
          <Button
            size='sm'
            variant='destructive'
            className='flex-1 bg-orange-400 active:bg-orange-400/80'
            onPress={handleEndRound}
          >
            <Text>End Round</Text>
          </Button>

          <Button
            size='sm'
            variant='destructive'
            className='flex-1 '
            onPress={handleEndGame}
          >
            <Text>{tournamentMode ? "End Tournament" : "End Game"}</Text>
          </Button>
        </View>
      </View>

      <View>
        <PlayersButtons />
      </View>
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
