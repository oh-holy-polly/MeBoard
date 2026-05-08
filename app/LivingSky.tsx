'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StarData {
  id: number;
  name: string;
  x: number;
  y: number;
  lvl: number;
  active: boolean;
}

interface LivingSkyProps {
  habitLogs: any[];
  habits: any[];
}

const LivingSky: React.FC<LivingSkyProps> = ({ habitLogs, habits }) => {
  // Генерация позиций звезд на основе текущей недели года
  const stars = useMemo(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((((now.getTime() - startOfYear.getTime()) / 86400000) + startOfYear.getDay() + 1) / 7);
    
    const seed = (n: number) => {
      const x = Math.sin(weekNumber * 13.37 + n * 42.42) * 10000;
      return x - Math.floor(x);
    };

    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    
    const currentDay = now.getDay();
    const diffToMonday = (currentDay === 0 ? 6 : currentDay - 1);
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);

    return days.map((day, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const isToday = dateStr === now.toISOString().split('T')[0];

      // Расчет LVL на основе логов
      // Если это сегодня, проверяем текущее состояние привычек
      let dayLogs;
      if (isToday) {
        dayLogs = habits.filter(h => h.is_completed);
      } else {
        dayLogs = habitLogs.filter(l => l.date === dateStr && l.completed);
      }
      
      const totalHabits = habits.length;
      let lvl = 0;
      let active = false;

      if (totalHabits > 0) {
        const completionRate = dayLogs.length / totalHabits;
        active = dayLogs.length > 0;
        if (completionRate === 1) lvl = 3;
        else if (completionRate >= 0.5) lvl = 2;
        else if (completionRate > 0) lvl = 1;
      }

      // Координаты (в процентах)
      return {
        id: i,
        name: day,
        x: 15 + seed(i * 2) * 70,
        y: 15 + seed(i * 2 + 1) * 60,
        lvl,
        active
      };
    });
  }, [habitLogs, habits]);

  const totalActivity = useMemo(() => {
    if (habits.length === 0) return 0;
    const activeStars = stars.filter(s => s.active).length;
    return activeStars / 7;
  }, [stars, habits.length]);

  return (
    <div className="living-sky-container" style={{
      position: 'relative',
      width: '100%',
      height: 'min(70vh, 450px)',
      borderRadius: '32px',
      overflow: 'hidden',
      background: `linear-gradient(135deg, 
        ${totalActivity > 0.7 ? '#1a1a2e' : '#2c3e50'} 0%, 
        ${totalActivity > 0.7 ? '#16213e' : '#4ca1af'} 50%, 
        ${totalActivity > 0.7 ? '#e94560' : '#ff5f6d'} 100%)`,
      transition: 'background 3s ease',
      boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 0 100px rgba(0,0,0,0.2)',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      {/* Эффект туманности (Nebula) */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 10, repeat: Infinity }}
        style={{
          position: 'absolute',
          top: '-20%', left: '-20%', width: '140%', height: '140%',
          background: 'radial-gradient(circle at 30% 30%, rgba(103, 58, 183, 0.2) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(233, 69, 96, 0.15) 0%, transparent 50%)',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }} 
      />
      {/* Звездная пыль */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
        backgroundSize: '40px 40px',
        opacity: 0.5,
        pointerEvents: 'none'
      }} />

      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Линии созвездия */}
        {stars.map((star, i) => {
          if (i === 0) return null;
          const prevStar = stars[i - 1];
          if (!star.active || !prevStar.active) return null;

          return (
            <motion.line
              key={`line-${i}`}
              x1={`${prevStar.x}%`}
              y1={`${prevStar.y}%`}
              x2={`${star.x}%`}
              y2={`${star.y}%`}
              stroke="rgba(255, 215, 135, 0.4)"
              strokeWidth="1.5"
              strokeDasharray="4 2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, delay: i * 0.3 }}
            />
          );
        })}

        {/* Звезды */}
        {stars.map((star, i) => (
          <g key={star.id}>
            {star.active && (
              <>
                {/* Внешнее сияние */}
                <motion.circle
                  cx={`${star.x}%`}
                  cy={`${star.y}%`}
                  r={star.lvl * 6 + 4}
                  fill="rgba(255, 215, 135, 0.15)"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.1, 0.3, 0.1]
                  }}
                  transition={{ duration: 4, repeat: Infinity, delay: i * 0.4 }}
                />
                {/* Лучи звезды (как на референсе) */}
                <motion.g
                  initial={{ opacity: 0, rotate: 0 }}
                  animate={{ opacity: 1, rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <line x1={`${star.x}%`} y1={`${star.y - 2 - star.lvl}%`} x2={`${star.x}%`} y2={`${star.y + 2 + star.lvl}%`} stroke="#ffd787" strokeWidth="0.5" />
                  <line x1={`${star.x - 2 - star.lvl}%`} y1={`${star.y}%`} x2={`${star.x + 2 + star.lvl}%`} y2={`${star.y}%`} stroke="#ffd787" strokeWidth="0.5" />
                </motion.g>
              </>
            )}
            
            {/* Основное тело звезды */}
            <motion.circle
              cx={`${star.x}%`}
              cy={`${star.y}%`}
              r={star.active ? 2.5 + star.lvl : 1.5}
              fill={star.active ? "#ffd787" : "rgba(255,255,255,0.2)"}
              filter={star.active ? "url(#glow)" : "none"}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10, delay: i * 0.1 }}
            />

            {/* Подпись */}
            <foreignObject
              x={`${star.x - 15}%`}
              y={`${star.y + 3}%`}
              width="30%"
              height="60"
              style={{ textAlign: 'center', pointerEvents: 'none', overflow: 'visible' }}
            >
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                marginTop: '8px'
              }}>
                <span style={{
                  color: star.active ? 'white' : 'rgba(255,255,255,0.4)',
                  fontSize: '0.8rem',
                  fontWeight: 300,
                  fontFamily: 'var(--font-serif)',
                  letterSpacing: '0.05em',
                  textShadow: star.active ? '0 2px 10px rgba(0,0,0,0.5)' : 'none'
                }}>
                  {star.name}
                </span>
                {star.active && (
                  <motion.span 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      color: '#ffd787',
                      fontSize: '0.6rem',
                      fontWeight: 500,
                      letterSpacing: '0.1em',
                      opacity: 0.8
                    }}
                  >
                    LVL {star.lvl}
                  </motion.span>
                )}
              </div>
            </foreignObject>
          </g>
        ))}
      </svg>

      <MeteorShower />
    </div>
  );
};

const MeteorShower = () => {
  const [meteors, setMeteors] = useState<{id: number, x: number, y: number}[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const id = Date.now();
        setMeteors(prev => [...prev, { id, x: Math.random() * 80 + 10, y: Math.random() * 40 }]);
        setTimeout(() => {
          setMeteors(prev => prev.filter(m => m.id !== id));
        }, 1000);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {meteors.map(m => (
        <motion.div
          key={m.id}
          initial={{ x: `${m.x}%`, y: `${m.y}%`, opacity: 0, width: 0 }}
          animate={{ x: `${m.x - 20}%`, y: `${m.y + 20}%`, opacity: [0, 1, 0], width: '80px' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            position: 'absolute',
            height: '1px',
            background: 'linear-gradient(to left, white, transparent)',
            transform: 'rotate(-45deg)',
            pointerEvents: 'none'
          }}
        />
      ))}
    </AnimatePresence>
  );
};

export default LivingSky;
