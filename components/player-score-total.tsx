import { Text } from '@/components/ui/text';
import { Player } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useGame } from '@/stores/use-game';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
} from 'react-native-reanimated';


export function PlayerScoreTotal({ player }: { player: Player }) {
  const total = player.score.reduce((acc, score) => acc + score.value, 0);
  const winningLimit = useGame((state) => state.winningLimit);
  const winnerPlayerId = useGame((state) => state.winnerPlayerId);
  const loserPlayerId = useGame((state) => state.loserPlayerId);
  const trioMode = useGame((state) => state.trioMode);

  const isWinner = player.id === winnerPlayerId;
  const isLoser = player.id === loserPlayerId;

  // In traditional mode, only winners get special treatment
  // In trio mode, both winners and losers get special treatment
  const shouldShowWinner = isWinner;
  const shouldShowLoser = trioMode && isLoser;

  const progress = Math.min(total / winningLimit, 1);
  const isNearLimit = progress >= 0.75 && !shouldShowWinner;

  // Animation values
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const progressWidth = useSharedValue(0);

  // Trigger celebration animation when this player wins (or different animation for loser in trio mode)
  useEffect(() => {
    if (shouldShowWinner) {
      // Scale and rotation animation for winner
      scale.value = withRepeat(
        withSequence(
          withSpring(1.3, { damping: 50, stiffness: 300 }),
          withSpring(1.5, { damping: 60, stiffness: 250 }),
        ),
        -1,
        true,
      );

      rotation.value = withRepeat(
        withSequence(
          withSpring(-5, { damping: 80, stiffness: 400 }),
          withSpring(0, { damping: 100, stiffness: 350 }),
          withSpring(5, { damping: 80, stiffness: 400 }),
        ),
        -1,
        true,
      );
    } else if (shouldShowLoser) {
      // More noticeable shake animation for loser in trio mode
      scale.value = withSpring(0.9, { damping: 40, stiffness: 200 }); // Slightly smaller scale
      rotation.value = withRepeat(
        withSequence(
          withSpring(-3, { damping: 80, stiffness: 400 }),
          withSpring(3, { damping: 80, stiffness: 400 }),
          withSpring(-3, { damping: 80, stiffness: 400 }),
          withSpring(0, { damping: 100, stiffness: 300 }),
        ),
        -1, // Infinite repeat like winner animation
        false,
      );
    } else {
      // Reset animations when not winner or loser
      scale.value = withSpring(1, { damping: 40, stiffness: 200 });
      rotation.value = withSpring(0, { damping: 40, stiffness: 200 });
    }
  }, [shouldShowWinner, shouldShowLoser, scale, rotation]);

  useEffect(() => {
    progressWidth.value = withSpring(progress * 100, {
      damping: 20,
      stiffness: 120,
    });
  }, [progress, progressWidth]);

  // Animated style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%` as any,
  }));

  return (
    <View className="flex-1 px-2">
      <Animated.View style={animatedStyle}>
        <Text
          className={cn('text-2xl font-extrabold text-center', {
            'text-success': shouldShowWinner,
            'text-destructive': shouldShowLoser,
          })}
        >
          {total}
        </Text>
      </Animated.View>
      <Text variant="muted" className="text-center text-lg font-medium">
        {winningLimit - total}
      </Text>
      <View className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <Animated.View
          style={progressBarStyle}
          className={cn('h-full rounded-full', {
            'bg-success': shouldShowWinner,
            'bg-destructive': shouldShowLoser,
            'bg-warning': isNearLimit,
            'bg-primary': !shouldShowWinner && !shouldShowLoser && !isNearLimit,
          })}
        />
      </View>
    </View>
  );
}
