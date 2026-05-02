import { persistDraftRound } from '@/db/actions/round';
import { getMultiLoseSetting, getTrioModeSetting } from '@/db/querys/settings';
import { GameStatus } from '@/lib/enums';
import type { Player, Score } from '@/lib/types';
import { calculateRoundOutcomes } from '@/lib/utils';
import { randomUUID } from 'expo-crypto';
import { create } from 'zustand';

let draftPersistQueue = Promise.resolve();

type GameState = {
  gameStatus: GameStatus;
  tournamentMode: boolean;
  trioMode: boolean;
  multiLose: boolean;
  players: Player[];
  gameSize: number;
  winningLimit: number;
  winnerPlayerId: string | null;
  loserPlayerId: string | null;
  currentGameId?: number;
  currentRoundNumber: number;
  toggleTournamentMode: () => void;
  setTrioMode: (enabled: boolean) => void;
  setMultiLose: (enabled: boolean) => void;
  loadSettings: () => Promise<void>;
  updateGameSize: (size: number) => void;
  updateWinningLimit: (limit: number) => void;
  addPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  addScoreToPlayer: (player: Player, score: number) => void;
  removeScoreFromPlayer: (player: Player, scoreId: string) => void;
  changePlayerActivity: (player: Player, isPlaying: boolean) => void;
  endRound: () => void;
  endGame: () => void;
  restoreGame: (
    gameId: number,
    state: {
      players: Player[];
      tournamentMode: boolean;
      gameStatus: GameStatus;
      currentRoundNumber: number;
      winnerPlayerId: string | null;
      loserPlayerId: string | null;
      winningLimit: number;
      gameSize: number;
    },
  ) => void;
};

function persistCurrentDraftRound() {
  const { currentGameId, players } = useGame.getState();
  if (!currentGameId) return;
  const playersSnapshot = players.map((player) => ({
    ...player,
    score: [...player.score],
  }));
  draftPersistQueue = draftPersistQueue
    .catch(() => undefined)
    .then(() => persistDraftRound(currentGameId, playersSnapshot));
}

export async function flushDraftPersistence() {
  await draftPersistQueue.catch(() => undefined);
}

function checkWinnerWhenUpdatingScore() {
  const { winningLimit, players, trioMode: isTrioMode } = useGame.getState();
  const playingPlayers = players.filter((p) => p.isPlaying);

  // Check if any player has reached the winning limit
  const playersAtLimit = playingPlayers.filter((player) => {
    const total = player.score.reduce((acc, score) => acc + score.value, 0);
    return total >= winningLimit;
  });

  if (playersAtLimit.length > 0) {
    if (isTrioMode) {
      // In trio mode, find both the highest scorer (winner) and lowest scorer (loser)

      const playersWithTotals = playingPlayers.map((player) => ({
        player,
        total: player.score.reduce((acc, score) => acc + score.value, 0),
      }));

      // Find highest and lowest scorers
      const maxTotal = Math.max(...playersWithTotals.map((p) => p.total));
      const minTotal = Math.min(...playersWithTotals.map((p) => p.total));

      const winner = playersWithTotals.find(
        (p) => p.total === maxTotal,
      )?.player;
      const loser = playersWithTotals.find((p) => p.total === minTotal)?.player;

      useGame.setState(() => ({
        winnerPlayerId: winner?.id || null,
        loserPlayerId: loser?.id || null,
        gameStatus: GameStatus.Finished,
      }));
    } else {
      // Traditional mode: first player to reach the limit wins
      const winner = playersAtLimit[0];
      useGame.setState(() => ({
        winnerPlayerId: winner.id,
        loserPlayerId: null,
        gameStatus: GameStatus.Finished,
      }));
    }
  } else {
    // Reset winner and loser if no player meets the winning condition
    useGame.setState(() => ({
      winnerPlayerId: null,
      loserPlayerId: null,
      gameStatus: GameStatus.InProgress,
    }));
  }
}

