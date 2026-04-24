import {
  calculateRoundOutcomes,
  calculateTotalScore,
  getRankingByWins,
} from '@/lib/utils';

const mkPlayer = (id: string, scores: number[]) => ({
  id,
  score: scores.map((value) => ({ value })),
});

describe('calculateRoundOutcomes', () => {
  describe('normal mode, multiLose=false', () => {
    const opts = { trioMode: false, multiLose: false };

    it('gives winner 1 win and 0 losses', () => {
      const players = [mkPlayer('a', [100]), mkPlayer('b', [50])];
      const result = calculateRoundOutcomes(players, 'a', opts);
      expect(result.find((d) => d.id === 'a')).toEqual({
        id: 'a',
        winsIncrement: 1,
        lossesIncrement: 0,
      });
    });

    it('gives non-winner 1 loss even when they have scores', () => {
      const players = [mkPlayer('a', [100]), mkPlayer('b', [50])];
      const result = calculateRoundOutcomes(players, 'a', opts);
      expect(result.find((d) => d.id === 'b')).toEqual({
        id: 'b',
        winsIncrement: 0,
        lossesIncrement: 1,
      });
    });

    it('gives non-winner 1 loss even when they have no scores', () => {
      const players = [mkPlayer('a', [100]), mkPlayer('b', [])];
      const result = calculateRoundOutcomes(players, 'a', opts);
      expect(result.find((d) => d.id === 'b')).toEqual({
        id: 'b',
        winsIncrement: 0,
        lossesIncrement: 1,
      });
    });
  });

  describe('normal mode, multiLose=true', () => {
    const opts = { trioMode: false, multiLose: true };

    it('gives non-winner with scores 1 loss', () => {
      const players = [mkPlayer('a', [100]), mkPlayer('b', [50])];
      const result = calculateRoundOutcomes(players, 'a', opts);
      expect(result.find((d) => d.id === 'b')?.lossesIncrement).toBe(1);
    });

    it('gives non-winner with no scores 2 losses', () => {
      const players = [mkPlayer('a', [100]), mkPlayer('b', [])];
      const result = calculateRoundOutcomes(players, 'a', opts);
      expect(result.find((d) => d.id === 'b')?.lossesIncrement).toBe(2);
    });

    it('winner still gets 1 win and 0 losses', () => {
      const players = [mkPlayer('a', [100]), mkPlayer('b', [])];
      const result = calculateRoundOutcomes(players, 'a', opts);
      expect(result.find((d) => d.id === 'a')).toEqual({
        id: 'a',
        winsIncrement: 1,
        lossesIncrement: 0,
      });
    });
  });

  describe('trio mode, multiLose=false', () => {
    const opts = { trioMode: true, multiLose: false };

    it('gives winner 1 win and 0 losses', () => {
      const players = [
        mkPlayer('a', [100]),
        mkPlayer('b', [50]),
        mkPlayer('c', [20]),
      ];
      const result = calculateRoundOutcomes(players, 'a', opts);
      expect(result.find((d) => d.id === 'a')).toEqual({
        id: 'a',
        winsIncrement: 1,
        lossesIncrement: 0,
      });
    });

    it('gives middle player 0 losses', () => {
      const players = [
        mkPlayer('a', [100]),
        mkPlayer('b', [50]),
        mkPlayer('c', [20]),
      ];
      const result = calculateRoundOutcomes(players, 'a', opts);
      expect(result.find((d) => d.id === 'b')?.lossesIncrement).toBe(0);
    });

    it('gives loser (lowest scorer with scores) 1 loss', () => {
      const players = [
        mkPlayer('a', [100]),
        mkPlayer('b', [50]),
        mkPlayer('c', [20]),
      ];
      const result = calculateRoundOutcomes(players, 'a', opts);
      expect(result.find((d) => d.id === 'c')?.lossesIncrement).toBe(1);
    });

    it('gives player with no scores 1 loss when only one has no scores', () => {
      const players = [
        mkPlayer('a', [100]),
        mkPlayer('b', [50]),
        mkPlayer('c', []),
      ];
      const result = calculateRoundOutcomes(players, 'a', opts);
      expect(result.find((d) => d.id === 'c')?.lossesIncrement).toBe(1);
    });

    it('gives all no-score players 1 loss each when multiple have no scores', () => {
      const players = [
        mkPlayer('a', [100]),
        mkPlayer('b', []),
        mkPlayer('c', []),
      ];
      const result = calculateRoundOutcomes(players, 'a', opts);
      expect(result.find((d) => d.id === 'b')?.lossesIncrement).toBe(1);
      expect(result.find((d) => d.id === 'c')?.lossesIncrement).toBe(1);
    });
  });

  describe('trio mode, multiLose=true', () => {
    const opts = { trioMode: true, multiLose: true };

    it('gives loser with scores 1 loss', () => {
      const players = [
        mkPlayer('a', [100]),
        mkPlayer('b', [50]),
        mkPlayer('c', [20]),
      ];
      const result = calculateRoundOutcomes(players, 'a', opts);
      expect(result.find((d) => d.id === 'c')?.lossesIncrement).toBe(1);
    });

    it('gives loser with no scores 2 losses', () => {
      const players = [
        mkPlayer('a', [100]),
        mkPlayer('b', [50]),
        mkPlayer('c', []),
      ];
      const result = calculateRoundOutcomes(players, 'a', opts);
      expect(result.find((d) => d.id === 'c')?.lossesIncrement).toBe(2);
    });

    it('gives all no-score players 2 losses when multiple have no scores', () => {
      const players = [
        mkPlayer('a', [100]),
        mkPlayer('b', []),
        mkPlayer('c', []),
      ];
      const result = calculateRoundOutcomes(players, 'a', opts);
      expect(result.find((d) => d.id === 'b')?.lossesIncrement).toBe(2);
      expect(result.find((d) => d.id === 'c')?.lossesIncrement).toBe(2);
    });

    it('middle player still gets 0 losses', () => {
      const players = [
        mkPlayer('a', [100]),
        mkPlayer('b', [50]),
        mkPlayer('c', []),
      ];
      const result = calculateRoundOutcomes(players, 'a', opts);
      expect(result.find((d) => d.id === 'b')?.lossesIncrement).toBe(0);
    });

    it('winner still gets 1 win and 0 losses', () => {
      const players = [
        mkPlayer('a', [100]),
        mkPlayer('b', [50]),
        mkPlayer('c', []),
      ];
      const result = calculateRoundOutcomes(players, 'a', opts);
      expect(result.find((d) => d.id === 'a')).toEqual({
        id: 'a',
        winsIncrement: 1,
        lossesIncrement: 0,
      });
    });
  });
});

