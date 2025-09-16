import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { useGame } from "@/stores/use-game";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { Link } from "expo-router";
// import { router, useRouter } from "expo-router";
import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Game() {
  const gameSize = useGame((state) => state.gameSize);
  const players = useGame((state) => state.players);

  const playerData = Array.from({ length: gameSize }, (_, index) => [
    players[`player${index}`] || `Player ${index + 1}`,
    `player${index}`,
  ]);

  return (
    <SafeAreaView className='flex-1 bg-background'>
      <Text
        variant='h1'
        className='mb-4'
      >
        Game
      </Text>
      <FlatList
        bounces={false}
        className='w-full'
        contentContainerClassName='flex-1'
        key={gameSize}
        numColumns={gameSize}
        data={playerData}
        renderItem={({ item }) => (
          <PlayerButton
            name={String(item[0])}
            playerKey={item[1]}
          />
        )}
      />

      <Link
        href='/'
        className='m-4'
      >
        <Text>Go back</Text>
      </Link>
    </SafeAreaView>
  );
}

function PlayerButton({
  name,
  playerKey,
}: {
  name: string;
  playerKey: string;
}) {
  const score = useGame((state) => state.score[playerKey]);
  const addScoreToPlayer = useGame((state) => state.addScoreToPlayer);
  const removeScoreFromPlayer = useGame((state) => state.removeScoreFromPlayer);
  return (
    <View className='flex-1 px-2'>
      <Button
        size='lg'
        onLongPress={() => {
          impactAsync(ImpactFeedbackStyle.Heavy);
          addScoreToPlayer(playerKey, 100);
        }}
      >
        <Text className='line-clamp-1'>{name}</Text>
      </Button>
      <FlatList
        className='mt-2'
        data={score || []}
        ItemSeparatorComponent={() => <Separator className='my-2' />}
        renderItem={({ item, index }) => (
          <View className='mb-2 w-[100px] mx-auto'>
            <Button
              onLongPress={() => {
                impactAsync(ImpactFeedbackStyle.Heavy);
                removeScoreFromPlayer(playerKey, index);
              }}
              variant='outline'
              size='lg'
            >
              <Text className='text-2xl'>{item}</Text>
            </Button>
          </View>
        )}
      />
    </View>
  );
}
