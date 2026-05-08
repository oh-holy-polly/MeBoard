import { mulberry32 } from './seededRandom';

export interface Pos {
  x: number;
  y: number;
}

/**
 * Создаёт 7 точек созвездия на основе сида (год*1000 + ISO неделя).
 * Использует гептаграмму со случайным шагом (2 или 3) и поворотом —
 * получается «сакрально-геометрическая» форма, новая каждую неделю,
 * но одинаковая для всей этой недели.
 */
export function buildConstellation(seed: number): Pos[] {
  const rand = mulberry32(seed);
  const cx = 50;
  const cy = 50;

  const ringMin = 30;
  const ringMax = 41;

  const rotation = rand() * Math.PI * 2;
  const step = rand() > 0.5 ? 2 : 3;

  const positions: Pos[] = [];
  for (let i = 0; i < 7; i++) {
    const idx = (i * step) % 7;
    const baseAngle = rotation + (idx * 2 * Math.PI) / 7;
    const angle = baseAngle + (rand() - 0.5) * (Math.PI / 9);
    const r = ringMin + rand() * (ringMax - ringMin);
    positions.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r * 0.92,
    });
  }
  return positions;
}
