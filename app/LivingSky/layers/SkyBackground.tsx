'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Растровый фон неба + 4 анимированных градиентных слоя
 * с mix-blend-mode: overlay/screen для свечения изнутри.
 */
const SkyBackground: React.FC = () => (
  <>
    <img
      src="/sky-bg.jpg"
      alt=""
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        zIndex: 0,
        userSelect: 'none',
      }}
    />

    {/* Глубокий индиго (overlay) */}
    <motion.div
      aria-hidden
      animate={{ opacity: [0.55, 0.75, 0.55] }}
      transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(ellipse 70% 60% at 25% 20%, rgba(72, 52, 212, 0.6) 0%, transparent 60%)',
        mixBlendMode: 'overlay',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />

    {/* Приглушённый фиолетовый (screen) */}
    <motion.div
      aria-hidden
      animate={{ opacity: [0.5, 0.7, 0.5], x: ['-2%', '2%', '-2%'] }}
      transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(ellipse 65% 55% at 75% 30%, rgba(138, 110, 196, 0.5) 0%, transparent 60%)',
        mixBlendMode: 'screen',
        zIndex: 2,
        pointerEvents: 'none',
      }}
    />

    {/* Закатный розовый (screen) */}
    <motion.div
      aria-hidden
      animate={{ opacity: [0.45, 0.7, 0.45] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(ellipse 70% 55% at 30% 78%, rgba(244, 114, 182, 0.5) 0%, transparent 58%)',
        mixBlendMode: 'screen',
        zIndex: 3,
        pointerEvents: 'none',
      }}
    />

    {/* Персик (screen) */}
    <motion.div
      aria-hidden
      animate={{ opacity: [0.4, 0.65, 0.4] }}
      transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(ellipse 65% 50% at 80% 88%, rgba(253, 186, 116, 0.55) 0%, transparent 58%)',
        mixBlendMode: 'screen',
        zIndex: 4,
        pointerEvents: 'none',
      }}
    />
  </>
);

export default SkyBackground;
