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
  winnerPlayerId: string | null;
  toggleTournamentMode: () => void;
  updateGameSize: (size: number) => void;
  updateWinningLimit: (limit: number) => void;
  addPlayers: (players: Player[]) => void;
  addScoreToPlayer: (player: Player, score: number) => void;
  removeScoreFromPlayer: (player: Player, scoreId: string) => void;
  changePlayerActivity: (player: Player, isPlaying: boolean) => void;
  updateGameStatus: (status: GameStatus) => void;
  endGame: () => void;
  startNewRound: () => void;
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
  players: [
    {
      id: "player0",
      name: "OMAR",
      score: [],
      isPlaying: false,
      losses: 0,
      wins: 0,
    },
    {
      id: "player1",
      name: "ALI",
      score: [],
      isPlaying: false,
      losses: 0,
      wins: 0,
    },
  ],
  gameSize: 2,
  winningLimit: 150,
  endGame: () =>
    set(() => ({
      gameStatus: GameStatus.NotStarted,
      winnerPlayerId: null,
      players: [],
    })),
  startNewRound: () =>
    set((state) => ({
      gameStatus: GameStatus.Ready,
      players: state.players.map((p) => ({ ...p, score: [] })),
    })),
  updateGameStatus: (status) => set({ gameStatus: status }),
  toggleTournamentMode: () =>
    set((state) => ({ tournamentMode: !state.tournamentMode })),
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
          p.id === player.id ? { ...p, score: [...p.score, newScore] } : p
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
            : p
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
        p.id === playerId ? { ...p, isPlaying } : p
      );
      return { players: updatedPlayers };
    }),
}));
