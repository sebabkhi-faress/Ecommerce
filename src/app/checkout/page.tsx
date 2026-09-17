'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { PRODUCTS } from '@/data/products';
import CodForm from '@/components/checkout/CodForm';
import { ShieldCheck, Truck, Zap, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';

export default function CheckoutPage() {
  const { cart } = useCart();
  const { lang, t } = useLanguage();

  // If cart is empty, fallback to the flagship product so user can still test/order
  const checkoutItems =
    cart.length > 0
      ? cart
      : [
          {
            product: PRODUCTS[0],
            quantity: 1,
            selectedColor: PRODUCTS[0].colors[0]?.nameFr,
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
            <span>{lang === 'ar' ? 'العودة للمتجر' : 'Retour à la boutique'}</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#FF6B00]/20 border border-[#FF6B00]/40 text-[#FF6B00] text-xs font-mono font-bold uppercase">
              EXPRESS COD CHECKOUT
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#F5F5F7] tracking-tight">
            {lang === 'ar' ? 'إتمام الطلب — الدفع عند الاستلام' : 'Validation de commande — Paiement à la livraison'}
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1AA]">
            {lang === 'ar'
              ? 'أدخل معلومات التوصيل الخاصة بك وسيتم إرسال طلبيتك إلى أي ولاية في الجزائر فوراً.'
              : 'Renseignez vos coordonnées de livraison. Votre commande sera expédiée avec suivi dans toute l’Algérie.'}
          </p>
        </div>

        {cart.length === 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-[#FFAA2C]/10 border border-[#FFAA2C]/30 text-xs text-[#FFAA2C] flex items-center gap-2">
            <Zap className="w-4 h-4 shrink-0" />
            <span>
              {lang === 'ar'
                ? 'ملاحظة: تم تحميل المنتج الأكثر طلباً تلقائياً (Aura Pro 2). يمكنك تعديل السلة في أي وقت.'
                : 'Note : Votre panier était vide, nous avons pré-sélectionné le flagship Aura Pro 2 pour votre commande.'}
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
