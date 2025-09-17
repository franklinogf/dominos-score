import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Settings() {
  return (
    <SafeAreaView className='flex-1 bg-background'>
      <Text variant={"h1"}>Settings</Text>
    </SafeAreaView>
  );
}
