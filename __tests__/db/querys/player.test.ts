jest.mock('@/db/schema', () => ({
  playersTable: { id: 'id', gameId: 'gameId', name: 'name', wins: 'wins', losses: 'losses' },
}));

jest.mock('drizzle-orm', () => ({
  and: jest.fn((...args) => ({ type: 'and', args })),
  eq: jest.fn((col, val) => ({ type: 'eq', col, val })),
  sql: jest.fn((strings, ...values) => ({ type: 'sql', strings, values })),
}));

jest.mock('@/db/database', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  },
}));

import {
  getPlayerByNameAndGame,
  incrementPlayerLosses,
  incrementPlayerWins,
  insertPlayer,
  insertPlayers,
} from '@/db/querys/player';

const getDb = () => require('@/db/database').db;

const mockPlayer = { id: 1, gameId: 1, name: 'Alice', wins: 0, losses: 0 };

beforeEach(() => {
  jest.clearAllMocks();
  const db = getDb();

  (db.select as jest.Mock).mockReturnValue({
    from: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([]),
      }),
    }),
  });

  (db.insert as jest.Mock).mockReturnValue({
    values: jest.fn().mockReturnValue({
      returning: jest.fn().mockResolvedValue([]),
    }),
  });

  (db.update as jest.Mock).mockReturnValue({
    set: jest.fn().mockReturnValue({
      where: jest.fn().mockResolvedValue(undefined),
    }),
  });
});

beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterAll(() => jest.restoreAllMocks());

describe('getPlayerByNameAndGame', () => {
  it('returns the first matching player', async () => {
    const db = getDb();
    (db.select as jest.Mock).mockReturnValueOnce({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([mockPlayer]),
        }),
      }),
    });
    expect(await getPlayerByNameAndGame(1, 'Alice')).toEqual(mockPlayer);
  });

  it('returns undefined when no match', async () => {
    expect(await getPlayerByNameAndGame(1, 'Unknown')).toBeUndefined();
  });

  it('returns undefined on error', async () => {
    const db = getDb();
    (db.select as jest.Mock).mockReturnValueOnce({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockRejectedValue(new Error('fail')),
        }),
      }),
    });
    expect(await getPlayerByNameAndGame(1, 'Alice')).toBeUndefined();
  });
});

describe('insertPlayers', () => {
  it('returns inserted players', async () => {
    const db = getDb();
    (db.insert as jest.Mock).mockReturnValueOnce({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([mockPlayer]),
      }),
    });
    expect(await insertPlayers([{ gameId: 1, name: 'Alice' }])).toEqual([mockPlayer]);
  });

  it('returns undefined on error', async () => {
    const db = getDb();
    (db.insert as jest.Mock).mockReturnValueOnce({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockRejectedValue(new Error('fail')),
      }),
    });
    expect(await insertPlayers([{ gameId: 1, name: 'Alice' }])).toBeUndefined();
  });
});

describe('insertPlayer', () => {
  it('returns the inserted player', async () => {
    const db = getDb();
    (db.insert as jest.Mock).mockReturnValueOnce({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([mockPlayer]),
      }),
    });
    expect(await insertPlayer({ gameId: 1, name: 'Alice' })).toEqual(mockPlayer);
  });

  it('returns undefined on error', async () => {
    const db = getDb();
    (db.insert as jest.Mock).mockReturnValueOnce({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockRejectedValue(new Error('fail')),
      }),
    });
    expect(await insertPlayer({ gameId: 1, name: 'Alice' })).toBeUndefined();
  });
});

describe('incrementPlayerWins', () => {
  it('calls update, set, and where', async () => {
    const db = getDb();
    await incrementPlayerWins(1);
    expect(db.update).toHaveBeenCalled();
  });

  it('does not throw on error', async () => {
    const db = getDb();
    (db.update as jest.Mock).mockReturnValueOnce({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockRejectedValue(new Error('fail')),
      }),
    });
    await expect(incrementPlayerWins(1)).resolves.not.toThrow();
  });
});

describe('incrementPlayerLosses', () => {
  it('calls update, set, and where', async () => {
    const db = getDb();
    await incrementPlayerLosses(1, 2);
    expect(db.update).toHaveBeenCalled();
  });

  it('defaults incrementBy to 1', async () => {
    const db = getDb();
    await incrementPlayerLosses(1);
    expect(db.update).toHaveBeenCalled();
  });

  it('does not throw on error', async () => {
    const db = getDb();
    (db.update as jest.Mock).mockReturnValueOnce({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockRejectedValue(new Error('fail')),
      }),
    });
    await expect(incrementPlayerLosses(1, 1)).resolves.not.toThrow();
  });
});
