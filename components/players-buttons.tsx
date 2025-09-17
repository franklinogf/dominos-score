import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useGame } from "@/stores/use-game";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { FlatList, View } from "react-native";
import Animated, {
  FlipOutXUp,
  SequencedTransition,
  ZoomIn,
} from "react-native-reanimated";

export function PlayersButtons() {
  const gameSize = useGame((state) => state.gameSize);
  const players = useGame((state) => state.players);

  const playerData = Array.from({ length: gameSize }, (_, index) => [
    players[`player${index}`] || `Player ${index + 1}`,
    `player${index}`,
  ]);
  return (
    <FlatList
      bounces={false}
      className='w-full'
      contentContainerClassName='flex-1'
      key={gameSize}
      numColumns={gameSize}
      data={playerData}
      renderItem={({ item }) => (
        <PlayerButton
          name={item[0]}
          playerKey={item[1]}
        />
      )}
    />
  );
}

function PlayerButton({
  name,
  playerKey,
}: {
  name: string;
  playerKey: string;
}) {
  const score = useGame((state) => state.score);
  const addScoreToPlayer = useGame((state) => state.addScoreToPlayer);
  const removeScoreFromPlayer = useGame((state) => state.removeScoreFromPlayer);
  return (
    <View className='flex-1 mx-2'>
      <Button
        size='lg'
        onLongPress={() => {
          impactAsync(ImpactFeedbackStyle.Heavy);
          addScoreToPlayer(playerKey, 100);
        }}
      >
        <Text className='line-clamp-1'>{name}</Text>
      </Button>
      <View>
        <Animated.FlatList
          className='mt-2'
          itemLayoutAnimation={SequencedTransition}
          data={score[playerKey] || []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Animated.View
              entering={ZoomIn}
              exiting={FlipOutXUp}
              className='mb-2 w-[85px] max-w-[100px] mx-auto'
            >
              <Button
                className='p-0'
                onLongPress={() => {
                  impactAsync(ImpactFeedbackStyle.Heavy);
                  removeScoreFromPlayer(playerKey, item.id);
                  // Alert.alert(
                  //   "Remove Score",
                  //   `Are you sure you want to remove ${item.value} points from ${name}?`,
                  //   [
                  //     {
                  //       text: "Cancel",
                  //       style: "cancel",
                  //     },
                  //     {
                  //       text: "OK",
                  //       onPress: () => removeScoreFromPlayer(playerKey, item.id),
                  //     },
                  //   ]
                  // );
                }}
                variant='outline'
                size='lg'
              >
                <Text className='text-2xl'>{item.value}</Text>
              </Button>
            </Animated.View>
          )}
        />
      </View>
    </View>
  );
}
