jest.mock('@/db/querys/round', () => ({
  insertRound: jest.fn(),
  insertPlayerToRound: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/db/querys/player', () => ({
  incrementPlayerWins: jest.fn().mockResolvedValue(undefined),
  incrementPlayerLosses: jest.fn().mockResolvedValue(undefined),
}));

import { addNewRound, addResultsToRound, newRoundWithResults } from '@/db/actions/round';
import { insertPlayerToRound, insertRound } from '@/db/querys/round';
import { incrementPlayerLosses, incrementPlayerWins } from '@/db/querys/player';
import type { Player } from '@/lib/types';

const mkPlayer = (id: string, scores: number[], wins = 0, losses = 0): Player => ({
  id,
  name: `P${id}`,
  wins,
  losses,
  isPlaying: true,
  score: scores.map((value, i) => ({ id: `s-${id}-${i}`, value })),
});

beforeEach(() => jest.clearAllMocks());
beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterAll(() => jest.restoreAllMocks());

describe('addNewRound', () => {
  it('returns the inserted round id', async () => {
    (insertRound as jest.Mock).mockResolvedValue([{ insertedId: 42 }]);
    expect(await addNewRound({ gameId: 1 })).toBe(42);
  });

  it('returns undefined when insertRound returns undefined', async () => {
    (insertRound as jest.Mock).mockResolvedValue(undefined);
    expect(await addNewRound({ gameId: 1 })).toBeUndefined();
  });

  it('returns undefined on error', async () => {
    (insertRound as jest.Mock).mockRejectedValue(new Error('fail'));
    expect(await addNewRound({ gameId: 1 })).toBeUndefined();
  });
});

describe('addResultsToRound', () => {
  it('calls insertPlayerToRound for each player with stringified scores', async () => {
    const players = [mkPlayer('1', [30, 60]), mkPlayer('2', [100])];
    await addResultsToRound(5, players);
    expect(insertPlayerToRound).toHaveBeenCalledWith(5, 1, ['30', '60']);
    expect(insertPlayerToRound).toHaveBeenCalledWith(5, 2, ['100']);
  });

  it('does not throw on error', async () => {
    (insertPlayerToRound as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    await expect(addResultsToRound(5, [mkPlayer('1', [30])])).resolves.not.toThrow();
  });
});

describe('newRoundWithResults', () => {
  it('creates round, stores results, and increments wins/losses', async () => {
    (insertRound as jest.Mock).mockResolvedValue([{ insertedId: 10 }]);
    const players = [mkPlayer('1', [150]), mkPlayer('2', [50])];

    await newRoundWithResults(
      { gameId: 1, roundWinnerId: 1 },
      players,
      { trioMode: false, multiLose: false },
    );

    expect(insertRound).toHaveBeenCalledTimes(1);
    expect(insertPlayerToRound).toHaveBeenCalledTimes(2);
    expect(incrementPlayerWins).toHaveBeenCalledWith(1);
    expect(incrementPlayerLosses).toHaveBeenCalledWith(2, 1);
  });

  it('skips win/loss updates when roundWinnerId is not set', async () => {
    (insertRound as jest.Mock).mockResolvedValue([{ insertedId: 10 }]);
    const players = [mkPlayer('1', [50]), mkPlayer('2', [40])];

    await newRoundWithResults(
      { gameId: 1 },
      players,
      { trioMode: false, multiLose: false },
    );

    expect(incrementPlayerWins).not.toHaveBeenCalled();
    expect(incrementPlayerLosses).not.toHaveBeenCalled();
  });

  it('applies multiLose=true: player with no scores gets 2 losses', async () => {
    (insertRound as jest.Mock).mockResolvedValue([{ insertedId: 10 }]);
    const players = [mkPlayer('1', [150]), mkPlayer('2', [])];

    await newRoundWithResults(
      { gameId: 1, roundWinnerId: 1 },
      players,
      { trioMode: false, multiLose: true },
    );

    expect(incrementPlayerLosses).toHaveBeenCalledWith(2, 2);
  });

  it('does not throw when insertRound returns no id', async () => {
    (insertRound as jest.Mock).mockResolvedValue(undefined);
    await expect(
      newRoundWithResults({ gameId: 1, roundWinnerId: 1 }, [], { trioMode: false, multiLose: false }),
    ).resolves.not.toThrow();
  });

  it('does not throw on error', async () => {
    (insertRound as jest.Mock).mockRejectedValue(new Error('fail'));
    await expect(
      newRoundWithResults({ gameId: 1, roundWinnerId: 1 }, [], { trioMode: false, multiLose: false }),
    ).resolves.not.toThrow();
  });
});
