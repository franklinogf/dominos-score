import { PartySize } from '@/components/party-size';
import { PlayersForm } from '@/components/players-form';
import { WinningLimit } from '@/components/points-selection';
import { TournamentSwitch } from '@/components/tournament-switch';
import { Text } from '@/components/ui/text';
import { useT } from '@/hooks/use-translation';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  const { t } = useT();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback
          accessible={false}
          className="flex-1"
          onPress={Keyboard.dismiss}
        >
          <View className="flex-1">
            <View className="pt-4">
              <Text variant="h1" className="text-center mb-6">
                {t('game.title')}
              </Text>
            </View>

            <TournamentSwitch />
            <PartySize />
            <WinningLimit />
            <PlayersForm />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
