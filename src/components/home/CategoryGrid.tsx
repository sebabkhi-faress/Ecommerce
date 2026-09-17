'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { CATEGORIES } from '@/data/products';
import { Headphones, Radio, Volume2, Zap, BatteryCharging, ArrowUpRight } from 'lucide-react';

const iconMap = {
  Headphones,
  Radio,
  Volume2,
  Zap,
  BatteryCharging,
};

interface CategoryGridProps {
  onSelectCategory?: (category: string) => void;
  activeCategory?: string;
}

export default function CategoryGrid({ onSelectCategory, activeCategory }: CategoryGridProps) {
  const { lang, t } = useLanguage();

  return (
    <section id="categories" className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFAA2C]">
            HARDWARE ECOSYSTEM
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#F5F5F7]">
            {t('categories.title')}
          </h2>
          <p className="text-xs sm:text-sm text-[#A1A1AA]">
            {t('categories.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = iconMap[cat.icon as keyof typeof iconMap] || Zap;
            const isSelected = activeCategory === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory && onSelectCategory(cat.id)}
                className={`group cursor-pointer bg-[#18181F] border ${
                  isSelected ? 'border-[#FF6B00] shadow-lg shadow-[#FF6B00]/20' : 'border-white/10'
                } hover:border-[#FF6B00]/50 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#22222B] border border-white/10 group-hover:bg-[#FF6B00]/20 group-hover:border-[#FF6B00]/40 flex items-center justify-center text-[#FFAA2C] group-hover:text-[#FF6B00] transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#A1A1AA] group-hover:text-[#FFAA2C] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>

                  <h3 className="text-base font-bold text-[#F5F5F7] group-hover:text-white transition-colors">
                    {lang === 'ar' ? cat.nameAr : cat.nameFr}
                  </h3>
                  <p className="text-xs text-[#A1A1AA] mt-1 line-clamp-2">
                    {lang === 'ar' ? cat.descriptionAr : cat.descriptionFr}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-[#A1A1AA]">
                  <span>{cat.count} {lang === 'ar' ? 'أجهزة' : 'produits'}</span>
                  <span className="text-[#FF6B00] font-bold group-hover:underline">
                    {lang === 'ar' ? 'عرض ←' : 'Explorer →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
