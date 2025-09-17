import { useGame } from "@/stores/use-game";
import { View } from "react-native";
import { PlayerScoreTotal } from "./player-score-total";

export function GameTotal() {
  const players = useGame((state) => state.players);
  const activePlayersIds = players.filter((p) => p.isPlaying);

  return (
    <View className='flex-1 flex-row'>
      {activePlayersIds.map((player) => (
        <View
          key={player.id}
          className='flex-1'
        >
          <PlayerScoreTotal player={player} />
        </View>
      ))}
    </View>
  );
}
