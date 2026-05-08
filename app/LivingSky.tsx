'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface LivingSkyProps {
  habitLogs: any[];
  habits: any[];
}

const LivingSky: React.FC<LivingSkyProps> = ({ habitLogs, habits }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const stars = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay();
    const diffToMonday = (currentDay === 0 ? 6 : currentDay - 1);
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);

    // Эстетичное расположение по кругу
    const positions = [
      { x: 50, y: 15 },  // Top
      { x: 78, y: 28 },  // Top-Right
      { x: 85, y: 58 },  // Right
      { x: 68, y: 82 },  // Bottom-Right
      { x: 32, y: 82 },  // Bottom-Left
      { x: 15, y: 58 },  // Left
      { x: 22, y: 28 },  // Top-Left
    ];

    return shortDays.map((day, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const isToday = dateStr === now.toISOString().split('T')[0];

      let dayLogs;
      if (isToday) {
        dayLogs = habits.filter(h => h.is_completed);
      } else {
        dayLogs = habitLogs.filter(l => l.date === dateStr && l.completed);
      }
      
      const totalHabits = habits.length;
      let lvl = 1;
      let active = false;

      if (totalHabits > 0) {
        const completionRate = dayLogs.length / totalHabits;
        active = dayLogs.length > 0;
        if (completionRate === 1) lvl = 3;
        else if (completionRate >= 0.5) lvl = 2;
        else if (completionRate > 0) lvl = 1;
      }

      return {
        id: i,
        fullName: days[i],
        name: day,
        x: positions[i].x,
        y: positions[i].y,
        lvl,
        active
      };
    });
  }, [habitLogs, habits]);

  return (
    <div className="living-sky-container" style={{
      position: 'relative',
      width: '100%',
      height: '600px',
      borderRadius: '48px',
      overflow: 'hidden',
      background: '#1a1a2e', // Базовый темный цвет
      boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.4)',
      userSelect: 'none'
    }}>
      {/* СЛОИ НЕБА ДЛЯ ГЛУБИНЫ */}
      
      {/* 1. Основной художественный градиент */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, #4834d4 0%, #686de0 30%, #95afc0 60%, #ff7979 100%)',
        opacity: 0.8
      }} />

      {/* 2. Туманности (Nebula) */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: 'absolute',
          top: '-10%', left: '-10%', width: '70%', height: '70%',
          background: 'radial-gradient(circle, rgba(104, 109, 224, 0.4) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} 
      />
      <motion.div 
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: 'absolute',
          bottom: '10%', right: '-10%', width: '80%', height: '60%',
          background: 'radial-gradient(circle, rgba(255, 121, 121, 0.3) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }} 
      />

      {/* 3. Облака (Живописная дымка внизу) */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0, height: '35%',
        background: 'linear-gradient(to top, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
        filter: 'blur(15px)',
        mixBlendMode: 'overlay'
      }} />
      
      {/* 4. Звездная пыль (Мелкие точки) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.2) 1px, transparent 0)',
        backgroundSize: '30px 30px',
        maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
      }} />

      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', overflow: 'visible' }}>
        <defs>
          <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <radialGradient id="starRadial">
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* ЦЕНТРАЛЬНАЯ СЕТКА (Изящный радар) */}
        <g opacity="0.1">
          {[12, 24, 36].map(r => (
            <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="white" strokeWidth="0.15" />
          ))}
          <line x1="50" y1="14" x2="50" y2="86" stroke="white" strokeWidth="0.1" />
          <line x1="14" y1="50" x2="86" y2="50" stroke="white" strokeWidth="0.1" />
          <g fontSize="1.5" fill="white" fontFamily="serif" letterSpacing="0.1">
            <text x="50" y="12" textAnchor="middle">N</text>
            <text x="88" y="50.5" textAnchor="middle">E</text>
            <text x="50" y="89" textAnchor="middle">S</text>
            <text x="12" y="50.5" textAnchor="middle">W</text>
          </g>
        </g>

        {/* ЦЕНТРАЛЬНАЯ ЗВЕЗДА */}
        <g transform="translate(50, 50)">
          <circle r="0.8" fill="white" filter="url(#starGlow)" />
          <line x1="-2" y1="0" x2="2" y2="0" stroke="white" strokeWidth="0.15" />
          <line x1="0" y1="-2" x2="0" y2="2" stroke="white" strokeWidth="0.15" />
        </g>

        {/* ЛИНИИ СОЗВЕЗДИЯ (Мягкие связи) */}
        {stars.map((star, i) => {
          const nextStar = stars[(i + 1) % stars.length];
          if (!star.active || !nextStar.active) return null;
          return (
            <motion.line
              key={`line-${i}`}
              x1={star.x} y1={star.y} x2={nextStar.x} y2={nextStar.y}
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="0.3"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          );
        })}

        {/* ЗВЕЗДЫ (Детализация как на референсе) */}
        {stars.map((star, i) => (
          <g key={star.id}>
            {/* 1. Внешний тонкий круг */}
            <circle 
              cx={star.x} cy={star.y} r="5.5" 
              fill="none" 
              stroke="white" 
              strokeWidth="0.1" 
              opacity={star.active ? 0.5 : 0.15} 
            />
            
            {/* 2. Ореол свечения (Halo) */}
            {star.active && (
              <motion.circle
                cx={star.x} cy={star.y} r={6 + star.lvl}
                fill="url(#starRadial)"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.1, 0.25, 0.1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            )}

            {/* 3. Звезда-перекрестие */}
            <g transform={`translate(${star.x}, ${star.y})`}>
              {/* Центральная точка */}
              <motion.circle 
                r={star.active ? 1 : 0.5} 
                fill="white" 
                filter={star.active ? "url(#starGlow)" : "none"}
                animate={star.active ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
              {/* Лучи */}
              <line x1="-2.2" y1="0" x2="2.2" y2="0" stroke="white" strokeWidth="0.15" opacity={star.active ? 0.9 : 0.3} />
              <line x1="0" y1="-2.2" x2="0" y2="2.2" stroke="white" strokeWidth="0.15" opacity={star.active ? 0.9 : 0.3} />
            </g>

            {/* 4. Подпись (Шрифт с засечками как на референсе) */}
            <foreignObject x={star.x - 12} y={star.y + 6} width="24" height="20">
              <div style={{
                textAlign: 'center',
                color: 'white',
                fontFamily: 'serif',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                <div style={{ 
                  fontSize: '3.2px', 
                  letterSpacing: '0.4px', 
                  fontWeight: 400,
                  opacity: star.active ? 1 : 0.4 
                }}>
                  {star.fullName}
                </div>
                {star.active && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    style={{ 
                      fontSize: '2.2px', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.8px',
                      marginTop: '1px'
                    }}
                  >
                    LVL {star.lvl}
                  </motion.div>
                )}
              </div>
            </foreignObject>
          </g>
        ))}
      </svg>

      {/* ЭФФЕКТ МЕРЦАНИЯ (Twinkle) */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + '%', 
              y: Math.random() * 100 + '%', 
              scale: Math.random() * 0.5 + 0.5,
              opacity: Math.random() * 0.3 
            }}
            animate={{ 
              opacity: [0.1, 0.4, 0.1],
              scale: [0.8, 1.1, 0.8]
            }}
            transition={{ 
              duration: 3 + Math.random() * 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            style={{
              position: 'absolute',
              width: '1.5px', height: '1.5px',
              background: 'white',
              borderRadius: '50%',
              boxShadow: '0 0 4px white'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LivingSky;
