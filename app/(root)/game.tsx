import { Button } from "@/components/ui/button";

import { Text } from "@/components/ui/text";
import { Link } from "expo-router";
// import { router, useRouter } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Game() {
  return (
    <SafeAreaView className='flex-1 bg-background'>
      <Text variant={"h1"}>Game</Text>
      <View className='px-4'>
        <Link
          asChild
          replace
          href={"/"}
        >
          <Button size='lg'>
            <Text>End Game</Text>
          </Button>
        </Link>
      </View>
      <View className='px-4 mt-4'>
        <Text>This is where the game would be played.</Text>
        <Text className='mt-2'>
          For now, click the button above to return to the home screen.
        </Text>
      </View>
    </SafeAreaView>
  );
}
