'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { ConstellationLine } from '../types';

interface Props {
  lines: ConstellationLine[];
}

/**
 * Линии созвездия — постоянные (не перерисовываются),
 * с лёгким мерцанием/свечением + бегущая яркая точка-импульс
 * по линии от A к B (как сигнал между звёздами).
 */
const ConstellationLines: React.FC<Props> = ({ lines }) => (
  <>
    {lines.map((ln, i) => (
      <g key={ln.key}>
        {/* Постоянная линия с пульсирующим свечением */}
        <motion.line
          x1={ln.x1}
          y1={ln.y1}
          x2={ln.x2}
          y2={ln.y2}
          stroke="rgba(255, 230, 195, 0.85)"
          strokeWidth={0.28}
          strokeLinecap="round"
          animate={{ opacity: [0.6, 0.95, 0.6] }}
          transition={{ duration: 4 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ filter: 'drop-shadow(0 0 1.2px rgba(255, 230, 195, 0.9))' }}
        />

        {/* Бегущая яркая точка-импульс */}
        <motion.circle
          r={0.55}
          fill="#ffffff"
          animate={{
            cx: [ln.x1, ln.x2],
            cy: [ln.y1, ln.y2],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 2.4,
            times: [0, 0.15, 0.85, 1],
            repeat: Infinity,
            repeatDelay: 4 + i * 0.7,
            delay: i * 1.3,
            ease: 'easeInOut',
          }}
          style={{ filter: 'drop-shadow(0 0 1.8px rgba(255, 240, 210, 1))' }}
        />
      </g>
    ))}
  </>
);

export default ConstellationLines;
