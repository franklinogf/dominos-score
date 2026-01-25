import { db } from '@/db/database';
import { settingsTable } from '@/db/schema';
import {
  DEFAULT_LONG_PRESS_SCORE,
  DEFAULT_MULTI_LOSE,
  DEFAULT_THEME,
  DEFAULT_TRIO_MODE,
  ThemeOption,
} from '@/lib/constants';

export async function getSetting(key: string): Promise<string | undefined> {
  try {
    const result = await db.query.settingsTable.findFirst({
      where: (settingsTable, { eq }) => eq(settingsTable.key, key),
    });
    return result?.value;
  } catch (error) {
    console.error('Database error fetching setting ' + key + ':', error);
    return undefined;
  }
}

export async function getLongPressScoreSetting(): Promise<number> {
  try {
    const value = await getSetting('longPressScore');
    return value ? Number(value) : DEFAULT_LONG_PRESS_SCORE;
  } catch (error) {
    console.error('Database error fetching long press score setting:', error);
    return DEFAULT_LONG_PRESS_SCORE;
  }
}

export async function getTrioModeSetting(): Promise<boolean> {
  try {
    const value = await getSetting('trioMode');
    return value ? value === 'true' : DEFAULT_TRIO_MODE;
  } catch (error) {
    console.error('Database error fetching trio mode setting:', error);
    return DEFAULT_TRIO_MODE;
  }
}

export async function getMultiLoseSetting(): Promise<boolean> {
  try {
    const value = await getSetting('multiLose');
    return value ? value === 'true' : DEFAULT_MULTI_LOSE;
  } catch (error) {
    console.error('Database error fetching multi lose setting:', error);
    return DEFAULT_MULTI_LOSE;
  }
}

export async function getThemeSetting(): Promise<ThemeOption> {
  try {
    const value = await getSetting('theme');
    if (value && ['light', 'dark', 'system'].includes(value)) {
      return value as ThemeOption;
    }
    return DEFAULT_THEME;
  } catch (error) {
    console.error('Database error fetching theme setting:', error);
    return DEFAULT_THEME;
  }
}

export async function updateSetting(key: string, value: string) {
  try {
    // Use upsert to insert or update the setting
    await db.insert(settingsTable).values({ key, value }).onConflictDoUpdate({
      target: settingsTable.key,
      set: { value },
    });
  } catch (error) {
    console.error('Database error updating setting ' + key + ':', error);
  }
}
