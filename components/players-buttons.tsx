import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { saveSettings } from '@/db/actions/settings';
import { getLongPressScoreSetting, getSetting } from '@/db/querys/settings';
import { useT } from '@/hooks/use-translation';
import { DEFAULT_LONG_PRESS_SCORE } from '@/lib/constants';
import { GameStatus } from '@/lib/enums';
import { Player } from '@/lib/types';
import { useGame } from '@/stores/use-game';
import { useScoreModal } from '@/stores/use-score-modal';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { Info } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Alert, Platform, Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export function PlayersButtons() {
  const { t } = useT();
  const players = useGame((state) => state.players);
  const activePlayers = players.filter((p) => p.isPlaying);
  const [longPressScore, setLongPressScore] = useState<number>(
    DEFAULT_LONG_PRESS_SCORE,
  );
  const [showHint, setShowHint] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchSettings = async () => {
        const score = await getLongPressScoreSetting();
        setLongPressScore(score);

        // Check if hint has been shown before
        const hintShown = await getSetting('hintShown');
        if (!hintShown) {
          setShowHint(true);
        }
      };

      fetchSettings();
    }, []),
  );

  const dismissHint = async () => {
    setShowHint(false);
    await saveSettings({ hintShown: 'true' });
  };

  return (
    <>
      <View className="flex-row">
        {activePlayers.map((player) => (
          <PlayerButton
            key={player.id}
            player={player}
            longPressScore={longPressScore}
          />
        ))}
      </View>
      {showHint && (
        <Animated.View entering={FadeIn.delay(500)} exiting={FadeOut}>
          <Pressable
            onPress={dismissHint}
            className="flex-row items-center justify-center gap-2 mt-2 px-4 py-2 bg-muted/50 rounded-lg mx-2"
          >
            <Info size={16} className="text-muted-foreground" />
            <Text
              variant="small"
              className="text-muted-foreground text-center flex-1"
            >
              {t('game.longPressHint', { points: longPressScore })}
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </>
  );
}

function PlayerButton({
  player,
  longPressScore,
}: {
  player: Player;
  longPressScore: number | null;
}) {
  const { t } = useT();
  const addScoreToPlayer = useGame((state) => state.addScoreToPlayer);
  const { open: openModal } = useScoreModal();

  const gameStatus = useGame((state) => state.gameStatus);
  const isIos = Platform.OS === 'ios';

  const handleAddCustomScore = () => {
    impactAsync(ImpactFeedbackStyle.Light);
    if (isIos) {
      Alert.prompt(
        t('game.addScore'),
        t('game.enterScoreFor', { name: player.name }),
        [
          {
            text: t('common.cancel'),
            style: 'cancel',
          },
          {
            text: t('game.add'),
            onPress: (score: string | undefined) => {
              // Allow empty input to cancel without error
              if (!score || score.trim() === '') {
                return;
              }

              const numericScore = parseInt(score, 10);
              if (!isNaN(numericScore) && numericScore > 0) {
                impactAsync(ImpactFeedbackStyle.Medium);
                addScoreToPlayer(player, numericScore);
              }
            },
          },
        ],
        'plain-text',
        '',
        'number-pad',
      );
    } else {
      openModal(player.id);
    }
  };

  return (
    <>
      <View className="flex-1 px-1">
        <Button
          disabled={gameStatus === GameStatus.Finished}
          className="px-0 relative overflow-hidden"
          size="lg"
          onPress={handleAddCustomScore}
          onLongPress={() => {
            if (longPressScore === null) return;
            impactAsync(ImpactFeedbackStyle.Heavy);
            addScoreToPlayer(player, longPressScore);
          }}
        >
          {player.losses > 0 && (
            <Text className="absolute -top-0.5 left-0.5 text-red-500/90 font-bold text-3xl">
              {player.losses}
            </Text>
          )}
          {player.wins > 0 && (
            <Text className="absolute -top-0.5 right-0.5 text-green-500/90 font-bold text-3xl">
              {player.wins}
            </Text>
          )}
          <Text className="line-clamp-1 uppercase">{player.name}</Text>
        </Button>
      </View>
    </>
  );
}
