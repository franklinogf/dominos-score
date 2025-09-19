import { getTrioModeSetting } from '@/db/querys/settings';
import { GameStatus } from '@/lib/enums';
import type { Player, Score } from '@/lib/types';
import { randomUUID } from 'expo-crypto';
import { create } from 'zustand';

type GameState = {
  gameStatus: GameStatus;
  tournamentMode: boolean;
  trioMode: boolean;
  players: Player[];
  gameSize: number;
  winningLimit: number;
  winnerPlayerId: string | null;
  loserPlayerId: string | null;
  currentGameId?: number;
  toggleTournamentMode: () => void;
  setTrioMode: (enabled: boolean) => void;
  loadSettings: () => Promise<void>;
  updateGameSize: (size: number) => void;
  updateWinningLimit: (limit: number) => void;
  addPlayers: (players: Player[]) => void;
  addScoreToPlayer: (player: Player, score: number) => void;
  removeScoreFromPlayer: (player: Player, scoreId: string) => void;
  changePlayerActivity: (player: Player, isPlaying: boolean) => void;
  updateGameStatus: (status: GameStatus) => void;
  endRound: () => void;
  endGame: () => void;
  updateCurrentGameId: (id: number) => void;
};

function checkWinnerWhenUpdatingScore() {
  const { winningLimit, players, trioMode: isTrioMode } = useGame.getState();

  // Check if any player has reached the winning limit
  const playersAtLimit = players.filter((player) => {
    const total = player.score.reduce((acc, score) => acc + score.value, 0);
    return total >= winningLimit;
  });

  if (playersAtLimit.length > 0) {
    if (isTrioMode) {
      // In trio mode, find both the highest scorer (winner) and lowest scorer (loser)
      const playingPlayers = players.filter((p) => p.isPlaying);
      if (playingPlayers.length > 1) {
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
        const loser = playersWithTotals.find(
          (p) => p.total === minTotal,
        )?.player;

        useGame.setState(() => ({
          winnerPlayerId: winner?.id || null,
          loserPlayerId: loser?.id || null,
          gameStatus: GameStatus.Finished,
        }));
      }
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
  currentGameId: undefined,
  players: [],
  gameSize: 2,
  winningLimit: 150,
  endRound: () =>
    set((state) => {
      const winnerId = state.winnerPlayerId;
      const loserId = state.loserPlayerId;
      const isTrioMode = state.trioMode;

      if (!winnerId) {
        return {
          winnerPlayerId: null,
          loserPlayerId: null,
          gameStatus: GameStatus.Ready,
          players: state.players.map((p) => ({ ...p, score: [] })),
        };
      }

      const playingPlayers = state.players.filter((p) => p.isPlaying);

      let updatedPlayers;
      if (isTrioMode) {
        // In trio mode: highest scorer wins, lowest scorer loses, others unchanged
        updatedPlayers = state.players.map((p) => {
          let updatedPlayer = { ...p };

          // Update wins/losses - only winner and loser change
          if (p.id === winnerId) {
            updatedPlayer.wins = p.wins + 1;
          } else if (p.id === loserId) {
            updatedPlayer.losses = p.losses + 1;
          }
          // Other players stay unchanged

          // Reset scores for all players
          updatedPlayer.score = [];
          return updatedPlayer;
        });
      } else {
        // Traditional mode: winner gets a win, everyone else gets a loss
        const losersIds = playingPlayers
          .filter((p) => p.id !== winnerId)
          .map((p) => p.id);

        updatedPlayers = state.players.map((p) => {
          let updatedPlayer = { ...p };

          // Update wins/losses
          if (p.id === winnerId) {
            updatedPlayer.wins = p.wins + 1;
          }
          if (losersIds.includes(p.id)) {
            updatedPlayer.losses = p.losses + 1;
          }

          // Reset scores
          updatedPlayer.score = [];
          return updatedPlayer;
        });
      }

      return {
        winnerPlayerId: null,
        loserPlayerId: null,
        gameStatus: GameStatus.Ready,
        players: updatedPlayers,
      };
    }),
  endGame: () =>
    set(() => ({
      currentGameId: undefined,
      gameStatus: GameStatus.NotStarted,
      winnerPlayerId: null,
      loserPlayerId: null,
      players: [],
    })),
  updateGameStatus: (status) => set({ gameStatus: status }),
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
  loadSettings: async () => {
    try {
      const trioMode = await getTrioModeSetting();
      useGame.setState({ trioMode });
    } catch (error) {
      console.error('Failed to load trio mode setting:', error);
    }
  },
  updateWinningLimit: (limit) => set({ winningLimit: limit }),
  updateGameSize: (size) => set({ gameSize: size }),
  addPlayers: (players) => set({ players }),
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

    // Check winner after state update
    setTimeout(() => checkWinnerWhenUpdatingScore(), 0);
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

    // Check winner after state update
    setTimeout(() => checkWinnerWhenUpdatingScore(), 0);
  },
  changePlayerActivity: (player, isPlaying) =>
    set((state) => {
      const playerId = player.id;
      const updatedPlayers = state.players.map((p) =>
        p.id === playerId ? { ...p, isPlaying } : p,
      );
      return { players: updatedPlayers };
    }),
  updateCurrentGameId: (id: number) => set({ currentGameId: id }),
}));
