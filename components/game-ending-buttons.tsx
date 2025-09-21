import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Alert, View } from 'react-native';

import { newRoundWithResults } from '@/db/actions/round';
import { useT } from '@/hooks/use-translation';
import { GameStatus } from '@/lib/enums';
import { useGame } from '@/stores/use-game';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { router } from 'expo-router';

export function GameEndingButtons() {
  const { t } = useT();
  const updateGameStatus = useGame((state) => state.updateGameStatus);
  const tournamentMode = useGame((state) => state.tournamentMode);
  const gameStatus = useGame((state) => state.gameStatus);
  const winnerPlayerId = useGame((state) => state.winnerPlayerId);
  const currentGameId = useGame((state) => state.currentGameId);
  const endRound = useGame((state) => state.endRound);
  const players = useGame((state) => state.players);
  const playingPlayers = players.filter((p) => p.isPlaying);
  const endGame = useGame((state) => state.endGame);

  const endRoundLabel = tournamentMode ? t('game.endRound') : t('game.restart');
  const endGameLabel = tournamentMode
    ? t('game.endTournament')
    : t('game.endGame');

  const handleEndRound = () => {
    impactAsync(ImpactFeedbackStyle.Medium);
    Alert.alert(endRoundLabel, t('game.endRoundConfirm'), [
      {
        text: t('common.cancel'),
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
            // Pass the actual winner ID (highest scorer) in trio mode
            newRoundWithResults(
              {
                gameId: currentGameId,
                roundWinnerId: Number(winnerPlayerId),
              },
              playingPlayers,
            );
          }
          endRound();
          if (tournamentMode) {
            router.push('/modal');
          }
        },
      },
    ]);
  };

  const handleEndGame = () => {
    impactAsync(ImpactFeedbackStyle.Medium);
    Alert.alert(endGameLabel, t('game.endGameConfirm'), [
      {
        text: t('common.cancel'),
        style: 'cancel',
      },
      {
        text: endGameLabel,
        style: 'destructive',
        onPress: () => {
          impactAsync(ImpactFeedbackStyle.Heavy);
          updateGameStatus(GameStatus.NotStarted);
          endGame();
          router.replace('/');
        },
      },
    ]);
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
