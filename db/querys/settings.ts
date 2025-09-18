import { DEFAULT_LONG_PRESS_SCORE } from '@/lib/constants';
import { eq } from 'drizzle-orm';
import { db } from '../database';
import { settingsTable } from '../schema';

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
