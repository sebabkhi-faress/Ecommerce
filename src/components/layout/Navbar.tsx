'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { PRODUCTS, Product } from '@/data/products';
import {
  Search,
  ShoppingBag,
  Zap,
  Globe,
  SlidersHorizontal,
  X,
  ArrowUpRight,
  ShieldAlert,
  Flame,
  LayoutDashboard,
  Sun,
  Moon,
} from 'lucide-react';

export default function Navbar() {
  const { lang, toggleLanguage, t } = useLanguage();
  const { totalItems, setIsCartOpen } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const matches = PRODUCTS.filter(
      (p) =>
        p.nameFr.toLowerCase().includes(q) ||
        p.nameAr.toLowerCase().includes(q) ||
        p.descriptionFr.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
    setSearchResults(matches);
  }, [searchQuery]);

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'backdrop-blur-xl bg-[#0D0D11]/85 border-b border-white/10 shadow-2xl shadow-black/60'
            : 'backdrop-blur-md bg-[#0D0D11]/70 border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo */}
            <div className="flex items-center gap-8">
              <Link href="/" className="group flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#FFAA2C] flex items-center justify-center shadow-lg shadow-[#FF6B00]/25 group-hover:scale-105 transition-transform">
                  <Zap className="w-5 h-5 text-black fill-black" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-black tracking-tighter text-[#F5F5F7] group-hover:text-white transition-colors flex items-center">
                    ELECTRONICS<span className="text-[#FF6B00] animate-pulse">.</span>
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#FFAA2C]/80 -mt-1 font-semibold">
                    {lang === 'ar' ? 'الجزائر 2026' : 'ALGERIA 2026'}
                  </span>
                </div>
              </Link>

              {/* Desktop Nav Links */}
              <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
                <Link
                  href="/"
                  className="px-3.5 py-2 text-sm font-medium text-[#A1A1AA] hover:text-[#F5F5F7] hover:bg-white/5 rounded-full transition-colors"
                >
                  {t('nav.home')}
                </Link>
                <Link
                  href="/#products"
                  className="px-3.5 py-2 text-sm font-medium text-[#A1A1AA] hover:text-[#F5F5F7] hover:bg-white/5 rounded-full transition-colors"
                >
                  {t('nav.products')}
                </Link>
                <Link
                  href="/#deals"
                  className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-[#FFAA2C] hover:text-[#FF6B00] hover:bg-[#FFAA2C]/10 rounded-full transition-colors"
                >
                  <Flame className="w-4 h-4" />
                  {t('nav.deals')}
                </Link>
                <Link
                  href="/#guarantees"
                  className="px-3.5 py-2 text-sm font-medium text-[#A1A1AA] hover:text-[#F5F5F7] hover:bg-white/5 rounded-full transition-colors"
                >
                  {t('nav.guarantees')}
                </Link>
                <Link
                  href="/admin"
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono text-[#A1A1AA] hover:text-[#FFAA2C] border border-white/10 hover:border-[#FFAA2C]/30 rounded-full transition-colors bg-[#18181F]/60"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>{t('nav.admin')}</span>
                </Link>
              </nav>
            </div>

            {/* Right Actions: Search, Language Pill, Cart */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Quick Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs text-[#A1A1AA] bg-[#18181F]/90 hover:bg-[#22222B] border border-white/10 hover:border-white/20 rounded-full transition-all group"
                aria-label="Search"
              >
                <Search className="w-3.5 h-3.5 text-[#FFAA2C] group-hover:scale-110 transition-transform" />
                <span className="hidden md:inline font-medium">{t('nav.search')}</span>
                <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-black/40 text-neutral-400 rounded border border-white/10">
                  ⌘K
                </kbd>
              </button>

              {/* Language Switcher Pill (AR ⇄ FR) */}
              <button
                onClick={toggleLanguage}
                className="relative flex items-center p-1 bg-[#18181F] border border-white/10 rounded-full hover:border-[#FF6B00]/40 transition-all group"
                title={lang === 'fr' ? 'Changer en Arabe' : 'Changer en Français'}
              >
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                    lang === 'ar'
                      ? 'bg-gradient-to-r from-[#FF6B00] to-[#FFAA2C] text-black shadow-md'
                      : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  <span>العربية</span>
                </div>
                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                    lang === 'fr'
                      ? 'bg-gradient-to-r from-[#FF6B00] to-[#FFAA2C] text-black shadow-md'
                      : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  <span>FR</span>
                </div>
              </button>

              {/* Theme Toggle Button (Light ⇄ Dark) */}
              <button
                onClick={toggleTheme}
                className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#18181F] hover:bg-[#22222B] border border-white/10 hover:border-[#FFAA2C]/50 transition-all text-[#F5F5F7] group shadow-inner"
                title={theme === 'light' ? (lang === 'ar' ? 'الوضع الداكن' : 'Mode sombre') : (lang === 'ar' ? 'الوضع الفاتح' : 'Mode clair')}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon className="w-4 h-4 text-[#64748B] group-hover:text-[#0F172A] transition-colors" />
                ) : (
                  <Sun className="w-4 h-4 text-[#FFAA2C] group-hover:rotate-45 transition-transform" />
                )}
              </button>

              {/* Cart Drawer Trigger Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center justify-center w-11 h-11 rounded-full bg-[#18181F] hover:bg-[#22222B] border border-white/10 hover:border-[#FF6B00]/50 transition-all text-[#F5F5F7] group shadow-inner"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5 text-[#F5F5F7] group-hover:text-[#FF6B00] transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#FF6B00] text-black font-extrabold text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-[#FF6B00]/50 animate-bounce">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Minimalist Search Overlay Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#18181F] border border-white/15 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden">
            <div className="flex items-center px-4 py-3 border-b border-white/10">
              <Search className="w-5 h-5 text-[#FF6B00]" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('nav.search')}
                className="w-full bg-transparent px-3 text-sm text-[#F5F5F7] placeholder-[#A1A1AA] focus:outline-none"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-4">
              {searchQuery.trim() === '' ? (
                <div className="py-8 text-center text-[#A1A1AA] text-sm">
                  <p className="font-mono text-xs uppercase tracking-widest text-[#FFAA2C] mb-2">
                    {lang === 'ar' ? 'بحث سريع عن المنتجات أو الأقسام' : 'RECHERCHE RAPIDE PAR PRODUIT OU CATÉGORIE'}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {['Aura Pro 2', 'Apex Studio 90', 'GaN 120W', 'MagSafe', 'IPX7'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="px-3 py-1 bg-white/5 hover:bg-[#FF6B00]/20 hover:border-[#FF6B00]/40 border border-white/10 rounded-full text-xs text-[#F5F5F7] transition-all"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.nameFr}
                        className="w-14 h-14 object-cover rounded-lg bg-black/40 border border-white/10"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-[#F5F5F7] group-hover:text-[#FFAA2C] truncate">
                            {lang === 'ar' ? product.nameAr : product.nameFr}
                          </h4>
                          <span className="text-xs font-mono font-bold text-[#FF6B00]">
                            {product.price.toLocaleString('fr-DZ')} {lang === 'ar' ? 'د.ج' : 'DZD'}
                          </span>
                        </div>
                        <p className="text-xs text-[#A1A1AA] truncate mt-0.5">
                          {lang === 'ar' ? product.taglineAr : product.taglineFr}
                        </p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-[#A1A1AA] group-hover:text-[#FFAA2C] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-[#A1A1AA] text-sm">
                  {lang === 'ar' ? `لا توجد نتائج لـ "${searchQuery}"` : `Aucun produit trouvé pour "${searchQuery}"`}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
