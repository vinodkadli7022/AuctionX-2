import { useEffect, useRef } from 'react';

const RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CountdownRing({ totalSeconds = 30, secondsRemaining = 30 }) {
  const progress = Math.max(0, Math.min(1, secondsRemaining / totalSeconds));
  const offset = CIRCUMFERENCE * (1 - progress);
  const isUrgent = secondsRemaining <= 10;
  const color = isUrgent ? '#EF4444' : '#FFD700';

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="112" height="112" viewBox="0 0 112 112">
        {/* Track */}
        <circle cx="56" cy="56" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
        {/* Progress ring */}
        <circle
          cx="56" cy="56" r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
          filter={`drop-shadow(0 0 6px ${color})`}
        />
      </svg>
      <div className="relative text-center">
        <span
          className={`font-display text-3xl font-bold leading-none ${isUrgent ? 'text-red-400' : 'text-gold'}`}
          style={{ textShadow: isUrgent ? '0 0 20px rgba(239,68,68,0.8)' : '0 0 20px rgba(255,215,0,0.8)' }}
        >
          {secondsRemaining}
        </span>
        <p className="text-xs text-muted mt-1">secs</p>
      </div>
    </div>
  );
}
