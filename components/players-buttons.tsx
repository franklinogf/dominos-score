import { Text } from '@/components/ui/text';
import { saveSettings } from '@/db/actions/settings';
import {
  getDoublePressScoreSetting,
  getLongPressScoreSetting,
  getSetting,
} from '@/db/querys/settings';
import {
  DEFAULT_DOUBLE_PRESS_SCORE,
  DEFAULT_LONG_PRESS_SCORE,
} from '@/lib/constants';
import { GameStatus } from '@/lib/enums';
import { Player } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useGame } from '@/stores/use-game';
import { useScoreModal } from '@/stores/use-score-modal';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { Info } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { DoubleTapButton } from './ui/double-tap-button';

export function PlayersButtons() {
  const { t } = useTranslation();
  const players = useGame((state) => state.players);
  const activePlayers = players.filter((p) => p.isPlaying);
  const [longPressScore, setLongPressScore] = useState<number>(
    DEFAULT_LONG_PRESS_SCORE,
  );
  const [doublePressScore, setDoublePressScore] = useState<number>(
    DEFAULT_DOUBLE_PRESS_SCORE,
  );
  const [showHint, setShowHint] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchSettings = async () => {
        const score = await getLongPressScoreSetting();
        setLongPressScore(score);
        const doubleScore = await getDoublePressScoreSetting();
        setDoublePressScore(doubleScore);

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
            doublePressScore={doublePressScore}
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
              {t(($) => $.game.longPressHint, {
                points: longPressScore,
              })}
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
  doublePressScore,
}: {
  player: Player;
  longPressScore: number | null;
  doublePressScore: number;
}) {
  const { t } = useTranslation();
  const addScoreToPlayer = useGame((state) => state.addScoreToPlayer);
  const { open: openModal } = useScoreModal();

  const gameStatus = useGame((state) => state.gameStatus);
  const winnerPlayerId = useGame((state) => state.winnerPlayerId);
  const loserPlayerId = useGame((state) => state.loserPlayerId);
  const trioMode = useGame((state) => state.trioMode);
  const isIos = Platform.OS === 'ios';
  const isWinner = player.id === winnerPlayerId;
  const isLoser = trioMode && player.id === loserPlayerId;
  const isFinished = gameStatus === GameStatus.Finished;

  const handleAddCustomScore = () => {
    impactAsync(ImpactFeedbackStyle.Light);
    if (isIos) {
      Alert.prompt(
        t(($) => $.game.addScore),
        t(($) => $.game.enterScoreFor, {
          name: player.name,
        }),
        [
          {
            text: t(($) => $.common.cancel),
            style: 'cancel',
          },
          {
            text: t(($) => $.game.add),
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
        <DoubleTapButton
          onDoublePress={() => {
            impactAsync(ImpactFeedbackStyle.Heavy);
            addScoreToPlayer(player, doublePressScore);
          }}
          disabled={isFinished}
          className={cn('relative overflow-hidden px-1', {
            'border-success bg-success/10 active:bg-success/15': isWinner,
            'border-destructive bg-destructive/10 active:bg-destructive/15':
              isLoser,
          })}
          variant={isWinner || isLoser ? 'outline' : 'default'}
          size="lg"
          onPress={handleAddCustomScore}
          onLongPress={() => {
            if (longPressScore === null) return;
            impactAsync(ImpactFeedbackStyle.Heavy);
            addScoreToPlayer(player, longPressScore);
          }}
        >
          {player.losses > 0 && (
            <Text className="absolute left-1 top-1 min-w-5 rounded bg-destructive px-1 text-center text-xs font-bold text-destructive-foreground">
              {player.losses}
            </Text>
          )}
          {player.wins > 0 && (
            <Text className="absolute right-1 top-1 min-w-5 rounded bg-success px-1 text-center text-xs font-bold text-success-foreground">
              {player.wins}
            </Text>
          )}
          <Text
            className={cn('line-clamp-1 px-5 text-center uppercase', {
              'text-success': isWinner,
              'text-destructive': isLoser,
            })}
          >
            {player.name}
          </Text>
        </DoubleTapButton>
      </View>
    </>
  );
}
