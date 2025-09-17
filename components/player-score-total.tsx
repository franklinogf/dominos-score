import { Player } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useGame } from "@/stores/use-game";
import { View } from "react-native";
import { Text } from "./ui/text";

export function PlayerScoreTotal({ player }: { player: Player }) {
  const gameScore = useGame((state) => state.gameScore);
  const scores = gameScore[player.id] || [];
  const total = scores.reduce((acc, score) => acc + score.value, 0);
  const winningLimit = useGame((state) => state.winningLimit);
  return (
    <View className='flex-1 mx-2'>
      <Text
        className={cn("text-2xl font-extrabold text-center", {
          "text-green-500": total >= winningLimit,
        })}
      >
        {total}
      </Text>
      <Text
        variant='muted'
        className='text-center text-lg font-medium'
      >
        {winningLimit}
      </Text>
    </View>
  );
}
