jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    closeSync: jest.fn(),
    execSync: jest.fn(),
  })),
  deleteDatabaseSync: jest.fn(),
}));

jest.mock('drizzle-orm/expo-sqlite', () => ({
  drizzle: jest.fn(() => ({
    query: {
      settingsTable: { findFirst: jest.fn() },
      gamesTable: { findFirst: jest.fn() },
    },
    insert: jest.fn(() => ({
      values: jest.fn(() => ({ onConflictDoUpdate: jest.fn() })),
    })),
    select: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  })),
}));

jest.mock('drizzle-orm/expo-sqlite/migrator', () => ({
  migrate: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => 'test-uuid-fixed'),
}));

jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'en' }]),
}));

void globalThis.TextDecoder;
void globalThis.TextDecoderStream;
void globalThis.TextEncoderStream;
void globalThis.URL;
void globalThis.URLSearchParams;
void (globalThis as typeof globalThis & { __ExpoImportMetaRegistry?: unknown })
  .__ExpoImportMetaRegistry;
void globalThis.structuredClone;

jest.mock('@/db/database', () => ({
  db: {
    query: {
      settingsTable: { findFirst: jest.fn() },
    },
    insert: jest.fn(() => ({
      values: jest.fn(() => ({ onConflictDoUpdate: jest.fn() })),
    })),
  },
  initializeDatabase: jest.fn().mockResolvedValue(undefined),
  deleteDatabase: jest.fn(),
}));

jest.mock('@/drizzle/migrations', () => ({}));
