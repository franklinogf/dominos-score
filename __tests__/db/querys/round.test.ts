jest.mock('@/db/schema', () => ({
  roundsTable: { id: 'id' },
  playersToRoundsTable: {},
}));

jest.mock('@/db/database', () => ({
  db: {
    insert: jest.fn(),
  },
}));

import { insertPlayerToRound, insertRound } from '@/db/querys/round';

const getDb = () => require('@/db/database').db;

beforeEach(() => {
  jest.clearAllMocks();
  const db = getDb();
  (db.insert as jest.Mock).mockReturnValue({
    values: jest.fn().mockReturnValue({
      returning: jest.fn().mockResolvedValue([{ insertedId: 1 }]),
    }),
  });
});

beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterAll(() => jest.restoreAllMocks());

describe('insertRound', () => {
  it('returns the result array from returning()', async () => {
    const result = await insertRound({ gameId: 1 });
    expect(result).toEqual([{ insertedId: 1 }]);
  });

  it('returns undefined on error', async () => {
    const db = getDb();
    (db.insert as jest.Mock).mockReturnValueOnce({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockRejectedValue(new Error('fail')),
      }),
    });
    expect(await insertRound({ gameId: 1 })).toBeUndefined();
  });
});

describe('insertPlayerToRound', () => {
  it('calls insert with values', async () => {
    const db = getDb();
    // Simulate the insert chain without returning (insertPlayerToRound doesn't use .returning)
    (db.insert as jest.Mock).mockReturnValueOnce({
      values: jest.fn().mockResolvedValue(undefined),
    });
    await insertPlayerToRound(1, 10, ['30', '60']);
    expect(db.insert).toHaveBeenCalled();
  });

  it('does not throw on error', async () => {
    const db = getDb();
    (db.insert as jest.Mock).mockReturnValueOnce({
      values: jest.fn().mockRejectedValue(new Error('fail')),
    });
    await expect(insertPlayerToRound(1, 10, ['30'])).resolves.not.toThrow();
  });
});
