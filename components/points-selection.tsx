import { Text } from "@/components/ui/text";
import { POINTS } from "@/constants/points";
import { Point } from "@/lib/types";
import * as Haptics from "expo-haptics";
import { View } from "react-native";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
export function PointsSelection({
  value,
  onValueChange: onChange,
}: {
  value?: Point;
  onValueChange?: (value: Point) => void;
}) {
  function onLabelPress(label: Point) {
    return () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange?.(label);
    };
  }

  function onValueChange(value: Point) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange?.(value);
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
        value={value}
        onValueChange={(value) => onValueChange(value as Point)}
      >
        {POINTS.values.map((point) => (
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
