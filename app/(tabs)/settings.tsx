import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { saveSettings } from '@/db/actions/settings';
import {
  getLongPressScoreSetting,
  getMultiLoseSetting,
  getTrioModeSetting,
} from '@/db/querys/settings';
import {
  DEFAULT_LONG_PRESS_SCORE,
  DEFAULT_MULTI_LOSE,
  DEFAULT_TRIO_MODE,
} from '@/lib/constants';
import { useGame } from '@/stores/use-game';
import { zodResolver } from '@hookform/resolvers/zod';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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
    <View className="my-3">
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

const settingsSchema = (t: (key: string) => string) =>
  z.object({
    longPressScore: z
      .string()
      .min(1, t('settings.longPressScoreRequired'))
      .refine((val) => !isNaN(Number(val)), t('settings.longPressScoreInvalid'))
      .refine((val) => Number(val) > 0, t('settings.longPressScorePositive'))
      .refine((val) => Number(val) <= 999, t('settings.longPressScoreMax')),
    trioMode: z.boolean(),
    multiLose: z.boolean(),
  });

type SettingsFormData = z.infer<ReturnType<typeof settingsSchema>>;

export default function Settings() {
  const [isLoading, setIsLoading] = useState(true);
  const setTrioMode = useGame((state) => state.setTrioMode);
  const setMultiLose = useGame((state) => state.setMultiLose);
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema(t)),
    defaultValues: {
      longPressScore: DEFAULT_LONG_PRESS_SCORE.toString(),
      trioMode: DEFAULT_TRIO_MODE,
      multiLose: DEFAULT_MULTI_LOSE,
    },
  });

  // Load current settings
  useFocusEffect(
    useCallback(() => {
      const loadSettings = async () => {
        try {
          const longPressScore = await getLongPressScoreSetting();
          const trioMode = await getTrioModeSetting();
          const multiLose = await getMultiLoseSetting();
          setValue('longPressScore', longPressScore.toString());
          setValue('trioMode', trioMode);
          setValue('multiLose', multiLose);
        } catch (error) {
          console.error('Failed to load settings:', error);
          Alert.alert(t('common.error'), t('settings.loadError'));
        } finally {
          setIsLoading(false);
        }
      };

      loadSettings();
    }, [setValue, t]),
  );

  const onSubmit = async (data: SettingsFormData) => {
    impactAsync(ImpactFeedbackStyle.Light);

    try {
      // Convert data to string format for storage
      const settingsData = {
        longPressScore: data.longPressScore,
        trioMode: data.trioMode.toString(),
        multiLose: data.multiLose.toString(),
      };
      await saveSettings(settingsData);

      // Update game store with new trio mode setting
      setTrioMode(data.trioMode);
      setMultiLose(data.multiLose);
      reset(data);
      impactAsync(ImpactFeedbackStyle.Medium);
      Alert.alert(t('settings.success'), t('settings.settingsSaved'));
    } catch (error) {
      console.error('Failed to save settings:', error);
      impactAsync(ImpactFeedbackStyle.Heavy);
      Alert.alert(t('common.error'), t('settings.settingsError'));
    } finally {
      Keyboard.dismiss();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background px-6 py-4">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
          <Text variant="h1" className="text-center mb-6">
            {t('settings.title')}
          </Text>

          {isLoading ? (
            <Text className="text-center text-muted-foreground">
              {t('common.loading')}
            </Text>
          ) : (
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              className="flex-1"
            >
              <FieldGroup
                id="longPressScore"
                label={t('settings.longPressScore')}
                description={t('settings.longPressScoreDescription')}
              >
                <Controller
                  control={control}
                  name="longPressScore"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      id="longPressScore"
                      value={value}
                      onChangeText={onChange}
                      placeholder={t('settings.longPressScorePlaceholder')}
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

              <FieldGroup
                id="trioMode"
                label={t('settings.trioMode')}
                description={t('settings.trioModeDescription')}
              >
                <Controller
                  control={control}
                  name="trioMode"
                  render={({ field: { onChange, value } }) => (
                    <View className="flex-row items-center space-x-2">
                      <Switch checked={value} onCheckedChange={onChange} />
                      <Text variant="default" className="ml-3">
                        {value ? t('settings.enabled') : t('settings.disabled')}
                      </Text>
                    </View>
                  )}
                />
              </FieldGroup>
              <FieldGroup
                id="multiLose"
                label={t('settings.multiLose')}
                description={t('settings.multiLoseDescription')}
              >
                <Controller
                  control={control}
                  name="multiLose"
                  render={({ field: { onChange, value } }) => (
                    <View className="flex-row items-center space-x-2">
                      <Switch checked={value} onCheckedChange={onChange} />
                      <Text variant="default" className="ml-3">
                        {value ? t('settings.enabled') : t('settings.disabled')}
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
                <Text>
                  {isSubmitting ? t('settings.saving') : t('common.save')}
                </Text>
              </Button>
            </KeyboardAvoidingView>
          )}
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
