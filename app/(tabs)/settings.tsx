import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { saveSettings } from '@/db/actions/settings';
import { getLongPressScoreSetting } from '@/db/querys/settings';
import { DEFAULT_LONG_PRESS_SCORE } from '@/lib/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Keyboard, TouchableWithoutFeedback, View } from 'react-native';
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
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function Settings() {
  const [isLoading, setIsLoading] = useState(true);

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
    },
  });

  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const longPressScore = await getLongPressScoreSetting();
        setValue('longPressScore', longPressScore.toString());
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
      await saveSettings(data);
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
            <View className="space-y-6">
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

              <Button
                onPress={handleSubmit(onSubmit)}
                disabled={!isDirty || isSubmitting}
                className="mt-8"
              >
                <Text>{isSubmitting ? 'Saving...' : 'Save'}</Text>
              </Button>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
