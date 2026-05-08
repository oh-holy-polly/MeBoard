'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { mulberry32 } from '../lib/seededRandom';

interface Meteor {
  id: number;
  x1: number;
  y1: number;
  cx: number;
  cy: number;
  x2: number;
  y2: number;
}

/**
 * Падающие звёзды — изогнутая траектория (Bezier-кривая Q),
 * pathLength анимируется от 0 до 1 за 1.6 сек,
 * появление — случайно раз в 15-25 сек.
 */
const ShootingStars: React.FC = () => {
  const [active, setActive] = useState<Meteor[]>([]);
  const seedRef = useRef(Math.floor(Math.random() * 100_000));
  const counterRef = useRef(0);

  useEffect(() => {
    const rand = mulberry32(seedRef.current);
    let timeout: ReturnType<typeof setTimeout>;

    const spawn = () => {
      counterRef.current += 1;
      const startX = rand() * 100;
      const startY = rand() * 25 - 5;
      const dir = rand() > 0.5 ? 1 : -1;
      const endX = startX + (40 + rand() * 35) * dir;
      const endY = startY + 55 + rand() * 30;

      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      const perpDx = -(endY - startY);
      const perpDy = endX - startX;
      const len = Math.sqrt(perpDx * perpDx + perpDy * perpDy) || 1;
      const curveAmount = 14 + rand() * 18;
      const cx = midX + (perpDx / len) * curveAmount;
      const cy = midY + (perpDy / len) * curveAmount;

      const m: Meteor = {
        id: counterRef.current,
        x1: startX,
        y1: startY,
        cx,
        cy,
        x2: endX,
        y2: endY,
      };

      setActive((arr) => [...arr, m]);
      setTimeout(() => {
        setActive((arr) => arr.filter((x) => x.id !== m.id));
      }, 1700);

      const nextDelay = 15_000 + rand() * 10_000;
      timeout = setTimeout(spawn, nextDelay);
    };

    timeout = setTimeout(spawn, 3000 + rand() * 5000);
    return () => clearTimeout(timeout);
  }, []);

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
        overflow: 'visible',
      }}
      aria-hidden
    >
      <AnimatePresence>
        {active.map((m) => {
          const path = `M${m.x1} ${m.y1} Q${m.cx} ${m.cy} ${m.x2} ${m.y2}`;
          return (
            <motion.path
              key={m.id}
              d={path}
              stroke="rgba(255, 245, 220, 1)"
              strokeWidth={0.16}
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 0.95, 0.6, 0] }}
              transition={{
                duration: 1.6,
                ease: [0.22, 0.61, 0.36, 1],
                times: [0, 0.18, 0.55, 1],
              }}
              style={{ filter: 'drop-shadow(0 0 0.9px rgba(255, 245, 220, 1)) drop-shadow(0 0 2.4px rgba(255, 220, 180, 0.7))' }}
            />
          );
        })}
      </AnimatePresence>
    </svg>
  );
};

export default ShootingStars;
