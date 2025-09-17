import { PlayersButtons } from "@/components/players-buttons";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
// import { router, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Game() {
  return (
    <SafeAreaView className='flex-1 bg-background'>
      <Text
        variant='h1'
        className='mb-4'
      >
        Game
      </Text>

      <PlayersButtons />
      <Separator className='my-4' />
      {/* <Scores /> */}
    </SafeAreaView>
  );
}
