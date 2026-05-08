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
 * Усиленное мерцание: opacity 0.4↔1.0, scale 0.92↔1.08.
 */
const DayStar: React.FC<Props> = ({ star, index }) => {
  const haloR = 2.0 + star.level * 0.9;
  const starSize = 0.85 + star.level * 0.45;
  const flickerDur = 3 + ((index * 1.3) % 3);
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
        animate={{ opacity: starOpacityRange, scale: [0.92, 1.08, 0.92] }}
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
