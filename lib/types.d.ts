import { POINTS } from "@/lib/constants";

export type Point = (typeof POINTS)[number];
export type Score = {
  id: string;
  value: number;
};
