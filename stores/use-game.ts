import { GameStatus } from "@/lib/enums";
import type { Player, Score } from "@/lib/types";
import { randomUUID } from "expo-crypto";
import { create } from "zustand";

type GameState = {
  gameStatus: GameStatus;
  tournamentMode: boolean;
  players: Player[];
  gameSize: number;
  winningLimit: number;
  toggleTournamentMode: () => void;
  updateGameSize: (size: number) => void;
  updateWinningLimit: (limit: number) => void;
  addPlayers: (players: Player[]) => void;
  addScoreToPlayer: (player: Player, score: number) => void;
  removeScoreFromPlayer: (player: Player, scoreId: string) => void;
  changePlayerActivity: (player: Player, isPlaying: boolean) => void;
  updateGameStatus: (status: GameStatus) => void;
};

function checkWinnerWhenUpdatingScore(player: Player) {
  const winningLimit = useGame.getState().winningLimit;
  const newTotal = player.score.reduce((acc, score) => acc + score.value, 0);

  useGame.setState((state) => ({
    players: state.players.map((player) =>
      player.id === player.id
        ? { ...player, isWinner: newTotal >= winningLimit ? true : false }
        : player
    ),
  }));
}

export const useGame = create<GameState>((set) => ({
  gameStatus: GameStatus.NotStarted,
  tournamentMode: false,
  players: [],
  gameSize: 2,
  winningLimit: 150,
  updateGameStatus: (status) => set({ gameStatus: status }),
  toggleTournamentMode: () =>
    set((state) => ({ tournamentMode: !state.tournamentMode })),
  updateWinningLimit: (limit) => set({ winningLimit: limit }),
  updateGameSize: (size) => set({ gameSize: size }),
  addPlayers: (players) => set({ players }),
  addScoreToPlayer: (player, scoreValue) =>
    set((state) => {
      const newScore: Score = {
        id: randomUUID(),
        value: scoreValue,
      };
      checkWinnerWhenUpdatingScore(player);
      return {
        players: state.players.map((p) =>
          p.id === player.id ? { ...p, score: [...p.score, newScore] } : p
        ),
      };
    }),
  removeScoreFromPlayer: (player, scoreId) =>
    set((state) => {
      const playerScores =
        state.players.find((p) => p.id === player.id)?.score || [];
      checkWinnerWhenUpdatingScore(player);
      return {
        players: state.players.map((p) =>
          p.id === player.id
            ? {
                ...p,
                score: playerScores.filter((score) => score.id !== scoreId),
              }
            : p
        ),
      };
    }),
  changePlayerActivity: (player, isPlaying) =>
    set((state) => {
      const updatedPlayers = state.players.map((player) =>
        player.id === player.id ? { ...player, isPlaying } : player
      );
      return { players: updatedPlayers };
    }),
}));
