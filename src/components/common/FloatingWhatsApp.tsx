'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';

export default function FloatingWhatsApp() {
  const pathname = usePathname();
  const { lang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  if (pathname.startsWith('/admin')) {
    return null;
  }

  const defaultMessage =
    lang === 'ar'
      ? 'السلام عليكم، أود الاستفسار أو الطلب من متجر Bika Store.'
      : 'Salam ! Je souhaite avoir des informations ou passer une commande sur Bika Store.';

  const whatsappUrl = `https://wa.me/213550123456?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <aside
      aria-label="Assistance WhatsApp"
      className={`fixed bottom-20 sm:bottom-6 ${
        lang === 'ar' ? 'left-4 sm:left-6' : 'right-4 sm:right-6'
      } z-40`}
    >
      {/* Popover Card */}
      {isOpen && (
        <div className="mb-3 w-72 sm:w-80 bg-[#18181F] border border-white/15 rounded-2xl p-4 shadow-2xl shadow-black/80 backdrop-blur-xl animate-scaleIn">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-[#25D366]" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#25D366] ring-2 ring-[#18181F]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#F5F5F7]">{t('whatsapp.agent')}</h4>
                <p className="text-[10px] text-[#25D366] font-medium">{t('whatsapp.status')}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#A1A1AA] hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3 text-xs text-[#A1A1AA] space-y-2">
            <div className="bg-[#22222B] p-2.5 rounded-xl border border-white/5 text-[#F5F5F7]">
              {lang === 'ar'
                ? 'مرحباً بك! فريق خدمة العملاء متاح للرد على استفساراتك ومتابعة شحنتك 7 أيام في الأسبوع.'
                : 'Bienvenue chez Bika Store ! Besoin d’un conseil avant de commander en paiement à la livraison ?'}
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-black font-bold text-xs rounded-xl shadow-lg shadow-[#25D366]/25 transition-transform active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>{lang === 'ar' ? 'بدء المحادثة الفورية' : 'Démarrer la discussion'}</span>
          </a>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#1E293B] to-[#0F172A] border border-white/20 hover:border-[#25D366] shadow-2xl shadow-black/80 hover:scale-105 active:scale-95 transition-all"
        aria-label="WhatsApp Support"
      >
        <div className="absolute inset-0 rounded-full bg-[#25D366]/20 animate-ping" />
        <div className="relative w-11 h-11 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg shadow-[#25D366]/40">
          <MessageCircle className="w-6 h-6 text-black fill-black" />
        </div>
      </button>
    </aside>
  );
}
