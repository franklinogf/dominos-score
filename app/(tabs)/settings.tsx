import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { saveSettings } from '@/db/actions/settings';
import {
  getLongPressScoreSetting,
  getTrioModeSetting,
} from '@/db/querys/settings';
import { DEFAULT_LONG_PRESS_SCORE, DEFAULT_TRIO_MODE } from '@/lib/constants';
import { useGame } from '@/stores/use-game';
import { zodResolver } from '@hookform/resolvers/zod';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

interface FieldGroupProps {
  id: string;
  label: string;
  description?: string;
  children: React.ReactNode;
}

function FieldGroup({ id, label, description, children }: FieldGroupProps) {
  return (
    <View>
      <View className="mb-3">
        <Label htmlFor={id} className="text-base font-medium">
          {label}
        </Label>
        {description && <Text variant="muted">{description}</Text>}
      </View>
      {children}
    </View>
  );
}

const settingsSchema = z.object({
  longPressScore: z
    .string()
    .min(1, 'Long press score is required')
    .refine((val) => !isNaN(Number(val)), 'Must be a valid number')
    .refine((val) => Number(val) > 0, 'Must be greater than 0')
    .refine((val) => Number(val) <= 999, 'Must be 999 or less'),
  trioMode: z.boolean(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function Settings() {
  const [isLoading, setIsLoading] = useState(true);
  const setTrioMode = useGame((state) => state.setTrioMode);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      longPressScore: DEFAULT_LONG_PRESS_SCORE.toString(),
      trioMode: DEFAULT_TRIO_MODE,
    },
  });

  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const longPressScore = await getLongPressScoreSetting();
        const trioMode = await getTrioModeSetting();
        setValue('longPressScore', longPressScore.toString());
        setValue('trioMode', trioMode);
      } catch (error) {
        console.error('Failed to load settings:', error);
        Alert.alert('Error', 'Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [setValue]);

  const onSubmit = async (data: SettingsFormData) => {
    impactAsync(ImpactFeedbackStyle.Light);

    try {
      // Convert data to string format for storage
      const settingsData = {
        longPressScore: data.longPressScore,
        trioMode: data.trioMode.toString(),
      };
      await saveSettings(settingsData);

      // Update game store with new trio mode setting
      setTrioMode(data.trioMode);

      reset(data);
      impactAsync(ImpactFeedbackStyle.Medium);
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      impactAsync(ImpactFeedbackStyle.Heavy);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      Keyboard.dismiss();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background px-6 py-4">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
          <Text variant="h1" className="text-center mb-6">
            Settings
          </Text>

          {isLoading ? (
            <Text className="text-center text-muted-foreground">
              Loading...
            </Text>
          ) : (
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              className="flex-1"
            >
              <FieldGroup
                id="longPressScore"
                label="Long Press Score"
                description="Points added when you long press a player button"
              >
                <Controller
                  control={control}
                  name="longPressScore"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      id="longPressScore"
                      value={value}
                      onChangeText={onChange}
                      placeholder="Enter score value"
                      keyboardType="number-pad"
                      maxLength={3}
                    />
                  )}
                />

                {errors.longPressScore && (
                  <Text className="text-destructive text-sm mt-2">
                    {errors.longPressScore.message}
                  </Text>
                )}
              </FieldGroup>

              <View className="my-6" />

              <FieldGroup
                id="trioMode"
                label="Trio Mode"
                description="Only the player with the lowest score loses (everyone else wins)"
              >
                <Controller
                  control={control}
                  name="trioMode"
                  render={({ field: { onChange, value } }) => (
                    <View className="flex-row items-center space-x-2">
                      <Switch checked={value} onCheckedChange={onChange} />
                      <Text variant="default" className="ml-3">
                        {value ? 'Enabled' : 'Disabled'}
                      </Text>
                    </View>
                  )}
                />
              </FieldGroup>

              <Button
                onPress={handleSubmit(onSubmit)}
                disabled={!isDirty || isSubmitting}
                className="mt-8"
              >
                <Text>{isSubmitting ? 'Saving...' : 'Save'}</Text>
              </Button>
            </KeyboardAvoidingView>
          )}
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
