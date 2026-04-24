import { useGame } from '@/stores/use-game';
import { GameStatus } from '@/lib/enums';
import type { Player } from '@/lib/types';
import { randomUUID } from 'expo-crypto';

jest.mock('@/db/querys/settings', () => ({
  getTrioModeSetting: jest.fn().mockResolvedValue(false),
  getMultiLoseSetting: jest.fn().mockResolvedValue(false),
}));

const INITIAL_STATE = {
  gameStatus: GameStatus.NotStarted,
  tournamentMode: false,
  trioMode: false,
  multiLose: false,
  players: [] as Player[],
  gameSize: 2,
  winningLimit: 150,
  winnerPlayerId: null,
  loserPlayerId: null,
  currentGameId: undefined,
  currentRoundNumber: 1,
};

const mkPlayer = (id: string, scores: number[] = [], wins = 0, losses = 0): Player => ({
  id,
  name: `Player ${id}`,
  wins,
  losses,
  isPlaying: true,
  score: scores.map((value, i) => ({ id: `score-${id}-${i}`, value })),
});

beforeEach(() => {
  useGame.setState(INITIAL_STATE);
  let uuidCounter = 0;
  (randomUUID as jest.Mock).mockImplementation(() => `uuid-${++uuidCounter}`);
});

describe('updateGameStatus', () => {
  it('sets the game status', () => {
    useGame.getState().updateGameStatus(GameStatus.Ready);
    expect(useGame.getState().gameStatus).toBe(GameStatus.Ready);
  });
});

describe('addScoreToPlayer', () => {
  it('transitions status to InProgress when a score is added', () => {
    const player = mkPlayer('a');
    useGame.setState({ players: [player] });
    useGame.getState().addScoreToPlayer(player, 50);
    expect(useGame.getState().gameStatus).toBe(GameStatus.InProgress);
  });

  it('is a no-op when game status is Finished', () => {
    const player = mkPlayer('a', [100]);
    useGame.setState({ players: [player], gameStatus: GameStatus.Finished });
    useGame.getState().addScoreToPlayer(player, 50);
    const updated = useGame.getState().players.find((p) => p.id === 'a')!;
    expect(updated.score).toHaveLength(1);
  });

  it('appends the new score to the player', () => {
    const player = mkPlayer('a', [30]);
    useGame.setState({ players: [player] });
    useGame.getState().addScoreToPlayer(player, 50);
    const updated = useGame.getState().players.find((p) => p.id === 'a')!;
    expect(updated.score).toHaveLength(2);
    expect(updated.score[1].value).toBe(50);
  });
});

describe('winner detection — normal mode', () => {
  it('sets status to Finished when player reaches winningLimit', () => {
    const player = mkPlayer('a', [100]);
    useGame.setState({ players: [player], winningLimit: 150 });
    useGame.getState().addScoreToPlayer(player, 50);
    expect(useGame.getState().gameStatus).toBe(GameStatus.Finished);
    expect(useGame.getState().winnerPlayerId).toBe('a');
  });

  it('does not set winner when total is below limit', () => {
    const player = mkPlayer('a', [50]);
    useGame.setState({ players: [player], winningLimit: 150 });
    useGame.getState().addScoreToPlayer(player, 50);
    expect(useGame.getState().gameStatus).toBe(GameStatus.InProgress);
    expect(useGame.getState().winnerPlayerId).toBeNull();
  });

  it('does not set loserPlayerId in normal mode', () => {
    const player = mkPlayer('a', [100]);
    useGame.setState({ players: [player], winningLimit: 150 });
    useGame.getState().addScoreToPlayer(player, 50);
    expect(useGame.getState().loserPlayerId).toBeNull();
  });
});

describe('winner detection — trio mode', () => {
  it('sets winnerPlayerId to highest scorer and loserPlayerId to lowest scorer', () => {
    const a = mkPlayer('a', [150]);
    const b = mkPlayer('b', [80]);
    const c = mkPlayer('c', [30]);
    useGame.setState({ players: [a, b, c], winningLimit: 150, trioMode: true });
    useGame.getState().addScoreToPlayer(a, 0);
    expect(useGame.getState().gameStatus).toBe(GameStatus.Finished);
    expect(useGame.getState().winnerPlayerId).toBe('a');
    expect(useGame.getState().loserPlayerId).toBe('c');
  });
});

describe('removeScoreFromPlayer', () => {
  it('pulls total below limit and clears winner', () => {
    const player = mkPlayer('a', [100, 50]);
    useGame.setState({
      players: [player],
      winningLimit: 150,
      gameStatus: GameStatus.Finished,
      winnerPlayerId: 'a',
    });
    const scoreToRemove = useGame.getState().players[0].score[1].id;
    useGame.getState().removeScoreFromPlayer(player, scoreToRemove);
    expect(useGame.getState().gameStatus).toBe(GameStatus.InProgress);
    expect(useGame.getState().winnerPlayerId).toBeNull();
  });
});

