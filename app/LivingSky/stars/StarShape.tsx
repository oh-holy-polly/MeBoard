import React from 'react';

interface Props {
  size: number;
  color?: string;
}

/**
 * SVG-форма звезды с референса:
 * - длинные тонкие перекрестия (вертикальное и горизонтальное)
 * - 4-конечный «бутон»
 * - вторичные диагональные лучи
 * - яркое белое ядро в центре
 */
const StarShape: React.FC<Props> = ({ size: s, color = '#fff5dc' }) => (
  <g>
    <line x1={0} y1={-s * 1.9} x2={0} y2={s * 1.9} stroke={color} strokeWidth={s * 0.06} strokeLinecap="round" opacity={0.95} />
    <line x1={-s * 1.9} y1={0} x2={s * 1.9} y2={0} stroke={color} strokeWidth={s * 0.06} strokeLinecap="round" opacity={0.95} />
    <path
      d={`M0,-${s} L${s * 0.18},-${s * 0.18} L${s},0 L${s * 0.18},${s * 0.18} L0,${s} L-${s * 0.18},${s * 0.18} L-${s},0 L-${s * 0.18},-${s * 0.18} Z`}
      fill={color}
    />
    <path
      d={`M${s * 0.55},-${s * 0.55} L${s * 0.08},-${s * 0.08} L${s * 0.55},${s * 0.55} L${s * 0.08},${s * 0.08} L-${s * 0.55},${s * 0.55} L-${s * 0.08},${s * 0.08} L-${s * 0.55},-${s * 0.55} L-${s * 0.08},-${s * 0.08} Z`}
      fill={color}
      opacity={0.6}
    />
    <circle r={s * 0.22} fill="#ffffff" />
  </g>
);

export default StarShape;
