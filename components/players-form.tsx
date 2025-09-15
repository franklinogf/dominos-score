import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { FlatList, View } from "react-native";
export function PlayersForm({
  gameSize,
  playerNames,
  setPlayerNames,
}: {
  gameSize: string;
  playerNames: string[];
  setPlayerNames: (names: string[]) => void;
}) {
  playerNames = Array.from({ length: parseInt(gameSize) }).map(
    (_, index) => playerNames[index] || ""
  );
  return (
    <FlatList
      bounces={false}
      className='mt-8 w-full flex-1'
      data={playerNames}
      keyExtractor={(_, index) => index.toString()}
      numColumns={2}
      renderItem={({ item, index }) => (
        <View
          key={index}
          className='w-1/2 px-4 mb-4'
        >
          <Label
            htmlFor={`player-name-${index}`}
            className='font-bold text-xl mb-2'
          >
            Player {index + 1}
          </Label>
          <Input
            id={`player-name-${index}`}
            className='h-12'
            value={playerNames[index]}
            onChangeText={(text) => {
              const newNames = [...playerNames];
              newNames[index] = text;
              setPlayerNames(newNames);
            }}
          />
        </View>
      )}
    />
  );
}
