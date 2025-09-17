import { useGame } from "@/stores/use-game";
import { View } from "react-native";
import { PlayerScoreList } from "./player-score-list";

export function GameScore() {
  const players = useGame((state) => state.players);
  const activePlayersIds = players.filter((p) => p.isPlaying);

  return (
    <View className='flex-1 flex-row'>
      {activePlayersIds.map((player) => (
        <View
          key={player.id}
          className='flex-1'
        >
          <PlayerScoreList player={player} />
        </View>
      ))}
    </View>
  );
}
