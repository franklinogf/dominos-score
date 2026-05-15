import { NAV_THEME, THEME } from '@/lib/theme';
import FontAwesome from '@expo/vector-icons/FontAwesome5';
import { ThemeProvider } from '@react-navigation/native';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const isIos = Platform.OS === 'ios';
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();

  const currentTheme = THEME[colorScheme ?? 'dark'];

  return (
    <SafeAreaProvider>
      <ThemeProvider value={NAV_THEME[colorScheme ?? 'dark']}>
        <NativeTabs
          backBehavior="none"
          labelStyle={{ color: currentTheme.foreground }}
          labelVisibilityMode={isIos ? 'auto' : 'unlabeled'}
          iconColor={isIos ? currentTheme.primary : currentTheme.foreground}
          backgroundColor={!isIos ? currentTheme.background : undefined}
          indicatorColor={!isIos ? currentTheme.primary : undefined}
          minimizeBehavior={isIos ? 'onScrollDown' : undefined}
          rippleColor={!isIos ? currentTheme.accent : undefined}
        >
          <NativeTabs.Trigger name="(game)" disableAutomaticContentInsets>
            <NativeTabs.Trigger.Label
              selectedStyle={{ color: currentTheme.foreground }}
            >
              {t($ => $.navigation.game)}
            </NativeTabs.Trigger.Label>
            {Platform.select({
              ios: <NativeTabs.Trigger.Icon sf="gamecontroller.fill" />,
              android: (
                <NativeTabs.Trigger.Icon
                  src={
                    <NativeTabs.Trigger.VectorIcon
                      family={FontAwesome}
                      name="gamepad"
                    />
                  }
                />
              ),
            })}
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="history" disableAutomaticContentInsets>
            <NativeTabs.Trigger.Label
              selectedStyle={{ color: currentTheme.foreground }}
            >
              {t($ => $.navigation.history)}
            </NativeTabs.Trigger.Label>
            {Platform.select({
              ios: <NativeTabs.Trigger.Icon sf="clock.fill" />,
              android: (
                <NativeTabs.Trigger.Icon
                  src={
                    <NativeTabs.Trigger.VectorIcon
                      family={FontAwesome}
                      name="history"
                    />
                  }
                />
              ),
            })}
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="settings" disableAutomaticContentInsets>
            <NativeTabs.Trigger.Label
              selectedStyle={{ color: currentTheme.foreground }}
            >
              {t($ => $.navigation.settings)}
            </NativeTabs.Trigger.Label>
            {Platform.select({
              ios: <NativeTabs.Trigger.Icon sf="gearshape.fill" />,
              android: (
                <NativeTabs.Trigger.Icon
                  src={
                    <NativeTabs.Trigger.VectorIcon
                      family={FontAwesome}
                      name="cog"
                    />
                  }
                />
              ),
            })}
          </NativeTabs.Trigger>
        </NativeTabs>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
