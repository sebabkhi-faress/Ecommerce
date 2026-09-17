'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlug, getProductById, formatDZD } from '@/data/products';
import { WILAYAS, getWilayaByCode } from '@/data/wilayas';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import CodForm from '@/components/checkout/CodForm';
import {
  Star,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Share2,
  Clock,
  Sparkles,
  Layers,
  MapPin,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { lang, t } = useLanguage();
  const { addToCart, openDirectCheckout } = useCart();

  const idOrSlug = params.id as string;
  const product = useMemo(() => {
    return getProductBySlug(idOrSlug) || getProductById(idOrSlug);
  }, [idOrSlug]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [calcWilayaCode, setCalcWilayaCode] = useState('16'); // Alger
  const [openAccordion, setOpenAccordion] = useState<string | null>('specs');

  const selectedWilaya = useMemo(
    () => getWilayaByCode(calcWilayaCode) || WILAYAS[15],
    [calcWilayaCode]
  );

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-xl font-bold text-white mb-2">Produit non trouvé</h2>
        <p className="text-sm text-[#A1A1AA] mb-6">Le produit que vous recherchez n’existe pas ou a été déplacé.</p>
        <Link
          href="/"
          className="px-6 py-2.5 bg-[#FF6B00] text-black font-bold rounded-xl text-xs"
        >
          Retour à l’accueil
        </Link>
      </div>
    );
  }

  const selectedColor = product.colors[selectedColorIndex];

  return (
    <div className="py-8 sm:py-12 bg-[#0D0D11] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb / Back Link */}
        <div className="mb-6 flex items-center gap-2 text-xs text-[#A1A1AA]">
          <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
            {lang === 'ar' ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
            <span>{t('pdp.back')}</span>
          </Link>
          <span>/</span>
          <span className="capitalize text-[#FFAA2C] font-mono">{product.category}</span>
          <span>/</span>
          <span className="text-[#F5F5F7] truncate max-w-xs">
            {lang === 'ar' ? product.nameAr : product.nameFr}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Interactive Gallery */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-b from-[#18181F] to-[#121217] border border-white/10 p-4 flex items-center justify-center group shadow-2xl">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.nameFr}
                className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
              />

              {/* Tag / Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                {product.isFlashDeal && (
                  <span className="px-3 py-1 rounded-full bg-[#FF6B00] text-black font-extrabold text-[11px] uppercase tracking-wider shadow-lg shadow-[#FF6B00]/40">
                    {lang === 'ar' ? product.badgeAr || 'تخفيض حصري' : product.badgeFr || 'PROMO FLASH'}
                  </span>
                )}
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white font-mono text-[11px]">
                  100% ORIGINAL
                </span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden bg-[#18181F] border-2 transition-all shrink-0 ${
                      activeImageIndex === idx
                        ? 'border-[#FF6B00] shadow-lg shadow-[#FF6B00]/30 scale-105'
                        : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Technical Accordions */}
            <div className="mt-8 space-y-3">
              {/* Accordion 1: Specs */}
              <div className="bg-[#18181F] border border-white/10 rounded-2xl overflow-hidden">
                <button
                  onClick={() =>
                    setOpenAccordion(openAccordion === 'specs' ? null : 'specs')
                  }
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-sm text-[#F5F5F7] hover:text-[#FFAA2C] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FF6B00]" />
                    {t('pdp.specs')}
                  </span>
                  {openAccordion === 'specs' ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {openAccordion === 'specs' && (
                  <div className="p-4 pt-0 border-t border-white/5 space-y-2 text-xs">
                    {product.specs.map((spec, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-1.5 border-b border-white/5"
                      >
                        <span className="text-[#A1A1AA]">
                          {lang === 'ar' ? spec.labelAr : spec.labelFr}
                        </span>
                        <span className="font-mono font-semibold text-[#F5F5F7]">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Accordion 2: Features */}
              <div className="bg-[#18181F] border border-white/10 rounded-2xl overflow-hidden">
                <button
                  onClick={() =>
                    setOpenAccordion(openAccordion === 'features' ? null : 'features')
                  }
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-sm text-[#F5F5F7] hover:text-[#FFAA2C] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#FFAA2C]" />
                    {t('pdp.key_features')}
                  </span>
                  {openAccordion === 'features' ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {openAccordion === 'features' && (
                  <div className="p-4 pt-0 border-t border-white/5 space-y-2.5 text-xs text-[#A1A1AA]">
                    {(lang === 'ar' ? product.featuresAr : product.featuresFr).map(
                      (feat, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Accordion 3: Wilaya Delivery Estimator */}
              <div className="bg-[#18181F] border border-white/10 rounded-2xl overflow-hidden">
                <button
                  onClick={() =>
                    setOpenAccordion(openAccordion === 'delivery' ? null : 'delivery')
                  }
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-sm text-[#F5F5F7] hover:text-[#FFAA2C] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#25D366]" />
                    {t('pdp.delivery_calc')}
                  </span>
                  {openAccordion === 'delivery' ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {openAccordion === 'delivery' && (
                  <div className="p-4 pt-0 border-t border-white/5 space-y-4 text-xs">
                    <div>
                      <label className="block text-[#A1A1AA] mb-1.5 font-medium">
                        {t('pdp.choose_wilaya')}
                      </label>
                      <select
                        value={calcWilayaCode}
                        onChange={(e) => setCalcWilayaCode(e.target.value)}
                        className="w-full bg-[#14141B] border border-white/15 focus:border-[#FF6B00] rounded-xl px-3 py-2 text-xs text-[#F5F5F7] outline-none"
                      >
                        {WILAYAS.map((w) => (
                          <option key={w.code} value={w.code} className="bg-[#18181F]">
                            {w.code} - {w.nameFr} ({w.nameAr})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-[#14141B] p-3 rounded-xl border border-white/5">
                        <p className="text-[11px] text-[#A1A1AA]">Livraison à Domicile :</p>
                        <p className="text-sm font-mono font-bold text-[#FF6B00] mt-0.5">
                          {selectedWilaya.homeDeliveryFee} DZD
                        </p>
                        <p className="text-[10px] text-[#A1A1AA] mt-0.5">
                          Délai : {selectedWilaya.estimatedDays} jours ouvrés
                        </p>
                      </div>

                      <div className="bg-[#14141B] p-3 rounded-xl border border-white/5">
                        <p className="text-[11px] text-[#A1A1AA]">Stop Desk (Bureau) :</p>
                        <p className="text-sm font-mono font-bold text-[#FFAA2C] mt-0.5">
                          {selectedWilaya.deskDeliveryFee} DZD
                        </p>
                        <p className="text-[10px] text-[#A1A1AA] mt-0.5">
                          Délai : {selectedWilaya.estimatedDays} jours ouvrés
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Product Info & Direct COD Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#18181F] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5">
              {/* Reviews & Stock */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-[#FFAA2C]">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#FFAA2C] text-[#FFAA2C]" />
                    ))}
                  </div>
                  <span className="font-mono font-bold">({product.reviewsCount} {t('products.reviews')})</span>
                </div>

                <span className="flex items-center gap-1 text-[#25D366] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping" />
                  {t('products.in_stock')} ({product.stockCount} {lang === 'ar' ? 'قطع' : 'restantes'})
                </span>
              </div>

              {/* Title & Tagline */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#F5F5F7] tracking-tight">
                  {lang === 'ar' ? product.nameAr : product.nameFr}
                </h1>
                <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1.5 leading-relaxed">
                  {lang === 'ar' ? product.taglineAr : product.taglineFr}
                </p>
              </div>

              {/* Price */}
              <div className="p-4 bg-[#14141B] rounded-2xl border border-white/5 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl sm:text-3xl font-mono font-black text-[#FF6B00]">
                    {formatDZD(product.price, lang)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xs font-mono text-[#A1A1AA]/60 line-through ml-3">
                      {formatDZD(product.originalPrice, lang)}
                    </span>
                  )}
                </div>
                <span className="text-xs font-mono text-[#FFAA2C] bg-[#FFAA2C]/10 px-2.5 py-1 rounded-full font-bold">
                  {lang === 'ar' ? 'دفع عند الاستلام' : 'Paiement COD'}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                {lang === 'ar' ? product.descriptionAr : product.descriptionFr}
              </p>

              {/* Color Picker */}
              {product.colors.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#F5F5F7]">
                    {t('pdp.color')} <span className="text-[#FFAA2C]">{lang === 'ar' ? selectedColor?.nameAr : selectedColor?.nameFr}</span>
                  </label>
                  <div className="flex gap-2">
                    {product.colors.map((color, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedColorIndex(idx)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                          selectedColorIndex === idx
                            ? 'border-[#FF6B00] bg-[#FF6B00]/10 text-white shadow-md'
                            : 'border-white/10 bg-[#14141B] text-[#A1A1AA] hover:border-white/20'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span>{lang === 'ar' ? color.nameAr : color.nameFr}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons: Fast Buy & Add to Cart */}
              <div className="grid grid-cols-5 gap-3 pt-2">
                <button
                  onClick={() => openDirectCheckout(product, quantity, selectedColor?.nameFr)}
                  className="col-span-4 py-3.5 px-4 bg-gradient-to-r from-[#FF6B00] via-[#FFAA2C] to-[#FF6B00] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#FF6B00]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-black" />
                  <span>{t('products.buy_now')}</span>
                </button>

                <button
                  onClick={() => addToCart(product, quantity, selectedColor?.nameFr)}
                  className="col-span-1 flex items-center justify-center rounded-xl bg-[#22222B] hover:bg-white/10 border border-white/10 text-white hover:text-[#FFAA2C] transition-all"
                  title={t('products.add_to_cart')}
                >
                  <ShoppingBag className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Direct 1-Click Embedded COD Form for frictionless ordering */}
            <div className="bg-[#18181F] border border-white/10 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-white/10">
                <Zap className="w-4 h-4 text-[#FF6B00]" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F5F5F7]">
                  {lang === 'ar' ? 'طلب فوري مباشر دون مغادرة الصفحة' : 'Formulaire de commande express immédiate'}
                </h3>
              </div>

              <CodForm
                items={[
                  {
                    product,
                    quantity,
                    selectedColor: selectedColor?.nameFr,
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Order Bar for Mobile */}
      <div className="fixed bottom-0 inset-x-0 z-30 p-3 bg-[#18181F]/95 backdrop-blur-xl border-t border-white/10 sm:hidden flex items-center justify-between gap-3 shadow-2xl">
        <div>
          <span className="text-[10px] text-[#A1A1AA] uppercase block">{lang === 'ar' ? 'السعر' : 'Prix'} :</span>
          <span className="text-base font-mono font-black text-[#FF6B00]">
            {formatDZD(product.price, lang)}
          </span>
        </div>

        <button
          onClick={() => openDirectCheckout(product, quantity, selectedColor?.nameFr)}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-[#FF6B00] to-[#FFAA2C] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#FF6B00]/40 flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
        >
          <Zap className="w-4 h-4 fill-black" />
          <span>{t('pdp.sticky_buy')}</span>
        </button>
      </div>
    </div>
  );
}
