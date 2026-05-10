import React from 'react';

interface Props {
  size: number;
  color?: string;
}

const StarShape: React.FC<Props> = ({ size: s, color = '#fff5dc' }) => (
  <g>
    {/* Мягкое свечение вокруг */}
    <circle r={s * 1.2} fill="rgba(255, 240, 180, 0.15)" />
    <circle r={s * 0.7} fill="rgba(255, 245, 210, 0.28)" />

    {/* 4 главных луча — очень пухлые */}
    <path
      d={`M0,-${s * 2.4} C${s * 0.5},-${s * 0.5} ${s * 0.5},-${s * 0.5} 0,0 C-${s * 0.5},-${s * 0.5} -${s * 0.5},-${s * 0.5} 0,-${s * 2.4} Z`}
      fill={color} opacity={0.95}
    />
    <path
      d={`M0,${s * 2.4} C${s * 0.5},${s * 0.5} ${s * 0.5},${s * 0.5} 0,0 C-${s * 0.5},${s * 0.5} -${s * 0.5},${s * 0.5} 0,${s * 2.4} Z`}
      fill={color} opacity={0.95}
    />
    <path
      d={`M-${s * 2.4},0 C-${s * 0.5},-${s * 0.5} -${s * 0.5},-${s * 0.5} 0,0 C-${s * 0.5},${s * 0.5} -${s * 0.5},${s * 0.5} -${s * 2.4},0 Z`}
      fill={color} opacity={0.95}
    />
    <path
      d={`M${s * 2.4},0 C${s * 0.5},-${s * 0.5} ${s * 0.5},-${s * 0.5} 0,0 C${s * 0.5},${s * 0.5} ${s * 0.5},${s * 0.5} ${s * 2.4},0 Z`}
      fill={color} opacity={0.95}
    />

    {/* 4 диагональных луча — тонкие, короче (~65% длины главных) */}
    <line x1={-s * 1.55} y1={-s * 1.55} x2={s * 1.55} y2={s * 1.55}
      stroke={color} strokeWidth={s * 0.09} strokeLinecap="round" opacity={0.7} />
    <line x1={s * 1.55} y1={-s * 1.55} x2={-s * 1.55} y2={s * 1.55}
      stroke={color} strokeWidth={s * 0.09} strokeLinecap="round" opacity={0.7} />

    {/* Яркое белое ядро */}
    <circle r={s * 0.32} fill="#ffffff" />
  </g>
);

export default StarShape;
