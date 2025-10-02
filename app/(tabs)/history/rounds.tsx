import { Text } from '@/components/ui/text';
import { GameWithRoundsAndPlayers, getGameById } from '@/db/querys/game';
import { useT } from '@/hooks/use-translation';
import { GameType } from '@/lib/enums';
import {
  calculateTotalScore,
  formatDate,
  getPlayerScoresForRound,
  getRankingByWins,
  getRankingWithTies,
} from '@/lib/utils';
import { useFocusEffect } from 'expo-router';
import { useLocalSearchParams } from 'expo-router/build/hooks';
import { useCallback, useState } from 'react';
import { FlatList, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Component for displaying game summary
function GameSummary({
  game,
}: {
  game: NonNullable<GameWithRoundsAndPlayers>;
}) {
  const { t } = useT();
  return (
    <View className="bg-card border border-border rounded-lg p-4 mb-6">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text variant="h3" className="text-foreground mb-1">
            {game.type === GameType.NORMAL
              ? t('history.gameType')
              : t('history.tournamentType')}
          </Text>
          <Text variant="muted" className="text-sm">
            {formatDate(game.createdAt)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-sm font-medium text-muted-foreground">
            {game.rounds.length}{' '}
            {game.rounds.length === 1
              ? t('history.round')
              : t('history.rounds')}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between">
        <Text variant="small" className="text-muted-foreground">
          {t('history.playersLabel')}: {game.gameSize}
        </Text>
        <Text variant="small" className="text-muted-foreground">
          {t('history.winningLimit')}: {game.winningLimit}
        </Text>
      </View>
    </View>
  );
}

// Component for no rounds display
function NoRoundsDisplay({
  game,
}: {
  game: NonNullable<GameWithRoundsAndPlayers>;
}) {
  const { t } = useT();
  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <GameSummary game={game} />

      <View className="bg-card border border-border rounded-lg p-4 mb-4">
        <Text variant="h3" className="text-center mb-4 text-foreground">
          {t('history.gameSetup')}
        </Text>

        {/* Players List - just showing they were registered */}
        <View className="space-y-3">
          <Text variant="default" className="font-medium mb-2">
            {t('history.registeredPlayers')}:
          </Text>
          {game.players.map((player, index) => (
            <View
              key={player.id}
              className="flex-row justify-between items-center py-2 border-b border-border last:border-b-0"
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full mr-3 items-center justify-center bg-muted">
                  <Text className="text-xs font-bold text-muted-foreground">
                    {index + 1}
                  </Text>
                </View>
                <Text variant="default" className="font-medium">
                  {player.name}
                </Text>
              </View>
              <Text className="text-xs text-muted-foreground">
                {t('history.readyToPlay')}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <View className="flex-row items-center mb-2">
          <View className="w-8 h-8 rounded-full bg-yellow-500 items-center justify-center mr-3">
            <Text className="text-white font-bold text-sm">!</Text>
          </View>
          <Text variant="h4" className="text-yellow-800 font-medium">
            {t('history.gameNotStarted')}
          </Text>
        </View>
        <Text className="text-yellow-700 text-sm leading-5">
          {t('history.gameNotStartedDesc')}
        </Text>
      </View>

      <View className="bg-muted/20 border border-border rounded-lg p-4">
        <Text variant="muted" className="text-center text-sm">
          {t('history.whenRoundsPlayed')}
        </Text>
      </View>
    </ScrollView>
  );
}

// Component for single round display
function SingleRoundDisplay({
  game,
}: {
  game: NonNullable<GameWithRoundsAndPlayers>;
}) {
  const { t } = useT();
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      bounces={false}
      className="flex-1"
    >
      <GameSummary game={game} />

      <View className="bg-card border border-border rounded-lg p-4 mb-4">
        <Text variant="h3" className="text-center mb-4 text-foreground">
          {t('history.gameResults')}
        </Text>

        {/* Players List with Scores */}
        <View className="space-y-3">
          {getRankingWithTies(game.players, game).map((player) => {
            const scores = getPlayerScoresForRound(game.rounds[0], player.id);
            const totalScore = calculateTotalScore(scores);

            return (
              <View
                key={player.id}
                className="border-b border-border pb-3 mb-3 last:border-b-0"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-row items-center flex-1">
                    <View
                      className={`w-8 h-8 rounded-full mr-3 items-center justify-center ${
                        player.rank === 1
                          ? 'bg-yellow-500'
                          : player.rank === 2
                            ? 'bg-gray-400'
                            : player.rank === 3
                              ? 'bg-orange-600'
                              : 'bg-muted'
                      }`}
                    >
                      <Text className="font-bold text-white">
                        {player.rank}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text variant="default" className="font-medium">
                        {player.name}
                      </Text>
                      <Text className="text-sm text-muted-foreground">
                        {player.wins} {t('game.wins')} • {player.losses}{' '}
                        {t('game.losses')}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-xl font-bold text-foreground">
                      {totalScore}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      {t('history.points')}
                    </Text>
                  </View>
                </View>

                {/* Individual Scores */}
                {scores && scores.length > 0 && (
                  <View className="ml-11">
                    <Text
                      variant="small"
                      className="text-muted-foreground mb-1"
                    >
                      {t('history.roundScores')}:
                    </Text>
                    <View className="flex-row flex-wrap">
                      {scores.map((score, scoreIndex) => (
                        <View
                          key={scoreIndex}
                          className="bg-muted px-2 py-1 rounded mr-2 mb-1"
                        >
                          <Text className="text-xs">{score}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {(!scores || scores.length === 0) && (
                  <View className="ml-11">
                    <Text variant="small" className="text-muted-foreground">
                      {t('history.noScoresRecorded')}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      <View className="bg-muted/20 border border-border rounded-lg p-4">
        <Text variant="muted" className="text-center">
          {t('history.singleRoundGame')}
        </Text>
      </View>
    </ScrollView>
  );
}

// Component for multiple rounds display
function MultipleRoundsDisplay({
  game,
}: {
  game: NonNullable<GameWithRoundsAndPlayers>;
}) {
  const { t } = useT();
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      bounces={false}
      className="flex-1"
    >
      <GameSummary game={game} />

      {/* Overall Standings */}
      <View className="bg-card border border-border rounded-lg p-4 mb-4">
        <Text variant="h3" className="text-center mb-4 text-foreground">
          {t('history.finalStandings')}
        </Text>

        <View className="space-y-2">
          {getRankingByWins(game.players).map((player) => (
            <View
              key={player.id}
              className="flex-row justify-between items-center py-2"
            >
              <View className="flex-row items-center">
                <View
                  className={`w-8 h-8 rounded-full mr-3 items-center justify-center ${
                    player.rank === 1
                      ? 'bg-yellow-500'
                      : player.rank === 2
                        ? 'bg-gray-400'
                        : player.rank === 3
                          ? 'bg-orange-600'
                          : 'bg-muted'
                  }`}
                >
                  <Text className="font-bold text-white">{player.rank}</Text>
                </View>
                <Text variant="default" className="font-medium">
                  {player.name}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-sm font-medium">
                  {player.wins} {t('game.wins')}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {player.losses} {t('game.losses')}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Rounds Breakdown */}
      <View className="bg-card border border-border rounded-lg p-4 mb-4">
        <Text variant="h3" className="text-center mb-4 text-foreground">
          {t('history.roundByRound')}
        </Text>

        <FlatList
          showsVerticalScrollIndicator={false}
          bounces={false}
          data={game.rounds}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item: round, index }) => (
            <View className="border-b border-border py-4 last:border-b-0">
              <View className="flex-row justify-between items-center mb-3">
                <Text variant="h4" className="font-medium">
                  {t('history.roundNumber', { number: index + 1 })}
                </Text>
                {round.roundWinnerId && (
                  <Text variant="small" className="text-primary font-medium">
                    {t('game.winner')}:{' '}
                    {game.players.find((p) => p.id === round.roundWinnerId)
                      ?.name || 'Unknown'}
                  </Text>
                )}
              </View>

              {/* Round Scores */}
              <View className="space-y-2">
                {round.playersToRounds.map((ptr) => {
                  const scores = getPlayerScoresForRound(round, ptr.playerId);
                  const totalScore = calculateTotalScore(scores);

                  return (
                    <View
                      key={ptr.playerId}
                      className="flex-row justify-between items-center py-1"
                    >
                      <Text variant="default" className="font-medium">
                        {ptr.player.name}
                      </Text>
                      <View className="flex-row items-center">
                        {scores && scores.length > 0 ? (
                          <>
                            <View className="flex-row mr-3">
                              {scores.map((score, scoreIndex) => (
                                <View
                                  key={scoreIndex}
                                  className="bg-muted px-1.5 py-0.5 rounded mr-1"
                                >
                                  <Text className="text-xs">{score}</Text>
                                </View>
                              ))}
                            </View>
                            <Text className="text-sm font-bold min-w-[40px] text-right">
                              {totalScore}
                            </Text>
                          </>
                        ) : (
                          <Text
                            variant="small"
                            className="text-muted-foreground"
                          >
                            {t('history.noScores')}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>

              {!round.roundWinnerId && !round.playersToRounds.length && (
                <Text variant="small" className="text-muted-foreground mt-2">
                  {t('history.roundNotCompleted')}
                </Text>
              )}
            </View>
          )}
          scrollEnabled={false}
        />
      </View>

      <View className="bg-muted/20 border border-border rounded-lg p-4">
        <Text variant="muted" className="text-center">
          {t('history.multipleRoundsGame', { count: game.rounds.length })}
        </Text>
      </View>
    </ScrollView>
  );
}

export default function HistoryRounds() {
  const [game, setGame] = useState<GameWithRoundsAndPlayers | null>(null);
  const gameId = useLocalSearchParams<{ gameId: string }>().gameId;
  const { t } = useT();

  const loadGame = useCallback(async () => {
    try {
      const gameData = await getGameById(Number(gameId));
      setGame(gameData);
    } catch (error) {
      console.error('Failed to load games:', error);
    }
  }, [gameId]);

  useFocusEffect(
    useCallback(() => {
      loadGame();
    }, [loadGame]),
  );

  if (!game) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text>{t('history.loadingGameData')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      className="flex-1 bg-background px-4 pt-4 pb-20"
    >
      <Text variant="h1" className="text-center mb-6">
        {t('history.gameDetails')}
      </Text>

      {game.rounds.length === 0 ? (
        <NoRoundsDisplay game={game} />
      ) : game.rounds.length === 1 ? (
        <SingleRoundDisplay game={game} />
      ) : (
        <MultipleRoundsDisplay game={game} />
      )}
    </SafeAreaView>
  );
}
