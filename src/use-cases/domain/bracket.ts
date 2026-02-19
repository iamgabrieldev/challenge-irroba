export const PHASES = {
  QUARTER_FINAL: 'QUARTER_FINAL',
  SEMI_FINAL: 'SEMI_FINAL',
  THIRD_PLACE: 'THIRD_PLACE',
  FINAL: 'FINAL',
} as const;

export type Phase = (typeof PHASES)[keyof typeof PHASES];

export interface BracketMatch {
  phase: Phase;
  matchOrder: number;
  homeIndex: number;
  awayIndex: number;
}

export function generateBracket(): BracketMatch[] {
  return [
    { phase: 'QUARTER_FINAL', matchOrder: 0, homeIndex: 0, awayIndex: 1 },
    { phase: 'QUARTER_FINAL', matchOrder: 1, homeIndex: 2, awayIndex: 3 },
    { phase: 'QUARTER_FINAL', matchOrder: 2, homeIndex: 4, awayIndex: 5 },
    { phase: 'QUARTER_FINAL', matchOrder: 3, homeIndex: 6, awayIndex: 7 },
    { phase: 'SEMI_FINAL', matchOrder: 0, homeIndex: -1, awayIndex: -1 },
    { phase: 'SEMI_FINAL', matchOrder: 1, homeIndex: -1, awayIndex: -1 },
    { phase: 'THIRD_PLACE', matchOrder: 0, homeIndex: -1, awayIndex: -1 },
    { phase: 'FINAL', matchOrder: 0, homeIndex: -1, awayIndex: -1 },
  ];
}
