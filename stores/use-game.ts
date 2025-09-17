import { GameStatus } from "@/lib/enums";
import { GameScore, Player, Score } from "@/lib/types";
import { randomUUID } from "expo-crypto";
import { create } from "zustand";

type GameState = {
  gameStatus: GameStatus;
  tournamentMode: boolean;
  players: Player[];
  gameScore: GameScore;
  gameSize: number;
  winningLimit: number;
  toggleTournamentMode: () => void;
  updateGameSize: (size: number) => void;
  updateWinningLimit: (limit: number) => void;
  addPlayers: (players: Player[]) => void;
  addScoreToPlayer: (playerId: string, score: number) => void;
  removeScoreFromPlayer: (playerId: string, scoreId: string) => void;
  changePlayerActivity: (playerId: string, isPlaying: boolean) => void;
  updateGameStatus: (status: GameStatus) => void;
};

function checkWinnerWhenUpdatingScore(playerId: string, playerScores: Score[]) {
  const winningLimit = useGame.getState().winningLimit;
  const newTotal = playerScores.reduce((acc, score) => acc + score.value, 0);
  if (newTotal >= winningLimit) {
    useGame.setState((state) => ({
      players: state.players.map((player) =>
        player.id === playerId ? { ...player, isWinner: true } : player
      ),
    }));
  }
}

export const useGame = create<GameState>((set) => ({
  gameStatus: GameStatus.NotStarted,
  tournamentMode: false,
  gameScore: {},
  players: [],
  gameSize: 2,
  winningLimit: 150,
  updateGameStatus: (status) => set({ gameStatus: status }),
  toggleTournamentMode: () =>
    set((state) => ({ tournamentMode: !state.tournamentMode })),
  updateWinningLimit: (limit) => set({ winningLimit: limit }),
  updateGameSize: (size) => set({ gameSize: size }),
  addPlayers: (players) => set({ players }),
  addScoreToPlayer: (playerId, scoreValue) =>
    set((state) => {
      const playerScores = state.gameScore[playerId] || [];
      const newScore: Score = {
        id: randomUUID(),
        value: scoreValue,
      };
      checkWinnerWhenUpdatingScore(playerId, [...playerScores, newScore]);
      return {
        gameScore: {
          ...state.gameScore,
          [playerId]: [...playerScores, newScore],
        },
      };
    }),
  removeScoreFromPlayer: (playerId, scoreId) =>
    set((state) => {
      const playerScores = state.gameScore[playerId] || [];
      checkWinnerWhenUpdatingScore(playerId, playerScores);
      return {
        gameScore: {
          ...state.gameScore,
          [playerId]: playerScores.filter((score) => score.id !== scoreId),
        },
      };
    }),
  changePlayerActivity: (playerId, isPlaying) =>
    set((state) => {
      const updatedPlayers = state.players.map((player) =>
        player.id === playerId ? { ...player, isPlaying } : player
      );
      return { players: updatedPlayers };
    }),
}));
