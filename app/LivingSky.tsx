'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Public types                                                       */
/* ------------------------------------------------------------------ */

export type DayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface Star {
  day: DayKey;
  /** 0..1 — доля выполненных привычек за этот день недели */
  completion: number;
}

interface LivingSkyProps {
  stars: Star[];
  className?: string;
  style?: React.CSSProperties;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DAY_ORDER: DayKey[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DAY_LABELS_RU: Record<DayKey, string> = {
  Mon: 'Пн',
  Tue: 'Вт',
  Wed: 'Ср',
  Thu: 'Чт',
  Fri: 'Пт',
  Sat: 'Сб',
  Sun: 'Вс',
};

/* ------------------------------------------------------------------ */
/*  Pure helpers                                                       */
/* ------------------------------------------------------------------ */

/** Mulberry32 — детерминированный PRNG */
function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** ISO 8601 week number */
function getISOWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

function levelFromCompletion(c: number): 0 | 1 | 2 | 3 {
  if (c <= 0) return 0;
  if (c >= 1) return 3;
  if (c >= 0.5) return 2;
  return 1;
}

/* ------------------------------------------------------------------ */
/*  Constellation geometry — sacred-geometry на базе гептагона        */
/* ------------------------------------------------------------------ */

interface Pos {
  x: number;
  y: number;
}

function buildConstellation(seed: number): Pos[] {
  const rand = mulberry32(seed);
  const cx = 50;
  const cy = 50;

  // Базовый радиус кольца, в котором живут звёзды (не залезают на компас в центре
  // и оставляют место подписям у краёв)
  const ringMin = 30;
  const ringMax = 41;

  // Случайный «поворот» всей фигуры на эту неделю
  const rotation = rand() * Math.PI * 2;

  // Чтобы получить «сакральную» форму, идём по вершинам гептаграммы
  // (звезды из 7 точек) — берём шаг 2 или 3 от 7. Шаг выбираем по сиду.
  const step = rand() > 0.5 ? 2 : 3;

  const positions: Pos[] = [];
  for (let i = 0; i < 7; i++) {
    const idx = (i * step) % 7;
    const baseAngle = rotation + (idx * 2 * Math.PI) / 7;
    // Лёгкое возмущение угла и радиуса — чтобы фигура не была идеально
    // правильной (живая, рукотворная)
    const angle = baseAngle + (rand() - 0.5) * (Math.PI / 9);
    const r = ringMin + rand() * (ringMax - ringMin);
    positions.push({
      x: cx + Math.cos(angle) * r,
      // Лёгкое вертикальное сжатие — небо «глубже», чем шире
      y: cy + Math.sin(angle) * r * 0.92,
    });
  }
  return positions;
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

const StarShape: React.FC<{ size: number; color?: string }> = ({ size: s, color = '#fff5dc' }) => (
  <g>
    {/* Длинные тонкие лучи — перекрестие (вертикаль + горизонталь) */}
    <line x1={0} y1={-s * 1.9} x2={0} y2={s * 1.9} stroke={color} strokeWidth={s * 0.06} strokeLinecap="round" opacity={0.95} />
    <line x1={-s * 1.9} y1={0} x2={s * 1.9} y2={0} stroke={color} strokeWidth={s * 0.06} strokeLinecap="round" opacity={0.95} />
    {/* Основной 4-конечный «бутон» */}
    <path
      d={`M0,-${s} L${s * 0.18},-${s * 0.18} L${s},0 L${s * 0.18},${s * 0.18} L0,${s} L-${s * 0.18},${s * 0.18} L-${s},0 L-${s * 0.18},-${s * 0.18} Z`}
      fill={color}
    />
    {/* Тонкие диагональные лучи (вторичные) */}
    <path
      d={`M${s * 0.55},-${s * 0.55} L${s * 0.08},-${s * 0.08} L${s * 0.55},${s * 0.55} L${s * 0.08},${s * 0.08} L-${s * 0.55},${s * 0.55} L-${s * 0.08},${s * 0.08} L-${s * 0.55},-${s * 0.55} L-${s * 0.08},-${s * 0.08} Z`}
      fill={color}
      opacity={0.6}
    />
    {/* Ядро — яркая белая точка */}
    <circle r={s * 0.22} fill="#ffffff" />
  </g>
);

const CenterStar: React.FC = () => (
  <motion.g
    transform="translate(50 50)"
    initial={{ opacity: 0, scale: 0.6 }}
    animate={{ opacity: [0.9, 1, 0.9], scale: [1, 1.05, 1] }}
    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    style={{ filter: 'url(#ls-glow-strong)' }}
  >
    <StarShape size={3.4} />
    <circle r={4.6} fill="none" stroke="rgba(255, 245, 220, 0.55)" strokeWidth={0.13} />
  </motion.g>
);

interface DayStarProps {
  star: { day: DayKey; completion: number; x: number; y: number; level: 0 | 1 | 2 | 3; active: boolean };
  index: number;
}

const DayStar: React.FC<DayStarProps> = ({ star, index }) => {
  // LVL влияет на размер ореола и силу свечения
  const haloR = 2.4 + star.level * 1.0; // 2.4 → 5.4
  const starSize = 1.1 + star.level * 0.45; // 1.1 → 2.45
  const flickerDur = 3 + ((index * 1.3) % 3);
  const flickerDelay = (index * 0.71) % 4;

  // Сдвиг подписи вниз — пропорционально размеру ореола
  const labelY = haloR + 4.2;
  const lvlY = labelY + 3.2;

  if (!star.active) {
    // Тусклая точка — без ореола, без линий
    return (
      <g transform={`translate(${star.x} ${star.y})`}>
        <motion.circle
          r={0.55}
          fill="#ffffff"
          initial={{ opacity: 0.15 }}
          animate={{ opacity: [0.1, 0.22, 0.1] }}
          transition={{ duration: flickerDur + 1, repeat: Infinity, ease: 'easeInOut', delay: flickerDelay }}
        />
        <text
          y={4.6}
          textAnchor="middle"
          fill="rgba(255,255,255,0.45)"
          fontSize={2.6}
          fontFamily="'Playfair Display', serif"
          fontStyle="italic"
        >
          {DAY_LABELS_RU[star.day]}
        </text>
      </g>
    );
  }

  // Уровень -> уровень фильтра свечения
  const glowFilter =
    star.level === 3 ? 'url(#ls-glow-strong)' : star.level === 2 ? 'url(#ls-glow-mid)' : 'url(#ls-glow-soft)';

  return (
    <g transform={`translate(${star.x} ${star.y})`}>
      {/* Внешний ореол */}
      <motion.circle
        r={haloR}
        fill="none"
        stroke="rgba(255, 245, 220, 0.55)"
        strokeWidth={0.12}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0.45, 0.75, 0.45], scale: [1, 1.04, 1] }}
        transition={{ duration: 5 + index * 0.27, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Внутренний слабый ореол — для глубины */}
      <motion.circle
        r={haloR * 0.62}
        fill="none"
        stroke="rgba(255, 245, 220, 0.25)"
        strokeWidth={0.1}
        animate={{ opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 4 + index * 0.21, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
      {/* Тело звезды со свечением */}
      <motion.g
        style={{ filter: glowFilter }}
        animate={{ opacity: [0.85, 1, 0.85] }}
        transition={{ duration: flickerDur, repeat: Infinity, ease: 'easeInOut', delay: flickerDelay }}
      >
        <StarShape size={starSize} />
      </motion.g>

      {/* Название дня */}
      <text
        y={labelY}
        textAnchor="middle"
        fill="rgba(255,255,255,0.95)"
        fontSize={3.0}
        fontFamily="'Playfair Display', serif"
        style={{ letterSpacing: '0.02em' }}
      >
        {DAY_LABELS_RU[star.day]}
      </text>
      {/* LVL */}
      <text
        y={lvlY}
        textAnchor="middle"
        fill="rgba(255,255,255,0.7)"
        fontSize={1.7}
        fontFamily="'Inter', sans-serif"
        style={{ letterSpacing: '0.18em' }}
      >
        LVL {star.level}
      </text>
    </g>
  );
};

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

const LivingSky: React.FC<LivingSkyProps> = ({ stars, className, style }) => {
  // Нормализуем массив — порядок Пн..Вс, отсутствующие дни → completion 0
  const ordered = useMemo(() => {
    const map = new Map(stars.map((s) => [s.day, s.completion]));
    return DAY_ORDER.map<{ day: DayKey; completion: number }>((day) => ({
      day,
      completion: Math.max(0, Math.min(1, map.get(day) ?? 0)),
    }));
  }, [stars]);

  // Координаты — детерминированно по ISO-неделе (одна фигура на всю неделю)
  const positions = useMemo(() => {
    const { year, week } = getISOWeek(new Date());
    return buildConstellation(year * 1000 + week);
  }, []);

  const enriched = useMemo(
    () =>
      ordered.map((s, i) => ({
        ...s,
        x: positions[i].x,
        y: positions[i].y,
        level: levelFromCompletion(s.completion),
        active: s.completion > 0,
      })),
    [ordered, positions]
  );

  // Среднее за неделю → глобальный фильтр контейнера
  const weekAvg = useMemo(
    () => enriched.reduce((acc, s) => acc + s.completion, 0) / 7,
    [enriched]
  );
  const brightness = (0.78 + weekAvg * 0.42).toFixed(2); // 0.78 → 1.20
  const saturate = (0.7 + weekAvg * 0.7).toFixed(2); // 0.7 → 1.4
  const hueRotate = ((weekAvg - 0.5) * 12).toFixed(1); // -6° (cool) → +6° (warm)
  const containerFilter = `brightness(${brightness}) saturate(${saturate}) hue-rotate(${hueRotate}deg)`;

  // Линии — между последовательными активными звёздами в порядке Пн→Вс
  const lines = useMemo(() => {
    const ls: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];
    for (let i = 0; i < enriched.length - 1; i++) {
      const a = enriched[i];
      const b = enriched[i + 1];
      if (a.active && b.active) {
        ls.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, key: `${a.day}-${b.day}` });
      }
    }
    return ls;
  }, [enriched]);

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        maxWidth: 760,
        margin: '0 auto',
        borderRadius: 32,
        overflow: 'hidden',
        isolation: 'isolate',
        backgroundColor: '#1a1535',
        filter: containerFilter,
        transition: 'filter 1.2s ease',
        ...style,
      }}
    >
      {/* ── Слой 1: растровый фон неба ───────────────────────────── */}
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

      {/* ── Слой 2: глубокий индиго (overlay) ────────────────────── */}
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

      {/* ── Слой 3: приглушённый фиолетовый (screen) ─────────────── */}
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

      {/* ── Слой 4: закатный розовый (screen) ────────────────────── */}
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

      {/* ── Слой 5: персик (screen) ──────────────────────────────── */}
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

      {/* ── Нижняя дымка / горизонт (мягкий blur) ────────────────── */}
      <motion.div
        aria-hidden
        animate={{ x: ['-3%', '3%', '-3%'] }}
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
          zIndex: 5,
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
          zIndex: 6,
          pointerEvents: 'none',
        }}
      />

      {/* ── Призрачная сетка-радар (центр) ───────────────────────── */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 7,
          opacity: 0.05,
          pointerEvents: 'none',
        }}
      >
        {[6, 12, 18, 24, 30].map((r) => (
          <circle key={r} cx={50} cy={50} r={r} fill="none" stroke="white" strokeWidth={0.18} />
        ))}
        <line x1={50} y1={18} x2={50} y2={82} stroke="white" strokeWidth={0.15} />
        <line x1={18} y1={50} x2={82} y2={50} stroke="white" strokeWidth={0.15} />
        <line x1={28} y1={28} x2={72} y2={72} stroke="white" strokeWidth={0.1} />
        <line x1={72} y1={28} x2={28} y2={72} stroke="white" strokeWidth={0.1} />
        <text x={50} y={17} fill="white" fontSize={1.6} textAnchor="middle">N</text>
        <text x={50} y={84} fill="white" fontSize={1.6} textAnchor="middle">S</text>
        <text x={17} y={51} fill="white" fontSize={1.6} textAnchor="middle">W</text>
        <text x={83} y={51} fill="white" fontSize={1.6} textAnchor="middle">E</text>
      </svg>

      {/* ── SVG-слой со звёздами и линиями созвездия ─────────────── */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 8,
          pointerEvents: 'none',
          overflow: 'visible',
        }}
      >
        <defs>
          {/* 3 уровня свечения — мягкое / среднее / сильное */}
          <filter id="ls-glow-soft" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="0.5" result="b1" />
            <feGaussianBlur stdDeviation="1.2" result="b2" />
            <feMerge>
              <feMergeNode in="b2" />
              <feMergeNode in="b1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="ls-glow-mid" x="-250%" y="-250%" width="600%" height="600%">
            <feGaussianBlur stdDeviation="0.7" result="b1" />
            <feGaussianBlur stdDeviation="1.8" result="b2" />
            <feGaussianBlur stdDeviation="3.5" result="b3" />
            <feMerge>
              <feMergeNode in="b3" />
              <feMergeNode in="b2" />
              <feMergeNode in="b1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="ls-glow-strong" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur stdDeviation="0.9" result="b1" />
            <feGaussianBlur stdDeviation="2.4" result="b2" />
            <feGaussianBlur stdDeviation="5.0" result="b3" />
            <feMerge>
              <feMergeNode in="b3" />
              <feMergeNode in="b2" />
              <feMergeNode in="b1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Градиент для линий созвездия — затухает к концам */}
          <linearGradient id="ls-line-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255, 220, 180, 0)" />
            <stop offset="50%" stopColor="rgba(255, 230, 195, 0.95)" />
            <stop offset="100%" stopColor="rgba(255, 220, 180, 0)" />
          </linearGradient>
        </defs>

        {/* Линии созвездия */}
        {lines.map((ln) => (
          <motion.line
            key={ln.key}
            x1={ln.x1}
            y1={ln.y1}
            x2={ln.x2}
            y2={ln.y2}
            stroke="url(#ls-line-grad)"
            strokeWidth={0.28}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.95 }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
            style={{ filter: 'drop-shadow(0 0 1.2px rgba(255, 230, 195, 0.9))' }}
          />
        ))}

        {/* Центральная (8-я) звезда — всегда активна, без подписи */}
        <CenterStar />

        {/* Звёзды дней недели */}
        {enriched.map((s, i) => (
          <DayStar key={s.day} star={s} index={i} />
        ))}
      </svg>
    </div>
  );
};

export default LivingSky;
