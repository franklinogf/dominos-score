import { updateSetting } from '@/db/querys/settings';

export async function saveSettings(data: Record<string, string>) {
  try {
    for (const [key, value] of Object.entries(data)) {
      await updateSetting(key, value);
    }
  } catch (error) {
    console.error('Database error saving settings:', error);
  }
}
