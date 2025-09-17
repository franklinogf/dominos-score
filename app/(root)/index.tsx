import { PartySize } from "@/components/party-size";
import { PlayersForm } from "@/components/players-form";
import { WinningLimit } from "@/components/points-selection";
import { TournamentModal } from "@/components/tournament-modal";
import { TournamentSwitch } from "@/components/tournament-switch";
import { Text } from "@/components/ui/text";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView className='flex-1 bg-background'>
      <Pressable
        className='flex-1'
        onPress={Keyboard.dismiss}
      >
        <Text variant={"h1"}>Dominos app</Text>
        <TournamentSwitch />
        <PartySize />
        <WinningLimit />

        <KeyboardAvoidingView
          className='flex-1'
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <PlayersForm />
        </KeyboardAvoidingView>
      </Pressable>

      <TournamentModal />
    </SafeAreaView>
  );
}
