jest.mock('@/db/schema', () => ({ settingsTable: { key: 'key', value: 'value' } }));

jest.mock('@/db/database', () => ({
  db: {
    query: { settingsTable: { findFirst: jest.fn() } },
    insert: jest.fn(),
  },
}));

import {
  getDoublePressScoreSetting,
  getLongPressScoreSetting,
  getMultiLoseSetting,
  getSetting,
  getThemeSetting,
  getTrioModeSetting,
  updateSetting,
} from '@/db/querys/settings';
import {
  DEFAULT_DOUBLE_PRESS_SCORE,
  DEFAULT_LONG_PRESS_SCORE,
  DEFAULT_MULTI_LOSE,
  DEFAULT_THEME,
  DEFAULT_TRIO_MODE,
} from '@/lib/constants';

const getDb = () => require('@/db/database').db;

beforeEach(() => {
  jest.clearAllMocks();
  const db = getDb();
  (db.insert as jest.Mock).mockReturnValue({
    values: jest.fn().mockReturnValue({
      onConflictDoUpdate: jest.fn().mockResolvedValue(undefined),
    }),
  });
});

beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterAll(() => jest.restoreAllMocks());

describe('getSetting', () => {
  it('returns the value when the setting exists', async () => {
    (getDb().query.settingsTable.findFirst as jest.Mock).mockResolvedValue({ value: 'hello' });
    expect(await getSetting('someKey')).toBe('hello');
  });

  it('returns undefined when the setting does not exist', async () => {
    (getDb().query.settingsTable.findFirst as jest.Mock).mockResolvedValue(undefined);
    expect(await getSetting('missing')).toBeUndefined();
  });

  it('returns undefined on error', async () => {
    (getDb().query.settingsTable.findFirst as jest.Mock).mockRejectedValue(new Error('DB error'));
    expect(await getSetting('key')).toBeUndefined();
  });
});

describe('getLongPressScoreSetting', () => {
  it('returns the parsed number when value is set', async () => {
    (getDb().query.settingsTable.findFirst as jest.Mock).mockResolvedValue({ value: '45' });
    expect(await getLongPressScoreSetting()).toBe(45);
  });

  it('returns DEFAULT_LONG_PRESS_SCORE when not set', async () => {
    (getDb().query.settingsTable.findFirst as jest.Mock).mockResolvedValue(undefined);
    expect(await getLongPressScoreSetting()).toBe(DEFAULT_LONG_PRESS_SCORE);
  });
});

describe('getDoublePressScoreSetting', () => {
  it('returns the parsed number when value is set', async () => {
    (getDb().query.settingsTable.findFirst as jest.Mock).mockResolvedValue({ value: '90' });
    expect(await getDoublePressScoreSetting()).toBe(90);
  });

  it('returns DEFAULT_DOUBLE_PRESS_SCORE when not set', async () => {
    (getDb().query.settingsTable.findFirst as jest.Mock).mockResolvedValue(undefined);
    expect(await getDoublePressScoreSetting()).toBe(DEFAULT_DOUBLE_PRESS_SCORE);
  });
});

describe('getTrioModeSetting', () => {
  it('returns true when value is "true"', async () => {
    (getDb().query.settingsTable.findFirst as jest.Mock).mockResolvedValue({ value: 'true' });
    expect(await getTrioModeSetting()).toBe(true);
  });

  it('returns false when value is "false"', async () => {
    (getDb().query.settingsTable.findFirst as jest.Mock).mockResolvedValue({ value: 'false' });
    expect(await getTrioModeSetting()).toBe(false);
  });

  it('returns DEFAULT_TRIO_MODE when not set', async () => {
    (getDb().query.settingsTable.findFirst as jest.Mock).mockResolvedValue(undefined);
    expect(await getTrioModeSetting()).toBe(DEFAULT_TRIO_MODE);
  });
});

describe('getMultiLoseSetting', () => {
  it('returns true when value is "true"', async () => {
    (getDb().query.settingsTable.findFirst as jest.Mock).mockResolvedValue({ value: 'true' });
    expect(await getMultiLoseSetting()).toBe(true);
  });

  it('returns false when value is "false"', async () => {
    (getDb().query.settingsTable.findFirst as jest.Mock).mockResolvedValue({ value: 'false' });
    expect(await getMultiLoseSetting()).toBe(false);
  });

  it('returns DEFAULT_MULTI_LOSE when not set', async () => {
    (getDb().query.settingsTable.findFirst as jest.Mock).mockResolvedValue(undefined);
    expect(await getMultiLoseSetting()).toBe(DEFAULT_MULTI_LOSE);
  });
});

describe('getThemeSetting', () => {
  it('returns "light" when value is "light"', async () => {
    (getDb().query.settingsTable.findFirst as jest.Mock).mockResolvedValue({ value: 'light' });
    expect(await getThemeSetting()).toBe('light');
  });

  it('returns "dark" when value is "dark"', async () => {
    (getDb().query.settingsTable.findFirst as jest.Mock).mockResolvedValue({ value: 'dark' });
    expect(await getThemeSetting()).toBe('dark');
  });

  it('returns "system" when value is "system"', async () => {
    (getDb().query.settingsTable.findFirst as jest.Mock).mockResolvedValue({ value: 'system' });
    expect(await getThemeSetting()).toBe('system');
  });

  it('returns DEFAULT_THEME when value is an invalid string', async () => {
    (getDb().query.settingsTable.findFirst as jest.Mock).mockResolvedValue({ value: 'invalid' });
    expect(await getThemeSetting()).toBe(DEFAULT_THEME);
  });

  it('returns DEFAULT_THEME when not set', async () => {
    (getDb().query.settingsTable.findFirst as jest.Mock).mockResolvedValue(undefined);
    expect(await getThemeSetting()).toBe(DEFAULT_THEME);
  });
});

describe('getSetting — query callback', () => {
  it('executes the where callback when findFirst invokes it', async () => {
    const db = getDb();
    (db.query.settingsTable.findFirst as jest.Mock).mockImplementationOnce(
      async (opts: { where?: (t: object, h: object) => unknown }) => {
        if (opts?.where) opts.where({ key: 'key' }, { eq: () => true });
        return { value: 'via-callback' };
      },
    );
    expect(await getSetting('test')).toBe('via-callback');
  });
});

describe('updateSetting', () => {
  it('calls insert with values and onConflictDoUpdate', async () => {
    await updateSetting('theme', 'dark');
    const db = getDb();
    expect(db.insert).toHaveBeenCalled();
  });

  it('does not throw on error', async () => {
    const db = getDb();
    (db.insert as jest.Mock).mockReturnValue({
      values: jest.fn().mockReturnValue({
        onConflictDoUpdate: jest.fn().mockRejectedValue(new Error('DB error')),
      }),
    });
    await expect(updateSetting('key', 'value')).resolves.not.toThrow();
  });
});
