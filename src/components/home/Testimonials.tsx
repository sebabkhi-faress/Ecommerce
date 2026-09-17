'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Star, CheckCircle, MapPin, Quote } from 'lucide-react';

export default function Testimonials() {
  const { lang, t } = useLanguage();

  const reviews = [
    {
      name: 'Sofiane M.',
      cityFr: 'Alger (Hydra)',
      cityAr: 'الجزائر العاصمة (حيدرة)',
      productFr: 'Aura Pro 2 ANC Transparent',
      productAr: 'سماعات أورا برو 2 الشفافة',
      commentFr:
        'Reçu en moins de 24h à Hydra ! Le son est dingue et l’esthétique transparente rappelle immédiatement Nothing Tech. Paiement en espèces au livreur après ouverture.',
      commentAr:
        'استلمت الطلب في أقل من 24 ساعة في حيدرة! الصوت مذهل والتصميم الشفاف فريد جداً يشبه هواتف Nothing. دفعت للموزع كاش بعد التأكد من العلبة.',
      rating: 5,
      date: 'Hier',
    },
    {
      name: 'Amel K.',
      cityFr: 'Oran (Akid Lotfi)',
      cityAr: 'وهران (عقيد لطفي)',
      productFr: 'Apex Studio 90 Casque Hi-Res',
      productAr: 'سماعات رأس أبيكس ستوديو 90',
      commentFr:
        'Casque exceptionnel pour le télétravail et les voyages. Le confort sur les oreilles est impressionnant et la batterie tient facilement toute la semaine.',
      commentAr:
        'سماعة رأس احترافية ممتازة للعمل عن بعد والرحلات. مريحة جداً على الأذنين وعزل الصوت متقن والبطارية تصمد معي أسبوعاً كاملاً.',
      rating: 5,
      date: 'Il y a 3 jours',
    },
    {
      name: 'Riad B.',
      cityFr: 'Constantine (Ali Mendjeli)',
      cityAr: 'قسنطينة (علي منجلي)',
      productFr: 'Chargeur HyperGaN 120W',
      productAr: 'شاحن GaN 120 واط فائق السرعة',
      commentFr:
        'Ce chargeur charge mon PC portable et mon smartphone à toute vitesse sans surchauffer. Finition premium et câble Kevlar très résistant.',
      commentAr:
        'يشحن حاسوبي المحمول وهاتفي معاً بسرعة فائقة وبدون أي سخونة. خامة راقية والكابل الكيفلار المرفق متين جداً.',
      rating: 5,
      date: 'Il y a 5 jours',
    },
  ];

  return (
    <section className="py-16 bg-[#0D0D11]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFAA2C]">
            COMMUNAUTÉ TECH DZ
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#F5F5F7]">
            {t('testimonials.title')}
          </h2>
          <p className="text-xs sm:text-sm text-[#A1A1AA]">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-[#18181F] border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:border-[#FF6B00]/40 transition-colors relative"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: rev.rating }).map((_, r) => (
                      <Star
                        key={r}
                        className="w-4 h-4 fill-[#FFAA2C] text-[#FFAA2C]"
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-mono text-[#A1A1AA]">{rev.date}</span>
                </div>

                <p className="text-xs sm:text-sm text-[#F5F5F7] leading-relaxed italic mb-4">
                  &ldquo;{lang === 'ar' ? rev.commentAr : rev.commentFr}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F5F5F7] flex items-center gap-1">
                    <span>{rev.name}</span>
                    <CheckCircle className="w-3.5 h-3.5 text-[#25D366]" />
                  </span>
                  <span className="text-[11px] text-[#FFAA2C] font-mono flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{lang === 'ar' ? rev.cityAr : rev.cityFr}</span>
                  </span>
                </div>
                <p className="text-[11px] text-[#A1A1AA] truncate">
                  {lang === 'ar' ? rev.productAr : rev.productFr}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
