'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Home, Grid, ShoppingBag, MessageSquare, Flame, User as UserIcon, Truck, LayoutDashboard } from 'lucide-react';

export default function MobileDock() {
  const pathname = usePathname();
  const { lang, t } = useLanguage();
  const { totalItems, setIsCartOpen } = useCart();
  const { user, role, isAuthenticated } = useAuth();

  // If inside admin, delivery console, or product page, do not show public dock (PDP has dedicated Buy Bar)
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/delivery') ||
    pathname.startsWith('/products/')
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-3 left-0 right-0 w-full z-40 px-3 sm:hidden pointer-events-none flex justify-center">
      <div className="w-full max-w-sm bg-[#18181F]/95 backdrop-blur-xl border border-white/15 rounded-full px-2 py-1.5 shadow-2xl shadow-black/80 flex items-center justify-between pointer-events-auto">
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-full transition-all shrink-0 ${
            pathname === '/' ? 'text-[#FF6B00]' : 'text-[#A1A1AA]'
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="text-[10px] font-semibold">{t('nav.home')}</span>
        </Link>

        <Link
          href="/#deals"
          className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-full text-[#FFAA2C] shrink-0"
        >
          <Flame className="w-4 h-4" />
          <span className="text-[10px] font-semibold">{lang === 'ar' ? 'العروض' : 'Offres'}</span>
        </Link>

        {/* Center Cart Trigger */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative -top-2.5 flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-tr from-[#FF6B00] to-[#FFAA2C] text-black shadow-lg shadow-[#FF6B00]/40 active:scale-95 transition-transform shrink-0"
          aria-label="Panier"
        >
          <ShoppingBag className="w-4 h-4 fill-black" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-white text-black font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-[#18181F]">
              {totalItems}
            </span>
          )}
        </button>

        <Link
          href="/#categories"
          className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-full text-[#A1A1AA] shrink-0"
        >
          <Grid className="w-4 h-4" />
          <span className="text-[10px] font-semibold">{lang === 'ar' ? 'الأقسام' : 'Rayons'}</span>
        </Link>

        <Link
          href={
            !isAuthenticated
              ? '/login'
              : role === 'delivery'
              ? '/delivery'
              : role === 'admin'
              ? '/admin'
              : '/account'
          }
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-full transition-all shrink-0 ${
            pathname === '/account' || pathname === '/login' ? 'text-[#FF6B00]' : 'text-[#A1A1AA]'
          }`}
        >
          {role === 'delivery' ? (
            <Truck className="w-4 h-4 text-[#FFAA2C]" />
          ) : role === 'admin' ? (
            <LayoutDashboard className="w-4 h-4 text-[#FF6B00]" />
          ) : (
            <UserIcon className="w-4 h-4" />
          )}
          <span className="text-[10px] font-semibold">
            {!isAuthenticated ? (lang === 'ar' ? 'دخول' : 'Connexion') : role === 'delivery' ? 'Livreur' : (lang === 'ar' ? 'حسابي' : 'Compte')}
          </span>
        </Link>
      </div>
    </div>
  );
}
