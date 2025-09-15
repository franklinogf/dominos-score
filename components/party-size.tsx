import { Text } from "@/components/ui/text";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import * as Haptics from "expo-haptics";
import { View } from "react-native";
const PartySizes = ["2", "3", "4", "5", "6", "7", "8"] as const;
export function PartySize({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <View className='w-full mt-4'>
      <Text
        className='text-center mb-1'
        variant='large'
      >
        Party size
      </Text>
      <ToggleGroup
        type='single'
        className='mx-auto'
        variant='outline'
        size='lg'
        value={value}
        onValueChange={(value) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onValueChange(value ?? "1");
        }}
      >
        {PartySizes.map((size, index) => (
          <PartySizeButton
            isFirst={index === 0}
            isLast={index === PartySizes.length - 1}
            key={size}
            label={size}
          />
        ))}
      </ToggleGroup>
    </View>
  );
}

function PartySizeButton({
  label,
  isFirst,
  isLast,
}: {
  label: string;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <ToggleGroupItem
      isFirst={isFirst}
      isLast={isLast}
      value={label}
    >
      <Text className='text-4xl'>{label}</Text>
    </ToggleGroupItem>
  );
}
