import migrations from '@/drizzle/migrations';
import {
  DEFAULT_DOUBLE_PRESS_SCORE,
  DEFAULT_LONG_PRESS_SCORE,
  DEFAULT_MULTI_LOSE,
  DEFAULT_TRIO_MODE,
} from '@/lib/constants';
import { eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import * as SQLite from 'expo-sqlite';
import * as schema from './schema';

export const expoDB = SQLite.openDatabaseSync('db.db');

export const db = drizzle(expoDB, { schema });

// Function to delete/close the database connection for cleanup
export function deleteDatabase() {
  try {
    expoDB.closeSync();
    console.log('Database connection closed');
    SQLite.deleteDatabaseSync('db.db');
    console.log('Database deleted');
  } catch (error) {
    console.error('Error closing database:', error);
  }
}

const defaultSettings = [
  { key: 'longPressScore', value: DEFAULT_LONG_PRESS_SCORE.toString() },
  { key: 'doublePressScore', value: DEFAULT_DOUBLE_PRESS_SCORE.toString() },
  { key: 'trioMode', value: DEFAULT_TRIO_MODE.toString() },
  { key: 'multiLose', value: DEFAULT_MULTI_LOSE.toString() },
];

export async function initializeDatabase() {
  try {
    await migrate(db, migrations);
    console.log('Database migrated successfully');

    await assertRequiredTablesExist();
    await seedDefaultSettings();
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

async function assertRequiredTablesExist() {
  const requiredTables = [
    'games',
    'players',
    'players_rounds',
    'rounds',
    'settings',
  ];
  const rows = await db.all<{ name: string }>(
    sql`SELECT name FROM sqlite_master WHERE type = 'table'`,
  );
  const tableNames = new Set(rows.map((row) => row.name));
  const missingTables = requiredTables.filter(
    (table) => !tableNames.has(table),
  );

  if (missingTables.length > 0) {
    throw new Error(
      `Database migration missing tables: ${missingTables.join(', ')}`,
    );
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
