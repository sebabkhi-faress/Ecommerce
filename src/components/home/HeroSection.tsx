'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/context/ProductContext';
import { formatDZD } from '@/data/products';
import {
  Zap,
  ShieldCheck,
  Truck,
  ArrowRight,
  ArrowLeft,
  Flame,
  CheckCircle2,
  Sparkles,
  Star,
  Phone,
} from 'lucide-react';

export default function HeroSection() {
  const { lang, t } = useLanguage();
  const { openDirectCheckout } = useCart();
  const { products } = useProducts();
  const heroProduct = products.find((p) => p.isFeatured || p.isFlashDeal) || products[0];

  return (
    <section className="relative pt-6 pb-14 md:pt-14 md:pb-24 overflow-hidden w-full max-w-full">
      {/* Background Ambience & Glow Aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-[#FF6B00]/15 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none animate-pulse-warm" />
      <div className="absolute top-1/3 end-4 sm:end-10 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-[#FFAA2C]/10 rounded-full blur-[90px] sm:blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* MOBILE-FIRST PRODUCT & PRICE ATTENTION SHOWCASE */}
        {heroProduct ? (
          <div className="lg:hidden space-y-4 mb-8">
            {/* Top Hook Card (Offer Hook + 5 Stars + Price + Brand Badge) */}
            <Link
              href={`/products/${heroProduct.slug || heroProduct.id}`}
              className="block bg-white dark:bg-[#14141B] border border-black/10 dark:border-white/15 rounded-3xl p-4 shadow-xl space-y-3 group hover:border-[#FF6B00]/40 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF6B00]/20 text-[#FFAA2C] border border-[#FF6B00]/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                    <Flame className="w-3 h-3 text-[#FF6B00]" />
                    <span>{lang === 'ar' ? 'العرض الحصري الأكثر طلباً في الجزائر' : 'OFFRE PHARE EN ALGÉRIE'}</span>
                  </span>
                  <h1 className="text-xl font-black text-slate-900 dark:text-[#F5F5F7] group-hover:text-[#FFAA2C] transition-colors leading-tight">
                    {lang === 'ar' ? heroProduct.nameAr : heroProduct.nameFr}
                  </h1>
                </div>

                {/* Store Logo Badge */}
                <div className="shrink-0">
                  <div className="px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-black border border-black/10 dark:border-white/20 text-center shadow-md">
                    <span className="text-xs font-black tracking-widest text-[#FF6B00] dark:text-[#FFAA2C] block">
                      BIKA STORE
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 dark:text-white/70 block uppercase">
                      OFFICIAL DZ
                    </span>
                  </div>
                </div>
              </div>

              {/* Stars & Big Bold Price */}
              <div className="flex items-center justify-between pt-2 border-t border-black/10 dark:border-white/10">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center text-[#FFAA2C]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#FFAA2C] text-[#FFAA2C]" />
                    ))}
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500 dark:text-[#A1A1AA]">
                    (4.9/5 • 3,500+)
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-mono font-black text-[#FF6B00]">
                    {formatDZD(heroProduct.price, lang)}
                  </span>
                  {heroProduct.originalPrice && (
                    <span className="text-xs font-mono text-slate-400 dark:text-[#A1A1AA]/60 line-through">
                      {formatDZD(heroProduct.originalPrice, lang)}
                    </span>
                  )}
                </div>
              </div>
            </Link>

            {/* Large Hero Image Stage (Full Viewport Focus) */}
            <Link
              href={`/products/${heroProduct.slug || heroProduct.id}`}
              className="relative aspect-[4/5] max-h-[460px] w-full rounded-3xl overflow-hidden bg-slate-100 dark:bg-gradient-to-b dark:from-[#18181F] dark:to-[#0D0D11] border border-black/10 dark:border-white/15 p-3 flex items-center justify-center shadow-xl block group cursor-pointer"
            >
              <img
                src={heroProduct.images[0] || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop'}
                alt={heroProduct.nameFr}
                className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
              />
              {/* Guarantee Tag */}
              <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-[10px] font-bold text-[#25D366]">
                  <CheckCircle2 className="w-3 h-3 text-[#25D366]" />
                  <span>{lang === 'ar' ? 'معاينة الطرد قبل الدفع' : 'Vérification avant paiement'}</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-[#FF6B00]/90 text-black text-[10px] font-black uppercase">
                  {lang === 'ar' ? '68 ولاية الدفع عند الاستلام' : '68 Wilayas COD'}
                </span>
              </div>
            </Link>

            {/* Action Row matching Screenshot Bottom CTA */}
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="tel:0550123456"
                className="w-12 h-12 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-black flex items-center justify-center shadow-lg shadow-[#25D366]/30 shrink-0 active:scale-95 transition-transform"
                title={lang === 'ar' ? 'اتصال فوري' : 'Appel direct'}
              >
                <Phone className="w-5 h-5 fill-black text-black" />
              </a>

              <button
                onClick={() => openDirectCheckout(heroProduct)}
                className="flex-1 py-3.5 px-4 bg-gradient-to-r from-[#FF6B00] via-[#FFAA2C] to-[#FF6B00] text-black font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-[#FF6B00]/40 flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>{lang === 'ar' ? 'اشتري الآن (الدفع عند الاستلام)' : 'Acheter maintenant (COD)'}</span>
              </button>
            </div>

            <Link
              href={`/products/${heroProduct.id || heroProduct.slug}`}
              className="block text-center text-xs text-[#FFAA2C] hover:underline font-mono pt-1"
            >
              {lang === 'ar' ? 'عرض كافة تفاصيل ومواصفات المنتج ←' : 'Voir toutes les caractéristiques techniques →'}
            </Link>
          </div>
        ) : (
          <div className="lg:hidden mb-8">
            <div className="bg-white dark:bg-[#14141B] border border-black/10 dark:border-white/10 rounded-3xl p-6 text-center space-y-3 shadow-lg">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6B00]/20 text-[#FFAA2C] text-xs font-mono font-bold uppercase">
                <Flame className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>{lang === 'ar' ? 'متجر الأجهزة الرائدة 2026' : 'FLAGSHIP STORE 2026'}</span>
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-[#F5F5F7]">
                {lang === 'ar' ? 'أقوى العروض الحصرية مع الدفع عند الاستلام' : 'Les meilleures offres tech en Algérie'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#A1A1AA]">
                {lang === 'ar' ? 'توصيل سريع 24-48 ساعة لـ 68 ولاية مع ضمان سنة' : 'Livraison express 68 Wilayas & Garantie 1 an'}
              </p>
            </div>
          </div>
        )}

        {/* DESKTOP HERO LAYOUT */}
        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Launch Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-[#18181F] border border-black/10 dark:border-[#FF6B00]/40 shadow-md dark:shadow-lg dark:shadow-[#FF6B00]/15">
              <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-ping" />
              <span className="text-xs font-mono font-bold tracking-widest text-[#FF6B00] dark:text-[#FFAA2C] uppercase">
                {t('hero.badge')}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black tracking-tight leading-[1.08] text-slate-900 dark:text-[#F5F5F7]">
              <span>{t('hero.title_part1')}</span>
              <br />
              <span className="text-gradient-warm">{t('hero.title_part2')}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-[#A1A1AA] max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {t('hero.subtitle')}
            </p>

            {/* Call To Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => {
                  if (heroProduct) {
                    openDirectCheckout(heroProduct);
                  } else {
                    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
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
                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-[#18181F] hover:bg-slate-100 dark:hover:bg-[#22222B] text-slate-900 dark:text-[#F5F5F7] hover:text-[#FF6B00] dark:hover:text-white font-bold text-sm rounded-2xl border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <span>{t('hero.cta_explore')}</span>
              </Link>
            </div>

            {/* Micro Pillars in Hero */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-[#F5F5F7]">
                <Truck className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <span>{t('hero.stat_wilayas')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-[#F5F5F7]">
                <Zap className="w-4 h-4 text-[#FFAA2C] shrink-0" />
                <span>{t('hero.stat_delivery')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-[#F5F5F7]">
                <ShieldCheck className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>{t('hero.stat_cod')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-[#F5F5F7]">
                <Sparkles className="w-4 h-4 text-[#FFAA2C] shrink-0" />
                <span>{t('hero.stat_warranty')}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Stage Card with Warm Ambient Aura */}
          <div className="lg:col-span-5 relative">
            {heroProduct ? (
              <div className="relative mx-auto max-w-md bg-white/90 dark:bg-[#18181F]/80 backdrop-blur-2xl border border-black/10 dark:border-white/15 rounded-3xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/80 group">
                {/* Product floating tag */}
                <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#FF6B00] text-black font-extrabold text-[10px] uppercase tracking-wider shadow-lg shadow-[#FF6B00]/40">
                    {t('hero.flagship_badge')}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 dark:bg-black/60 border border-black/10 dark:border-white/10 text-white font-mono text-[11px]">
                    {formatDZD(heroProduct.price, lang)}
                  </span>
                </div>

                {/* Product Stage Image */}
                <Link
                  href={`/products/${heroProduct.slug || heroProduct.id}`}
                  className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-gradient-to-b dark:from-[#22222B] dark:to-[#0D0D11] p-4 flex items-center justify-center my-4 block cursor-pointer group/img"
                >
                  <div className="absolute inset-0 bg-radial-gradient from-[#FF6B00]/25 via-transparent to-transparent" />
                  <img
                    src={heroProduct.images[0] || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop'}
                    alt={heroProduct.nameFr}
                    className="w-full h-full object-cover rounded-xl shadow-2xl group-hover:scale-105 group-hover/img:scale-105 transition-transform duration-500"
                  />
                </Link>

                {/* Card Meta & Direct Buy Button */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/products/${heroProduct.slug || heroProduct.id}`}
                      className="block hover:text-[#FF6B00] transition-colors"
                    >
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-[#F5F5F7] hover:text-[#FF6B00] transition-colors">
                        {lang === 'ar' ? heroProduct.nameAr : heroProduct.nameFr}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-[#A1A1AA] mt-0.5">
                        {lang === 'ar' ? heroProduct.taglineAr : heroProduct.taglineFr}
                      </p>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-black/10 dark:border-white/10 text-xs">
                    <span className="text-[#25D366] font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t('products.in_stock')} ({heroProduct.stockCount || 10} {lang === 'ar' ? 'قطعة' : 'pièces'})</span>
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
            ) : (
              <div className="relative mx-auto max-w-md bg-white/90 dark:bg-[#18181F]/80 backdrop-blur-2xl border border-black/10 dark:border-white/15 rounded-3xl p-8 text-center space-y-4 shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-[#FF6B00]/20 border border-[#FF6B00]/40 flex items-center justify-center mx-auto shadow-lg shadow-[#FF6B00]/30">
                  <Zap className="w-7 h-7 text-[#FF6B00]" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-[#F5F5F7]">
                  {lang === 'ar' ? 'تجربة تسوق موثوقة 100%' : 'Shopping 100% Sécurisé'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#A1A1AA]">
                  {lang === 'ar' ? 'الدفع عند الاستلام مع إمكانية فتح الطرد والمعاينة' : 'Paiement à la livraison avec vérification du colis avant paiement'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
