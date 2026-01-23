import { db } from '@/db/database';
import { settingsTable } from '@/db/schema';
import {
  DEFAULT_LONG_PRESS_SCORE,
  DEFAULT_MULTI_LOSE,
  DEFAULT_TRIO_MODE,
} from '@/lib/constants';
import { eq } from 'drizzle-orm';

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

export async function updateSetting(key: string, value: string) {
  try {
    await db
      .update(settingsTable)
      .set({ value })
      .where(eq(settingsTable.key, key));
  } catch (error) {
    console.error('Database error updating setting ' + key + ':', error);
  }
}
