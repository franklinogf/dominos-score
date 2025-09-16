import { create } from "zustand";

type GameState = {
  tournamentMode: boolean;
  players: Record<string, string>;
  score: Record<string, number[]>;
  gameSize: number;
  winningLimit: number;
  updateGameSize: (size: number) => void;
  updateWinningLimit: (limit: number) => void;
  updatePlayers: (players: Record<string, string>) => void;
  addScoreToPlayer: (playerKey: string, score: number) => void;
  removeScoreFromPlayer: (playerKey: string, index: number) => void;
};

export const useGame = create<GameState>((set) => ({
  tournamentMode: false,
  score: { player0: [10, 12, 40, 20] },
  players: {},
  gameSize: 2,
  winningLimit: 150,
  updateWinningLimit: (limit) => set({ winningLimit: limit }),
  updateGameSize: (size) => set({ gameSize: size }),
  updatePlayers: (players) => set({ players }),
  addScoreToPlayer: (playerKey, score) =>
    set((state) => {
      const playerScores = state.score[playerKey] || [];
      return {
        score: {
          ...state.score,
          [playerKey]: [...playerScores, score],
        },
      };
    }),
  removeScoreFromPlayer: (playerKey, index) =>
    set((state) => {
      const playerScores = state.score[playerKey] || [];
      return {
        score: {
          ...state.score,
          [playerKey]: playerScores.filter((_, i) => i !== index),
        },
      };
    }),
}));
