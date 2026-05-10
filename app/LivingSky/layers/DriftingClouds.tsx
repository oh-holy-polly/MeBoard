'use client';

import React from 'react';
import { motion } from 'framer-motion';

const CLOUDS = [
  { top: '8%',  width: '55%', height: '18%', color: 'rgba(255, 220, 230, 0.55)', duration: 38, delay: 0 },
  { top: '25%', width: '70%', height: '22%', color: 'rgba(220, 200, 255, 0.45)', duration: 52, delay: -18 },
  { top: '45%', width: '60%', height: '20%', color: 'rgba(255, 210, 190, 0.50)', duration: 44, delay: -10 },
  { top: '62%', width: '75%', height: '24%', color: 'rgba(255, 225, 200, 0.48)', duration: 30, delay: -22 },
  { top: '15%', width: '45%', height: '16%', color: 'rgba(200, 190, 255, 0.40)', duration: 60, delay: -35 },
];

const DriftingClouds: React.FC = () => (
  <>
    {CLOUDS.map((c, i) => (
      <motion.div
        key={i}
        aria-hidden
        initial={{ x: '-70%' }}
        animate={{ x: '120%' }}
        transition={{
          duration: c.duration,
          delay: c.delay,
          repeat: Infinity,
          ease: 'linear',
          repeatType: 'loop',
        }}
        style={{
          position: 'absolute',
          left: 0,
          top: c.top,
          width: c.width,
          height: c.height,
          background: `radial-gradient(ellipse 60% 100% at 50% 50%, ${c.color} 0%, transparent 75%)`,
          filter: 'blur(14px)',
          zIndex: 5,
          pointerEvents: 'none',
          willChange: 'transform',
        }}
      />
    ))}
  </>
);

export default DriftingClouds;
