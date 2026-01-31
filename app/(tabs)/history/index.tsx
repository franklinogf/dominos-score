import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { removeAllGames, removeGame } from '@/db/actions/game';
import { type GameWithRounds, getAllGames } from '@/db/querys/game';
import { useT } from '@/hooks/use-translation';
import { GameType } from '@/lib/enums';
import { formatDate } from '@/lib/utils';
import { useGame } from '@/stores/use-game';
import { useFocusEffect } from '@react-navigation/native';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { Link } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, View } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const { t } = useT();
  const handleDelete = () => {
    impactAsync(ImpactFeedbackStyle.Light);
    Alert.alert(
      t('history.deleteGame'),
      t('history.deleteConfirm', { type: game.type.toLowerCase() }),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
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
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text variant="h3" className="text-foreground">
                {game.type === GameType.NORMAL
                  ? t('game.newGame')
                  : t('game.tournament')}
              </Text>
              {isCurrentGame && (
                <View className="ml-2 bg-primary px-2 py-1 rounded">
                  <Text className="text-primary-foreground text-xs font-medium">
                    {t('history.current')}
                  </Text>
                </View>
              )}
            </View>
            <Text variant="muted" className="text-sm">
              {formatDate(game.createdAt)}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-sm font-medium text-muted-foreground">
              {game.rounds.length}{' '}
              {game.rounds.length === 1
                ? t('history.round')
                : t('history.rounds').toLowerCase()}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center">
          <View className="flex-row">
            <Text variant="small" className="mr-2">
              {t('history.playersLabel')}: {game.gameSize}
            </Text>
            <Text variant="small">
              {t('history.limitLabel')}: {game.winningLimit}
            </Text>
          </View>

          <View className="flex-row">
            <Link
              push
              asChild
              href={{
                pathname: '/history/rounds',
                params: { gameId: game.id },
              }}
            >
              <Button variant="outline" size="sm">
                <Text className="text-xs">{t('history.viewDetails')}</Text>
              </Button>
            </Link>
            {!isCurrentGame && (
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onPress={handleDelete}
              >
                <Text className="text-xs text-destructive">
                  {t('common.delete')}
                </Text>
              </Button>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

export default function HistoryIndex() {
  const { t } = useT();
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
        Alert.alert(t('common.error'), t('history.deleteFailed'));
        impactAsync(ImpactFeedbackStyle.Heavy);
      }
    },
    [loadGames, t],
  );

  const handleDeleteAllGames = useCallback(() => {
    impactAsync(ImpactFeedbackStyle.Light);
    Alert.alert(t('history.deleteAll'), t('history.deleteAllConfirm'), [
      {
        text: t('common.cancel'),
        style: 'cancel',
      },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await removeAllGames();
            setGames([]);
            impactAsync(ImpactFeedbackStyle.Heavy);
            console.log('All games deleted successfully');
          } catch (error) {
            console.error('Failed to delete all games:', error);
            Alert.alert(t('common.error'), t('history.deleteAllFailed'));
            impactAsync(ImpactFeedbackStyle.Heavy);
          }
        },
      },
    ]);
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      loadGames();
    }, [loadGames]),
  );

  return (
    <SafeAreaView className="flex-1 bg-background px-4 py-6">
      <Text variant="h1" className="text-center mb-4">
        {t('history.title')}
      </Text>

      {games.length > 0 && !isLoading && (
        <View className="items-center mb-4">
          <Button
            variant="destructive"
            size="sm"
            onPress={handleDeleteAllGames}
          >
            <Text className="text-xs text-destructive-foreground">
              {t('history.deleteAll')}
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
        <View className="justify-center items-center">
          <Text className="text-center text-muted-foreground text-lg mb-4">
            {t('history.noGames')}
          </Text>
          <Text className="text-center text-muted-foreground">
            {t('history.startFirstGame')}
          </Text>
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
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}
