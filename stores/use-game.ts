import { Score } from "@/lib/types";
import { randomUUID } from "expo-crypto";
import { create } from "zustand";

type GameState = {
  tournamentMode: boolean;
  players: Record<string, string>;
  score: Record<string, Score[]>;
  gameSize: number;
  winningLimit: number;
  updateGameSize: (size: number) => void;
  updateWinningLimit: (limit: number) => void;
  updatePlayers: (players: Record<string, string>) => void;
  addScoreToPlayer: (playerKey: string, score: number) => void;
  removeScoreFromPlayer: (playerKey: string, scoreId: string) => void;
  toggleTournamentMode: () => void;
};

export const useGame = create<GameState>((set) => ({
  tournamentMode: false,
  score: {
    player0: [
      { id: randomUUID(), value: 10 },
      { id: randomUUID(), value: 12 },
      { id: randomUUID(), value: 40 },
      { id: randomUUID(), value: 20 },
    ],
  },
  players: {},
  gameSize: 2,
  winningLimit: 150,
  toggleTournamentMode: () =>
    set((state) => ({ tournamentMode: !state.tournamentMode })),
  updateWinningLimit: (limit) => set({ winningLimit: limit }),
  updateGameSize: (size) => set({ gameSize: size }),
  updatePlayers: (players) => set({ players }),
  addScoreToPlayer: (playerKey, scoreValue) =>
    set((state) => {
      const playerScores = state.score[playerKey] || [];
      const newScore: Score = {
        id: randomUUID(),
        value: scoreValue,
      };
      return {
        score: {
          ...state.score,
          [playerKey]: [...playerScores, newScore],
        },
      };
    }),
  removeScoreFromPlayer: (playerKey, scoreId) =>
    set((state) => {
      const playerScores = state.score[playerKey] || [];
      return {
        score: {
          ...state.score,
          [playerKey]: playerScores.filter((score) => score.id !== scoreId),
        },
      };
    }),
}));
