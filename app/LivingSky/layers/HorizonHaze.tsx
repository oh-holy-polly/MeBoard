'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Нижняя дымка / горизонт с мягким свечением.
 */
const HorizonHaze: React.FC = () => (
  <>
    <motion.div
      aria-hidden
      animate={{ x: ['-3%', '3%', '-3%'], opacity: [0.85, 1, 0.85] }}
      transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        left: '-12%',
        right: '-12%',
        bottom: 0,
        height: '40%',
        background:
          'linear-gradient(to top, rgba(253, 186, 116, 0.55) 0%, rgba(244, 114, 182, 0.25) 45%, transparent 100%)',
        filter: 'blur(48px)',
        mixBlendMode: 'screen',
        zIndex: 6,
        pointerEvents: 'none',
      }}
    />
    <div
      aria-hidden
      style={{
        position: 'absolute',
        left: '-15%',
        right: '-15%',
        bottom: '-6%',
        height: '28%',
        background:
          'radial-gradient(ellipse at 50% 100%, rgba(255, 220, 180, 0.4) 0%, transparent 70%)',
        filter: 'blur(64px)',
        mixBlendMode: 'screen',
        zIndex: 7,
        pointerEvents: 'none',
      }}
    />
  </>
);

export default HorizonHaze;
