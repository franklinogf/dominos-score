import { GameEndingButtons } from '@/components/game-ending-buttons';
import { GameScore } from '@/components/game-score';
import { GameTotal } from '@/components/game-total';
import { PlayersButtons } from '@/components/players-buttons';
import { ScoreModal } from '@/components/score-modal';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { getGameById } from '@/db/querys/game';
import { useTournamentTitle } from '@/hooks/use-tournament-title';
import { buildRestoredGameState } from '@/lib/game-restore';
import { useGame } from '@/stores/use-game';
import { useFocusEffect } from '@react-navigation/native';
import { useKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

export default function Game() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const players = useGame((state) => state.players);
  const activePlayersCount = players.filter((p) => p.isPlaying).length;
  const tournamentMode = useGame((state) => state.tournamentMode);
  const currentRoundNumber = useGame((state) => state.currentRoundNumber);
  const currentGameId = useGame((state) => state.currentGameId);
  const trioMode = useGame((state) => state.trioMode);
  const restoreGame = useGame((state) => state.restoreGame);
  const { gameId } = useLocalSearchParams<{ gameId?: string }>();
  const routeGameId = gameId ? Number(gameId) : currentGameId;
  const [isHydrating, setIsHydrating] = useState(Boolean(gameId));

  const navigation = useNavigation();
  const title = useTournamentTitle();
  const bottomPadding = Math.max(insets.bottom, 12);

  useEffect(() => {
    const hydrateGame = async () => {
      if (!routeGameId || Number.isNaN(routeGameId)) {
        setIsHydrating(false);
        router.replace('/');
        return;
      }

      if (currentGameId === routeGameId && players.length > 0) {
        setIsHydrating(false);
        return;
      }

      const game = await getGameById(routeGameId);
      if (!game || game.endedAt) {
        setIsHydrating(false);
        router.replace('/');
        return;
      }

      restoreGame(routeGameId, buildRestoredGameState(game, trioMode));
      setIsHydrating(false);
    };

    hydrateGame();
  }, [currentGameId, players.length, restoreGame, routeGameId, trioMode]);

  // Update title dynamically
  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({ title });
    }, [navigation, title]),
  );

  // Redirect to home if no active players
  useEffect(() => {
    if (!isHydrating && activePlayersCount === 0) {
      router.replace('/');
    }
  }, [activePlayersCount, isHydrating]);

  if (isHydrating || activePlayersCount === 0) {
    return null;
  }

  return (
    <>
      <SafeAreaView
        edges={['left', 'right']}
        className="flex-1 bg-background px-2"
        style={{ paddingBottom: bottomPadding }}
      >
        <View className="py-3">
          <GameEndingButtons />
          {tournamentMode && (
            <Text variant="muted" className="text-center text-xs mt-1">
              {t($ => $.game.round)} {currentRoundNumber}
            </Text>
          )}
        </View>

        <PlayersButtons />

        <Separator className="mt-2" />

        <View className="flex-1">
          <GameScore />
        </View>

        <Separator className="my-2" />

        <View className="h-36">
          <GameTotal />
        </View>

        {Platform.OS === 'android' && <ScoreModal />}
      </SafeAreaView>
    </>
  );
}
