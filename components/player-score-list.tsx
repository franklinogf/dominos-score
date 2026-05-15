import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Player } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useGame } from '@/stores/use-game';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import Animated, {
  FlipOutXUp,
  SequencedTransition,
  ZoomIn,
} from 'react-native-reanimated';

export function PlayerScoreList({ player }: { player: Player }) {
  const { t } = useTranslation();
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
      className="flex-1 px-1 py-2"
      itemLayoutAnimation={SequencedTransition}
      data={player.score}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => {
        const isLastItem = index === player.score.length - 1;
        return (
          <Animated.View
            entering={ZoomIn}
            exiting={FlipOutXUp}
            className="mx-auto mb-2 w-[76px] max-w-[92px]"
          >
            <Button
              disabled={
                (player.id === winnerPlayerId && !isLastItem) ||
                (player.id !== winnerPlayerId && winnerPlayerId !== null)
              }
              className={cn('h-11 p-0', {
                'bg-muted/50': winnerPlayerId !== null,
              })}
              onLongPress={() => {
                impactAsync(ImpactFeedbackStyle.Heavy);
                Alert.alert(
                  t(($) => $.game.removeScore),
                  t(($) => $.game.removeScoreConfirm, {
                    value: item.value,
                    name: player.name,
                  }),
                  [
                    {
                      text: t(($) => $.common.cancel),
                      style: 'cancel',
                    },
                    {
                      text: t(($) => $.common.ok),
                      style: 'destructive',
                      onPress: () => removeScoreFromPlayer(player, item.id),
                    },
                  ],
                );
              }}
              variant="outline"
              size="lg"
            >
              <Text className="text-xl font-semibold tabular-nums">
                {item.value}
              </Text>
            </Button>
          </Animated.View>
        );
      }}
    />
  );
}
