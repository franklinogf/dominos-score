import { GameScore, Player, Score } from "@/lib/types";
import { randomUUID } from "expo-crypto";
import { create } from "zustand";

type GameState = {
  tournamentMode: boolean;
  players: Player[];
  score: GameScore;
  gameSize: number;
  winningLimit: number;
  toggleTournamentMode: () => void;
  updateGameSize: (size: number) => void;
  updateWinningLimit: (limit: number) => void;
  addPlayers: (players: Player[]) => void;
  addScoreToPlayer: (playerId: string, score: number) => void;
  removeScoreFromPlayer: (playerId: string, scoreId: string) => void;
};

export const useGame = create<GameState>((set) => ({
  tournamentMode: false,
  score: {},
  players: [
    {
      id: randomUUID(),
      name: "Player 1",
      wins: 0,
      losses: 0,
      isPlaying: false,
    },
    {
      id: randomUUID(),
      name: "Player 2",
      wins: 0,
      losses: 0,
      isPlaying: false,
    },
  ],
  gameSize: 2,
  winningLimit: 150,
  toggleTournamentMode: () =>
    set((state) => ({ tournamentMode: !state.tournamentMode })),
  updateWinningLimit: (limit) => set({ winningLimit: limit }),
  updateGameSize: (size) => set({ gameSize: size }),
  addPlayers: (players) => set({ players }),
  addScoreToPlayer: (playerId, scoreValue) =>
    set((state) => {
      const playerScores = state.score[playerId] || [];
      const newScore: Score = {
        id: randomUUID(),
        value: scoreValue,
      };
      return {
        score: {
          ...state.score,
          [playerId]: [...playerScores, newScore],
        },
      };
    }),
  removeScoreFromPlayer: (playerId, scoreId) =>
    set((state) => {
      const playerScores = state.score[playerId] || [];
      return {
        score: {
          ...state.score,
          [playerId]: playerScores.filter((score) => score.id !== scoreId),
        },
      };
    }),
}));
