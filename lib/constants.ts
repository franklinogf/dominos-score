export const POINTS = ['100', '150', '200'] as const;

export const PARTY_SIZES = ['2', '3', '4'] as const;
export const BIG_PARTY_SIZES = [
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
] as const;

export const DEFAULT_LONG_PRESS_SCORE = 30;

export const DEFAULT_TRIO_MODE = true;

export const DEFAULT_MULTI_LOSE = false;

export const DEFAULT_THEME = 'system' as const;

export const THEME_OPTIONS = ['light', 'dark', 'system'] as const;

export type ThemeOption = (typeof THEME_OPTIONS)[number];
