import { Switch } from '@/components/ui/switch';
import { useGame } from '@/stores/use-game';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { View } from 'react-native';
import { Label } from './ui/label';

export function TournamentSwitch() {
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
        Tournament Mode
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
