'use client';

import React from 'react';
import Link from 'next/link';
import { Product, formatDZD } from '@/data/products';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { Star, ShoppingBag, Zap, Eye, CheckCircle2, Flame } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { lang, t } = useLanguage();
  const { addToCart, openDirectCheckout } = useCart();

  return (
    <div className="group relative bg-[#18181F] border border-white/10 hover:border-[#FF6B00]/50 rounded-3xl p-4 sm:p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-[#FF6B00]/10 flex flex-col justify-between overflow-hidden">
      {/* Top Badges */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        {product.isFlashDeal ? (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FF6B00] text-black font-extrabold text-[10px] uppercase tracking-wider shadow-lg shadow-[#FF6B00]/40">
            <Flame className="w-3 h-3 fill-black" />
            {lang === 'ar' ? product.badgeAr || 'عرض حصري' : product.badgeFr || 'VENTE FLASH'}
          </span>
        ) : product.badgeFr ? (
          <span className="px-2.5 py-1 rounded-full bg-[#22222B] border border-white/15 text-[#FFAA2C] font-mono font-bold text-[10px] uppercase tracking-wider">
            {lang === 'ar' ? product.badgeAr : product.badgeFr}
          </span>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-1 bg-[#0D0D11]/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 text-[11px] font-mono text-[#FFAA2C]">
          <Star className="w-3 h-3 fill-[#FFAA2C] text-[#FFAA2C]" />
          <span>{product.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Product Image Stage */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-b from-[#22222B]/60 to-[#121217] my-3"
      >
        <div className="absolute inset-0 bg-radial-gradient from-[#FF6B00]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <img
          src={product.images[0]}
          alt={product.nameFr}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Quick view hint */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-opacity flex items-center justify-center">
          <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#18181F]/90 border border-white/20 text-xs font-semibold text-white shadow-xl">
            <Eye className="w-3.5 h-3.5 text-[#FFAA2C]" />
            <span>{lang === 'ar' ? 'التفاصيل' : 'Aperçu'}</span>
          </span>
        </div>
      </Link>

      {/* Product Information */}
      <div className="space-y-2 mt-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#FFAA2C] font-mono uppercase tracking-wider font-semibold">
            {t(`products.${product.category}`) || product.category}
          </span>
          <span className="flex items-center gap-1 text-[#25D366] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
            {t('products.in_stock')}
          </span>
        </div>

        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="text-sm sm:text-base font-bold text-[#F5F5F7] group-hover:text-[#FF6B00] transition-colors line-clamp-1">
            {lang === 'ar' ? product.nameAr : product.nameFr}
          </h3>
          <p className="text-xs text-[#A1A1AA] line-clamp-1 mt-0.5">
            {lang === 'ar' ? product.taglineAr : product.taglineFr}
          </p>
        </Link>

        {/* Price Row */}
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-base sm:text-lg font-mono font-black text-[#FF6B00]">
            {formatDZD(product.price, lang)}
          </span>
          {product.originalPrice && (
            <span className="text-xs font-mono text-[#A1A1AA]/60 line-through">
              {formatDZD(product.originalPrice, lang)}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons: 1-Click Fast Buy + Add to Cart */}
      <div className="grid grid-cols-5 gap-2 mt-4 pt-3 border-t border-white/5">
        <button
          onClick={() => openDirectCheckout(product)}
          className="col-span-4 py-2.5 px-3 bg-gradient-to-r from-[#FF6B00] via-[#FFAA2C] to-[#FF6B00] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-[#FF6B00]/25 hover:shadow-[#FF6B00]/45 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
        >
          <Zap className="w-3.5 h-3.5 fill-black" />
          <span>{t('products.buy_now')}</span>
        </button>

        <button
          onClick={() => addToCart(product)}
          className="col-span-1 flex items-center justify-center rounded-xl bg-[#22222B] hover:bg-white/10 border border-white/10 text-[#F5F5F7] hover:text-[#FFAA2C] transition-all"
          title={t('products.add_to_cart')}
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
