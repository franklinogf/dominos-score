import {
  addNewRound,
  addResultsToRound,
  clearCurrentDraftRound,
  newRoundWithResults,
  persistDraftRound,
} from '@/db/actions/round';
import { incrementPlayerLosses, incrementPlayerWins } from '@/db/querys/player';
import {
  clearDraftRoundScores,
  getOrCreateDraftRound,
  insertRound,
  updateRoundWinner,
  upsertPlayerDraftScores,
} from '@/db/querys/round';
import type { Player } from '@/lib/types';

jest.mock('@/db/querys/round', () => ({
  insertRound: jest.fn(),
  getOrCreateDraftRound: jest.fn().mockResolvedValue(10),
  upsertPlayerDraftScores: jest.fn().mockResolvedValue(undefined),
  clearDraftRoundScores: jest.fn().mockResolvedValue(undefined),
  updateRoundWinner: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/db/querys/player', () => ({
  incrementPlayerWins: jest.fn().mockResolvedValue(undefined),
  incrementPlayerLosses: jest.fn().mockResolvedValue(undefined),
}));

const mkPlayer = (
  id: string,
  scores: number[],
  wins = 0,
  losses = 0,
): Player => ({
  id,
  name: `P${id}`,
  wins,
  losses,
  isPlaying: true,
  score: scores.map((value, i) => ({ id: `s-${id}-${i}`, value })),
});

beforeEach(() => {
  jest.clearAllMocks();
  (getOrCreateDraftRound as jest.Mock).mockResolvedValue(10);
  (upsertPlayerDraftScores as jest.Mock).mockResolvedValue(undefined);
  (clearDraftRoundScores as jest.Mock).mockResolvedValue(undefined);
  (updateRoundWinner as jest.Mock).mockResolvedValue(undefined);
});
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
  it('upserts scores for each player with stringified scores', async () => {
    const players = [mkPlayer('1', [30, 60]), mkPlayer('2', [100])];
    await addResultsToRound(5, players);
    expect(upsertPlayerDraftScores).toHaveBeenCalledWith(5, 1, ['30', '60']);
    expect(upsertPlayerDraftScores).toHaveBeenCalledWith(5, 2, ['100']);
  });

  it('does not throw on error', async () => {
    (upsertPlayerDraftScores as jest.Mock).mockRejectedValueOnce(
      new Error('fail'),
    );
    await expect(
      addResultsToRound(5, [mkPlayer('1', [30])]),
    ).resolves.not.toThrow();
  });
});

describe('newRoundWithResults', () => {
  it('uses draft round, stores results, completes round, and increments wins/losses', async () => {
    (getOrCreateDraftRound as jest.Mock).mockResolvedValue(10);
    const players = [mkPlayer('1', [150]), mkPlayer('2', [50])];

    await newRoundWithResults({ gameId: 1, roundWinnerId: 1 }, players, {
      trioMode: false,
      multiLose: false,
    });

    expect(getOrCreateDraftRound).toHaveBeenCalledWith(1);
    expect(upsertPlayerDraftScores).toHaveBeenCalledTimes(2);
    expect(updateRoundWinner).toHaveBeenCalledWith(10, 1);
    expect(incrementPlayerWins).toHaveBeenCalledWith(1);
    expect(incrementPlayerLosses).toHaveBeenCalledWith(2, 1);
  });

  it('skips win/loss updates when roundWinnerId is not set', async () => {
    (getOrCreateDraftRound as jest.Mock).mockResolvedValue(10);
    const players = [mkPlayer('1', [50]), mkPlayer('2', [40])];

    await newRoundWithResults({ gameId: 1 }, players, {
      trioMode: false,
      multiLose: false,
    });

    expect(updateRoundWinner).not.toHaveBeenCalled();
    expect(incrementPlayerWins).not.toHaveBeenCalled();
    expect(incrementPlayerLosses).not.toHaveBeenCalled();
  });

  it('applies multiLose=true: player with no scores gets 2 losses', async () => {
    (getOrCreateDraftRound as jest.Mock).mockResolvedValue(10);
    const players = [mkPlayer('1', [150]), mkPlayer('2', [])];

    await newRoundWithResults({ gameId: 1, roundWinnerId: 1 }, players, {
      trioMode: false,
      multiLose: true,
    });

    expect(incrementPlayerLosses).toHaveBeenCalledWith(2, 2);
  });

  it('does not throw when insertRound returns no id', async () => {
    (getOrCreateDraftRound as jest.Mock).mockResolvedValue(undefined);
    await expect(
      newRoundWithResults({ gameId: 1, roundWinnerId: 1 }, [], {
        trioMode: false,
        multiLose: false,
      }),
    ).resolves.not.toThrow();
  });

  it('does not throw on error', async () => {
    (getOrCreateDraftRound as jest.Mock).mockRejectedValue(new Error('fail'));
    await expect(
      newRoundWithResults({ gameId: 1, roundWinnerId: 1 }, [], {
        trioMode: false,
        multiLose: false,
      }),
    ).resolves.not.toThrow();
  });
});

describe('persistDraftRound', () => {
  it('clears and upserts playing players', async () => {
    await persistDraftRound(1, [mkPlayer('1', [30]), mkPlayer('2', [])]);
    expect(clearDraftRoundScores).toHaveBeenCalledWith(10);
    expect(upsertPlayerDraftScores).toHaveBeenCalledWith(10, 1, ['30']);
    expect(upsertPlayerDraftScores).toHaveBeenCalledWith(10, 2, []);
  });
});

describe('clearCurrentDraftRound', () => {
  it('clears scores for the current draft round', async () => {
    await clearCurrentDraftRound(1);
    expect(clearDraftRoundScores).toHaveBeenCalledWith(10);
  });
});
