import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { LONG_PRESS_SCORE } from "@/lib/constants";
import { Player } from "@/lib/types";
import { useGame } from "@/stores/use-game";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { router } from "expo-router";
import { FlatList, View } from "react-native";
import { PlayerScoreList } from "./player-score-list";

export function PlayersButtons() {
  const players = useGame((state) => state.players);
  const activePlayers = players.filter((p) => p.isPlaying);

  if (activePlayers.length === 0) {
    router.replace("/");
    return null;
  }

  return (
    <>
      <FlatList
        bounces={false}
        showsVerticalScrollIndicator={false}
        key={activePlayers.length}
        numColumns={activePlayers.length}
        data={activePlayers}
        renderItem={({ item }) => (
          <PlayerButton
            name={item.name}
            player={item}
          />
        )}
      />
    </>
  );
}

function PlayerButton({ name, player }: { name: string; player: Player }) {
  const addScoreToPlayer = useGame((state) => state.addScoreToPlayer);
  return (
    <View className='flex-1 mx-2'>
      <Button
        className='px-0 relative overflow-hidden'
        size='lg'
        onLongPress={() => {
          impactAsync(ImpactFeedbackStyle.Heavy);
          addScoreToPlayer(player.id, LONG_PRESS_SCORE);
        }}
      >
        {player.losses > 0 && (
          <Text className='absolute -top-0.5 left-0.5 text-red-500/90 font-bold text-3xl'>
            {player.losses}
          </Text>
        )}
        {player.wins > 0 && (
          <Text className='absolute -top-0.5 right-0.5 text-green-500/90 font-bold text-3xl'>
            {player.wins}
          </Text>
        )}
        <Text className='line-clamp-1'>{name}</Text>
      </Button>
      <PlayerScoreList player={player} />
    </View>
  );
}
