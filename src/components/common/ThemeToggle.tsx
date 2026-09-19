'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'pill';
  showLabel?: boolean;
}

export default function ThemeToggle({
  className = '',
  size = 'md',
  variant = 'icon',
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const { lang } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isDark = theme === 'dark';

  const tooltipText = isDark
    ? lang === 'ar'
      ? 'تفعيل الوضع الفاتح'
      : 'Passer en mode clair'
    : lang === 'ar'
    ? 'تفعيل الوضع الليلي (الداكن)'
    : 'Passer en mode sombre';

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 sm:w-9 sm:h-9 text-xs',
    lg: 'w-10 h-10 text-sm',
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  if (!mounted) {
    // Render a stable placeholder during SSR/hydration to avoid flash
    return (
      <button
        type="button"
        disabled
        className={`relative inline-flex items-center justify-center rounded-xl border transition-all cursor-pointer group select-none ${sizeClasses} bg-slate-100 dark:bg-white/5 border-black/10 dark:border-white/10 ${className}`}
        aria-label="Theme toggle"
      >
        <span className={`${iconSizes} opacity-0`} />
      </button>
    );
  }

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer select-none ${
          isDark
            ? 'bg-[#18181F] hover:bg-[#22222B] border-white/10 text-[#F5F5F7]'
            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900 shadow-sm'
        } ${className}`}
        title={tooltipText}
        aria-label={tooltipText}
      >
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center transition-transform ${
            isDark ? 'bg-[#FF6B00]/20 text-[#FFAA2C]' : 'bg-slate-100 text-slate-700'
          }`}
        >
          {isDark ? (
            <Sun className="w-3 h-3 text-[#FFAA2C] animate-spin-slow" />
          ) : (
            <Moon className="w-3 h-3 text-slate-700" />
          )}
        </div>
        {showLabel && (
          <span className="text-xs font-semibold">
            {isDark
              ? lang === 'ar'
                ? 'الوضع الداكن'
                : 'Mode Sombre'
              : lang === 'ar'
              ? 'الوضع الفاتح'
              : 'Mode Clair'}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center rounded-xl border transition-all cursor-pointer group select-none ${sizeClasses} ${
        isDark
          ? 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-[#FFAA2C]/40 text-[#A1A1AA] hover:text-white shadow-md shadow-black/20'
          : 'bg-white hover:bg-slate-100 border-slate-200/90 hover:border-[#FF6B00]/50 text-slate-700 hover:text-slate-900 shadow-sm'
      } ${className}`}
      title={tooltipText}
      aria-label={tooltipText}
    >
      <span className="sr-only">{tooltipText}</span>

      {/* Sun Icon (Dark Mode State -> transitions to Light) */}
      <Sun
        className={`${iconSizes} text-[#FFAA2C] transition-all duration-300 ${
          isDark
            ? 'opacity-100 rotate-0 scale-100'
            : 'opacity-0 -rotate-90 scale-0 absolute pointer-events-none'
        } group-hover:rotate-45`}
      />

      {/* Moon Icon (Light Mode State -> transitions to Dark) */}
      <Moon
        className={`${iconSizes} text-slate-700 transition-all duration-300 ${
          !isDark
            ? 'opacity-100 rotate-0 scale-100'
            : 'opacity-0 rotate-90 scale-0 absolute pointer-events-none'
        } group-hover:-rotate-12`}
      />
    </button>
  );
}
