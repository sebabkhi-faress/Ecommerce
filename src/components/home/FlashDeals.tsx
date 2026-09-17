'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { PRODUCTS } from '@/data/products';
import ProductCard from './ProductCard';
import { Flame, Clock, Zap } from 'lucide-react';

export default function FlashDeals() {
  const { lang, t } = useLanguage();

  // Simulated countdown timer: 1 day, 8 hours, 45 minutes, 20 seconds
  const [timeLeft, setTimeLeft] = useState({
    days: 1,
    hours: 8,
    minutes: 42,
    seconds: 15,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flashProducts = PRODUCTS.filter((p) => p.isFlashDeal);

  return (
    <section id="deals" className="py-12 bg-[#121217]/60 border-y border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Title & Animated Countdown */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6B00]/20 border border-[#FF6B00]/40 text-[#FF6B00] text-xs font-mono font-bold uppercase">
                <Flame className="w-3.5 h-3.5 fill-[#FF6B00]" />
                <span>LIMITED TIME OFFER</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F5F5F7]">
              {t('deals.title')}
            </h2>
            <p className="text-xs sm:text-sm text-[#A1A1AA]">
              {t('deals.subtitle')}
            </p>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-3 bg-[#18181F] border border-[#FFAA2C]/30 rounded-2xl p-3 shadow-lg shadow-[#FFAA2C]/10">
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#FFAA2C] font-semibold">
              <Clock className="w-4 h-4 animate-spin text-[#FFAA2C]" style={{ animationDuration: '8s' }} />
              <span className="hidden sm:inline">{t('deals.ends_in')}</span>
            </div>

            <div className="flex items-center gap-1 font-mono text-center">
              <div className="bg-[#0D0D11] border border-white/10 px-2.5 py-1.5 rounded-lg">
                <span className="text-base sm:text-lg font-bold text-[var(--white-titanium)] block leading-none">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="text-[9px] text-[#A1A1AA] uppercase">{t('deals.days')}</span>
              </div>
              <span className="text-[#FFAA2C] font-bold">:</span>
              <div className="bg-[#0D0D11] border border-white/10 px-2.5 py-1.5 rounded-lg">
                <span className="text-base sm:text-lg font-bold text-[var(--white-titanium)] block leading-none">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[9px] text-[#A1A1AA] uppercase">{t('deals.hours')}</span>
              </div>
              <span className="text-[#FFAA2C] font-bold">:</span>
              <div className="bg-[#0D0D11] border border-white/10 px-2.5 py-1.5 rounded-lg">
                <span className="text-base sm:text-lg font-bold text-[var(--white-titanium)] block leading-none">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[9px] text-[#A1A1AA] uppercase">{t('deals.minutes')}</span>
              </div>
              <span className="text-[#FFAA2C] font-bold">:</span>
              <div className="bg-[#0D0D11] border border-[#FF6B00]/40 px-2.5 py-1.5 rounded-lg">
                <span className="text-base sm:text-lg font-bold text-[#FF6B00] block leading-none animate-pulse">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[9px] text-[#FF6B00] uppercase">{t('deals.seconds')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {flashProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
