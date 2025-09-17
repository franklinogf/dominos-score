import { useGame } from "@/stores/use-game";
import { FlatList } from "react-native";
import { PlayerScoreTotal } from "./player-score-total";

export function GameTotal() {
  const players = useGame((state) => state.players);
  const activePlayersIds = players.filter((p) => p.isPlaying);

  return (
    <FlatList
      className='flex-1'
      numColumns={activePlayersIds.length}
      data={activePlayersIds}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <PlayerScoreTotal player={item} />}
    />
  );
}
