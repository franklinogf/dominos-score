import { GameStatus } from '@/lib/enums';
import type { Player, Score } from '@/lib/types';
import { randomUUID } from 'expo-crypto';
import { create } from 'zustand';

type GameState = {
  gameStatus: GameStatus;
  tournamentMode: boolean;
  players: Player[];
  gameSize: number;
  winningLimit: number;
  winnerPlayerId: string | null;
  currentGameId?: number;
  toggleTournamentMode: () => void;
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
  const state = useGame.getState();
  const winningLimit = state.winningLimit;
  const players = state.players;

  // Find the first player who has reached the winning limit
  const winner = players.find((player) => {
    const total = player.score.reduce((acc, score) => acc + score.value, 0);
    return total >= winningLimit;
  });

  if (winner) {
    useGame.setState(() => ({
      winnerPlayerId: winner.id,
      gameStatus: GameStatus.Finished,
    }));
  } else {
    // Reset winner if no player meets the winning condition
    useGame.setState(() => ({
      winnerPlayerId: null,
      gameStatus: GameStatus.InProgress,
    }));
  }
}

export const useGame = create<GameState>((set) => ({
  winnerPlayerId: null,
  gameStatus: GameStatus.NotStarted,
  tournamentMode: false,
  currentGameId: undefined,
  players: [],
  gameSize: 2,
  winningLimit: 150,
  endRound: () =>
    set((state) => {
      const winnerId = state.winnerPlayerId;

      if (!winnerId) {
        return {
          winnerPlayerId: null,
          gameStatus: GameStatus.Ready,
          players: state.players.map((p) => ({ ...p, score: [] })),
        };
      }

      const playingPlayers = state.players.filter((p) => p.isPlaying);
      const losersIds = playingPlayers
        .filter((p) => p.id !== winnerId)
        .map((p) => p.id);
      const updatedPlayers = state.players.map((p) => {
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

      return {
        winnerPlayerId: null,
        gameStatus: GameStatus.Ready,
        players: updatedPlayers,
      };
    }),
  endGame: () =>
    set(() => ({
      currentGameId: undefined,
      gameStatus: GameStatus.NotStarted,
      winnerPlayerId: null,
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
