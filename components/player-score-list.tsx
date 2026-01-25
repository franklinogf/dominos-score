import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useT } from '@/hooks/use-translation';
import { Player } from '@/lib/types';
import { useGame } from '@/stores/use-game';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import Animated, {
  FlipOutXUp,
  SequencedTransition,
  ZoomIn,
} from 'react-native-reanimated';

export function PlayerScoreList({ player }: { player: Player }) {
  const { t } = useT();
  const removeScoreFromPlayer = useGame((state) => state.removeScoreFromPlayer);
  const winnerPlayerId = useGame((state) => state.winnerPlayerId);
  const flatListRef = useRef<any>(null);

  // Auto-scroll to the end when new scores are added
  useEffect(() => {
    if (player.score.length > 0) {
      // Small delay to ensure the item is rendered before scrolling
      setTimeout(() => {
        try {
          flatListRef.current?.scrollToEnd({ animated: true });
        } catch {
          // Fallback: scroll to index if scrollToEnd doesn't work
          try {
            flatListRef.current?.scrollToIndex({
              index: player.score.length - 1,
              animated: true,
            });
          } catch {
            console.log('Auto-scroll not available for this list');
          }
        }
      }, 150);
    }
  }, [player.score.length]);

  return (
    <Animated.FlatList
      ref={flatListRef}
      className="mt-2 flex-1 px-2"
      itemLayoutAnimation={SequencedTransition}
      data={player.score}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => {
        const isLastItem = index === player.score.length - 1;
        return (
          <Animated.View
            entering={ZoomIn}
            exiting={FlipOutXUp}
            className="mb-2 w-[85px] max-w-[100px] mx-auto"
          >
            <Button
              disabled={
                (player.id === winnerPlayerId && !isLastItem) ||
                (player.id !== winnerPlayerId && winnerPlayerId !== null)
              }
              className="p-0"
              onLongPress={() => {
                impactAsync(ImpactFeedbackStyle.Heavy);
                Alert.alert(
                  t('game.removeScore'),
                  t('game.removeScoreConfirm', {
                    value: item.value,
                    name: player.name,
                  }),
                  [
                    {
                      text: t('common.cancel'),
                      style: 'cancel',
                    },
                    {
                      text: t('common.ok'),
                      style: 'destructive',
                      onPress: () => removeScoreFromPlayer(player, item.id),
                    },
                  ],
                );
              }}
              variant="outline"
              size="lg"
            >
              <Text className="text-2xl">{item.value}</Text>
            </Button>
          </Animated.View>
        );
      }}
    />
  );
}
