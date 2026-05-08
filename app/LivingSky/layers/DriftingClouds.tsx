'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * 3 полупрозрачных облачных слоя, плывут слева направо.
 * Разная скорость и сдвиги по фазе — небо ощущается живым.
 */
const CLOUDS = [
  { top: '12%', height: '22%', color: 'rgba(244, 114, 182, 0.22)', duration: 78, delay: 0 },
  { top: '38%', height: '20%', color: 'rgba(255, 200, 180, 0.20)', duration: 92, delay: -32 },
  { top: '58%', height: '24%', color: 'rgba(255, 220, 195, 0.18)', duration: 66, delay: -55 },
];

const DriftingClouds: React.FC = () => (
  <>
    {CLOUDS.map((c, i) => (
      <motion.div
        key={i}
        aria-hidden
        animate={{ x: ['-40%', '140%'] }}
        transition={{
          duration: c.duration,
          repeat: Infinity,
          ease: 'linear',
          delay: c.delay,
        }}
        style={{
          position: 'absolute',
          left: 0,
          top: c.top,
          width: '70%',
          height: c.height,
          background: `radial-gradient(ellipse 50% 100% at 50% 50%, ${c.color} 0%, transparent 70%)`,
          filter: 'blur(34px)',
          mixBlendMode: 'screen',
          zIndex: 5,
          pointerEvents: 'none',
        }}
      />
    ))}
  </>
);

export default DriftingClouds;