export const useGame = create<GameState>((set) => ({
  winnerPlayerId: null,
  loserPlayerId: null,
  gameStatus: GameStatus.NotStarted,
  tournamentMode: false,
  trioMode: false,
  multiLose: false,
  currentGameId: undefined,
  currentRoundNumber: 1,
  players: [],
  gameSize: 2,
  winningLimit: 150,
  endRound: () =>
    set((state) => {
      const winnerId = state.winnerPlayerId;

      if (!winnerId) {
        return {
          winnerPlayerId: null,
          loserPlayerId: null,
          gameStatus: GameStatus.Ready,
          players: state.players.map((p) => ({ ...p, score: [] })),
        };
      }

      const playingPlayers = state.players.filter((p) => p.isPlaying);
      const deltas = calculateRoundOutcomes(playingPlayers, winnerId, {
        trioMode: state.trioMode,
        multiLose: state.multiLose,
      });
      const deltaMap = new Map(deltas.map((d) => [d.id, d]));

      return {
        winnerPlayerId: null,
        loserPlayerId: null,
        gameStatus: GameStatus.Ready,
        currentRoundNumber: state.currentRoundNumber + 1,
        players: state.players.map((p) => {
          const delta = deltaMap.get(p.id);
          return {
            ...p,
            score: [],
            wins: p.wins + (delta?.winsIncrement ?? 0),
            losses: p.losses + (delta?.lossesIncrement ?? 0),
          };
        }),
      };
    }),
  endGame: () =>
    set(() => ({
      currentGameId: undefined,
      currentRoundNumber: 1,
      gameStatus: GameStatus.NotStarted,
      winnerPlayerId: null,
      loserPlayerId: null,
      players: [],
    })),
  toggleTournamentMode: () =>
    set((state) => ({
      tournamentMode: !state.tournamentMode,
      gameSize:
        state.tournamentMode && state.gameSize > 4
          ? 4
          : !state.tournamentMode && state.gameSize === 2
            ? 3
            : state.gameSize,
    })),
  setTrioMode: (enabled) => set({ trioMode: enabled }),
  setMultiLose: (enabled) => set({ multiLose: enabled }),
  loadSettings: async () => {
    try {
      const trioMode = await getTrioModeSetting();
      const multiLose = await getMultiLoseSetting();
      useGame.setState({ trioMode, multiLose });
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  },
  updateWinningLimit: (limit) => set({ winningLimit: limit }),
  updateGameSize: (size) => set({ gameSize: size }),
  addPlayers: (players) => set({ players, currentRoundNumber: 1 }),
  addPlayer: (player) =>
    set((state) => ({ players: [...state.players, player] })),
  removePlayer: (playerId) =>
    set((state) => ({
      players: state.players.filter((p) => p.id !== playerId),
    })),
  addScoreToPlayer: (player, scoreValue) => {
    set((state) => {
      if (state.gameStatus === GameStatus.Finished) return {};
      const newScore: Score = {
        id: randomUUID(),
        value: scoreValue,
      };
      return {
        gameStatus: GameStatus.InProgress,
        players: state.players.map((p) =>
          p.id === player.id ? { ...p, score: [...p.score, newScore] } : p,
        ),
      };
    });

    checkWinnerWhenUpdatingScore();
    persistCurrentDraftRound();
  },
  removeScoreFromPlayer: (player, scoreId) => {
    set((state) => {
      const playerScores =
        state.players.find((p) => p.id === player.id)?.score || [];

      return {
        gameStatus: GameStatus.InProgress,
        players: state.players.map((p) =>
          p.id === player.id
            ? {
                ...p,
                score: playerScores.filter((score) => score.id !== scoreId),
              }
            : p,
        ),
      };
    });

    checkWinnerWhenUpdatingScore();
    persistCurrentDraftRound();
  },
  changePlayerActivity: (player, isPlaying) => {
    set((state) => {
      const playerId = player.id;
      const updatedPlayers = state.players.map((p) =>
        p.id === playerId ? { ...p, isPlaying } : p,
      );
      return { players: updatedPlayers };
    });
    persistCurrentDraftRound();
  },
  restoreGame: (gameId, restoredState) =>
    set({
      currentGameId: gameId,
      ...restoredState,
    }),
}));
