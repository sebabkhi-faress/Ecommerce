'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatDZD } from '@/data/products';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft, ShieldCheck, Zap } from 'lucide-react';

export default function CartDrawer() {
  const router = useRouter();
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();
  const { lang, t } = useLanguage();

  if (!isCartOpen) return null;

  const handleCheckoutNavigation = () => {
    setIsCartOpen(false);
    router.push('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Drawer panel */}
      <div
        className={`fixed inset-y-0 ${
          lang === 'ar' ? 'left-0' : 'right-0'
        } max-w-full flex pl-0 sm:pl-10`}
      >
        <div className="w-screen max-w-md bg-[#14141B] border-l border-white/10 shadow-2xl shadow-black text-[#F5F5F7] flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#18181F]/70 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/20 border border-[#FF6B00]/40 flex items-center justify-center text-[#FF6B00]">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-wide uppercase">{t('cart.title')}</h3>
                <p className="text-xs text-[#A1A1AA]">
                  {totalItems} {totalItems > 1 ? (lang === 'ar' ? 'منتجات' : 'articles') : (lang === 'ar' ? 'منتج' : 'article')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#18181F] border border-white/10 flex items-center justify-center text-[#A1A1AA] mb-4">
                  <ShoppingBag className="w-7 h-7 stroke-[1.5]" />
                </div>
                <p className="text-sm text-[#A1A1AA] mb-4">{t('cart.empty')}</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E05E00] text-black font-bold text-xs rounded-full shadow-lg shadow-[#FF6B00]/25 transition-all"
                >
                  {t('cart.empty_cta')}
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedColor || ''}-${item.selectedSize || ''}`}
                  className="flex gap-4 p-3.5 bg-[#18181F] border border-white/10 rounded-2xl relative group hover:border-[#FF6B00]/40 transition-colors"
                >
                  <Link
                    href={`/products/${item.product.slug || item.product.id}`}
                    onClick={() => setIsCartOpen(false)}
                    className="shrink-0"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.nameFr}
                      className="w-20 h-20 object-cover rounded-xl bg-black/40 border border-white/10 hover:border-[#FF6B00]/60 transition-colors"
                    />
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <Link
                        href={`/products/${item.product.slug || item.product.id}`}
                        onClick={() => setIsCartOpen(false)}
                        className="hover:text-[#FFAA2C] transition-colors block"
                      >
                        <h4 className="text-xs font-semibold text-[#F5F5F7] hover:text-[#FFAA2C] transition-colors truncate">
                          {lang === 'ar' ? item.product.nameAr : item.product.nameFr}
                        </h4>
                      </Link>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        {item.selectedColor && (
                          <span className="text-[11px] text-[#FFAA2C]">
                            {item.selectedColor}
                          </span>
                        )}
                        {item.selectedSize && (
                          <span className="px-1.5 py-0.5 rounded bg-[#FF6B00]/20 border border-[#FF6B00]/30 text-[10px] text-[#FF6B00] font-mono font-bold">
                            {item.selectedSize}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-mono font-bold text-[#FF6B00]">
                        {formatDZD(item.product.price, lang)}
                      </span>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1.5 bg-[#0D0D11] border border-white/10 rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-mono font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="absolute top-2.5 right-2.5 p-1 text-[#A1A1AA] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title={t('cart.delete')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer with Subtotal & COD Checkout Button */}
          {cart.length > 0 && (
            <div className="p-5 bg-[#18181F] border-t border-white/10 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#A1A1AA]">
                  <span>{t('checkout.subtotal')}</span>
                  <span className="font-mono font-bold text-white">
                    {formatDZD(subtotal, lang)}
                  </span>
                </div>
                <div className="flex justify-between text-[#A1A1AA]">
                  <span>{t('checkout.delivery_fee')}</span>
                  <span className="text-[#FFAA2C] font-semibold">
                    {t('cart.calculated_by_wilaya')}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
                <span className="text-xs uppercase tracking-wider text-[#A1A1AA] font-bold">
                  {t('cart.estimated_total')}
                </span>
                <span className="text-lg font-mono font-black text-[#FF6B00]">
                  {formatDZD(subtotal, lang)}
                </span>
              </div>

              <button
                onClick={handleCheckoutNavigation}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#FF6B00] via-[#FFAA2C] to-[#FF6B00] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-[#FF6B00]/30 hover:scale-[1.02] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>{t('cart.checkout')}</span>
                {lang === 'ar' ? (
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                ) : (
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#A1A1AA]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#25D366]" />
                <span>{t('cart.cash_guarantee')}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
