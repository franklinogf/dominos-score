import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { useGame } from '@/stores/use-game';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

export function TournamentSwitch() {
  const { t } = useTranslation();
  const tournamentMode = useGame((state) => state.tournamentMode);
  const toggleTournamentMode = useGame((state) => state.toggleTournamentMode);

  function onCheckedChange() {
    impactAsync(ImpactFeedbackStyle.Light);
    toggleTournamentMode();
  }
  return (
    <View className="flex-row items-center justify-between gap-4">
      <View className="flex-1">
        <Label
          onPress={onCheckedChange}
          nativeID="tournament-mode"
          className="text-lg font-semibold"
        >
          {t(($) => $.game.tournamentMode)}
        </Label>
        <Text variant="muted">
          {tournamentMode
            ? t(($) => $.settings.enabled)
            : t(($) => $.settings.disabled)}
        </Text>
      </View>
      <Switch
        nativeID="tournament-mode"
        id="tournament-mode"
        checked={tournamentMode}
        onCheckedChange={onCheckedChange}
      />
    </View>
  );
}
