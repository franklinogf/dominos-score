import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Text } from "@/components/ui/text";
import { POINTS } from "@/lib/constants";
import { Point } from "@/lib/types";
import { useGame } from "@/stores/use-game";
import * as Haptics from "expo-haptics";
import { View } from "react-native";

export function WinningLimit() {
  const winningLimit = useGame((state) => state.winningLimit);
  const updateWinningLimit = useGame((state) => state.updateWinningLimit);
  function onLabelPress(label: Point) {
    return () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      updateWinningLimit(Number(label));
    };
  }

  function onValueChange(value: Point) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateWinningLimit(Number(value));
  }
  return (
    <View className='w-full mt-4'>
      <Text
        className='text-center mb-1'
        variant='large'
      >
        Points to win
      </Text>
      <RadioGroup
        className='text-xl mx-auto flex-row'
        value={winningLimit.toString()}
        onValueChange={(value) => onValueChange(value as Point)}
      >
        {POINTS.map((point) => (
          <View
            key={point}
            className='flex-row items-center gap-2'
          >
            <RadioGroupItem
              className='size-8'
              value={point}
              id={`r${point}`}
            />
            <Label
              className='text-2xl'
              onPress={onLabelPress(point)}
              htmlFor={`r${point}`}
            >
              {point}
            </Label>
          </View>
        ))}
      </RadioGroup>
    </View>
  );
}
