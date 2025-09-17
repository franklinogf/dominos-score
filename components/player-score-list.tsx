import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Player } from "@/lib/types";
import { useGame } from "@/stores/use-game";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { Alert } from "react-native";
import Animated, {
  FlipOutXUp,
  SequencedTransition,
  ZoomIn,
} from "react-native-reanimated";

export function PlayerScoreList({ player }: { player: Player }) {
  const removeScoreFromPlayer = useGame((state) => state.removeScoreFromPlayer);
  const winnerPlayerId = useGame((state) => state.winnerPlayerId);

  return (
    <Animated.FlatList
      className='mt-2'
      itemLayoutAnimation={SequencedTransition}
      data={player.score}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => {
        const isLastItem = index === player.score.length - 1;
        return (
          <Animated.View
            entering={ZoomIn}
            exiting={FlipOutXUp}
            className='mb-2 w-[85px] max-w-[100px] mx-auto'
          >
            <Button
              disabled={
                (player.id === winnerPlayerId && !isLastItem) ||
                (player.id !== winnerPlayerId && winnerPlayerId !== null)
              }
              className='p-0'
              onLongPress={() => {
                impactAsync(ImpactFeedbackStyle.Heavy);
                Alert.alert(
                  "Remove Score",
                  `Remove ${item.value} points from ${player.name}?`,
                  [
                    {
                      text: "Cancel",
                      style: "cancel",
                    },
                    {
                      text: "OK",
                      style: "destructive",
                      onPress: () => removeScoreFromPlayer(player, item.id),
                    },
                  ]
                );
              }}
              variant='outline'
              size='lg'
            >
              <Text className='text-2xl'>{item.value}</Text>
            </Button>
          </Animated.View>
        );
      }}
    />
  );
}
