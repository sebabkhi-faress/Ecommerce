'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Zap, ShieldCheck, Truck, Headphones, Sparkles, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  const { lang, t } = useLanguage();

  return (
    <footer className="relative bg-[#09090D] border-t border-white/10 text-[#A1A1AA] pt-16 pb-24 sm:pb-16 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-[#FF6B00]/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Col 1 & 2: Brand & DZ Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#FFAA2C] flex items-center justify-center">
                <Zap className="w-4 h-4 text-black fill-black" />
              </div>
              <span className="text-xl font-black tracking-tighter text-[#F5F5F7]">
                ELECTRONICS<span className="text-[#FF6B00]">.</span>
              </span>
            </Link>

            <p className="text-xs leading-relaxed max-w-sm text-[#A1A1AA]">
              {t('footer.description')}
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18181F] border border-white/10 text-[#F5F5F7]">
                <Truck className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>68 Wilayas Express</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18181F] border border-white/10 text-[#F5F5F7]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FFAA2C]" />
                <span>100% Cash on Delivery</span>
              </span>
            </div>
          </div>

          {/* Col 3: Categories */}
          <div>
            <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-[#F5F5F7] mb-4">
              {t('nav.categories')}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/#products" className="hover:text-[#FFAA2C] transition-colors">
                  {t('products.earbuds')}
                </Link>
              </li>
              <li>
                <Link href="/#products" className="hover:text-[#FFAA2C] transition-colors">
                  {t('products.headphones')}
                </Link>
              </li>
              <li>
                <Link href="/#products" className="hover:text-[#FFAA2C] transition-colors">
                  {t('products.speakers')}
                </Link>
              </li>
              <li>
                <Link href="/#products" className="hover:text-[#FFAA2C] transition-colors">
                  {t('products.chargers')}
                </Link>
              </li>
              <li>
                <Link href="/#products" className="hover:text-[#FFAA2C] transition-colors">
                  {t('products.powerbanks')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Admin */}
          <div>
            <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-[#F5F5F7] mb-4">
              {t('footer.support')}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/#guarantees" className="hover:text-[#FFAA2C] transition-colors">
                  {t('trust.p1_title')}
                </Link>
              </li>
              <li>
                <Link href="/#guarantees" className="hover:text-[#FFAA2C] transition-colors">
                  {t('trust.p2_title')}
                </Link>
              </li>
              <li>
                <Link href="/#guarantees" className="hover:text-[#FFAA2C] transition-colors">
                  {t('trust.p3_title')}
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-[#FF6B00] hover:underline font-mono">
                  → {t('nav.admin')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact & Location DZ */}
          <div>
            <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-[#F5F5F7] mb-4">
              Algérie & Contact
            </h4>
            <div className="space-y-2.5 text-xs">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                <span>Bab Ezzouar & Hydra, Alger, Algérie</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#FFAA2C] shrink-0" />
                <span dir="ltr">+213 (0) 550 12 34 56</span>
              </p>
              <p className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>7j/7 : 08:30 — 21:00</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-center sm:text-left text-[#A1A1AA]/80">
            {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-3 font-mono text-[11px] text-[#FFAA2C]">
            <span>DZ • COD PAYMENT</span>
            <span>•</span>
            <span>NOTHING TECH AESTHETIC</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
