'use client';

import React from 'react';

/**
 * 3 полупрозрачных облачных слоя, плывут слева направо.
 * Реализовано через чистый CSS @keyframes — надёжнее, чем framer-motion
 * для бесконечной линейной прокрутки transform на элементах
 * с mixBlendMode + blur (там у framer-motion бывают застревания).
 */
const CLOUDS = [
  { top: '12%', height: '22%', color: 'rgba(244, 114, 182, 0.42)', duration: 38, delay: 0 },
  { top: '38%', height: '20%', color: 'rgba(255, 200, 180, 0.38)', duration: 52, delay: -18 },
  { top: '58%', height: '24%', color: 'rgba(255, 220, 195, 0.36)', duration: 30, delay: -22 },
];

const DriftingClouds: React.FC = () => (
  <>
    <style>{`
      @keyframes ls-cloud-drift {
        from { transform: translateX(-50%); }
        to   { transform: translateX(180%); }
      }
    `}</style>
    {CLOUDS.map((c, i) => (
      <div
        key={i}
        aria-hidden
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
          animation: `ls-cloud-drift ${c.duration}s linear ${c.delay}s infinite`,
          willChange: 'transform',
        }}
      />
    ))}
  </>
);

export default DriftingClouds;
