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
        stroke="rgba(255, 230, 195, 0.6)"
        strokeWidth={0.18}
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: [0, 0.55, 0], scale: [0.4, 4.5, 5] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeOut',
          delay: i * 2.7,
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
