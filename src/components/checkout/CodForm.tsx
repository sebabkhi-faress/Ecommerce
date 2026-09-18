'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useOrders, useDeliveryFees } from '@/context/OrderContext';
import { usePromotions } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';
import { WILAYAS, Wilaya, getWilayaByCode } from '@/data/wilayas';
import { Product, formatDZD } from '@/data/products';
import {
  ShieldCheck,
  Truck,
  Building2,
  Home,
  CheckCircle2,
  AlertCircle,
  Zap,
  Phone,
  User,
  MapPin,
  ChevronDown,
  Tag,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CodFormProps {
  items: {
    product: Product;
    quantity: number;
    selectedColor?: string;
    selectedSize?: string;
  }[];
  onSuccess?: (orderId: string) => void;
  isModal?: boolean;
}

export default function CodForm({ items, onSuccess, isModal = false }: CodFormProps) {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const { createOrder, checkPhoneBannedAsync, isPhoneBanned } = useOrders();
  const { getDeliveryFeeForWilaya } = useDeliveryFees();
  const { getPromotionForProduct } = usePromotions();
  const { clearCart } = useCart();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedWilayaCode, setSelectedWilayaCode] = useState('16'); // Default to Alger
  const [commune, setCommune] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<'home' | 'desk'>('home');
  const [notes, setNotes] = useState('');

  const [phoneError, setPhoneError] = useState('');
  const [bannedError, setBannedError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Editable items state to allow quantity adjustments directly in form
  const [formItems, setFormItems] = useState(items);
  useEffect(() => {
    setFormItems(items);
  }, [items]);

  // Pre-fill phone and name if saved from past session
  useEffect(() => {
    try {
      const savedPhone = localStorage.getItem('bika_customer_phone');
      const savedName = localStorage.getItem('bika_customer_name');
      if (savedPhone && !phone) setPhone(savedPhone);
      if (savedName && !fullName) setFullName(savedName);
    } catch (e) {
      // Ignore
    }
  }, []);

  const selectedWilaya = useMemo(
    () => getWilayaByCode(selectedWilayaCode) || WILAYAS[15],
    [selectedWilayaCode]
  );

  // Dynamic delivery fees from database / context
  const homeDeliveryFee = useMemo(
    () => getDeliveryFeeForWilaya(selectedWilaya.code, 'home'),
    [getDeliveryFeeForWilaya, selectedWilaya.code]
  );

  const deskDeliveryFee = useMemo(
    () => getDeliveryFeeForWilaya(selectedWilaya.code, 'desk'),
    [getDeliveryFeeForWilaya, selectedWilaya.code]
  );

  const deliveryFee = deliveryMode === 'home' ? homeDeliveryFee : deskDeliveryFee;

  // Calculate promotional prices for all items in checkout
  const itemsWithPricing = useMemo(() => {
    return formItems.map((item) => {
      const promo = getPromotionForProduct(item.product);
      const unitPrice = promo ? promo.finalPrice : item.product.price;
      const originalUnitPrice = item.product.price;
      const hasDiscount = promo !== null && promo.savings > 0;
      return {
        ...item,
        unitPrice,
        originalUnitPrice,
        hasDiscount,
        promo,
        itemTotal: unitPrice * item.quantity,
        totalSavings: hasDiscount && promo ? promo.savings * item.quantity : 0,
      };
    });
  }, [formItems, getPromotionForProduct]);

  const subtotal = useMemo(
    () => itemsWithPricing.reduce((sum, item) => sum + item.itemTotal, 0),
    [itemsWithPricing]
  );

  const totalPromoSavings = useMemo(
    () => itemsWithPricing.reduce((sum, item) => sum + item.totalSavings, 0),
    [itemsWithPricing]
  );

  const total = subtotal + deliveryFee;

  // Phone validation for Algeria: 05, 06, 07 followed by 8 digits (10 digits total)
  const validatePhone = (num: string) => {
    const cleaned = num.replace(/\s+/g, '').replace(/[-_.]/g, '');
    const regex = /^(0)(5|6|7)[0-9]{8}$/;
    return regex.test(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePhone(phone)) {
      setPhoneError(t('checkout.phone_error'));
      return;
    }
    setPhoneError('');
    setBannedError(null);

    if (!fullName.trim() || !commune.trim()) {
      return;
    }

    setIsSubmitting(true);

    // 1. Check if phone is blacklisted/banned
    try {
      const banCheck = await checkPhoneBannedAsync(phone.trim());
      if (banCheck.isBanned) {
        setIsSubmitting(false);
        const reasonText = banCheck.reason ? ` (${banCheck.reason})` : '';
        setBannedError(
          lang === 'ar'
            ? `⚠️ هذا الرقم محظور من الطلب نظراً لتكرار إلغاء الطلبيات أو رفض الاستلام${reasonText}. يرجى التواصل مع إدارة المتجر.`
            : `⚠️ Ce numéro de téléphone est suspendu pour commandes${reasonText}. Veuillez contacter notre service client.`
        );
        return;
      }
    } catch (e) {
      if (isPhoneBanned(phone.trim())) {
        setIsSubmitting(false);
        setBannedError(
          lang === 'ar'
            ? '⚠️ هذا الرقم محظور من إتمام الطلبيات.'
            : '⚠️ Ce numéro de téléphone est suspendu pour commandes.'
        );
        return;
      }
    }

    try {
      const orderItems = itemsWithPricing.map((item) => ({
        productId: item.product.id,
        productNameFr: item.product.nameFr,
        productNameAr: item.product.nameAr,
        price: item.unitPrice,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
        image: item.product.images[0],
      }));

      const newOrder = createOrder({
        fullName: fullName.trim(),
        phone: phone.trim(),
        wilayaCode: selectedWilaya.code,
        wilayaNameFr: selectedWilaya.nameFr,
        wilayaNameAr: selectedWilaya.nameAr,
        commune: commune.trim(),
        deliveryMode,
        notes: notes.trim() || undefined,
        items: orderItems,
        subtotal,
        deliveryFee,
        total,
      });

      // Launch celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF6B00', '#FFAA2C', '#FFFFFF'],
        });
      } catch (err) {
        // Confetti fallback
      }

      // Save customer phone and name locally for easy future order tracking
      try {
        localStorage.setItem('bika_customer_phone', phone.trim());
        localStorage.setItem('bika_customer_name', fullName.trim());
      } catch (e) {
        // Ignore
      }

      clearCart();

      if (onSuccess) {
        onSuccess(newOrder.id);
      } else {
        router.push(`/order-success/${newOrder.id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Summary Preview in Form */}
      <div className="bg-[#18181F] border border-white/10 rounded-2xl p-4 space-y-3">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFAA2C] flex items-center justify-between">
          <span>{t('checkout.order_summary')}</span>
          <span className="text-[11px] text-[#A1A1AA] lowercase">
            {formItems.reduce((s, i) => s + i.quantity, 0)} {t('checkout.articles_count')}
          </span>
        </h4>

        <div className="space-y-2.5 max-h-48 overflow-y-auto">
          {itemsWithPricing.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 text-xs bg-white/[0.02] p-2 rounded-xl border border-white/5">
              <img
                src={item.product.images[0]}
                alt={item.product.nameFr}
                className="w-12 h-12 object-cover rounded-lg bg-black/40 border border-white/10 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#F5F5F7] truncate">
                  {lang === 'ar' ? item.product.nameAr : item.product.nameFr}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-[#A1A1AA] mt-1 flex-wrap">
                  {/* Inline Quantity Stepper */}
                  <div className="inline-flex items-center gap-1.5 bg-[#14141B] border border-white/10 rounded-lg p-0.5 shadow-inner">
                    <button
                      type="button"
                      onClick={() => {
                        setFormItems((prev) =>
                          prev.map((it, i) =>
                            i === idx ? { ...it, quantity: Math.max(1, it.quantity - 1) } : it
                          )
                        );
                      }}
                      disabled={item.quantity <= 1}
                      className="w-5 h-5 rounded bg-white/5 hover:bg-white/15 disabled:opacity-30 flex items-center justify-center text-white font-bold text-xs transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-mono font-bold text-xs text-[#FF6B00]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormItems((prev) =>
                          prev.map((it, i) =>
                            i === idx
                              ? { ...it, quantity: Math.min(it.product.stockCount || 99, it.quantity + 1) }
                              : it
                          )
                        );
                      }}
                      disabled={item.quantity >= (item.product.stockCount || 99)}
                      className="w-5 h-5 rounded bg-white/5 hover:bg-white/15 disabled:opacity-30 flex items-center justify-center text-white font-bold text-xs transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  {item.selectedColor && <span>• {item.selectedColor}</span>}
                  {item.selectedSize && (
                    <span className="px-1.5 py-0.5 rounded bg-[#FF6B00]/20 border border-[#FF6B00]/30 text-[10px] text-[#FF6B00] font-mono font-bold">
                      {item.selectedSize}
                    </span>
                  )}
                  {item.hasDiscount && (
                    <span className="px-1.5 py-0.5 rounded bg-[#FF6B00]/20 text-[#FFAA2C] font-mono text-[10px] font-bold border border-[#FF6B00]/30">
                      -{item.promo?.discountPercent}%
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono font-bold text-[#FF6B00] block">
                  {formatDZD(item.itemTotal, lang)}
                </span>
                {item.hasDiscount && (
                  <span className="font-mono text-[10px] text-[#A1A1AA]/60 line-through block">
                    {formatDZD(item.originalUnitPrice * item.quantity, lang)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Information Fields */}
      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-[#F5F5F7] mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#FFAA2C]" />
            <span>{t('checkout.full_name')}</span>
            <span className="text-[#FF6B00]">*</span>
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={t('checkout.full_name_placeholder')}
            className="w-full bg-[#18181F] border border-white/15 focus:border-[#FF6B00] rounded-xl px-4 py-3.5 text-base sm:text-sm text-[#F5F5F7] placeholder-[#A1A1AA]/50 outline-none transition-colors"
          />
        </div>

        {/* Phone Number with DZ validation */}
        <div>
          <label className="block text-xs font-semibold text-[#F5F5F7] mb-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#FFAA2C]" />
              <span>{t('checkout.phone')}</span>
              <span className="text-[#FF6B00]">*</span>
            </div>
            <span className="text-[10px] font-mono text-[#A1A1AA]">
              {phone.length}/10 {lang === 'ar' ? 'أرقام' : 'chiffres'}
            </span>
          </label>
          <div className="relative">
            <input
              type="tel"
              required
              dir="ltr"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="tel"
              maxLength={10}
              value={phone}
              onChange={(e) => {
                // Strictly numbers only: strip letters, spaces, symbols, max 10 digits
                const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                setPhone(cleaned);
                if (phoneError) setPhoneError('');
                if (bannedError) setBannedError(null);
              }}
              placeholder="0677898762"
              className={`w-full bg-[#18181F] border ${
                phoneError ? 'border-red-500' : 'border-white/15 focus:border-[#FF6B00]'
              } rounded-xl px-4 py-3.5 text-base sm:text-sm text-[#F5F5F7] font-mono placeholder-[#A1A1AA]/50 outline-none transition-colors tracking-wider`}
            />
            <span className="absolute right-3 top-3.5 text-xs text-[#A1A1AA] font-mono pointer-events-none">
              DZ +213
            </span>
          </div>
          {phoneError ? (
            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {phoneError}
            </p>
          ) : (
            <p className="text-[11px] text-[#A1A1AA] mt-1 font-mono">
              {lang === 'ar' ? '10 أرقام تبدأ بـ 05 أو 06 أو 07 (مثال: 0677898762)' : '10 chiffres : 05, 06 ou 07 (Ex: 0677898762)'}
            </p>
          )}
        </div>

        {/* Wilaya Dropdown (01 - 68) */}
        <div>
          <label className="block text-xs font-semibold text-[#F5F5F7] mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#FFAA2C]" />
            <span>{t('checkout.wilaya')}</span>
            <span className="text-[#FF6B00]">*</span>
          </label>
          <div className="relative">
            <select
              value={selectedWilayaCode}
              onChange={(e) => setSelectedWilayaCode(e.target.value)}
              className="w-full appearance-none bg-[#18181F] border border-white/15 focus:border-[#FF6B00] rounded-xl px-4 py-3.5 ltr:pr-10 rtl:pl-10 text-base sm:text-sm text-[#F5F5F7] outline-none transition-colors cursor-pointer"
            >
              {WILAYAS.map((w) => (
                <option key={w.code} value={w.code} className="bg-[#18181F] text-[#F5F5F7] py-2">
                  {w.code} — {w.nameFr} ({w.nameAr})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 ltr:right-3.5 rtl:left-3.5 flex items-center text-[#A1A1AA]">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Commune / Detailed Address */}
        <div>
          <label className="block text-xs font-semibold text-[#F5F5F7] mb-1.5">
            {t('checkout.commune')}
            <span className="text-[#FF6B00]">*</span>
          </label>
          <input
            type="text"
            required
            value={commune}
            onChange={(e) => setCommune(e.target.value)}
            placeholder={t('checkout.commune_placeholder')}
            className="w-full bg-[#18181F] border border-white/15 focus:border-[#FF6B00] rounded-xl px-4 py-3.5 text-base sm:text-sm text-[#F5F5F7] placeholder-[#A1A1AA]/50 outline-none transition-colors"
          />
        </div>

        {/* Delivery Mode Radio Selector */}
        <div>
          <label className="block text-xs font-semibold text-[#F5F5F7] mb-2">
            {t('checkout.delivery_mode')}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDeliveryMode('home')}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all text-left ${
                deliveryMode === 'home'
                  ? 'bg-[#FF6B00]/10 border-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/15'
                  : 'bg-[#18181F] border-white/10 text-[#A1A1AA] hover:border-white/20'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  deliveryMode === 'home'
                    ? 'bg-[#FF6B00] text-black'
                    : 'bg-white/5 text-[#A1A1AA]'
                }`}
              >
                <Home className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-[#F5F5F7]">
                  {t('checkout.home_delivery')}
                </p>
                <p className="text-[11px] font-mono text-[#FFAA2C] font-semibold mt-0.5">
                  +{homeDeliveryFee} DZD ({selectedWilaya.estimatedDays} {t('checkout.days')})
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setDeliveryMode('desk')}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all text-left ${
                deliveryMode === 'desk'
                  ? 'bg-[#FF6B00]/10 border-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/15'
                  : 'bg-[#18181F] border-white/10 text-[#A1A1AA] hover:border-white/20'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  deliveryMode === 'desk'
                    ? 'bg-[#FF6B00] text-black'
                    : 'bg-white/5 text-[#A1A1AA]'
                }`}
              >
                <Building2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-[#F5F5F7]">
                  {t('checkout.desk_delivery')}
                </p>
                <p className="text-[11px] font-mono text-[#FFAA2C] font-semibold mt-0.5">
                  +{deskDeliveryFee} DZD ({selectedWilaya.estimatedDays} {t('checkout.days')})
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
            {t('checkout.notes')}
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('checkout.notes_placeholder')}
            className="w-full bg-[#18181F] border border-white/15 focus:border-[#FF6B00] rounded-xl px-4 py-3 sm:py-2.5 text-base sm:text-xs text-[#F5F5F7] placeholder-[#A1A1AA]/40 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Pricing Summary Breakdown */}
      <div className="bg-[#18181F] border border-white/10 rounded-2xl p-4 space-y-2 text-xs">
        <div className="flex justify-between text-[#A1A1AA]">
          <span>{t('checkout.subtotal')}</span>
          <span className="font-mono font-bold text-[#F5F5F7]">
            {formatDZD(subtotal + totalPromoSavings, lang)}
          </span>
        </div>
        {totalPromoSavings > 0 && (
          <div className="flex justify-between text-[#25D366]">
            <span className="flex items-center gap-1 font-semibold">
              <Tag className="w-3.5 h-3.5" />
              {lang === 'ar' ? 'تخفيض ترويجي' : 'Remise promotionnelle'}
            </span>
            <span className="font-mono font-bold">
              -{formatDZD(totalPromoSavings, lang)}
            </span>
          </div>
        )}
        <div className="flex justify-between text-[#A1A1AA]">
          <span>{t('checkout.delivery_fee')} ({lang === 'ar' ? selectedWilaya.nameAr : selectedWilaya.nameFr})</span>
          <span className="font-mono font-bold text-[#FFAA2C]">
            {formatDZD(deliveryFee, lang)}
          </span>
        </div>
        <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
          <span className="text-xs font-extrabold uppercase text-[#F5F5F7]">
            {t('checkout.total')}
          </span>
          <span className="text-xl font-mono font-black text-[#FF6B00]">
            {formatDZD(total, lang)}
          </span>
        </div>
      </div>

      {/* Banned / Blacklisted Phone Error Notice */}
      {bannedError && (
        <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs sm:text-sm font-medium leading-relaxed flex items-start gap-3 animate-fadeIn shadow-lg shadow-red-900/20">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">{bannedError}</div>
        </div>
      )}

      {/* High Contrast Massive Glowing CTA Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 px-6 bg-gradient-to-r from-[#FF6B00] via-[#FFAA2C] to-[#FF6B00] text-black font-black text-sm uppercase tracking-wider rounded-2xl shadow-2xl shadow-[#FF6B00]/40 hover:shadow-[#FF6B00]/60 hover:scale-[1.02] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <Zap className="w-5 h-5 fill-black" />
        <span>{t('checkout.confirm_button')}</span>
      </button>

      {/* Reassurance text */}
      <div className="text-center space-y-1">
        <p className="text-[11px] text-[#A1A1AA]">{t('checkout.security_note')}</p>
        <p className="text-[11px] text-[#25D366] flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t('checkout.inspect_guarantee')}</span>
        </p>
      </div>
    </form>
  );
}
