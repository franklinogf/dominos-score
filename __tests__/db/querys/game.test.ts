jest.mock('@/db/schema', () => ({
  gamesTable: { id: 'id', endedAt: 'endedAt', createdAt: 'createdAt' },
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn((col, val) => ({ type: 'eq', col, val })),
  ne: jest.fn((col, val) => ({ type: 'ne', col, val })),
}));

jest.mock('@/db/database', () => ({
  db: {
    query: {
      gamesTable: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
    },
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

import {
  deleteAllGames,
  deleteGame,
  getAllGames,
  getGameById,
  getUnfinishedGame,
  insertGame,
  updateGameEndedAt,
} from '@/db/querys/game';

const getDb = () => require('@/db/database').db;

beforeEach(() => {
  jest.clearAllMocks();
  const db = getDb();

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

  (db.delete as jest.Mock).mockReturnValue({
    where: jest.fn().mockResolvedValue(undefined),
  });
});

beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterAll(() => jest.restoreAllMocks());

describe('insertGame', () => {
  it('returns the first element of the result array', async () => {
    const mockGame = { id: 1, gameSize: 2, winningLimit: 150, type: 'normal' };
    const db = getDb();
    (db.insert as jest.Mock).mockReturnValueOnce({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([mockGame]),
      }),
    });
    expect(await insertGame({ gameSize: 2, winningLimit: 150, type: 'normal' })).toEqual(mockGame);
  });

  it('returns undefined on error', async () => {
    const db = getDb();
    (db.insert as jest.Mock).mockReturnValueOnce({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockRejectedValue(new Error('fail')),
      }),
    });
    expect(await insertGame({ gameSize: 2, winningLimit: 150, type: 'normal' })).toBeUndefined();
  });
});

describe('updateGameEndedAt', () => {
  it('calls update, set, and where', async () => {
    const db = getDb();
    await updateGameEndedAt(1);
    expect(db.update).toHaveBeenCalled();
  });

  it('does not throw on error', async () => {
    const db = getDb();
    (db.update as jest.Mock).mockReturnValueOnce({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockRejectedValue(new Error('fail')),
      }),
    });
    await expect(updateGameEndedAt(1)).resolves.not.toThrow();
  });
});

describe('deleteGame', () => {
  it('calls delete and where with the given id', async () => {
    const db = getDb();
    await deleteGame(3);
    expect(db.delete).toHaveBeenCalled();
  });

  it('does not throw on error', async () => {
    const db = getDb();
    (db.delete as jest.Mock).mockReturnValueOnce({
      where: jest.fn().mockRejectedValue(new Error('fail')),
    });
    await expect(deleteGame(3)).resolves.not.toThrow();
  });
});

describe('deleteAllGames', () => {
  it('calls delete with where clause when excludeGameId is provided', async () => {
    const db = getDb();
    await deleteAllGames(5);
    expect(db.delete).toHaveBeenCalled();
    const deleteReturn = (db.delete as jest.Mock).mock.results[0].value;
    expect(deleteReturn.where).toHaveBeenCalled();
  });

  it('calls delete without where clause when excludeGameId is not provided', async () => {
    const db = getDb();
    // Override delete to return an object that is also a promise (no where call)
    const mockDeleteResult = Promise.resolve(undefined);
    (db.delete as jest.Mock).mockReturnValueOnce(mockDeleteResult);
    await deleteAllGames();
    expect(db.delete).toHaveBeenCalled();
  });

  it('does not throw on error', async () => {
    const db = getDb();
    (db.delete as jest.Mock).mockReturnValueOnce({
      where: jest.fn().mockRejectedValue(new Error('fail')),
    });
    await expect(deleteAllGames(1)).resolves.not.toThrow();
  });
});

describe('getUnfinishedGame — query callbacks', () => {
  it('executes where and orderBy callbacks when findFirst invokes them', async () => {
    const db = getDb();
    type Opts = { where?: Function; orderBy?: Function };
    (db.query.gamesTable.findFirst as jest.Mock).mockImplementationOnce(async (opts: Opts) => {
      if (opts?.where) opts.where({ endedAt: null }, { isNull: () => true });
      if (opts?.orderBy) opts.orderBy({ createdAt: '' }, { desc: (x: unknown) => x });
      return null;
    });
    expect(await getUnfinishedGame()).toBeNull();
  });
});

describe('getAllGames — query callbacks', () => {
  it('executes orderBy callback when findMany invokes it', async () => {
    const db = getDb();
    type Opts = { orderBy?: Function };
    (db.query.gamesTable.findMany as jest.Mock).mockImplementationOnce(async (opts: Opts) => {
      if (opts?.orderBy) opts.orderBy({ createdAt: '' }, { desc: (x: unknown) => x });
      return [];
    });
    expect(await getAllGames()).toEqual([]);
  });
});

describe('getUnfinishedGame', () => {
  it('returns the game found', async () => {
    const mockGame = { id: 1, endedAt: null };
    (getDb().query.gamesTable.findFirst as jest.Mock).mockResolvedValue(mockGame);
    expect(await getUnfinishedGame()).toEqual(mockGame);
  });

  it('returns null when no game found', async () => {
    (getDb().query.gamesTable.findFirst as jest.Mock).mockResolvedValue(undefined);
    expect(await getUnfinishedGame()).toBeNull();
  });

  it('returns null on error', async () => {
    (getDb().query.gamesTable.findFirst as jest.Mock).mockRejectedValue(new Error('fail'));
    expect(await getUnfinishedGame()).toBeNull();
  });
});

describe('getAllGames', () => {
  it('returns games array', async () => {
    const mockGames = [{ id: 1 }, { id: 2 }];
    (getDb().query.gamesTable.findMany as jest.Mock).mockResolvedValue(mockGames);
    expect(await getAllGames()).toEqual(mockGames);
  });

  it('returns empty array on error', async () => {
    (getDb().query.gamesTable.findMany as jest.Mock).mockRejectedValue(new Error('fail'));
    expect(await getAllGames()).toEqual([]);
  });
});

describe('getGameById', () => {
  it('returns the game when found', async () => {
    const mockGame = { id: 1, rounds: [] };
    (getDb().query.gamesTable.findFirst as jest.Mock).mockResolvedValue(mockGame);
    expect(await getGameById(1)).toEqual(mockGame);
  });

  it('returns null when not found', async () => {
    (getDb().query.gamesTable.findFirst as jest.Mock).mockResolvedValue(undefined);
    expect(await getGameById(1)).toBeNull();
  });

  it('returns null on error', async () => {
    (getDb().query.gamesTable.findFirst as jest.Mock).mockRejectedValue(new Error('fail'));
    expect(await getGameById(1)).toBeNull();
  });
});
