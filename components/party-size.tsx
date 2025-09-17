import { Text } from "@/components/ui/text";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BIG_PARTY_SIZES, PARTY_SIZES } from "@/lib/constants";
import { useGame } from "@/stores/use-game";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { View } from "react-native";

export function PartySize() {
  const gameSize = useGame((state) => state.gameSize);
  const updateGameSize = useGame((state) => state.updateGameSize);
  const tournamentMode = useGame((state) => state.tournamentMode);

  const currentMaxPartySizes = tournamentMode ? BIG_PARTY_SIZES : PARTY_SIZES;
  const [modalVisible, setModalVisible] = useState(false);

  // Ensure game size is valid when toggling tournament mode
  if (!tournamentMode && gameSize > 4) {
    updateGameSize(4);
  }

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
        value={gameSize.toString()}
        onValueChange={(value) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          updateGameSize(value !== undefined ? Number(value) : 2);
        }}
      >
        {currentMaxPartySizes.map((size, index) => (
          <PartySizeButton
            isFirst={index === 0}
            isLast={index === currentMaxPartySizes.length - 1}
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
