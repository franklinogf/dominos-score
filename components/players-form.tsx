import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";

import { PlayerName } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FlatList, View } from "react-native";
import { z } from "zod";
import { Button } from "./ui/button";

// Create dynamic schema based on game size
const createPlayersSchema = (gameSize: number) => {
  const playerFields = Array.from({ length: gameSize }, (_, index) => [
    `player${index}`,
    z
      .string()
      .min(1, `Player ${index + 1} name is required`)
      .max(10, "Name must be 10 characters or less"),
  ]);

  return z.object(Object.fromEntries(playerFields));
};

export function PlayersForm({
  gameSize,
  playerNames,
  setPlayerNames,
}: {
  gameSize: string;
  playerNames: PlayerName[];
  setPlayerNames: (players: PlayerName[]) => void;
}) {
  const gameSizeNum = parseInt(gameSize);
  const schema = createPlayersSchema(gameSizeNum);

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: zodResolver(schema) as any,
    defaultValues: Object.fromEntries(
      Array.from({ length: gameSizeNum }, (_, index) => [
        `player${index}`,
        playerNames[index]?.name || "",
      ])
    ),
  });

  const playersData = Array.from({ length: gameSizeNum }, (_, index) => ({
    index,
    fieldName: `player${index}` as const,
  }));

  const onSubmit = (data: Record<string, string>) => {
    setPlayerNames(
      Object.keys(data).map((key) => ({
        id: key,
        name: data[key],
      }))
    );
  };
  return (
    <View className='flex-1 w-full'>
      <FlatList
        bounces={false}
        className='mt-8 w-full flex-1'
        data={playersData}
        keyExtractor={(item) => item.fieldName}
        numColumns={2}
        renderItem={({ item }) => (
          <View
            key={item.index}
            className='w-1/2 px-4 mb-4'
          >
            <Label
              htmlFor={`player-name-${item.index}`}
              className='font-bold text-xl mb-2'
            >
              Player {item.index + 1}
            </Label>
            <Controller
              control={control}
              name={item.fieldName}
              render={({ field: { onChange, value } }) => (
                <Input
                  id={`player-name-${item.index}`}
                  className='h-12'
                  value={value}
                  onChangeText={onChange}
                  placeholder={`Enter player ${item.index + 1} name`}
                />
              )}
            />
            {errors[item.fieldName] && (
              <Text className='text-destructive text-sm mt-1.5'>
                {errors[item.fieldName]?.message}
              </Text>
            )}
          </View>
        )}
      />
      <View className='px-4 pb-2'>
        <Button
          onPress={handleSubmit(onSubmit)}
          size='lg'
        >
          <Text>Start game</Text>
        </Button>
      </View>
    </View>
  );
}
