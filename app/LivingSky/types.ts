export type DayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface Star {
  day: DayKey;
  /** 0..1 — доля выполненных привычек за этот день недели */
  completion: number;
}

export interface EnrichedStar {
  day: DayKey;
  completion: number;
  x: number;
  y: number;
  level: 0 | 1 | 2 | 3;
  active: boolean;
}

export interface ConstellationLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  key: string;
}
