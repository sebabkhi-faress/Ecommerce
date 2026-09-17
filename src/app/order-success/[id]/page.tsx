'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useOrders } from '@/context/OrderContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatDZD } from '@/data/products';
import {
  CheckCircle2,
  Clock,
  PhoneCall,
  Truck,
  ShieldCheck,
  Printer,
  MessageCircle,
  Home,
  Copy,
  Check,
} from 'lucide-react';

export default function OrderSuccessPage() {
  const params = useParams();
  const { getOrderById } = useOrders();
  const { lang, t } = useLanguage();
  const [copied, setCopied] = React.useState(false);

  const orderId = params.id as string;
  const order = useMemo(() => getOrderById(orderId), [orderId, getOrderById]);

  const copyTracking = () => {
    if (order) {
      navigator.clipboard.writeText(order.trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const whatsappMessage = order
    ? encodeURIComponent(
        `Salam ! Je viens de passer la commande ${order.trackingCode} au nom de ${order.fullName} (${order.wilayaNameFr}). Montant : ${order.total} DZD.`
      )
    : '';

  return (
    <div className="py-12 sm:py-20 bg-[#0D0D11] min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header Badge */}
        <div className="text-center space-y-4 mb-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#FF6B00] to-[#FFAA2C] mx-auto flex items-center justify-center shadow-2xl shadow-[#FF6B00]/40 animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-black stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold tracking-widest text-[#25D366] uppercase">
              PAIEMENT À LA LIVRAISON CONFIRMÉ
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-[#F5F5F7]">
              {t('success.title')}
            </h1>
            <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-md mx-auto">
              {t('success.subtitle')}
            </p>
          </div>

          {/* Tracking Box */}
          {order && (
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#18181F] border border-[#FF6B00]/40 shadow-lg shadow-[#FF6B00]/15">
              <span className="text-xs text-[#A1A1AA] font-medium">
                {t('success.order_id')}
              </span>
              <span className="font-mono font-black text-[#FF6B00] text-sm tracking-wider">
                {order.trackingCode}
              </span>
              <button
                onClick={copyTracking}
                className="p-1.5 rounded-lg hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors"
                title="Copier le code"
              >
                {copied ? <Check className="w-4 h-4 text-[#25D366]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>

        {/* Order Details Card */}
        {order && (
          <div className="bg-[#14141B] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Delivery Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-white/10 text-xs">
              <div>
                <p className="text-[#A1A1AA] mb-1">Destinataire :</p>
                <p className="font-bold text-[#F5F5F7] text-sm">{order.fullName}</p>
                <p className="font-mono text-[#A1A1AA] mt-0.5">{order.phone}</p>
              </div>
              <div>
                <p className="text-[#A1A1AA] mb-1">Lieu de livraison :</p>
                <p className="font-bold text-[#FFAA2C]">
                  {order.wilayaCode} - {order.wilayaNameFr} ({order.wilayaNameAr})
                </p>
                <p className="text-[#F5F5F7] mt-0.5">{order.commune}</p>
                <p className="text-[11px] text-[#A1A1AA] mt-0.5 capitalize">
                  Mode : {order.deliveryMode === 'home' ? 'À domicile' : 'Stop Desk (Point relais)'}
                </p>
              </div>
            </div>

            {/* Items Purchased */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFAA2C]">
                Articles commandés
              </h3>
              <div className="space-y-2">
                {order.items.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#18181F] border border-white/5 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      {it.image && (
                        <img
                          src={it.image}
                          alt={it.productNameFr}
                          className="w-10 h-10 object-cover rounded-lg bg-black/40 border border-white/10"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-[#F5F5F7]">
                          {lang === 'ar' ? it.productNameAr : it.productNameFr}
                        </p>
                        <p className="text-[11px] text-[#A1A1AA]">
                          Qté : {it.quantity} {it.selectedColor && `• ${it.selectedColor}`}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-[#FF6B00]">
                      {formatDZD(it.price * it.quantity, lang)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total breakdown */}
            <div className="bg-[#18181F] rounded-2xl p-4 space-y-2 text-xs border border-white/5">
              <div className="flex justify-between text-[#A1A1AA]">
                <span>Sous-total articles :</span>
                <span className="font-mono font-bold text-white">{formatDZD(order.subtotal, lang)}</span>
              </div>
              <div className="flex justify-between text-[#A1A1AA]">
                <span>Frais de livraison ({order.wilayaNameFr}) :</span>
                <span className="font-mono font-bold text-[#FFAA2C]">
                  {formatDZD(order.deliveryFee, lang)}
                </span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
                <span className="text-xs font-black uppercase text-[#F5F5F7]">Total en espèces :</span>
                <span className="text-xl font-mono font-black text-[#FF6B00]">
                  {formatDZD(order.total, lang)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a
                href={`https://wa.me/213550123456?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-black font-bold text-xs rounded-xl shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-black" />
                <span>{t('success.whatsapp_confirm')}</span>
              </a>

              <button
                onClick={handlePrint}
                className="py-3 px-4 bg-[#18181F] hover:bg-[#22222B] border border-white/10 text-[#F5F5F7] font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>{t('success.print')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Next Steps Timeline */}
        <div className="mt-8 bg-[#18181F] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5">
          <h3 className="text-sm font-bold text-[#F5F5F7] uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#FFAA2C]" />
            <span>{t('success.next_steps_title')}</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#FF6B00]/20 border border-[#FF6B00]/50 text-[#FF6B00] font-mono font-bold flex items-center justify-center shrink-0">
                1
              </div>
              <p className="text-[#A1A1AA] pt-1">{t('success.step1')}</p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#FFAA2C]/20 border border-[#FFAA2C]/50 text-[#FFAA2C] font-mono font-bold flex items-center justify-center shrink-0">
                2
              </div>
              <p className="text-[#A1A1AA] pt-1">{t('success.step2')}</p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#25D366]/20 border border-[#25D366]/50 text-[#25D366] font-mono font-bold flex items-center justify-center shrink-0">
                3
              </div>
              <p className="text-[#A1A1AA] pt-1">{t('success.step3')}</p>
            </div>
          </div>
        </div>

        {/* Back to Home Button */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#F5F5F7] border border-white/10 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>{t('success.back_home')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
