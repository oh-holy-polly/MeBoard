import React from 'react';

interface Props {
  size: number;
  color?: string;
}

const StarShape: React.FC<Props> = ({ size: s, color = '#fff5dc' }) => (
  <g>
    {/* Свечение вокруг */}
    <circle r={s * 1.3} fill="rgba(255, 240, 180, 0.15)" />
    <circle r={s * 0.75} fill="rgba(255, 245, 210, 0.25)" />

    {/* 4 главных луча — широкие у основания, острые к концу */}
    <path d={`M0,-${s*2.5} L${s*0.38},0 L0,${s*2.5} L-${s*0.38},0 Z`} fill={color} opacity={0.97} />
    <path d={`M-${s*2.5},0 L0,-${s*0.38} L${s*2.5},0 L0,${s*0.38} Z`} fill={color} opacity={0.97} />

    {/* 4 диагональных луча — острые, длина ~82% от главных */}
    <path d={`M-${s*2.05},-${s*2.05} L${s*0.18},0 L${s*2.05},${s*2.05} L-${s*0.18},0 Z`} fill={color} opacity={0.82} />
    <path d={`M${s*2.05},-${s*2.05} L-${s*0.18},0 L-${s*2.05},${s*2.05} L${s*0.18},0 Z`} fill={color} opacity={0.82} />

    {/* Яркое белое ядро */}
    <circle r={s * 0.3} fill="#ffffff" />
    <circle r={s * 0.15} fill="#ffffff" />
  </g>
);

export default StarShape;
