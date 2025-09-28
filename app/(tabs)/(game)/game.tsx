import { GameEndingButtons } from '@/components/game-ending-buttons';
import { GameScore } from '@/components/game-score';
import { GameTotal } from '@/components/game-total';
import { PlayersButtons } from '@/components/players-buttons';
import { ScoreModal } from '@/components/score-modal';
import { Separator } from '@/components/ui/separator';
import { useTournamentTitle } from '@/hooks/use-tournament-title';
import { useGame } from '@/stores/use-game';
import { useFocusEffect } from '@react-navigation/native';
import { router, useNavigation } from 'expo-router';
import { useCallback } from 'react';
import { Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Game() {
  const players = useGame((state) => state.players);
  const activePlayersCount = players.filter((p) => p.isPlaying).length;

  const navigation = useNavigation();
  const title = useTournamentTitle();

  // Update title dynamically
  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({ title });
    }, [navigation, title]),
  );

  if (activePlayersCount === 0) {
    router.replace('/');
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
