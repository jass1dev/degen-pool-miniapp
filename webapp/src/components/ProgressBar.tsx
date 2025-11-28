import React from 'react';

interface ProgressBarProps {
  sold: number;
  max: number;
  className?: string;
}

export function ProgressBar({ sold, max, className = '' }: ProgressBarProps) {
  const percentage = Math.min(100, Math.round((sold / max) * 100));

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
        <span>{sold} / {max}</span>
        <span>{percentage}%</span>
      </div>
    </div>
  );
}

