import { useT } from '@/hooks/use-translation';
import { GameStatus } from '@/lib/enums';
import { NAV_THEME, THEME } from '@/lib/theme';
import { useGame } from '@/stores/use-game';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ThemeProvider } from '@react-navigation/native';
import {
  Badge,
  Icon,
  Label,
  NativeTabs,
  VectorIcon,
} from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'nativewind';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const isIos = Platform.OS === 'ios';
  const { colorScheme } = useColorScheme();
  const { t } = useT();
  const gameStatus = useGame((state) => state.gameStatus);
  const currentTheme = THEME[colorScheme ?? 'dark'];

  return (
    <SafeAreaProvider>
      <ThemeProvider value={NAV_THEME[colorScheme ?? 'dark']}>
        <NativeTabs
          backBehavior="none"
          labelStyle={{ color: currentTheme.foreground }}
          labelVisibilityMode="auto"
          badgeBackgroundColor={currentTheme.accent}
          iconColor={currentTheme.accentForeground}
          tintColor={currentTheme.accent}
          backgroundColor={!isIos ? currentTheme.background : undefined}
          indicatorColor={!isIos ? currentTheme.primary : undefined}
          minimizeBehavior={isIos ? 'never' : undefined}
          rippleColor={!isIos ? currentTheme.primaryForeground : undefined}
        >
          <NativeTabs.Trigger name="(game)">
            <Badge hidden={gameStatus !== GameStatus.InProgress} />
            <Label selectedStyle={{ color: currentTheme.foreground }}>
              {t('navigation.game')}
            </Label>
            {Platform.select({
              ios: <Icon sf="gamecontroller.fill" />,
              android: (
                <Icon
                  src={<VectorIcon family={FontAwesome} name="gamepad" />}
                />
              ),
            })}
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="history">
            <Label selectedStyle={{ color: currentTheme.foreground }}>
              {t('navigation.history')}
            </Label>
            {Platform.select({
              ios: <Icon sf="clock.fill" />,
              android: (
                <Icon
                  src={<VectorIcon family={FontAwesome} name="history" />}
                />
              ),
            })}
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="settings">
            <Label selectedStyle={{ color: currentTheme.foreground }}>
              {t('navigation.settings')}
            </Label>
            {Platform.select({
              ios: <Icon sf="gearshape.fill" />,
              android: (
                <Icon src={<VectorIcon family={FontAwesome} name="cog" />} />
              ),
            })}
          </NativeTabs.Trigger>
        </NativeTabs>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
