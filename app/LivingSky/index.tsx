'use client';

import React, { useMemo } from 'react';
import { MotionConfig } from 'framer-motion';

import type { Star, EnrichedStar, DayKey, ConstellationLine } from './types';
import { getISOWeek, levelFromCompletion } from './lib/seededRandom';
import { buildConstellation } from './lib/constellation';

import SkyBackground from './layers/SkyBackground';
import DriftingClouds from './layers/DriftingClouds';
import HorizonHaze from './layers/HorizonHaze';
import Stardust from './layers/Stardust';
import ShootingStars from './layers/ShootingStars';
import CompassGrid from './layers/CompassGrid';

import CenterStar from './stars/CenterStar';
import DayStar from './stars/DayStar';
import ConstellationLines from './stars/ConstellationLines';

const DAY_ORDER: DayKey[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface LivingSkyProps {
  stars: Star[];
  className?: string;
  style?: React.CSSProperties;
  /** Соотношение сторон контейнера. По умолчанию '5 / 4' (≈ как на референсе карточки). */
  aspectRatio?: string;
}

const LivingSky: React.FC<LivingSkyProps> = ({
  stars,
  className,
  style,
  aspectRatio = '5 / 4',
}) => {
  // Нормализация — порядок Пн..Вс, отсутствующие дни → 0
  const ordered = useMemo(() => {
    const map = new Map(stars.map((s) => [s.day, s.completion]));
    return DAY_ORDER.map((day) => ({
      day,
      completion: Math.max(0, Math.min(1, map.get(day) ?? 0)),
    }));
  }, [stars]);

  // Координаты — детерминированно по ISO-неделе
  const positions = useMemo(() => {
    const { year, week } = getISOWeek(new Date());
    return buildConstellation(year * 1000 + week);
  }, []);

  const enriched: EnrichedStar[] = useMemo(
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

  // Среднее за неделю → глобальный фильтр (тёплый/холодный, ярче/темнее)
  const weekAvg = useMemo(
    () => enriched.reduce((acc, s) => acc + s.completion, 0) / 7,
    [enriched]
  );
  const brightness = (0.85 + weekAvg * 0.35).toFixed(2); // 0.85 → 1.20
  const saturate = (0.85 + weekAvg * 0.55).toFixed(2);   // 0.85 → 1.40
  const hueRotate = ((weekAvg - 0.5) * 12).toFixed(1);   // -6° → +6°
  const containerFilter = `brightness(${brightness}) saturate(${saturate}) hue-rotate(${hueRotate}deg)`;

  // Линии — между последовательными активными звёздами Пн→Вс
  const lines: ConstellationLine[] = useMemo(() => {
    const ls: ConstellationLine[] = [];
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
    /*
     * MotionConfig reducedMotion="never" — анимации работают независимо
     * от системной настройки prefers-reduced-motion. Это намеренно:
     * LivingSky — эмоциональный центр приложения, и его «жизнь» — часть смысла.
     * Остальные компоненты сайта продолжат уважать предпочтения пользователя.
     */
    <MotionConfig reducedMotion="never">
      <div
        className={className}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio,
          borderRadius: 32,
          overflow: 'hidden',
          isolation: 'isolate',
          backgroundColor: '#1a1535',
          filter: containerFilter,
          transition: 'filter 1.2s ease',
          ...style,
        }}
      >
        <SkyBackground />
        <DriftingClouds />
        <HorizonHaze />
        <Stardust count={45} />
        <ShootingStars />
        <CompassGrid />

        {/* Главный SVG-слой: линии + центр + 7 звёзд */}
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
          </defs>

          <ConstellationLines lines={lines} />
          <CenterStar />
          {enriched.map((s, i) => (
            <DayStar key={s.day} star={s} index={i} />
          ))}
        </svg>
      </div>
    </MotionConfig>
  );
};

export default LivingSky;
export type { Star, DayKey } from './types';

/* ============================================================================
 * ПОДКЛЮЧЕНИЕ В page.tsx
 * ============================================================================
 *
 * import LivingSky, { type Star, type DayKey } from './LivingSky';
 *
 * // Конвертация из { habits, habitLogs } в Star[]:
 *
 * const skyStars: Star[] = useMemo(() => {
 *   const now = new Date();
 *   const currentDay = now.getDay();
 *   const diffToMonday = currentDay === 0 ? 6 : currentDay - 1;
 *   const monday = new Date(now);
 *   monday.setDate(now.getDate() - diffToMonday);
 *   monday.setHours(0, 0, 0, 0);
 *
 *   const dayKeys: DayKey[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
 *   const todayKey = dayKeys[diffToMonday];
 *
 *   const formatLocal = (d: Date) => {
 *     const y = d.getFullYear();
 *     const m = String(d.getMonth() + 1).padStart(2, '0');
 *     const day = String(d.getDate()).padStart(2, '0');
 *     return `${y}-${m}-${day}`;
 *   };
 *
 *   const total = habits.length;
 *
 *   return dayKeys.map((day, i) => {
 *     const d = new Date(monday);
 *     d.setDate(monday.getDate() + i);
 *     d.setHours(12, 0, 0, 0);
 *     const dateStr = formatLocal(d);
 *     const isToday = day === todayKey;
 *     const isFuture = formatLocal(d) > formatLocal(now);
 *
 *     let done = 0;
 *     if (!isFuture) {
 *       done = isToday
 *         ? habits.filter((h: any) => h.is_completed).length
 *         : habitLogs.filter((l: any) => l.date === dateStr && l.completed).length;
 *     }
 *     return { day, completion: total > 0 ? done / total : 0 };
 *   });
 * }, [habits, habitLogs]);
 *
 * <LivingSky stars={skyStars} />
 *
 * Не забудь, что sky-bg.jpg должен лежать в /public/sky-bg.jpg
 * ============================================================================ */
