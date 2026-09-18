'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useOrders } from '@/context/OrderContext';
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
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CodFormProps {
  items: {
    product: Product;
    quantity: number;
    selectedColor?: string;
  }[];
  onSuccess?: (orderId: string) => void;
  isModal?: boolean;
}

export default function CodForm({ items, onSuccess, isModal = false }: CodFormProps) {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const { createOrder } = useOrders();
  const { clearCart } = useCart();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedWilayaCode, setSelectedWilayaCode] = useState('16'); // Default to Alger
  const [commune, setCommune] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<'home' | 'desk'>('home');
  const [notes, setNotes] = useState('');

  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedWilaya = useMemo(
    () => getWilayaByCode(selectedWilayaCode) || WILAYAS[15],
    [selectedWilayaCode]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  );

  const deliveryFee = useMemo(() => {
    return deliveryMode === 'home'
      ? selectedWilaya.homeDeliveryFee
      : selectedWilaya.deskDeliveryFee;
  }, [deliveryMode, selectedWilaya]);

  const total = subtotal + deliveryFee;

  // Phone validation for Algeria: 05, 06, 07 followed by 8 digits (10 digits total)
  const validatePhone = (num: string) => {
    const cleaned = num.replace(/\s+/g, '').replace(/[-_.]/g, '');
    const regex = /^(0)(5|6|7)[0-9]{8}$/;
    return regex.test(cleaned);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePhone(phone)) {
      setPhoneError(t('checkout.phone_error'));
      return;
    }
    setPhoneError('');

    if (!fullName.trim() || !commune.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        productNameFr: item.product.nameFr,
        productNameAr: item.product.nameAr,
        price: item.product.price,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
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
            {items.reduce((s, i) => s + i.quantity, 0)} {t('checkout.articles_count')}
          </span>
        </h4>

        <div className="space-y-2 max-h-40 overflow-y-auto">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 text-xs">
              <img
                src={item.product.images[0]}
                alt={item.product.nameFr}
                className="w-12 h-12 object-cover rounded-lg bg-black/40 border border-white/10"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#F5F5F7] truncate">
                  {lang === 'ar' ? item.product.nameAr : item.product.nameFr}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-[#A1A1AA]">
                  <span>{t('checkout.qty_label')} {item.quantity}</span>
                  {item.selectedColor && <span>• {item.selectedColor}</span>}
                </div>
              </div>
              <span className="font-mono font-bold text-[#FF6B00]">
                {formatDZD(item.product.price * item.quantity, lang)}
              </span>
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
          <label className="block text-xs font-semibold text-[#F5F5F7] mb-1.5 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-[#FFAA2C]" />
            <span>{t('checkout.phone')}</span>
            <span className="text-[#FF6B00]">*</span>
          </label>
          <div className="relative">
            <input
              type="tel"
              required
              dir="ltr"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (phoneError) setPhoneError('');
              }}
              placeholder={t('checkout.phone_placeholder')}
              className={`w-full bg-[#18181F] border ${
                phoneError ? 'border-red-500' : 'border-white/15 focus:border-[#FF6B00]'
              } rounded-xl px-4 py-3.5 text-base sm:text-sm text-[#F5F5F7] font-mono placeholder-[#A1A1AA]/50 outline-none transition-colors`}
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
            <p className="text-[11px] text-[#A1A1AA] mt-1">{t('checkout.phone_hint')}</p>
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
                  +{selectedWilaya.homeDeliveryFee} DZD ({selectedWilaya.estimatedDays} {t('checkout.days')})
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
                  +{selectedWilaya.deskDeliveryFee} DZD ({selectedWilaya.estimatedDays} {t('checkout.days')})
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
            {formatDZD(subtotal, lang)}
          </span>
        </div>
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
