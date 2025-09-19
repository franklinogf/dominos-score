import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Alert, View } from 'react-native';

import { addNewRound } from '@/db/actions/round';
import { GameStatus } from '@/lib/enums';
import { useGame } from '@/stores/use-game';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { router } from 'expo-router';

export function GameEndingButtons() {
  const updateGameStatus = useGame((state) => state.updateGameStatus);
  const tournamentMode = useGame((state) => state.tournamentMode);
  const gameStatus = useGame((state) => state.gameStatus);
  const winnerPlayerId = useGame((state) => state.winnerPlayerId);
  const currentGameId = useGame((state) => state.currentGameId);
  const endRound = useGame((state) => state.endRound);

  const endRoundLabel = tournamentMode ? 'End Round' : 'Restart';
  const endGameLabel = tournamentMode ? 'End Tournament' : 'End Game';

  const handleEndRound = () => {
    impactAsync(ImpactFeedbackStyle.Medium);
    Alert.alert(endRoundLabel, 'Are you sure you want to end this round?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: endRoundLabel,
        style: 'destructive',
        onPress: async () => {
          impactAsync(ImpactFeedbackStyle.Heavy);

          if (
            gameStatus === GameStatus.Finished &&
            currentGameId &&
            winnerPlayerId
          ) {
            addNewRound({
              gameId: currentGameId,
              roundWinnerId: Number(winnerPlayerId),
            });
          }

          if (tournamentMode) {
            router.push('/modal');
          }
          endRound();
        },
      },
    ]);
  };

  const handleEndGame = () => {
    impactAsync(ImpactFeedbackStyle.Medium);
    Alert.alert(
      endGameLabel,
      'Are you sure you want to end the entire game? This will reset all scores.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: endGameLabel,
          style: 'destructive',
          onPress: () => {
            impactAsync(ImpactFeedbackStyle.Heavy);
            updateGameStatus(GameStatus.NotStarted);
            router.replace('/');
          },
        },
      ],
    );
  };

  return (
    <View className="flex-row gap-3">
      <Button
        size="sm"
        className="flex-1 bg-warning active:bg-warning/80"
        onPress={handleEndRound}
      >
        <Text>{endRoundLabel}</Text>
      </Button>

      <Button
        size="sm"
        variant="destructive"
        className="flex-1"
        onPress={handleEndGame}
      >
        <Text>{endGameLabel}</Text>
      </Button>
    </View>
  );
}
