import {
  addNewGame,
  addPlayerToGame,
  endGame,
  removeAllGames,
  removeGame,
} from '@/db/actions/game';
import {
  deleteAllGames,
  deleteGame,
  getUnfinishedGame,
  insertGame,
  updateGameEndedAt,
} from '@/db/querys/game';
import {
  getPlayerByNameAndGame,
  insertPlayer,
  insertPlayers,
} from '@/db/querys/player';
import { GameType } from '@/lib/enums';

jest.mock('@/db/querys/game', () => ({
  insertGame: jest.fn(),
  deleteGame: jest.fn().mockResolvedValue(undefined),
  deleteAllGames: jest.fn().mockResolvedValue(undefined),
  getUnfinishedGame: jest.fn().mockResolvedValue(undefined),
  updateGameEndedAt: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/db/querys/player', () => ({
  insertPlayers: jest.fn(),
  insertPlayer: jest.fn(),
  getPlayerByNameAndGame: jest.fn(),
}));

const mockGame = {
  id: 1,
  gameSize: 2,
  winningLimit: 150,
  type: GameType.NORMAL,
};
const mockPlayer = { id: 10, gameId: 1, name: 'Alice', wins: 0, losses: 0 };

beforeEach(() => {
  jest.clearAllMocks();
  (getUnfinishedGame as jest.Mock).mockResolvedValue(undefined);
  (updateGameEndedAt as jest.Mock).mockResolvedValue(undefined);
});
beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterAll(() => jest.restoreAllMocks());

describe('addNewGame', () => {
  it('creates game and players, returns both', async () => {
    (insertGame as jest.Mock).mockResolvedValue(mockGame);
    (insertPlayers as jest.Mock).mockResolvedValue([mockPlayer]);

    const result = await addNewGame(
      { gameSize: 2, winningLimit: 150, type: GameType.NORMAL },
      ['Alice'],
    );

    expect(insertGame).toHaveBeenCalledTimes(1);
    expect(insertPlayers).toHaveBeenCalledWith([{ gameId: 1, name: 'Alice' }]);
    expect(result).toEqual({ game: mockGame, players: [mockPlayer] });
  });

  it('ends an existing unfinished game before creating a new one', async () => {
    (getUnfinishedGame as jest.Mock).mockResolvedValue({ id: 99 });
    (insertGame as jest.Mock).mockResolvedValue(mockGame);
    (insertPlayers as jest.Mock).mockResolvedValue([mockPlayer]);

    await addNewGame(
      { gameSize: 2, winningLimit: 150, type: GameType.NORMAL },
      ['Alice'],
    );

    expect(updateGameEndedAt).toHaveBeenCalledWith(99);
    expect(insertGame).toHaveBeenCalledTimes(1);
  });

  it('returns undefined and logs error when insertGame returns undefined', async () => {
    (insertGame as jest.Mock).mockResolvedValue(undefined);
    const result = await addNewGame(
      { gameSize: 2, winningLimit: 150, type: GameType.NORMAL },
      ['Alice'],
    );
    expect(result).toBeUndefined();
  });

  it('returns undefined and logs error when insertPlayers returns undefined', async () => {
    (insertGame as jest.Mock).mockResolvedValue(mockGame);
    (insertPlayers as jest.Mock).mockResolvedValue(undefined);
    const result = await addNewGame(
      { gameSize: 2, winningLimit: 150, type: GameType.NORMAL },
      ['Alice'],
    );
    expect(result).toBeUndefined();
  });
});

describe('removeGame', () => {
  it('calls deleteGame with the given id', async () => {
    await removeGame(5);
    expect(deleteGame).toHaveBeenCalledWith(5);
  });

  it('does not throw on error', async () => {
    (deleteGame as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    await expect(removeGame(5)).resolves.not.toThrow();
  });
});

describe('endGame', () => {
  it('calls updateGameEndedAt with the given id', async () => {
    await endGame(3);
    expect(updateGameEndedAt).toHaveBeenCalledWith(3);
  });

  it('does not throw on error', async () => {
    (updateGameEndedAt as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    await expect(endGame(3)).resolves.not.toThrow();
  });
});

describe('removeAllGames', () => {
  it('calls deleteAllGames without an exclude id when none provided', async () => {
    await removeAllGames();
    expect(deleteAllGames).toHaveBeenCalledWith(undefined);
  });

  it('calls deleteAllGames with the exclude id when provided', async () => {
    await removeAllGames(7);
    expect(deleteAllGames).toHaveBeenCalledWith(7);
  });

  it('does not throw on error', async () => {
    (deleteAllGames as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    await expect(removeAllGames()).resolves.not.toThrow();
  });
});

describe('addPlayerToGame', () => {
  it('returns existing player when found by name', async () => {
    (getPlayerByNameAndGame as jest.Mock).mockResolvedValue(mockPlayer);
    const result = await addPlayerToGame(1, 'Alice');
    expect(insertPlayer).not.toHaveBeenCalled();
    expect(result).toEqual(mockPlayer);
  });

  it('creates and returns new player when not found', async () => {
    (getPlayerByNameAndGame as jest.Mock).mockResolvedValue(undefined);
    (insertPlayer as jest.Mock).mockResolvedValue(mockPlayer);
    const result = await addPlayerToGame(1, 'Bob');
    expect(insertPlayer).toHaveBeenCalledWith({ gameId: 1, name: 'Bob' });
    expect(result).toEqual(mockPlayer);
  });

  it('returns undefined when insertPlayer returns undefined', async () => {
    (getPlayerByNameAndGame as jest.Mock).mockResolvedValue(undefined);
    (insertPlayer as jest.Mock).mockResolvedValue(undefined);
    const result = await addPlayerToGame(1, 'Bob');
    expect(result).toBeUndefined();
  });

  it('does not throw on error', async () => {
    (getPlayerByNameAndGame as jest.Mock).mockRejectedValueOnce(
      new Error('fail'),
    );
    await expect(addPlayerToGame(1, 'Bob')).resolves.not.toThrow();
  });
});