describe('calculateTotalScore', () => {
  it('returns 0 for null', () => {
    expect(calculateTotalScore(null)).toBe(0);
  });

  it('returns 0 for empty array', () => {
    expect(calculateTotalScore([])).toBe(0);
  });

  it('sums an array of numbers', () => {
    expect(calculateTotalScore([30, 60, 10])).toBe(100);
  });

  it('coerces string numbers via Number()', () => {
    expect(calculateTotalScore(['30', '60'] as unknown as number[])).toBe(90);
  });
});

describe('getRankingByWins', () => {
  const mkDbPlayer = (id: number, name: string, wins: number) => ({
    id,
    gameId: 1,
    name,
    wins,
    losses: 0,
  });

  it('sorts players descending by wins', () => {
    const players = [mkDbPlayer(1, 'A', 2), mkDbPlayer(2, 'B', 5), mkDbPlayer(3, 'C', 1)];
    const ranked = getRankingByWins(players);
    expect(ranked[0].name).toBe('B');
    expect(ranked[1].name).toBe('A');
    expect(ranked[2].name).toBe('C');
  });

  it('assigns rank 1 to the player with most wins', () => {
    const players = [mkDbPlayer(1, 'A', 3), mkDbPlayer(2, 'B', 1)];
    const ranked = getRankingByWins(players);
    expect(ranked[0].rank).toBe(1);
  });

  it('assigns same rank to tied players', () => {
    const players = [mkDbPlayer(1, 'A', 3), mkDbPlayer(2, 'B', 3), mkDbPlayer(3, 'C', 1)];
    const ranked = getRankingByWins(players);
    expect(ranked[0].rank).toBe(1);
    expect(ranked[1].rank).toBe(1);
  });

  it('skips rank after a tie (1, 1, 3)', () => {
    const players = [mkDbPlayer(1, 'A', 3), mkDbPlayer(2, 'B', 3), mkDbPlayer(3, 'C', 1)];
    const ranked = getRankingByWins(players);
    expect(ranked[2].rank).toBe(3);
  });

  it('assigns rank 1 to a single player', () => {
    const players = [mkDbPlayer(1, 'A', 5)];
    const ranked = getRankingByWins(players);
    expect(ranked[0].rank).toBe(1);
  });
});
