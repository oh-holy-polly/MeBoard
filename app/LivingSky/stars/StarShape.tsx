import React from 'react';

interface Props {
  size: number;
  color?: string;
}

const StarShape: React.FC<Props> = ({ size: s, color = '#fff5dc' }) => (
  <g>
    {/* Мягкое тёплое свечение вокруг центра */}
    <circle r={s * 1.1} fill="rgba(255, 240, 180, 0.18)" />
    <circle r={s * 0.65} fill="rgba(255, 245, 210, 0.32)" />

    {/* 4 главных луча — пухлые ромбы вертикально/горизонтально */}
    <path
      d={`M0,-${s * 2.2} L${s * 0.22},0 L0,${s * 2.2} L-${s * 0.22},0 Z`}
      fill={color}
      opacity={0.95}
    />
    <path
      d={`M-${s * 2.2},0 L0,-${s * 0.22} L${s * 2.2},0 L0,${s * 0.22} Z`}
      fill={color}
      opacity={0.95}
    />

    {/* 4 диагональных луча — тонкие, длина ~88% от главных */}
    <line x1={-s * 1.94} y1={-s * 1.94} x2={s * 1.94} y2={s * 1.94}
      stroke={color} strokeWidth={s * 0.07} strokeLinecap="round" opacity={0.75} />
    <line x1={s * 1.94} y1={-s * 1.94} x2={-s * 1.94} y2={s * 1.94}
      stroke={color} strokeWidth={s * 0.07} strokeLinecap="round" opacity={0.75} />

    {/* Яркое белое ядро */}
    <circle r={s * 0.28} fill="#ffffff" />
    <circle r={s * 0.14} fill="#ffffff" opacity={0.9} />
  </g>
);

export default StarShape;
