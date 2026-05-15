import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
    <View className="flex-row items-center justify-center gap-2 mt-2">
      <Label
        onPress={onCheckedChange}
        nativeID="tournament-mode"
        className="text-lg"
      >
        {t($ => $.game.tournamentMode)}
      </Label>
      <Switch
        nativeID="tournament-mode"
        id="tournament-mode"
        checked={tournamentMode}
        onCheckedChange={onCheckedChange}
      />
    </View>
  );
}
