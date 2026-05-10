'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { ConstellationLine } from '../types';

interface Props {
  lines: ConstellationLine[];
}

const ConstellationLines: React.FC<Props> = ({ lines }) => (
  <>
    <defs>
      {lines.map((ln) => (
        <linearGradient
          key={`grad-${ln.key}`}
          id={`grad-${ln.key}`}
          x1={ln.x1} y1={ln.y1}
          x2={ln.x2} y2={ln.y2}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor="#ffdca0" stopOpacity={0} />
          <stop offset="25%"  stopColor="#ffdca0" stopOpacity={0.8} />
          <stop offset="50%"  stopColor="#ffe8b0" stopOpacity={1} />
          <stop offset="75%"  stopColor="#ffdca0" stopOpacity={0.8} />
          <stop offset="100%" stopColor="#ffdca0" stopOpacity={0} />
        </linearGradient>
      ))}
    </defs>

    {lines.map((ln, i) => (
      <motion.line
        key={ln.key}
        x1={ln.x1} y1={ln.y1}
        x2={ln.x2} y2={ln.y2}
        stroke={`url(#grad-${ln.key})`}
        strokeWidth={0.45}
        strokeLinecap="round"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 4 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ filter: 'drop-shadow(0 0 1.5px rgba(255, 220, 150, 0.8))' }}
      />
    ))}
  </>
);

export default ConstellationLines;
