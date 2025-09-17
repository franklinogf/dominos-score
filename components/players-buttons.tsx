import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { GameStatus } from "@/lib/enums";
import { Player } from "@/lib/types";
import { useGame } from "@/stores/use-game";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { Alert, View } from "react-native";

export function PlayersButtons() {
  const players = useGame((state) => state.players);
  const activePlayers = players.filter((p) => p.isPlaying);

  return (
    <View className='flex-row'>
      {activePlayers.map((player) => (
        <PlayerButton
          key={player.id}
          player={player}
        />
      ))}
    </View>
  );
}

function PlayerButton({ player }: { player: Player }) {
  console.log(
    "Rendering PlayerButton for:",
    player.name,
    player.wins,
    player.losses
  );
  const addScoreToPlayer = useGame((state) => state.addScoreToPlayer);
  const gameStatus = useGame((state) => state.gameStatus);

  const handleAddCustomScore = () => {
    impactAsync(ImpactFeedbackStyle.Light);
    Alert.prompt(
      "Add Score",
      `Enter score for ${player.name}:`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Add",
          onPress: (score: string | undefined) => {
            // Allow empty input to cancel without error
            if (!score || score.trim() === "") {
              return; // Simply cancel if empty
            }

            const numericScore = parseInt(score, 10);
            if (!isNaN(numericScore) && numericScore > 0) {
              impactAsync(ImpactFeedbackStyle.Medium);
              addScoreToPlayer(player, numericScore);
            }
          },
        },
      ],
      "plain-text",
      "",
      "number-pad"
    );
  };

  return (
    <View className='flex-1 px-1'>
      <Button
        disabled={gameStatus === GameStatus.Finished}
        className='px-0 relative overflow-hidden'
        size='lg'
        onPress={handleAddCustomScore}
        onLongPress={() => {
          impactAsync(ImpactFeedbackStyle.Heavy);
          addScoreToPlayer(player, 10);
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
        <Text className='line-clamp-1 uppercase'>{player.name}</Text>
      </Button>
    </View>
  );
}
