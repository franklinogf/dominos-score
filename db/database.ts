import migrations from '@/drizzle/migrations';
import { DEFAULT_LONG_PRESS_SCORE } from '@/lib/constants';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import * as SQLite from 'expo-sqlite';
import * as schema from './schema';
// import { eq } from 'drizzle-orm';

const expo = SQLite.openDatabaseSync('db.db');

export const db = drizzle(expo, { schema });

// Function to delete/close the database connection for cleanup
export function deleteDatabase() {
  try {
    expo.closeSync();
    console.log('Database connection closed');
    SQLite.deleteDatabaseSync('db.db');
    console.log('Database deleted');
  } catch (error) {
    console.error('Error closing database:', error);
  }
}

const defaultSettings = [
  { key: 'longPressScore', value: DEFAULT_LONG_PRESS_SCORE.toString() },
];

export async function initializeDatabase() {
  try {
    await migrate(db, migrations);
    console.log('Database migrated successfully');

    await seedDefaultSettings();
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

async function seedDefaultSettings() {
  const { settingsTable } = schema;
  for (const setting of defaultSettings) {
    const existingSetting = await db.query.settingsTable.findFirst({
      where: eq(settingsTable.key, setting.key),
    });
    if (!existingSetting) {
      await db.insert(settingsTable).values(setting);
      console.log(`Inserted default setting for ${setting.key}`);
    }
  }
}
