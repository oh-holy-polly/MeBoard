"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

interface LivingSkyProps {
  habits: any[];
  habitLogs: any[];
}

/* =========================
   Utils: Date / Week
========================= */

function getISOWeek(date: Date) {
  const temp = new Date(date.getTime());
  temp.setHours(0, 0, 0, 0);
  temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
  const week1 = new Date(temp.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((temp.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
}

function getWeekSeed(date: Date) {
  const year = date.getFullYear();
  const week = getISOWeek(date);
  return year * 100 + week;
}

/* =========================
   Utils: Seeded pseudo-random
========================= */

function seeded(seed: number) {
  return function () {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
}

/* =========================
   Utils: Dates of current week
   (Mon - Sun)
========================= */

function getWeekDates(baseDate: Date) {
  const date = new Date(baseDate);
  const day = (date.getDay() + 6) % 7; // Mon = 0

  const monday = new Date(date);
  monday.setDate(date.getDate() - day);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatDate(d: Date) {
  return d.toISOString().split("T")[0];
}

/* =========================
   Activity logic
========================= */

function isDayActive(date: Date, habits: any[], habitLogs: any[]) {
  const todayStr = formatDate(date);
  const nowStr = formatDate(new Date());

  // Today: use habits.is_completed
  if (todayStr === nowStr) {
    return habits?.some((h) => h.is_completed);
  }

  // Past days: use logs
  return habitLogs?.some(
    (log) => log.date === todayStr && log.completed === true
  );
}

/* =========================
   Star component
========================= */

function Star({
  x,
  y,
  active,
}: {
  x: number;
  y: number;
  active: boolean;
}) {
  return (
    <motion.circle
      cx={x}
      cy={y}
      r={active ? 3.2 : 2}
      fill={active ? "#D4AF37" : "rgba(255,255,255,0.35)"}
      animate={
        active
          ? {
              r: [3, 4.2, 3],
              opacity: [0.8, 1, 0.8],
            }
          : {
              opacity: 0.4,
            }
      }
      transition={{
        duration: 2.5,
        repeat: Infinity,
      }}
    />
  );
}

/* =========================
   Particles
========================= */

function Particles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 25 }).map(() => ({
        x: Math.random() * 300,
        y: Math.random() * 200,
        r: Math.random() * 1.5,
        d: Math.random() * 100,
      })),
    []
  );

  return (
    <>
      {particles.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={p.r}
          fill="white"
          opacity={0.15}
          animate={{
            y: [p.y, p.y - 20, p.y],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{
            duration: 10 + p.d / 10,
            repeat: Infinity,
          }}
        />
      ))}
    </>
  );
}

/* =========================
   Comet
========================= */

function Comet() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShow(true);
      setTimeout(() => setShow(false), 2000);
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  if (!show) return null;

  return (
    <motion.circle
      cx={0}
      cy={50}
      r={3}
      fill="white"
      animate={{
        x: [0, 320],
        y: [50, 120],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 2,
        ease: "easeOut",
      }}
    />
  );
}

/* =========================
   Main Component
========================= */

export default function LivingSky({
  habits,
  habitLogs,
}: LivingSkyProps) {
  const today = new Date();
  const weekDates = useMemo(() => getWeekDates(today), []);

  const seed = getWeekSeed(today);
  const rand = useMemo(() => seeded(seed), [seed]);

  const points = useMemo(() => {
    return weekDates.map((_, i) => {
      const angle = (i / 7) * Math.PI * 2;
      const radius = 70 + rand() * 25;

      return {
        x: 150 + Math.cos(angle) * radius,
        y: 100 + Math.sin(angle) * radius * 0.6,
      };
    });
  }, [weekDates, rand]);

  const activeDays = weekDates.map((d) =>
    isDayActive(d, habits, habitLogs)
  );

  return (
    <div className="w-full h-[220px] rounded-2xl overflow-hidden relative">
      {/* Background */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(circle at 20% 20%, #1a1446, #0b0a1f)",
            "radial-gradient(circle at 80% 60%, #1f1147, #0b0a1f)",
            "radial-gradient(circle at 30% 80%, #140f3a, #0b0a1f)",
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
        }}
      />

      <svg
        viewBox="0 0 300 200"
        className="w-full h-full relative z-10"
      >
        {/* Particles */}
        <Particles />

        {/* Connections */}
        {points.map((p, i) => {
          if (i === 6) return null;
          if (!activeDays[i] || !activeDays[i + 1]) return null;

          return (
            <line
              key={i}
              x1={p.x}
              y1={p.y}
              x2={points[i + 1].x}
              y2={points[i + 1].y}
              stroke="rgba(212,175,55,0.4)"
              strokeWidth="1"
            />
          );
        })}

        {/* Stars */}
        {points.map((p, i) => (
          <Star
            key={i}
            x={p.x}
            y={p.y}
            active={activeDays[i]}
          />
        ))}

        {/* Comet */}
        <Comet />
      </svg>
    </div>
  );
}
