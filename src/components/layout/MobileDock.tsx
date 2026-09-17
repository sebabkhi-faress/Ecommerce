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

  // If inside admin or delivery console, do not show public dock
  if (pathname.startsWith('/admin') || pathname.startsWith('/delivery')) {
    return null;
  }

  return (
    <div className="fixed bottom-3 inset-x-0 z-40 px-4 sm:hidden pointer-events-none">
      <div className="max-w-md mx-auto bg-[#18181F]/90 backdrop-blur-xl border border-white/15 rounded-full p-2 shadow-2xl shadow-black/80 flex items-center justify-around pointer-events-auto">
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-all ${
            pathname === '/' ? 'text-[#FF6B00]' : 'text-[#A1A1AA]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">{t('nav.home')}</span>
        </Link>

        <Link
          href="/#deals"
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-full text-[#FFAA2C]"
        >
          <Flame className="w-5 h-5" />
          <span className="text-[10px] font-medium">{t('nav.deals')}</span>
        </Link>

        {/* Center Cart Trigger */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative -top-2 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF6B00] to-[#FFAA2C] text-black shadow-lg shadow-[#FF6B00]/40 active:scale-95 transition-transform"
          aria-label="Panier"
        >
          <ShoppingBag className="w-5 h-5 fill-black" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-white text-black font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#18181F]">
              {totalItems}
            </span>
          )}
        </button>

        <Link
          href="/#categories"
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-full text-[#A1A1AA]"
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] font-medium">{t('nav.categories')}</span>
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
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-all ${
            pathname === '/account' || pathname === '/login' ? 'text-[#FF6B00]' : 'text-[#A1A1AA]'
          }`}
        >
          {role === 'delivery' ? (
            <Truck className="w-5 h-5 text-[#FFAA2C]" />
          ) : role === 'admin' ? (
            <LayoutDashboard className="w-5 h-5 text-[#FF6B00]" />
          ) : (
            <UserIcon className="w-5 h-5" />
          )}
          <span className="text-[10px] font-medium">
            {!isAuthenticated ? (lang === 'ar' ? 'دخول' : 'Connexion') : role === 'delivery' ? 'Livreur' : (lang === 'ar' ? 'حسابي' : 'Compte')}
          </span>
        </Link>
      </div>
    </div>
  );
}
