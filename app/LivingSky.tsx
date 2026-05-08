'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface LivingSkyProps {
  habitLogs: any[];
  habits: any[];
}

const LivingSky: React.FC<LivingSkyProps> = ({ habitLogs, habits }) => {
  const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const stars = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay();
    const diffToMonday = (currentDay === 0 ? 6 : currentDay - 1);
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);

    // Эстетичное расположение по кругу (чуть шире для воздуха)
    const positions = [
      { x: 50, y: 18 },  // Top
      { x: 75, y: 30 },  // Top-Right
      { x: 82, y: 55 },  // Right
      { x: 68, y: 80 },  // Bottom-Right
      { x: 32, y: 80 },  // Bottom-Left
      { x: 18, y: 55 },  // Left
      { x: 25, y: 30 },  // Top-Left
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
      height: '550px',
      borderRadius: '40px',
      overflow: 'hidden',
      background: '#2d3436', // Fallback
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      userSelect: 'none'
    }}>
      {/* 1. ГЛУБОКИЙ ХУДОЖЕСТВЕННЫЙ ФОН (Многослойный градиент) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(circle at 50% 0%, #4a4e69 0%, transparent 70%),
          radial-gradient(circle at 0% 100%, #9a8c98 0%, transparent 50%),
          radial-gradient(circle at 100% 100%, #c9ada7 0%, transparent 50%),
          linear-gradient(180deg, #22223b 0%, #4a4e69 40%, #9a8c98 75%, #f2e9e4 100%)
        `,
        opacity: 1
      }} />

      {/* 2. СВЕТОВЫЕ ПЯТНА (Nebula Glow) */}
      <motion.div 
        animate={{ opacity: [0.4, 0.6, 0.4], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
        style={{
          position: 'absolute',
          top: '10%', left: '20%', width: '60%', height: '40%',
          background: 'radial-gradient(circle, rgba(154, 140, 152, 0.4) 0%, transparent 70%)',
          filter: 'blur(60px)',
          mixBlendMode: 'screen'
        }} 
      />

      {/* 3. ОБЛАКА (Фактурные слои внизу) */}
      <div style={{
        position: 'absolute',
        bottom: '-5%', left: 0, right: 0, height: '40%',
        background: 'linear-gradient(to top, rgba(242, 233, 228, 0.8) 0%, rgba(242, 233, 228, 0.3) 40%, transparent 100%)',
        filter: 'blur(20px)',
        mixBlendMode: 'overlay'
      }} />
      
      {/* 4. ЗВЕЗДНАЯ ПЫЛЬ */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)',
        backgroundSize: '45px 45px',
        opacity: 0.4
      }} />

      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', overflow: 'visible' }}>
        <defs>
          {/* Фильтр для мягкого сияния звезд */}
          <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          {/* Градиент для лучей */}
          <radialGradient id="rayGradient">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ЦЕНТРАЛЬНАЯ СЕТКА (Призрачная) */}
        <g opacity="0.08">
          {[15, 30, 45].map(r => (
            <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="white" strokeWidth="0.1" />
          ))}
          <line x1="50" y1="5" x2="50" y2="95" stroke="white" strokeWidth="0.05" />
          <line x1="5" y1="50" x2="95" y2="50" stroke="white" strokeWidth="0.05" />
        </g>

        {/* ЦЕНТРАЛЬНАЯ ЗВЕЗДА */}
        <g transform="translate(50, 50)">
          <circle r="0.6" fill="white" filter="url(#softGlow)" />
          <line x1="-2" y1="0" x2="2" y2="0" stroke="white" strokeWidth="0.1" opacity="0.5" />
          <line x1="0" y1="-2" x2="0" y2="2" stroke="white" strokeWidth="0.1" opacity="0.5" />
        </g>

        {/* ЛИНИИ СОЗВЕЗДИЯ */}
        {stars.map((star, i) => {
          const nextStar = stars[(i + 1) % stars.length];
          if (!star.active || !nextStar.active) return null;
          return (
            <motion.line
              key={`line-${i}`}
              x1={star.x} y1={star.y} x2={nextStar.x} y2={nextStar.y}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="0.25"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2 }}
            />
          );
        })}

        {/* ЗВЕЗДЫ (Как на референсе) */}
        {stars.map((star, i) => (
          <g key={star.id}>
            {/* Внешний тонкий круг */}
            <circle 
              cx={star.x} cy={star.y} r="6.5" 
              fill="none" 
              stroke="white" 
              strokeWidth="0.08" 
              opacity={star.active ? 0.4 : 0.1} 
            />
            
            {/* Свечение (Halo) */}
            {star.active && (
              <motion.circle
                cx={star.x} cy={star.y} r={7 + star.lvl}
                fill="rgba(255, 255, 255, 0.1)"
                animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            )}

            {/* Звезда-перекрестие */}
            <g transform={`translate(${star.x}, ${star.y})`}>
              {/* Ядро */}
              <motion.circle 
                r={star.active ? 1.2 : 0.4} 
                fill="white" 
                filter={star.active ? "url(#softGlow)" : "none"}
                animate={star.active ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              />
              {/* Лучи (Тонкие и длинные) */}
              <line x1="-3" y1="0" x2="3" y2="0" stroke="white" strokeWidth="0.15" opacity={star.active ? 0.8 : 0.2} />
              <line x1="0" y1="-3" x2="0" y2="3" stroke="white" strokeWidth="0.15" opacity={star.active ? 0.8 : 0.2} />
            </g>

            {/* Подпись (Эстетичная типографика) */}
            <foreignObject x={star.x - 15} y={star.y + 7} width="30" height="20">
              <div style={{
                textAlign: 'center',
                color: 'white',
                fontFamily: 'serif',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textShadow: '0 2px 10px rgba(0,0,0,0.4)'
              }}>
                <div style={{ 
                  fontSize: '3.8px', 
                  letterSpacing: '0.6px', 
                  fontWeight: 300,
                  opacity: star.active ? 1 : 0.3 
                }}>
                  {star.name}
                </div>
                {star.active && (
                  <div style={{ 
                    fontSize: '2.4px', 
                    textTransform: 'uppercase', 
                    letterSpacing: '1px',
                    marginTop: '1px',
                    opacity: 0.6
                  }}>
                    LVL {star.lvl}
                  </div>
                )}
              </div>
            </foreignObject>
          </g>
        ))}
      </svg>

      {/* МЕРЦАЮЩИЕ ЧАСТИЦЫ */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + '%', 
              y: Math.random() * 100 + '%', 
              opacity: Math.random() * 0.4 
            }}
            animate={{ 
              opacity: [0.1, 0.4, 0.1],
              y: ['-2%', '2%']
            }}
            transition={{ 
              duration: 4 + Math.random() * 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            style={{
              position: 'absolute',
              width: '1.5px', height: '1.5px',
              background: 'white',
              borderRadius: '50%',
              boxShadow: '0 0 5px rgba(255,255,255,0.5)'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LivingSky;
