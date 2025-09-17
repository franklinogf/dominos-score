import { useGame } from "@/stores/use-game";
import { useTournamentModal } from "@/stores/use-tournament-modal";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { Modal, Pressable, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Text } from "./ui/text";

export function TournamentModal() {
  const isOpen = useTournamentModal((state) => state.isOpen);
  const closeModal = useTournamentModal((state) => state.closeModal);

  return (
    <Modal
      presentationStyle='fullScreen'
      animationType='slide'
      visible={isOpen}
      onRequestClose={closeModal}
    >
      <SafeAreaProvider>
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
                onPress={closeModal}
                className='bg-primary shadow-sm'
              >
                <Text className='text-primary-foreground font-medium'>
                  Continue
                </Text>
              </Button>
            </View>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

function PlayersList() {
  const players = useGame((state) => state.players);
  const updatePlayerActivity = useGame((state) => state.changePlayerActivity);

  const activePlayersCount = players.filter((p) => p.isPlaying).length;

  const handlePlayerToggle = (playerId: string, isPlaying: boolean) => {
    impactAsync(ImpactFeedbackStyle.Light);
    updatePlayerActivity(playerId, isPlaying);
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
                  handlePlayerToggle(player.id, !player.isPlaying);
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
                  handlePlayerToggle(player.id, checked)
                }
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
