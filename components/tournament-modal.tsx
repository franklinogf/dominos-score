import { useGame } from "@/stores/use-game";
import { useTournamentModal } from "@/stores/use-tournament-modal";
import { Modal, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "./ui/text";

export function TournamentModal() {
  const players = useGame((state) => state.players);
  const isOpen = useTournamentModal((state) => state.isOpen);
  const closeModal = useTournamentModal((state) => state.closeModal);
  return (
    <Modal
      presentationStyle='fullScreen'
      animationType='slide'
      visible={isOpen}
      onRequestClose={closeModal}
    >
      <SafeAreaView className='flex-1 bg-background'>
        <View className='px-8'>
          <Text
            variant='h4'
            className='text-center'
          >
            Select the players that will be playing this round
          </Text>

          <View>
            {Object.entries(players).map(([key, name]) => (
              <View
                key={key}
                className='py-2 border-b border-b-muted-foreground/10 flex-row items-center gap-2'
              >
                {/* <Switch checked={} /> */}
              </View>
            ))}
          </View>

          <Pressable
            onPress={closeModal}
            className='mt-4 bg-blue-500 p-2 rounded'
          >
            <Text className='text-white'>Close Modal</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
