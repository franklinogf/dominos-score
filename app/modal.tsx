import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { GameStatus } from "@/lib/enums";
import { Player } from "@/lib/types";
import { useGame } from "@/stores/use-game";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TournamentModal() {
  const players = useGame((state) => state.players);
  const gameStatus = useGame((state) => state.gameStatus);
  const updateGameStatus = useGame((state) => state.updateGameStatus);
  const startNewRound = useGame((state) => state.startNewRound);

  const activePlayersCount = players.filter((p) => p.isPlaying).length;

  function handleSubmit() {
    if (activePlayersCount < 2 || activePlayersCount > 4) {
      impactAsync(ImpactFeedbackStyle.Heavy);
      return; // Don't proceed if invalid player count
    }
    impactAsync(ImpactFeedbackStyle.Medium);
    startNewRound();

    // Dismiss modal and navigate to game, preventing back navigation
    router.dismissAll();
    router.replace("/game");
  }

  function handleBack() {
    router.back();
    updateGameStatus(
      gameStatus === GameStatus.Ready ? GameStatus.NotStarted : gameStatus
    );
    impactAsync(ImpactFeedbackStyle.Light);
  }
  return (
    <SafeAreaView className='flex-1 bg-background'>
      <View className='flex-1 px-6 py-4'>
        <View className='mb-6 pt-2'>
          <Text
            variant='h1'
            className='text-center'
          >
            Tournament
          </Text>
          <Text className='text-center text-muted-foreground mt-2'>
            Select players for this round
          </Text>
        </View>

        <PlayersList />

        <View className='mt-auto pt-6'>
          <Button
            onPress={handleSubmit}
            className={`
                  shadow-sm
                  ${
                    activePlayersCount >= 2 && activePlayersCount <= 4
                      ? "bg-primary"
                      : "bg-muted opacity-50"
                  }
                `}
            disabled={activePlayersCount < 2 || activePlayersCount > 4}
          >
            <Text
              className={`
                  font-medium
                  ${
                    activePlayersCount >= 2 && activePlayersCount <= 4
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  }
                `}
            >
              {activePlayersCount < 2
                ? "Select at least 2 players"
                : activePlayersCount > 4
                  ? "Too many players selected"
                  : "Start Game"}
            </Text>
          </Button>

          {gameStatus === GameStatus.NotStarted && (
            <View className='mt-4'>
              <Button
                variant='outline'
                onPress={handleBack}
              >
                <Text>Cancel</Text>
              </Button>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

function PlayersList() {
  const players = useGame((state) => state.players);
  const updatePlayerActivity = useGame((state) => state.changePlayerActivity);
  console.log(JSON.stringify(players, null, 2));
  const activePlayersCount = players.filter((p) => p.isPlaying).length;

  const handlePlayerToggle = (player: Player, isPlaying: boolean) => {
    impactAsync(ImpactFeedbackStyle.Light);
    updatePlayerActivity(player, isPlaying);
  };

  return (
    <View className='mt-6'>
      <View className='mb-4 items-center px-4 py-3 bg-muted/20 rounded-lg'>
        <Text
          variant='muted'
          className='text-center text-base font-medium'
        >
          {activePlayersCount} selected
        </Text>
        <Text
          variant='muted'
          className='text-xs mt-1'
        >
          2 or 4 players required to start
        </Text>
      </View>

      <View className='bg-card rounded-xl border border-border/50 overflow-hidden shadow-sm'>
        {players.map((player, index) => {
          const isDisabled =
            (activePlayersCount === 2 && player.isPlaying) ||
            (activePlayersCount === 4 && !player.isPlaying);

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
                ${index !== players.length - 1 ? "border-b border-border/30" : ""}
                ${player.isPlaying ? "bg-primary/5" : "bg-transparent"}
                ${isDisabled && !player.isPlaying ? "opacity-50" : "active:bg-muted/30"}
              `}
            >
              <View className='flex-row items-center flex-1'>
                <Text
                  className={`
                    flex-1 text-lg
                    ${player.isPlaying ? "text-foreground font-medium" : "text-muted-foreground"}
                  `}
                >
                  {player.name}
                </Text>
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
    </View>
  );
}
