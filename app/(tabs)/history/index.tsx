import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { removeGame } from '@/db/actions/game';
import { type GameWithRounds, getAllGames } from '@/db/querys/game';
import { formatDate, ucFirst } from '@/lib/utils';
import { useGame } from '@/stores/use-game';
import { useFocusEffect } from '@react-navigation/native';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useCallback, useState } from 'react';
import { Alert, FlatList, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

function GameCard({
  game,
  onDelete,
  isCurrentGame,
}: {
  game: GameWithRounds;
  onDelete: (gameId: number) => void;
  isCurrentGame: boolean;
}) {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const [isDeleting, setIsDeleting] = useState(false);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  const animateOut = (callback: () => void) => {
    setIsDeleting(true);
    opacity.value = withTiming(0, { duration: 300 });
    scale.value = withTiming(0.8, { duration: 300 });
  };

  const handleDelete = () => {
    impactAsync(ImpactFeedbackStyle.Light);
    Alert.alert(
      'Delete Game',
      `Are you sure you want to delete this ${game.type} game? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            impactAsync(ImpactFeedbackStyle.Heavy);
            animateOut(() => onDelete(game.id));
          },
        },
      ],
    );
  };
  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          marginBottom: 12,
        },
      ]}
    >
      <View
        className={`bg-card border rounded-lg p-4 ${
          isCurrentGame ? 'border-primary border-2' : 'border-border'
        } ${isDeleting ? 'opacity-60' : ''}`}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text variant="h3" className="text-foreground">
                {ucFirst(game.type)} Game
              </Text>
              {isCurrentGame && (
                <View className="ml-2 bg-primary px-2 py-1 rounded">
                  <Text className="text-primary-foreground text-xs font-medium">
                    CURRENT
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
              {game.rounds.length === 1 ? 'round' : 'rounds'}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center">
          <View className="flex-row">
            <Text variant="small" className="mr-2">
              Players: {game.gameSize}
            </Text>
            <Text variant="small">Limit: {game.winningLimit}</Text>
          </View>

          <View className="flex-row">
            <Button variant="outline" size="sm" className="mr-2">
              <Text className="text-xs">View Details</Text>
            </Button>
            {!isCurrentGame && (
              <Button variant="outline" size="sm" onPress={handleDelete}>
                <Text className="text-xs text-destructive">Delete</Text>
              </Button>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

export default function HistoryIndex() {
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
      } catch (error) {
        console.error('Failed to delete game:', error);
        Alert.alert('Error', 'Failed to delete game. Please try again.');
        impactAsync(ImpactFeedbackStyle.Heavy);
      }
    },
    [loadGames],
  );

  useFocusEffect(
    useCallback(() => {
      loadGames();
    }, [loadGames]),
  );
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 py-6">
        <Text variant="h1" className="text-center mb-6">
          Game History
        </Text>
        {isLoading && (
          <Text className="text-center text-muted-foreground">
            Loading games...
          </Text>
        )}

        {!isLoading && games.length === 0 && (
          <View className="justify-center items-center">
            <Text className="text-center text-muted-foreground text-lg mb-4">
              No games played yet
            </Text>
            <Text className="text-center text-muted-foreground">
              Start your first game to see it here!
            </Text>
          </View>
        )}

        {!isLoading && games.length > 0 && (
          <FlatList
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
      </View>
    </SafeAreaView>
  );
}
