'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ShieldCheck, Truck, Sparkles } from 'lucide-react';

export default function AnnouncementBar() {
  const { t, lang } = useLanguage();

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#FF6B00] via-[#FFAA2C] to-[#FF6B00] text-[#0D0D11] text-xs font-bold py-2 border-b border-[#FF6B00]/40 tracking-wider shadow-sm z-50">
      <div className="flex items-center space-x-8 animate-marquee whitespace-nowrap">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="flex items-center space-x-6 mx-4">
            <span className="flex items-center gap-1.5 font-extrabold text-[12px] uppercase">
              <Truck className="w-3.5 h-3.5 inline-block text-black stroke-[2.5]" />
              {t('announcement.marquee')}
            </span>
            <span className="text-black/60">•</span>
            <span className="flex items-center gap-1 font-semibold text-[11px] bg-black/15 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3 text-black" />
              {t('announcement.badge_cod')}
            </span>
            <span className="text-black/60">•</span>
            <span className="flex items-center gap-1 font-semibold text-[11px]">
              <Sparkles className="w-3 h-3 text-black" />
              {t('announcement.badge_aesthetic')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
