import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { endGame as endGameInDb } from '@/db/actions/game';
import { useGame } from '@/stores/use-game';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

export function ResumeGameBanner() {
  const { t } = useTranslation();
  const currentGameId = useGame((state) => state.currentGameId);
  const players = useGame((state) => state.players);
  const tournamentMode = useGame((state) => state.tournamentMode);
  const endGame = useGame((state) => state.endGame);
  const activePlayersCount = players.filter(
    (player) => player.isPlaying,
  ).length;

  if (!currentGameId || players.length === 0) return null;

  const handleResume = () => {
    impactAsync(ImpactFeedbackStyle.Medium);
    if (tournamentMode && activePlayersCount === 0) {
      router.push({ pathname: '/modal', params: { gameId: currentGameId } });
      return;
    }

    router.push({ pathname: '/game', params: { gameId: currentGameId } });
  };

  const handleDiscard = () => {
    impactAsync(ImpactFeedbackStyle.Light);
    Alert.alert(t($ => $.game.discardResume), t($ => $.game.discardResumeConfirm), [
      {
        text: t($ => $.common.cancel),
        style: 'cancel',
      },
      {
        text: t($ => $.game.discard),
        style: 'destructive',
        onPress: async () => {
          impactAsync(ImpactFeedbackStyle.Heavy);
          await endGameInDb(currentGameId);
          endGame();
        },
      },
    ]);
  };

  return (
    <View className="mx-4 mb-2 rounded-lg border border-border bg-card p-3">
      <Text className="font-semibold text-foreground">
        {t($ => $.game.resumeGame)}
      </Text>
      <Text variant="muted" className="mt-1 text-sm">
        {t($ => $.game.resumeGameDescription)}
      </Text>
      <View className="mt-3 flex-row gap-2">
        <Button className="flex-1" size="sm" onPress={handleResume}>
          <Text>{t($ => $.game.resume)}</Text>
        </Button>
        <Button
          className="flex-1"
          size="sm"
          variant="outline"
          onPress={handleDiscard}
        >
          <Text>{t($ => $.game.discard)}</Text>
        </Button>
      </View>
    </View>
  );
}
