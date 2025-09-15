const points_values = ["100", "150", "200"];
export const POINTS: {
  default: (typeof points_values)[number];
  values: (typeof points_values)[number][];
} = {
  default: "150",
  values: points_values,
} as const;
