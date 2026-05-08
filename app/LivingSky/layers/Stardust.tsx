'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { mulberry32 } from '../lib/seededRandom';

interface Dot {
  x: number;
  y: number;
  r: number;
  dur: number;
  delay: number;
  opacity: number;
}

interface Props {
  count?: number;
  seed?: number;
}

/**
 * 30-50 точечных мерцающих звёзд на фоне неба.
 * Размер, позиция и фаза мерцания — детерминированно по сиду.
 */
const Stardust: React.FC<Props> = ({ count = 45, seed = 7 }) => {
  const dots = useMemo(() => {
    const rand = mulberry32(seed);
    const arr: Dot[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: rand() * 100,
        y: rand() * 100,
        r: 0.08 + rand() * 0.22,
        dur: 2 + rand() * 4,
        delay: rand() * 5,
        opacity: 0.4 + rand() * 0.5,
      });
    }
    return arr;
  }, [count, seed]);

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 6,
        pointerEvents: 'none',
      }}
      aria-hidden
    >
      {dots.map((d, i) => (
        <motion.circle
          key={i}
          cx={d.x}
          cy={d.y}
          r={d.r}
          fill="white"
          animate={{ opacity: [0.05, d.opacity, 0.05] }}
          transition={{
            duration: d.dur,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: d.delay,
          }}
          style={{ filter: 'drop-shadow(0 0 0.4px rgba(255,255,255,0.9))' }}
        />
      ))}
    </svg>
  );
};

export default Stardust;
