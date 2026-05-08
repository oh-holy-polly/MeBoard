import React from 'react';

/**
 * Призрачная сетка-радар в центре. Не анимирована (пользователь отказался от вращения).
 * Опасити 0.05 — выглядит как часть атмосферы.
 */
const CompassGrid: React.FC = () => (
  <svg
    viewBox="0 0 100 100"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden
    style={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      zIndex: 7,
      opacity: 0.05,
      pointerEvents: 'none',
    }}
  >
    {[6, 12, 18, 24, 30].map((r) => (
      <circle key={r} cx={50} cy={50} r={r} fill="none" stroke="white" strokeWidth={0.18} />
    ))}
    <line x1={50} y1={18} x2={50} y2={82} stroke="white" strokeWidth={0.15} />
    <line x1={18} y1={50} x2={82} y2={50} stroke="white" strokeWidth={0.15} />
    <line x1={28} y1={28} x2={72} y2={72} stroke="white" strokeWidth={0.1} />
    <line x1={72} y1={28} x2={28} y2={72} stroke="white" strokeWidth={0.1} />
    <text x={50} y={17} fill="white" fontSize={1.6} textAnchor="middle">N</text>
    <text x={50} y={84} fill="white" fontSize={1.6} textAnchor="middle">S</text>
    <text x={17} y={51} fill="white" fontSize={1.6} textAnchor="middle">W</text>
    <text x={83} y={51} fill="white" fontSize={1.6} textAnchor="middle">E</text>
  </svg>
);

export default CompassGrid;
