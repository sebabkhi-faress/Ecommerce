'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useProducts } from '@/context/ProductContext';
import { PRODUCTS } from '@/data/products';
import CodForm from '@/components/checkout/CodForm';
import { ShieldCheck, Truck, Zap, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';

export default function CheckoutPage() {
  const { cart } = useCart();
  const { lang, t } = useLanguage();
  const { products } = useProducts();

  const fallbackProduct = products[0] || PRODUCTS[0];

  // If cart is empty, fallback to the flagship product so user can still test/order
  const checkoutItems =
    cart.length > 0
      ? cart
      : [
          {
            product: fallbackProduct,
            quantity: 1,
            selectedColor: fallbackProduct.colors[0]?.nameFr,
          },
        ];

  return (
    <div className="py-10 sm:py-16 bg-[#0D0D11] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-white transition-colors mb-2"
          >
            {lang === 'ar' ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
            <span>{t('checkout.return_shop')}</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#FF6B00]/20 border border-[#FF6B00]/40 text-[#FF6B00] text-xs font-mono font-bold uppercase">
              {t('checkout.express_badge')}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#F5F5F7] tracking-tight">
            {t('checkout.order_title')}
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1AA]">
            {t('checkout.order_subtitle')}
          </p>
        </div>

        {cart.length === 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-[#FFAA2C]/10 border border-[#FFAA2C]/30 text-xs text-[#FFAA2C] flex items-center gap-2">
            <Zap className="w-4 h-4 shrink-0" />
            <span>
              {t('checkout.cart_empty_note')}
            </span>
          </div>
        )}

        <div className="bg-[#14141B] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <CodForm items={checkoutItems} />
        </div>
      </div>
    </div>
  );
}