describe('endRound', () => {
  it('resets to Ready and clears all scores when there is no winner', () => {
    const players = [mkPlayer('a', [50]), mkPlayer('b', [30])];
    useGame.setState({ players, gameStatus: GameStatus.InProgress });
    useGame.getState().endRound();
    const state = useGame.getState();
    expect(state.gameStatus).toBe(GameStatus.Ready);
    state.players.forEach((p) => expect(p.score).toHaveLength(0));
  });

  it('applies wins/losses deltas, clears scores, and transitions to Ready when there is a winner', () => {
    const players = [mkPlayer('a', [150]), mkPlayer('b', [50])];
    useGame.setState({
      players,
      winnerPlayerId: 'a',
      gameStatus: GameStatus.Finished,
    });
    useGame.getState().endRound();
    const state = useGame.getState();
    expect(state.gameStatus).toBe(GameStatus.Ready);
    const winner = state.players.find((p) => p.id === 'a')!;
    const loser = state.players.find((p) => p.id === 'b')!;
    expect(winner.wins).toBe(1);
    expect(winner.losses).toBe(0);
    expect(loser.losses).toBe(1);
    state.players.forEach((p) => expect(p.score).toHaveLength(0));
  });

  it('increments currentRoundNumber when there is a winner', () => {
    const players = [mkPlayer('a', [150]), mkPlayer('b', [50])];
    useGame.setState({ players, winnerPlayerId: 'a', currentRoundNumber: 3 });
    useGame.getState().endRound();
    expect(useGame.getState().currentRoundNumber).toBe(4);
  });

  it('trio mode: middle player gets 0 losses', () => {
    const players = [mkPlayer('a', [150]), mkPlayer('b', [80]), mkPlayer('c', [30])];
    useGame.setState({
      players,
      winnerPlayerId: 'a',
      trioMode: true,
      gameStatus: GameStatus.Finished,
    });
    useGame.getState().endRound();
    const middle = useGame.getState().players.find((p) => p.id === 'b')!;
    expect(middle.losses).toBe(0);
    expect(middle.wins).toBe(0);
  });
});

describe('endGame', () => {
  it('resets status to NotStarted, clears players and currentGameId', () => {
    useGame.setState({
      gameStatus: GameStatus.Finished,
      players: [mkPlayer('a')],
      currentGameId: 42,
      currentRoundNumber: 5,
    });
    useGame.getState().endGame();
    const state = useGame.getState();
    expect(state.gameStatus).toBe(GameStatus.NotStarted);
    expect(state.players).toHaveLength(0);
    expect(state.currentGameId).toBeUndefined();
    expect(state.currentRoundNumber).toBe(1);
  });
});

describe('toggleTournamentMode', () => {
  it('turning ON when gameSize is 2 changes gameSize to 3', () => {
    useGame.setState({ tournamentMode: false, gameSize: 2 });
    useGame.getState().toggleTournamentMode();
    expect(useGame.getState().tournamentMode).toBe(true);
    expect(useGame.getState().gameSize).toBe(3);
  });

  it('turning OFF when gameSize > 4 clamps gameSize to 4', () => {
    useGame.setState({ tournamentMode: true, gameSize: 6 });
    useGame.getState().toggleTournamentMode();
    expect(useGame.getState().tournamentMode).toBe(false);
    expect(useGame.getState().gameSize).toBe(4);
  });

  it('turning OFF when gameSize is within normal range keeps gameSize unchanged', () => {
    useGame.setState({ tournamentMode: true, gameSize: 4 });
    useGame.getState().toggleTournamentMode();
    expect(useGame.getState().gameSize).toBe(4);
  });
});

describe('restoreGame', () => {
  it('sets gameStatus to Ready', () => {
    useGame.getState().restoreGame(10, [], false);
    expect(useGame.getState().gameStatus).toBe(GameStatus.Ready);
  });

  it('sets currentGameId and players', () => {
    const players = [mkPlayer('a', [], 2, 1)];
    useGame.getState().restoreGame(10, players, true);
    expect(useGame.getState().currentGameId).toBe(10);
    expect(useGame.getState().players).toHaveLength(1);
    expect(useGame.getState().tournamentMode).toBe(true);
  });

  it('computes currentRoundNumber as max(wins+losses)+1', () => {
    const players = [mkPlayer('a', [], 3, 1), mkPlayer('b', [], 2, 2)];
    useGame.getState().restoreGame(5, players, false);
    // player a: 3+1=4, player b: 2+2=4 → max=4, round=5
    expect(useGame.getState().currentRoundNumber).toBe(5);
  });
});

describe('loadSettings', () => {
  it('loads trioMode and multiLose from settings and applies them to the store', async () => {
    const { getTrioModeSetting, getMultiLoseSetting } = require('@/db/querys/settings');
    (getTrioModeSetting as jest.Mock).mockResolvedValueOnce(true);
    (getMultiLoseSetting as jest.Mock).mockResolvedValueOnce(true);
    await useGame.getState().loadSettings();
    expect(useGame.getState().trioMode).toBe(true);
    expect(useGame.getState().multiLose).toBe(true);
  });
});
