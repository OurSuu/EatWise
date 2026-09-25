import React from 'react';
import { MoodType, SizeType } from '@/types';

interface ChefMangoProps {
  mood?: MoodType;
  message?: string;
  userName?: string;
  size?: SizeType;
}

const sizeClasses: Record<SizeType, string> = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
  xl: 'w-40 h-40 md:w-48 md:h-48',
};

export default function ChefMango({ mood = 'idle', message, userName = '', size = 'md' }: ChefMangoProps) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 my-2">
      <div className={`relative ${sizeClasses[size]} shrink-0 mood-${mood} transition-all duration-300 filter drop-shadow-xl`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Feather Tail */}
          <path d="M 18 75 Q 5 85 10 70 Q 5 60 22 65 Z" fill="#F59E0B" />

          {/* Body */}
          <ellipse cx="50" cy="65" rx="34" ry="29" fill="#FBBF24" />

          {/* Crest / Feathers */}
          <path d="M 50 16 Q 38 30 50 40 Q 62 30 50 16 Z" fill="#F59E0B" />
          <path d="M 50 16 Q 28 20 44 40 Z" fill="#FBBF24" />
          <path d="M 50 16 Q 72 20 56 40 Z" fill="#FBBF24" />

          {/* Chef Hat */}
          <path d="M 25 34 Q 25 12 40 12 Q 50 2 60 12 Q 75 12 75 34 Z" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2" />
          <rect x="30" y="34" width="40" height="14" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2" rx="3" />
          <line x1="38" y1="34" x2="38" y2="48" stroke="#F3F4F6" strokeWidth="1.5" />
          <line x1="50" y1="34" x2="50" y2="48" stroke="#F3F4F6" strokeWidth="1.5" />
          <line x1="62" y1="34" x2="62" y2="48" stroke="#F3F4F6" strokeWidth="1.5" />

          {/* Eyes & Expressions */}
          {mood === 'sad' ? (
            <>
              <path d="M 34 52 Q 40 46 44 52" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 56 52 Q 60 46 66 52" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </>
          ) : mood === 'excited' ? (
            <>
              <path d="M 34 50 Q 40 43 46 50" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 54 50 Q 60 43 66 50" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <circle cx="40" cy="49" r="4" fill="#1F2937" />
              <circle cx="60" cy="49" r="4" fill="#1F2937" />
              <circle cx="38.5" cy="47.5" r="1.5" fill="white" />
              <circle cx="58.5" cy="47.5" r="1.5" fill="white" />
            </>
          )}

          {/* Cheeks */}
          <circle cx="28" cy="58" r="6.5" fill="#F97316" opacity="0.85" />
          <circle cx="72" cy="58" r="6.5" fill="#F97316" opacity="0.85" />

          {/* Beak */}
          <path d="M 44 53 L 56 53 L 50 63 Z" fill="#EA580C" />

          {/* Wings */}
          {mood === 'excited' ? (
            <>
              <path d="M 16 58 Q 2 68 18 78" fill="#F59E0B" />
              <path d="M 84 58 Q 98 68 82 78" fill="#F59E0B" />
            </>
          ) : (
            <>
              <path d="M 16 58 Q 20 74 26 68" fill="#F59E0B" />
              <path d="M 84 58 Q 80 74 74 68" fill="#F59E0B" />
            </>
          )}
        </svg>
      </div>

      {message && (
        <div className="relative bg-amber-50 dark:bg-zinc-800 border-2 border-orange-400/40 dark:border-orange-500/30 p-4 rounded-2xl shadow-md text-zinc-800 dark:text-zinc-100 max-w-lg w-full transition-colors">
          <div className="hidden md:block absolute top-6 -left-3 w-4 h-4 bg-amber-50 dark:bg-zinc-800 border-t-2 border-l-2 border-orange-400/40 dark:border-orange-500/30 transform -rotate-45" />
          <div className="md:hidden absolute -top-3 left-8 w-4 h-4 bg-amber-50 dark:bg-zinc-800 border-t-2 border-l-2 border-orange-400/40 dark:border-orange-500/30 transform rotate-45" />
          <p className="relative z-10 text-sm md:text-base font-semibold leading-relaxed">
            {message}
          </p>
        </div>
      )}
    </div>
  );
}
