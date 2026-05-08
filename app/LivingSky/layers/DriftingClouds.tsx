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
