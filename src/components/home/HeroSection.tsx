'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { PRODUCTS, formatDZD } from '@/data/products';
import {
  Zap,
  ShieldCheck,
  Truck,
  ArrowRight,
  ArrowLeft,
  Flame,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function HeroSection() {
  const { lang, t } = useLanguage();
  const { openDirectCheckout } = useCart();
  const heroProduct = PRODUCTS[0]; // Aura Pro 2

  return (
    <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 overflow-hidden">
      {/* Background Ambience & Glow Aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF6B00]/15 rounded-full blur-[140px] pointer-events-none animate-pulse-warm" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-[#FFAA2C]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Launch Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#18181F] border border-[#FF6B00]/40 shadow-lg shadow-[#FF6B00]/15">
              <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-ping" />
              <span className="text-xs font-mono font-bold tracking-widest text-[#FFAA2C] uppercase">
                {t('hero.badge')}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black tracking-tight leading-[1.08] text-[#F5F5F7]">
              <span>{t('hero.title_part1')}</span>
              <br />
              <span className="text-gradient-warm">{t('hero.title_part2')}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#A1A1AA] max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {t('hero.subtitle')}
            </p>

            {/* Call To Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => openDirectCheckout(heroProduct)}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#FF6B00] via-[#FFAA2C] to-[#FF6B00] text-black font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-[#FF6B00]/30 hover:shadow-[#FF6B00]/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>{t('hero.cta_buy')}</span>
                {lang === 'ar' ? (
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                ) : (
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                )}
              </button>

              <Link
                href="/#products"
                className="w-full sm:w-auto px-8 py-4 bg-[#18181F] hover:bg-[#22222B] text-[#F5F5F7] hover:text-white font-bold text-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <span>{t('hero.cta_explore')}</span>
              </Link>
            </div>

            {/* Micro Pillars in Hero */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F5F7]">
                <Truck className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <span>{t('hero.stat_wilayas')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F5F7]">
                <Zap className="w-4 h-4 text-[#FFAA2C] shrink-0" />
                <span>{t('hero.stat_delivery')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F5F7]">
                <ShieldCheck className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>{t('hero.stat_cod')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F5F7]">
                <Sparkles className="w-4 h-4 text-[#FFAA2C] shrink-0" />
                <span>{t('hero.stat_warranty')}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Stage Card with Warm Ambient Aura */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md bg-[#18181F]/80 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl shadow-black/80 group">
              {/* Product floating tag */}
              <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#FF6B00] text-black font-extrabold text-[10px] uppercase tracking-wider shadow-lg shadow-[#FF6B00]/40">
                  FLAGSHIP 2026
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-black/60 border border-white/10 text-white font-mono text-[11px]">
                  {formatDZD(heroProduct.price, lang)}
                </span>
              </div>

              {/* Product Stage Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-b from-[#22222B] to-[#0D0D11] p-4 flex items-center justify-center my-4">
                <div className="absolute inset-0 bg-radial-gradient from-[#FF6B00]/25 via-transparent to-transparent" />
                <img
                  src={heroProduct.images[0]}
                  alt={heroProduct.nameFr}
                  className="w-full h-full object-cover rounded-xl shadow-2xl group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Card Meta & Direct Buy Button */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-[#F5F5F7]">
                      {lang === 'ar' ? heroProduct.nameAr : heroProduct.nameFr}
                    </h3>
                    <p className="text-xs text-[#A1A1AA] mt-0.5">
                      {lang === 'ar' ? heroProduct.taglineAr : heroProduct.taglineFr}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                  <span className="text-[#25D366] font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('products.in_stock')} (14 {lang === 'ar' ? 'قطعة' : 'pièces'})</span>
                  </span>

                  <button
                    onClick={() => openDirectCheckout(heroProduct)}
                    className="py-2 px-4 bg-[#FF6B00] hover:bg-[#E05E00] text-black font-extrabold text-xs rounded-xl shadow-md shadow-[#FF6B00]/30 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 fill-black" />
                    <span>{t('products.buy_now')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
