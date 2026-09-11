'use client';

import React from 'react';

interface BonowLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSlogan?: boolean;
  variant?: 'dark' | 'light';
  className?: string;
}

export const BonowIsotipo: React.FC<{ className?: string; size?: number }> = ({
  className = 'h-8 w-8',
  size = 32,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient
          id="bonow-coral-grad"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#FF5E5E" />
          <stop offset="100%" stopColor="#E63946" />
        </linearGradient>
      </defs>
      {/* Circle Icon */}
      <circle cx="50" cy="50" r="48" fill="url(#bonow-coral-grad)" />
      {/* White Smile Arc */}
      <path
        d="M 28 48 C 28 68, 72 68, 72 48"
        stroke="white"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export const BonowLogo: React.FC<BonowLogoProps> = ({
  size = 'md',
  showSlogan = true,
  variant = 'dark',
  className = '',
}) => {
  // Sizing styles
  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const sloganSizes = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-[13px]',
    xl: 'text-[15px]',
  };

  const iconSizes = {
    sm: 18,
    md: 24,
    lg: 30,
    xl: 36,
  };

  const isLight = variant === 'light';

  return (
    <div className={`flex flex-col items-start leading-none ${className}`}>
      <div className="flex items-center gap-0.5 font-black tracking-tight select-none">
        {/* 'bon' */}
        <span
          className={`${textSizes[size]} font-black ${
            isLight ? 'text-white' : 'text-[#0F1E36] dark:text-white'
          }`}
          style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}
        >
          bon
        </span>

        {/* 'o' (Smile Isotipo) */}
        <span className="inline-flex items-center justify-center mx-0.5">
          <BonowIsotipo size={iconSizes[size]} className="inline-block" />
        </span>

        {/* 'w' */}
        <span
          className={`${textSizes[size]} font-black text-[#009999] dark:text-teal-400`}
        >
          w
        </span>
      </div>

      {showSlogan && (
        <span
          className={`${sloganSizes[size]} font-bold tracking-normal mt-0.5 ${
            isLight ? 'text-zinc-200' : 'text-[#0F1E36] dark:text-zinc-300'
          }`}
        >
          Tu recompensa,{' '}
          <span className="text-[#009999] dark:text-teal-400 font-extrabold">
            ahora.
          </span>
        </span>
      )}
    </div>
  );
};
