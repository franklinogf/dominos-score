import { GameEndingButtons } from '@/components/game-ending-buttons';
import { GameScore } from '@/components/game-score';
import { GameTotal } from '@/components/game-total';
import { PlayersButtons } from '@/components/players-buttons';
import { ScoreModal } from '@/components/score-modal';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useT } from '@/hooks/use-translation';
import { useTournamentTitle } from '@/hooks/use-tournament-title';
import { useGame } from '@/stores/use-game';
import { useFocusEffect } from '@react-navigation/native';
import { useKeepAwake } from 'expo-keep-awake';
import { router, useNavigation } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Game() {
  useKeepAwake();
  const { t } = useT();
  const players = useGame((state) => state.players);
  const activePlayersCount = players.filter((p) => p.isPlaying).length;
  const tournamentMode = useGame((state) => state.tournamentMode);
  const currentRoundNumber = useGame((state) => state.currentRoundNumber);

  const navigation = useNavigation();
  const title = useTournamentTitle();

  // Update title dynamically
  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({ title });
    }, [navigation, title]),
  );

  // Redirect to home if no active players
  useEffect(() => {
    if (activePlayersCount === 0) {
      router.replace('/');
    }
  }, [activePlayersCount]);

  if (activePlayersCount === 0) {
    return null;
  }

  return (
    <>
      <SafeAreaView
        edges={['left', 'right']}
        className="flex-1 bg-background px-2"
      >
        <View className="py-3">
          <GameEndingButtons />
          {tournamentMode && (
            <Text variant="muted" className="text-center text-xs mt-1">
              {t('game.round')} {currentRoundNumber}
            </Text>
          )}
        </View>

        <PlayersButtons />

        <Separator className="mt-2" />

        <View className="flex-1">
          <GameScore />
        </View>

        <Separator className="my-2" />

        <View className={Platform.OS === 'ios' ? 'h-36' : 'h-40'}>
          <GameTotal />
        </View>

        {Platform.OS === 'android' && <ScoreModal />}
      </SafeAreaView>
    </>
  );
}
