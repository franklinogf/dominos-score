import { InputField } from '@/components/input-field';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { addPlayerToGame } from '@/db/actions/game';
import { useT } from '@/hooks/use-translation';
import { BIG_PARTY_SIZES } from '@/lib/constants';
import { GameStatus } from '@/lib/enums';
import { Player } from '@/lib/types';
import { useAddPlayerDialog } from '@/stores/use-add-player-dialog';
import { useGame } from '@/stores/use-game';
import { zodResolver } from '@hookform/resolvers/zod';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

const MAX_PLAYERS = parseInt(BIG_PARTY_SIZES[BIG_PARTY_SIZES.length - 1], 10);

export default function TournamentModal() {
  const { t } = useT();
  const players = useGame((state) => state.players);
  const gameStatus = useGame((state) => state.gameStatus);
  const updateGameStatus = useGame((state) => state.updateGameStatus);

  const trioMode = useGame((state) => state.trioMode);

  const maxActivePlayers = trioMode ? 3 : 4;
  const minActivePlayers = trioMode ? 3 : 2;

  const activePlayersCount = players.filter((p) => p.isPlaying).length;

  function handleSubmit() {
    if (
      activePlayersCount < minActivePlayers ||
      activePlayersCount > maxActivePlayers
    ) {
      impactAsync(ImpactFeedbackStyle.Heavy);
      return;
    }
    impactAsync(ImpactFeedbackStyle.Medium);

    // Dismiss modal and navigate to game, preventing back navigation
    router.dismissAll();
    router.replace('/game');
  }

  function handleBack() {
    router.back();
    updateGameStatus(
      gameStatus === GameStatus.Ready ? GameStatus.NotStarted : gameStatus,
    );
    impactAsync(ImpactFeedbackStyle.Light);
  }
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 py-4">
        <View className="mb-6 pt-2">
          <Text variant="h1" className="text-center">
            {t('game.tournament')}
          </Text>
          <Text className="text-center text-muted-foreground mt-2">
            {t('game.selectPlayersForRound')}
          </Text>

          {trioMode && (
            <View className="mt-4 mx-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <Text className="text-center text-amber-800 font-medium text-sm">
                {t('game.trioModeEnabled')}
              </Text>
              <Text className="text-center text-amber-700 text-xs mt-1">
                {t('game.trioModeExactly3')}
              </Text>
              <Text className="text-center text-amber-600 text-xs mt-1">
                {t('game.disableInSettings')}
              </Text>
            </View>
          )}
        </View>

        <PlayersList />

        <AddPlayerDialog />

        <View className="mt-auto pt-6">
          <Button
            onPress={handleSubmit}
            variant={
              activePlayersCount < minActivePlayers ||
              activePlayersCount > maxActivePlayers
                ? 'outline'
                : 'default'
            }
            className={`shadow-sm`}
            disabled={
              activePlayersCount < minActivePlayers ||
              activePlayersCount > maxActivePlayers
            }
          >
            <Text>
              {activePlayersCount < minActivePlayers
                ? t('game.selectAtLeast', { count: minActivePlayers })
                : activePlayersCount > maxActivePlayers
                  ? t('game.tooManyPlayers')
                  : t('game.startGame')}
            </Text>
          </Button>

          {gameStatus === GameStatus.NotStarted && (
            <View className="mt-4">
              <Button variant="outline" onPress={handleBack}>
                <Text>{t('common.cancel')}</Text>
              </Button>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

function PlayersList() {
  const { t } = useT();
  const players = useGame((state) => state.players);
  const updatePlayerActivity = useGame((state) => state.changePlayerActivity);
  const activePlayersCount = players.filter((p) => p.isPlaying).length;
  const trioMode = useGame((state) => state.trioMode);
  const maxActivePlayers = trioMode ? 3 : 4;
  const openAddPlayerDialog = useAddPlayerDialog((state) => state.open);

  const canAddMorePlayers = players.length < MAX_PLAYERS;

  const handlePlayerToggle = (player: Player, isPlaying: boolean) => {
    impactAsync(ImpactFeedbackStyle.Light);
    updatePlayerActivity(player, isPlaying);
  };

  const handleAddPlayerPress = () => {
    impactAsync(ImpactFeedbackStyle.Light);
    openAddPlayerDialog();
  };

  return (
    <View className="mt-6 flex-1">
      <View className="mb-4 items-center px-4 py-3 bg-muted/20 rounded-lg">
        <Text variant="muted" className="text-center text-base font-medium">
          {activePlayersCount} {t('game.selected')}
        </Text>
        <Text variant="muted" className="text-xs mt-1">
          {trioMode ? t('game.select3Players') : t('game.select2to4Players')}
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-sm">
          {players.map((player, index) => {
            const isDisabled =
              (activePlayersCount === 1 && player.isPlaying) ||
              (activePlayersCount === maxActivePlayers && !player.isPlaying);

            return (
              <Pressable
                disabled={isDisabled}
                key={player.id}
                onPress={() => {
                  if (!isDisabled) {
                    handlePlayerToggle(player, !player.isPlaying);
                  }
                }}
                className={`
                py-4 px-4 flex-row items-center justify-between
                ${index !== players.length - 1 ? 'border-b border-border/30' : ''}
                ${player.isPlaying ? 'bg-primary/5' : 'bg-transparent'}
                ${isDisabled && !player.isPlaying ? 'opacity-50' : 'active:bg-muted/30'}
              `}
              >
                <View className="flex-row items-center flex-1">
                  <View className="flex-1">
                    <Text
                      className={`
                      text-lg
                      ${player.isPlaying ? 'text-foreground font-medium' : 'text-muted-foreground'}
                    `}
                    >
                      {player.name}
                    </Text>
                    {(player.wins > 0 || player.losses > 0) && (
                      <Text
                        className={`
                        text-sm mt-1
                        ${player.isPlaying ? 'text-muted-foreground' : 'text-muted-foreground/70'}
                      `}
                      >
                        {player.wins} {t('game.wins')} • {player.losses}{' '}
                        {t('game.losses')}
                      </Text>
                    )}
                  </View>
                </View>

                <Switch
                  disabled={isDisabled}
                  checked={player.isPlaying}
                  onCheckedChange={(checked) =>
                    handlePlayerToggle(player, checked)
                  }
                />
              </Pressable>
            );
          })}
        </View>

        <View className="mt-4">
          <Button
            variant="outline"
            onPress={handleAddPlayerPress}
            disabled={!canAddMorePlayers}
            className="border-dashed"
          >
            <Text>
              {canAddMorePlayers
                ? `+ ${t('players.addPlayer')}`
                : t('players.maxPlayersReached', { count: MAX_PLAYERS })}
            </Text>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

function AddPlayerDialog() {
  const { t } = useT();
  const isOpen = useAddPlayerDialog((state) => state.isOpen);
  const close = useAddPlayerDialog((state) => state.close);
  const players = useGame((state) => state.players);
  const currentGameId = useGame((state) => state.currentGameId);

  // Create schema with dynamic validation
  const createSchema = () => {
    return z.object({
      playerName: z
        .string()
        .min(1, t('validation.required', { field: t('players.playerName') }))
        .max(10, t('players.nameMaxLength'))
        .refine(
          (name) => {
            const normalizedName = name.trim().toLowerCase();
            return !players.some(
              (p) => p.name.trim().toLowerCase() === normalizedName,
            );
          },
          { message: t('players.playerNameExists') },
        ),
    });
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createSchema()),
    defaultValues: {
      playerName: '',
    },
  });

  const addPlayer = useGame((state) => state.addPlayer);

  const onSubmit = async (data: { playerName: string }) => {
    if (!currentGameId) {
      console.error('No current game ID');
      return;
    }

    try {
      const newPlayer = await addPlayerToGame(
        currentGameId,
        data.playerName.trim(),
      );

      if (newPlayer) {
        // Update store with new player
        addPlayer({
          id: newPlayer.id.toString(),
          name: newPlayer.name,
          wins: 0,
          losses: 0,
          isPlaying: false, // New players start as inactive in tournament mode
          score: [],
        });

        // Success haptic feedback
        impactAsync(ImpactFeedbackStyle.Medium);

        // Close dialog and reset form
        close();
        reset();
      }
    } catch (error) {
      console.error('Error adding player:', error);
      impactAsync(ImpactFeedbackStyle.Heavy);
    }
  };

  const handleClose = () => {
    close();
    reset();
    impactAsync(ImpactFeedbackStyle.Light);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="min-w-full">
        <DialogTitle>
          <Text variant="large">{t('players.addPlayerTitle')}</Text>
        </DialogTitle>

        <InputField
          autoFocus
          name="playerName"
          control={control}
          placeholder={t('players.addPlayerPlaceholder')}
          error={errors.playerName?.message}
          autoCapitalize="words"
          className="mt-4"
        />

        <View className="mt-6 flex-row justify-end gap-3">
          <Button variant="outline" onPress={handleClose}>
            <Text>{t('common.cancel')}</Text>
          </Button>
          <Button onPress={handleSubmit(onSubmit)}>
            <Text>{t('game.add')}</Text>
          </Button>
        </View>
      </DialogContent>
    </Dialog>
  );
}
