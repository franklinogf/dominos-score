import { PartySize } from "@/components/party-size";
import { PlayersForm } from "@/components/players-form";
import { PointsSelection } from "@/components/points-selection";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { POINTS } from "@/constants/points";
import { Point } from "@/lib/types";
import { Link } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const [gameSize, setGameSize] = useState("2");
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [points, setPoints] = useState<Point>(POINTS.default); // default to 150
  return (
    <SafeAreaView className='flex-1 bg-background'>
      <Pressable
        className='flex-1'
        onPress={Keyboard.dismiss}
      >
        <Text variant={"h1"}>Dominos app</Text>
        <PartySize
          value={gameSize}
          onValueChange={setGameSize}
        />
        <PointsSelection
          value={points}
          onValueChange={setPoints}
        />

        <KeyboardAvoidingView
          className='flex-1'
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <PlayersForm
            gameSize={gameSize}
            playerNames={playerNames}
            setPlayerNames={setPlayerNames}
          />
        </KeyboardAvoidingView>
        <View className='px-4 pb-2'>
          <Link
            asChild
            replace
            href={"/game"}
          >
            <Button size='lg'>
              <Text>Start game</Text>
            </Button>
          </Link>
        </View>
      </Pressable>
    </SafeAreaView>
  );
}
