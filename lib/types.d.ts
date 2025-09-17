import { POINTS } from "@/lib/constants";

export type Point = (typeof POINTS)[number];
export type Score = {
  id: string;
  value: number;
};
export interface Player {
  id: string;
  name: string;
  wins: number;
  losses: number;
  isPlaying: boolean;
  isWinner: boolean;
  score: Score[];
}
