import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { removeAllGames, removeGame } from '@/db/actions/game';
import { type GameWithRounds, getAllGames } from '@/db/querys/game';
import { GameType } from '@/lib/enums';
import { formatDate } from '@/lib/utils';
import { useGame } from '@/stores/use-game';
import { useFocusEffect } from '@react-navigation/native';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { Link } from 'expo-router';
import {
  CalendarDays,
  Eye,
  Gamepad2,
  PlusCircle,
  Target,
  Trash2,
  Trophy,
  Users,
} from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, FlatList, View } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

function GameCardSkeleton() {
  return (
    <View>
      <View className="bg-card border border-border rounded-lg p-4 mb-4">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Skeleton className="h-6 w-24" />
            </View>
            <Skeleton className="h-4 w-32 mt-1" />
          </View>
          <View className="items-end">
            <Skeleton className="h-4 w-16" />
          </View>
        </View>

        <View className="flex-row justify-between items-center">
          <View className="flex-row">
            <Skeleton className="h-4 w-20 mr-2" />
            <Skeleton className="h-4 w-16" />
          </View>

          <View className="flex-row">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-16 ml-2" />
          </View>
        </View>
      </View>
    </View>
  );
}

function GameCard({
  game,
  onDelete,
  isCurrentGame,
}: {
  game: GameWithRounds;
  onDelete: (gameId: number) => void;
  isCurrentGame: boolean;
}) {
  const { t } = useTranslation();
  const gameTitle =
    game.type === GameType.NORMAL
      ? t(($) => $.game.newGame)
      : t(($) => $.game.tournament);
  const roundsLabel =
    game.rounds.length === 1
      ? t(($) => $.history.round)
      : t(($) => $.history.rounds).toLowerCase();

  const handleDelete = () => {
    impactAsync(ImpactFeedbackStyle.Light);
    Alert.alert(
      t(($) => $.history.deleteGame),
      t(($) => $.history.deleteConfirm, {
        type: game.type.toLowerCase(),
      }),
      [
        {
          text: t(($) => $.common.cancel),
          style: 'cancel',
        },
        {
          text: t(($) => $.common.delete),
          style: 'destructive',
          onPress: () => {
            impactAsync(ImpactFeedbackStyle.Heavy);
            onDelete(game.id);
          },
        },
      ],
    );
  };
  return (
    <Animated.View key={game.id} exiting={FadeOut.duration(200)}>
      <View
        className={`bg-card border rounded-lg p-4 mb-4 ${
          isCurrentGame ? 'border-primary border-2' : 'border-border'
        }`}
      >
        <View className="flex-row justify-between items-start gap-3 mb-4">
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Icon
                as={game.type === GameType.NORMAL ? Gamepad2 : Trophy}
                className="text-primary"
                size={20}
              />
              <Text variant="h4" className="text-foreground">
                {gameTitle}
              </Text>
              {isCurrentGame && (
                <View className="bg-primary px-2 py-1 rounded">
                  <Text className="text-primary-foreground text-xs font-medium">
                    {t(($) => $.history.current)}
                  </Text>
                </View>
              )}
            </View>
            <View className="flex-row items-center gap-1">
              <Icon
                as={CalendarDays}
                className="text-muted-foreground"
                size={14}
              />
              <Text variant="muted" className="text-sm">
                {formatDate(game.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-4 flex-row justify-between rounded-md bg-muted/60 px-3 py-2">
          <View className="flex-1 items-center gap-1">
            <Icon as={Users} className="text-muted-foreground" size={16} />
            <Text variant="small" className="text-center text-xs">
              {game.gameSize} {t(($) => $.history.playersLabel)}
            </Text>
          </View>
          <View className="flex-1 items-center gap-1">
            <Icon as={Target} className="text-muted-foreground" size={16} />
            <Text variant="small" className="text-center text-xs">
              {t(($) => $.history.limitLabel)} {game.winningLimit}
            </Text>
          </View>
          <View className="flex-1 items-center gap-1">
            <Icon as={Trophy} className="text-muted-foreground" size={16} />
            <Text variant="small" className="text-center text-xs">
              {game.rounds.length} {roundsLabel}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-end">
          <Link
            push
            asChild
            href={{
              pathname: '/history/rounds',
              params: { gameId: game.id },
            }}
          >
            <Button variant="outline" size="sm">
              <Icon as={Eye} className="text-foreground" size={15} />
              <Text className="text-xs">{t(($) => $.history.viewDetails)}</Text>
            </Button>
          </Link>
          {!isCurrentGame && (
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onPress={handleDelete}
            >
              <Icon as={Trash2} className="text-destructive" size={15} />
              <Text className="text-xs text-destructive">
                {t(($) => $.common.delete)}
              </Text>
            </Button>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

export default function HistoryIndex() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [games, setGames] = useState<GameWithRounds[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentGameId = useGame((state) => state.currentGameId);

  const loadGames = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedGames = await getAllGames();
      setGames(fetchedGames);
    } catch (error) {
      console.error('Failed to load games:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reload when a game ends (currentGameId transitions to undefined)
  useEffect(() => {
    if (currentGameId === undefined) {
      loadGames();
    }
  }, [currentGameId, loadGames]);

  const handleDeleteGame = useCallback(
    async (gameId: number) => {
      try {
        await removeGame(gameId);
        // Reload games after deletion
        loadGames();
        impactAsync(ImpactFeedbackStyle.Medium);
        console.log('Game deleted successfully');
      } catch (error) {
        console.error('Failed to delete game:', error);
        Alert.alert(
          t(($) => $.common.error),
          t(($) => $.history.deleteFailed),
        );
        impactAsync(ImpactFeedbackStyle.Heavy);
      }
    },
    [loadGames, t],
  );

  const handleDeleteAllGames = useCallback(() => {
    impactAsync(ImpactFeedbackStyle.Light);
    Alert.alert(
      t(($) => $.history.deleteAll),
      t(($) => $.history.deleteAllConfirm),
      [
        {
          text: t(($) => $.common.cancel),
          style: 'cancel',
        },
        {
          text: t(($) => $.common.delete),
          style: 'destructive',
          onPress: async () => {
            try {
              await removeAllGames(currentGameId);
              setGames((prev) =>
                currentGameId ? prev.filter((g) => g.id === currentGameId) : [],
              );
              impactAsync(ImpactFeedbackStyle.Heavy);
            } catch (error) {
              console.error('Failed to delete all games:', error);
              Alert.alert(
                t(($) => $.common.error),
                t(($) => $.history.deleteAllFailed),
              );
              impactAsync(ImpactFeedbackStyle.Heavy);
            }
          },
        },
      ],
    );
  }, [t, currentGameId]);

  useFocusEffect(
    useCallback(() => {
      loadGames();
    }, [loadGames]),
  );

  const bottomPadding = Math.max(insets.bottom, 12);

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      className="flex-1 bg-background px-4 py-6"
    >
      <Text variant="h1" className="text-center mb-4">
        {t(($) => $.history.title)}
      </Text>
      {games.length > 0 && !isLoading && (
        <View className="items-center mb-4">
          <Button
            variant="destructive"
            size="sm"
            onPress={handleDeleteAllGames}
          >
            <Icon
              as={Trash2}
              className="text-destructive-foreground"
              size={15}
            />
            <Text className="text-xs text-destructive-foreground">
              {t(($) => $.history.deleteAll)}
            </Text>
          </Button>
        </View>
      )}
      {isLoading && (
        <View>
          <GameCardSkeleton />
          <GameCardSkeleton />
          <GameCardSkeleton />
        </View>
      )}
      {!isLoading && games.length === 0 && (
        <View className="flex-1 justify-center items-center px-4">
          <View className="size-16 rounded-full bg-muted items-center justify-center mb-4">
            <Icon as={Gamepad2} className="text-muted-foreground" size={28} />
          </View>
          <Text className="text-center text-foreground text-lg font-semibold mb-2">
            {t(($) => $.history.noGames)}
          </Text>
          <Text className="text-center text-muted-foreground mb-6">
            {t(($) => $.history.startFirstGame)}
          </Text>
          <Link href="/" asChild>
            <Button>
              <Icon
                as={PlusCircle}
                className="text-primary-foreground"
                size={17}
              />
              <Text>{t(($) => $.game.startGame)}</Text>
            </Button>
          </Link>
        </View>
      )}
      {!isLoading && games.length > 0 && (
        <FlatList
          className="flex-1"
          bounces={false}
          data={games}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <GameCard
              game={item}
              onDelete={handleDeleteGame}
              isCurrentGame={currentGameId === item.id}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: bottomPadding }}
        />
      )}
    </SafeAreaView>
  );
}
