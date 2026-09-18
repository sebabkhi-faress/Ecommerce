'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Truck, ShieldCheck, RefreshCw, Headphones, MapPin, CheckCircle2 } from 'lucide-react';

export default function TrustPillars() {
  const { lang, t } = useLanguage();

  const pillars = [
    {
      icon: Truck,
      title: t('trust.p1_title'),
      desc: t('trust.p1_desc'),
      tag: t('trust.p1_tag'),
      color: '#FF6B00',
    },
    {
      icon: ShieldCheck,
      title: t('trust.p2_title'),
      desc: t('trust.p2_desc'),
      tag: t('trust.p2_tag'),
      color: '#FFAA2C',
    },
    {
      icon: RefreshCw,
      title: t('trust.p3_title'),
      desc: t('trust.p3_desc'),
      tag: t('trust.p3_tag'),
      color: '#25D366',
    },
    {
      icon: Headphones,
      title: t('trust.p4_title'),
      desc: t('trust.p4_desc'),
      tag: t('trust.p4_tag'),
      color: '#3B82F6',
    },
  ];

  return (
    <section id="guarantees" className="py-16 bg-slate-100/60 dark:bg-[#121217]/50 border-t border-black/5 dark:border-white/5 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFAA2C]">
            {t('trust.eyebrow')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#F5F5F7]">
            {t('trust.title')}
          </h2>
          <p className="text-xs sm:text-sm text-[#A1A1AA]">
            {t('trust.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-[#18181F] border border-white/10 hover:border-white/25 rounded-3xl p-6 transition-all duration-300 relative group overflow-hidden"
              >
                <div className="flex items-center justify-between mb-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{
                      backgroundColor: `${pillar.color}15`,
                      border: `1px solid ${pillar.color}40`,
                      color: pillar.color,
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold tracking-widest px-2.5 py-1 rounded-full bg-white/5 text-[#A1A1AA] border border-white/10">
                    {pillar.tag}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#F5F5F7] mb-2">
                  {pillar.title}
                </h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  {pillar.desc}
                </p>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] text-[#25D366]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'معتمد رسمياً' : 'Garanti & Vérifié'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
