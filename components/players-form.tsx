import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';

import { Button } from '@/components/ui/button';
import { addNewGame } from '@/db/actions/game';
import { GameStatus, GameType } from '@/lib/enums';
import { Player } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useGame } from '@/stores/use-game';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, FlatList, TextInput, View } from 'react-native';
import { z } from 'zod';

// Create dynamic schema based on game size
const createPlayersSchema = (gameSize: number) => {
  const playerFields = Array.from({ length: gameSize }, (_, index) => [
    `player${index}`,
    z
      .string()
      .min(1, `Player ${index + 1} name is required`)
      .max(10, 'Name must be 10 characters or less'),
  ]);

  return z.object(Object.fromEntries(playerFields));
};

export function PlayersForm() {
  const gameSize = useGame((state) => state.gameSize);
  const players = useGame((state) => state.players);
  const addPlayers = useGame((state) => state.addPlayers);
  const schema = createPlayersSchema(gameSize);
  const tournamentMode = useGame((state) => state.tournamentMode);
  const inputRef = useRef<TextInput[]>([]);
  const updateGameStatus = useGame((state) => state.updateGameStatus);
  const winningLimit = useGame((state) => state.winningLimit);
  const updateCurrentGameId = useGame((state) => state.updateCurrentGameId);
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: zodResolver(schema) as any,
    defaultValues: Object.fromEntries(
      Array.from({ length: gameSize }, (_, index) => [
        `player${index}`,
        players[index]?.name || '',
      ]),
    ) as Record<string, string>,
  });

  const playersData = Array.from({ length: gameSize }, (_, index) => ({
    index,
    fieldName: `player${index}` as const,
  }));

  const onSubmit = async (data: Record<string, string>) => {
    const playersNames = Object.entries(data).map(([_, name]) => name.trim());
    const result = await addNewGame(
      {
        gameSize,
        type: tournamentMode ? GameType.TOURNAMENT : GameType.NORMAL,
        winningLimit,
      },
      playersNames,
    );

    if (result === undefined) {
      Alert.alert('Error', 'Failed to create a new game. Please try again.');
      return;
    }
    const { game, players } = result;

    const newPlayers: Player[] = players.map((p) => ({
      id: String(p.id),
      name: p.name,
      score: [],
      isPlaying: tournamentMode ? false : true,
      wins: 0,
      losses: 0,
    }));

    addPlayers(newPlayers);
    updateCurrentGameId(game.id);

    if (tournamentMode) {
      router.push('/modal');
    } else {
      updateGameStatus(GameStatus.Ready);
      router.replace('/game');
    }
  };
  return (
    <View className="flex-1 w-full">
      <FlatList
        key={gameSize}
        bounces={false}
        className="mt-8 w-full flex-1"
        data={playersData}
        keyExtractor={(item) => item.fieldName}
        numColumns={gameSize > 3 ? 2 : 1}
        renderItem={({ item }) => (
          <View
            key={item.index}
            className={cn('w-full px-4 mb-4', { 'w-1/2': gameSize > 3 })}
          >
            <Label
              htmlFor={`player-name-${item.index}`}
              className="font-bold text-xl mb-2"
            >
              Player {item.index + 1}
            </Label>
            <Controller
              control={control}
              name={item.fieldName}
              render={({ field: { onChange, value } }) => (
                <Input
                  ref={(el) => {
                    if (el) {
                      inputRef.current[item.index] = el;
                    }
                  }}
                  returnKeyType={item.index === gameSize - 1 ? 'done' : 'next'}
                  onSubmitEditing={() => {
                    if (item.index < gameSize - 1) {
                      inputRef.current[item.index + 1]?.focus();
                    } else {
                      inputRef.current[item.index]?.blur();
                    }
                  }}
                  autoCorrect={false}
                  spellCheck={false}
                  autoComplete="off"
                  id={`player-name-${item.index}`}
                  value={value}
                  onChangeText={onChange}
                  placeholder={`Enter player ${item.index + 1} name`}
                />
              )}
            />
            {errors[item.fieldName] && (
              <Text className="text-destructive text-sm mt-1.5">
                {errors[item.fieldName]?.message}
              </Text>
            )}
          </View>
        )}
      />
      <View className="px-4 pb-2">
        <Button onPress={handleSubmit(onSubmit)} size="lg">
          <Text>{tournamentMode ? 'Start Tournament' : 'Start Game'}</Text>
        </Button>
      </View>
    </View>
  );
}
