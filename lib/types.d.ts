import { POINTS } from "@/constants/points";

export type Point = (typeof POINTS)["values"][number];

export type PlayerName = { id: string; name: string };
