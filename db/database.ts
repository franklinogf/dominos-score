import migrations from '@/drizzle/migrations';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import * as SQLite from 'expo-sqlite';
import * as schema from './schema';

const expo = SQLite.openDatabaseSync('db.db');

export const db = drizzle(expo, { schema });

export async function initializeDatabase() {
  const { settingsTable } = schema;
  try {
    await migrate(db, migrations);
    console.log('Database migrated successfully');

    const existingSettings = await db.query.settingsTable.findFirst();
    if (!existingSettings) {
      await db
        .insert(settingsTable)
        .values({ key: 'long_press_score', value: '2' });
      console.log('Inserted default setting for long_press_score');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}
