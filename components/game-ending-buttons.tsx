import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Alert, View } from "react-native";

import { GameStatus } from "@/lib/enums";
import { useGame } from "@/stores/use-game";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { router } from "expo-router";

export function GameEndingButtons() {
  const updateGameStatus = useGame((state) => state.updateGameStatus);
  const tournamentMode = useGame((state) => state.tournamentMode);
  const startNewRound = useGame((state) => state.startNewRound);

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
          if (tournamentMode) {
            router.push("/modal");
          } else {
            startNewRound();
          }
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
  );
}
