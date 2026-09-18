'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import CodForm from './CodForm';
import { X, Zap, ShieldCheck } from 'lucide-react';

export default function FastCheckoutModal() {
  const { directCheckoutItem, closeDirectCheckout } = useCart();
  const { lang, t } = useLanguage();

  if (!directCheckoutItem) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={closeDirectCheckout}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      <div className="min-h-full flex items-center justify-center p-4 text-center sm:p-0">
        <div className="relative bg-[#14141B] border border-white/15 rounded-3xl max-w-lg w-full text-left overflow-hidden shadow-2xl shadow-black my-8">
          {/* Modal Header with Warm Glowing Accent */}
          <div className="p-6 border-b border-white/10 bg-[#18181F]/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#FFAA2C] flex items-center justify-center shadow-lg shadow-[#FF6B00]/30">
                <Zap className="w-5 h-5 text-black fill-black" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#F5F5F7] tracking-tight uppercase">
                  {t('checkout.modal_title')}
                </h3>
                <p className="text-[11px] text-[#A1A1AA]">
                  {t('checkout.modal_subtitle')}
                </p>
              </div>
            </div>
            <button
              onClick={closeDirectCheckout}
              className="p-2 rounded-full hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body with CodForm */}
          <div className="p-6">
            <CodForm
              items={[
                {
                  product: directCheckoutItem.product,
                  quantity: directCheckoutItem.quantity,
                  selectedColor: directCheckoutItem.selectedColor,
                  selectedSize: directCheckoutItem.selectedSize,
                },
              ]}
              isModal={true}
              onSuccess={() => closeDirectCheckout()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
