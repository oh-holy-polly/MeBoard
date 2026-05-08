'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * 3 полупрозрачных облачных слоя, плывут слева направо.
 * Разная скорость и стартовая позиция — небо ощущается живым.
 */
const CLOUDS = [
  { top: '12%', height: '22%', color: 'rgba(244, 114, 182, 0.35)', duration: 38, startX: '-50%' },
  { top: '38%', height: '20%', color: 'rgba(255, 200, 180, 0.32)', duration: 52, startX: '20%' },
  { top: '58%', height: '24%', color: 'rgba(255, 220, 195, 0.30)', duration: 30, startX: '60%' },
];

const DriftingClouds: React.FC = () => (
  <>
    {CLOUDS.map((c, i) => (
      <motion.div
        key={i}
        aria-hidden
        initial={{ x: c.startX }}
        animate={{ x: ['-50%', '180%'] }}
        transition={{
          duration: c.duration,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          position: 'absolute',
          left: 0,
          top: c.top,
          width: '60%',
          height: c.height,
          background: `radial-gradient(ellipse 50% 100% at 50% 50%, ${c.color} 0%, transparent 70%)`,
          filter: 'blur(24px)',
          mixBlendMode: 'screen',
          zIndex: 5,
          pointerEvents: 'none',
        }}
      />
    ))}
  </>
);

export default DriftingClouds;
📁 Файл 2: app/LivingSky/layers/ShootingStars.tsx
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
📁 Файл 3: app/LivingSky/stars/CenterStar.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import StarShape from './StarShape';

/**
 * Центральная (8-я) звезда. Всегда активна, без подписи.
 * Дополнительно — расходящиеся «волны энергии» (3 круга,
 * стартующие со сдвигом по фазе, имитируют пульс на воде).
 */
const CenterStar: React.FC = () => (
  <g transform="translate(50 50)">
    {/* Волны энергии */}
    {[0, 1, 2].map((i) => (
      <motion.circle
        key={i}
        cx={0}
        cy={0}
        r={4}
        fill="none"
        stroke="rgba(255, 235, 200, 0.7)"
        strokeWidth={0.08}
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: [0, 0.4, 0], scale: [0.4, 3.8, 4.4] }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeOut',
          delay: i * 3,
        }}
        style={{ transformOrigin: 'center' }}
      />
    ))}

    {/* Тело центральной звезды + ореол */}
    <motion.g
      initial={{ opacity: 0.6, scale: 0.85 }}
      animate={{ opacity: [0.85, 1, 0.85], scale: [0.95, 1.08, 0.95] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      style={{ filter: 'url(#ls-glow-strong)', transformOrigin: 'center' }}
    >
      <StarShape size={3.4} />
      <circle r={4.6} fill="none" stroke="rgba(255, 245, 220, 0.55)" strokeWidth={0.13} />
    </motion.g>
  </g>
);

export default CenterStar;
📁 Файл 4: app/LivingSky/stars/DayStar.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import StarShape from './StarShape';
import type { EnrichedStar } from '../types';

const DAY_LABELS_RU: Record<EnrichedStar['day'], string> = {
  Mon: 'Пн',
  Tue: 'Вт',
  Wed: 'Ср',
  Thu: 'Чт',
  Fri: 'Пт',
  Sat: 'Сб',
  Sun: 'Вс',
};

interface Props {
  star: EnrichedStar;
  index: number;
}

/**
 * Звезда дня недели. Видна всегда (Вариант B).
 * Уровень (LVL 0..3) масштабирует размер ореола, силу свечения и яркость пульсации.
 * Усиленное мерцание: opacity 0.4↔1.0, scale 0.88↔1.12.
 */
const DayStar: React.FC<Props> = ({ star, index }) => {
  const haloR = 2.0 + star.level * 0.9;
  const starSize = 0.85 + star.level * 0.45;
  const flickerDur = 2.4 + ((index * 1.1) % 2.2);
  const flickerDelay = (index * 0.71) % 4;

  const labelY = haloR + 4.2;
  const lvlY = labelY + 3.2;

  const glowFilter =
    star.level === 3 ? 'url(#ls-glow-strong)' :
    star.level === 2 ? 'url(#ls-glow-mid)' :
    'url(#ls-glow-soft)';

  const haloMax = 0.4 + star.level * 0.13;
  const haloMin = haloMax * 0.45;

  const starOpacityRange =
    star.level === 0 ? [0.35, 0.7, 0.35] : [0.4, 1.0, 0.4];

  return (
    <g transform={`translate(${star.x} ${star.y})`}>
      {/* Внешний ореол */}
      <motion.circle
        r={haloR}
        fill="none"
        stroke="rgba(255, 245, 220, 0.55)"
        strokeWidth={0.12}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [haloMin, haloMax, haloMin], scale: [0.96, 1.06, 0.96] }}
        transition={{ duration: 5 + index * 0.27, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: 'center' }}
      />

      {/* Внутренний слабый ореол — только для LVL 2-3 (для глубины) */}
      {star.level >= 2 && (
        <motion.circle
          r={haloR * 0.62}
          fill="none"
          stroke="rgba(255, 245, 220, 0.25)"
          strokeWidth={0.1}
          animate={{ opacity: [0.25, 0.55, 0.25] }}
          transition={{ duration: 4 + index * 0.21, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
      )}

      {/* Тело звезды со свечением — усиленное мерцание */}
      <motion.g
        style={{ filter: glowFilter, transformOrigin: 'center' }}
        animate={{ opacity: starOpacityRange, scale: [0.88, 1.12, 0.88] }}
        transition={{ duration: flickerDur, repeat: Infinity, ease: 'easeInOut', delay: flickerDelay }}
      >
        <StarShape size={starSize} />
      </motion.g>

      {/* Название дня */}
      <text
        y={labelY}
        textAnchor="middle"
        fill={star.level === 0 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.95)'}
        fontSize={3.0}
        fontFamily="'Playfair Display', serif"
        style={{ letterSpacing: '0.02em' }}
      >
        {DAY_LABELS_RU[star.day]}
      </text>

      {/* LVL — только для активных дней */}
      {star.level > 0 && (
        <text
          y={lvlY}
          textAnchor="middle"
          fill="rgba(255,255,255,0.7)"
          fontSize={1.7}
          fontFamily="'Inter', sans-serif"
          style={{ letterSpacing: '0.18em' }}
        >
          LVL {star.level}
        </text>
      )}
    </g>
  );
};

export default DayStar;
