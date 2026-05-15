import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Text } from '@/components/ui/text';
import { POINTS } from '@/lib/constants';
import { Point } from '@/lib/types';
import { useGame } from '@/stores/use-game';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

export function WinningLimit() {
  const { t } = useTranslation();
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
    <View className="w-full">
      <Text className="mb-3" variant="large">
        {t(($) => $.game.pointsToWin)}
      </Text>
      <RadioGroup
        className="text-xl flex-row gap-5"
        value={winningLimit.toString()}
        onValueChange={(value) => onValueChange(value as Point)}
      >
        {POINTS.map((point) => (
          <View key={point} className="flex-row items-center gap-2">
            <RadioGroupItem className="size-8" value={point} id={`r${point}`} />
            <Label
              className="text-2xl font-semibold"
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
