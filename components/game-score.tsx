import { useGame } from "@/stores/use-game";
import { FlatList } from "react-native";
import { PlayerScoreList } from "./player-score-list";

export function GameScore() {
  const players = useGame((state) => state.players);
  const activePlayersIds = players.filter((p) => p.isPlaying);

  return (
    <FlatList
      className='flex-1'
      numColumns={activePlayersIds.length}
      data={activePlayersIds}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <PlayerScoreList player={item} />}
    />
  );
}
