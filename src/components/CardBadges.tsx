import React from 'react';
import { CardBadge } from '../types';

interface CardBadgesProps {
  badges: CardBadge[];
  size?: 'sm' | 'md' | 'lg';
}

export const CardBadges: React.FC<CardBadgesProps> = ({ badges, size = 'md' }) => {
  return (
    <div className="flex items-center gap-1.5 flex-wrap justify-end">
      {badges.map((b, idx) => (
        <BadgeIcon key={idx} badge={b} size={size} />
      ))}
    </div>
  );
};

const BadgeIcon: React.FC<{ badge: CardBadge; size: 'sm' | 'md' | 'lg' }> = ({ badge, size }) => {
  const { label, shape, color } = badge;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 min-w-[54px] h-[34px]',
    md: 'text-[13px] px-2.5 py-1 min-w-[66px] h-[42px]',
    lg: 'text-[16px] px-3.5 py-1.5 min-w-[84px] h-[52px]'
  }[size];

  // Colors matching the original World Vision cards
  const colorStyles: Record<string, { bg: string; border: string; text: string; shadow: string }> = {
    orange: { bg: 'bg-[#F59E0B]', border: 'border-[#FDE68A]', text: 'text-white', shadow: 'shadow-amber-600/30' },
    blue: { bg: 'bg-[#2563EB]', border: 'border-[#93C5FD]', text: 'text-white', shadow: 'shadow-blue-600/30' },
    pink: { bg: 'bg-[#EC4899]', border: 'border-[#FBCFE8]', text: 'text-white', shadow: 'shadow-pink-600/30' },
    mint: { bg: 'bg-[#0D9488]', border: 'border-[#99F6E4]', text: 'text-white', shadow: 'shadow-teal-600/30' },
    green: { bg: 'bg-[#16A34A]', border: 'border-[#BBF7D0]', text: 'text-white', shadow: 'shadow-green-600/30' },
    red: { bg: 'bg-[#DC2626]', border: 'border-[#FECACA]', text: 'text-white', shadow: 'shadow-red-600/30' }
  };

  const currentTheme = colorStyles[color] || colorStyles.orange;

  if (shape === 'heart') {
    return (
      <div
        className={`relative inline-flex flex-col items-center justify-center font-bold ${currentTheme.text} drop-shadow-md transition-transform hover:scale-105`}
        title={label}
      >
        <svg
          viewBox="0 0 100 90"
          className={`${size === 'sm' ? 'w-10 h-9' : size === 'md' ? 'w-14 h-12' : 'w-18 h-16'} filter drop-shadow`}
        >
          <path
            d="M 50,85 C 20,60 0,40 0,22 C 0,10 10,0 24,0 C 35,0 44,7 50,16 C 56,7 65,0 76,0 C 90,0 100,10 100,22 C 100,40 80,60 50,85 Z"
            fill="#F59E0B"
            stroke="#FEF3C7"
            strokeWidth="5"
          />
        </svg>
        <span
          className={`absolute inset-0 flex items-center justify-center font-bold text-white pt-1 select-none ${
            size === 'sm' ? 'text-[10px]' : size === 'md' ? 'text-[12px]' : 'text-[14px]'
          }`}
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
        >
          {label}
        </span>
      </div>
    );
  }

  if (shape === 'diamond') {
    return (
      <div
        className={`relative inline-flex items-center justify-center ${currentTheme.text} drop-shadow-md transition-transform hover:scale-105`}
        title={label}
      >
        <div
          className={`${
            size === 'sm' ? 'w-9 h-9' : size === 'md' ? 'w-12 h-12' : 'w-16 h-16'
          } bg-[#1D4ED8] rotate-45 rounded-lg border-2 border-[#BFDBFE] flex items-center justify-center shadow-lg`}
        />
        <span
          className={`absolute font-extrabold text-white text-center leading-tight select-none ${
            size === 'sm' ? 'text-[10px]' : size === 'md' ? 'text-[12px]' : 'text-[14px]'
          }`}
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
        >
          {label}
        </span>
      </div>
    );
  }

  if (shape === 'flower') {
    return (
      <div
        className={`relative inline-flex items-center justify-center drop-shadow-md transition-transform hover:scale-105`}
        title={label}
      >
        <svg
          viewBox="0 0 100 100"
          className={`${size === 'sm' ? 'w-10 h-10' : size === 'md' ? 'w-14 h-14' : 'w-18 h-18'}`}
        >
          <g fill={color === 'pink' ? '#F43F5E' : '#2563EB'} stroke="#FFFFFF" strokeWidth="4">
            <circle cx="50" cy="20" r="18" />
            <circle cx="78" cy="35" r="18" />
            <circle cx="78" cy="65" r="18" />
            <circle cx="50" cy="80" r="18" />
            <circle cx="22" cy="65" r="18" />
            <circle cx="22" cy="35" r="18" />
            <circle cx="50" cy="50" r="26" />
          </g>
        </svg>
        <span
          className={`absolute font-extrabold text-white text-center leading-tight select-none ${
            size === 'sm' ? 'text-[9px]' : size === 'md' ? 'text-[11px]' : 'text-[13px]'
          }`}
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
        >
          {label}
        </span>
      </div>
    );
  }

  if (shape === 'arch') {
    return (
      <div
        className={`relative inline-flex flex-col items-center justify-center drop-shadow-md transition-transform hover:scale-105`}
        title={label}
      >
        <div
          className={`${
            size === 'sm' ? 'w-9 h-10 pt-1' : size === 'md' ? 'w-13 h-13 pt-1.5' : 'w-17 h-16 pt-2'
          } bg-[#EF4444] rounded-t-full rounded-b-md border-2 border-[#FECACA] flex items-center justify-center shadow-lg`}
        >
          <span
            className={`font-extrabold text-white text-center select-none ${
              size === 'sm' ? 'text-[9px]' : size === 'md' ? 'text-[11px]' : 'text-[13px]'
            }`}
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
          >
            {label}
          </span>
        </div>
      </div>
    );
  }

  // polygon / badge default
  return (
    <div
      className={`inline-flex items-center justify-center font-extrabold rounded-xl border-2 shadow-md ${sizeClasses} ${currentTheme.bg} ${currentTheme.border} ${currentTheme.text} transition-transform hover:scale-105 select-none`}
      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
    >
      {label}
    </div>
  );
};
