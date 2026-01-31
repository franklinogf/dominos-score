import { useFocusEffect, useRouter } from 'expo-router';
import { XIcon } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { getLongPressScoreSetting } from '@/db/querys/settings';
import { useT } from '@/hooks/use-translation';
import {
  DEFAULT_DOUBLE_PRESS_SCORE,
  DEFAULT_LONG_PRESS_SCORE,
} from '@/lib/constants';
import { useColorScheme } from 'nativewind';
import { useCallback, useState } from 'react';

export default function InfoModal() {
  const { t } = useT();
  const router = useRouter();
  const [longPressScore, setLongPressScore] = useState<number>(
    DEFAULT_LONG_PRESS_SCORE,
  );
  const { colorScheme } = useColorScheme();

  const iconColor = colorScheme === 'dark' ? '#fff' : '#000';

  useFocusEffect(
    useCallback(() => {
      const fetchSettings = async () => {
        const score = await getLongPressScoreSetting();
        setLongPressScore(score);
      };

      fetchSettings();
    }, []),
  );

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between p-4 border-b border-border">
        <Text className="text-xl font-bold text-foreground">
          {t('info.title')}
        </Text>
        <Pressable onPress={() => router.back()} className="p-2">
          <XIcon size={24} color={iconColor} />
        </Pressable>
      </View>

      <ScrollView className="flex-1 p-4" contentContainerClassName="gap-6 pb-8">
        {/* Controls Section */}
        <View className="gap-3">
          <Text className="text-lg font-semibold text-foreground">
            {t('info.controlsTitle')}
          </Text>

          <View className="bg-card rounded-lg p-4 gap-3">
            <View className="gap-1">
              <Text className="font-medium text-foreground">
                {t('info.tapTitle')}
              </Text>
              <Text className="text-muted-foreground text-sm">
                {t('info.tapDescription')}
              </Text>
            </View>

            <View className="h-px bg-border" />

            <View className="gap-1">
              <Text className="font-medium text-foreground">
                {t('info.longPressTitle')}
              </Text>
              <Text className="text-muted-foreground text-sm">
                {t('info.longPressDescription', { amount: longPressScore })}
              </Text>
            </View>

            <View className="h-px bg-border" />

            <View className="gap-1">
              <Text className="font-medium text-foreground">
                {t('info.doubleTapTitle')}
              </Text>
              <Text className="text-muted-foreground text-sm">
                {t('info.doubleTapDescription', {
                  amount: DEFAULT_DOUBLE_PRESS_SCORE,
                })}
              </Text>
            </View>

            <View className="h-px bg-border" />

            <View className="gap-1">
              <Text className="font-medium text-foreground">
                {t('info.removeScoreTitle')}
              </Text>
              <Text className="text-muted-foreground text-sm">
                {t('info.removeScoreDescription')}
              </Text>
            </View>
          </View>
        </View>

        {/* Game Modes Section */}
        <View className="gap-3">
          <Text className="text-lg font-semibold text-foreground">
            {t('info.gameModesTitle')}
          </Text>

          <View className="bg-card rounded-lg p-4 gap-3">
            <View className="gap-1">
              <Text className="font-medium text-foreground">
                {t('info.normalModeTitle')}
              </Text>
              <Text className="text-muted-foreground text-sm">
                {t('info.normalModeDescription')}
              </Text>
            </View>

            <View className="h-px bg-border" />

            <View className="gap-1">
              <Text className="font-medium text-foreground">
                {t('info.tournamentModeTitle')}
              </Text>
              <Text className="text-muted-foreground text-sm">
                {t('info.tournamentModeDescription')}
              </Text>
            </View>
          </View>
        </View>

        {/* Tournament Options Section */}
        <View className="gap-3">
          <Text className="text-lg font-semibold text-foreground">
            {t('info.tournamentOptionsTitle')}
          </Text>

          <View className="bg-card rounded-lg p-4 gap-3">
            <View className="gap-1">
              <Text className="font-medium text-foreground">
                🎯 {t('info.trioModeTitle')}
              </Text>
              <Text className="text-muted-foreground text-sm">
                {t('info.trioModeDescription')}
              </Text>
            </View>

            <View className="h-px bg-border" />

            <View className="gap-1">
              <Text className="font-medium text-foreground">
                ⚡ {t('info.multiLoseTitle')}
              </Text>
              <Text className="text-muted-foreground text-sm">
                {t('info.multiLoseDescription')}
              </Text>
            </View>
          </View>
        </View>

        {/* Tips Section */}
        <View className="gap-3">
          <Text className="text-lg font-semibold text-foreground">
            {t('info.tipsTitle')}
          </Text>

          <View className="bg-card rounded-lg p-4 gap-2">
            <Text className="text-muted-foreground text-sm">
              • {t('info.tip1')}
            </Text>
            <Text className="text-muted-foreground text-sm">
              • {t('info.tip2')}
            </Text>
            <Text className="text-muted-foreground text-sm">
              • {t('info.tip3')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
