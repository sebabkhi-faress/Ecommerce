'use client';

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import Link from 'next/link';
import { useOrders, Order, OrderStatus } from '@/context/OrderContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { formatDZD } from '@/data/products';
import {
  Package,
  Search,
  Phone,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  MapPin,
  ExternalLink,
  MessageCircle,
  Printer,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Calendar,
  Sparkles,
  ShoppingBag,
  Home,
  Check,
  Copy,
} from 'lucide-react';

export default function CustomerOrdersPage() {
  const { lang } = useLanguage();
  const { orders, refreshOrders, isSupabaseConnected } = useOrders();
  const { user } = useAuth();

  const [phoneQuery, setPhoneQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-fill from localStorage or logged-in user phone on mount
  useEffect(() => {
    try {
      const savedPhone =
        localStorage.getItem('bika_customer_phone') ||
        user?.phone ||
        '';
      if (savedPhone) {
        setPhoneQuery(savedPhone);
        setHasSearched(true);
      }
    } catch (e) {
      // Ignore
    }
  }, [user]);

  // Clean phone string to purely digits
  const cleanDigits = (val: string) => {
    return val.replace(/\D/g, '').replace(/^213/, '0');
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phoneQuery.trim()) return;
    setHasSearched(true);
    try {
      localStorage.setItem('bika_customer_phone', phoneQuery.trim());
    } catch (e) {
      // Ignore
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Matched orders based on phone digits
  const matchingOrders = useMemo(() => {
    const q = cleanDigits(phoneQuery);
    if (!q || q.length < 4) return [];

    return orders.filter((order) => {
      const orderPhone = cleanDigits(order.phone);
      // Match suffix or exact or substring
      return (
        orderPhone.includes(q) ||
        q.includes(orderPhone) ||
        (q.startsWith('0') && orderPhone.endsWith(q.substring(1))) ||
        (orderPhone.startsWith('0') && q.endsWith(orderPhone.substring(1)))
      );
    });
  }, [orders, phoneQuery]);

  // Helper for Order Status Badge & Stepper info
  const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return {
          labelFr: 'En attente de confirmation',
          labelAr: 'في انتظار تأكيد المكالمة',
          step: 1,
          color: '#FFAA2C',
          badgeClass: 'bg-[#FFAA2C]/15 text-[#FFAA2C] border-[#FFAA2C]/30',
          icon: Clock,
        };
      case 'confirmed':
        return {
          labelFr: 'Confirmée — En préparation',
          labelAr: 'تم تأكيد الطلبية — جاري التجهيز',
          step: 2,
          color: '#38BDF8',
          badgeClass: 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/30',
          icon: CheckCircle2,
        };
      case 'in_delivery':
        return {
          labelFr: 'En cours d’acheminement (Avec le livreur)',
          labelAr: 'في طريق التوصيل مع الموزع',
          step: 3,
          color: '#FF6B00',
          badgeClass: 'bg-[#FF6B00]/15 text-[#FF6B00] border-[#FF6B00]/30',
          icon: Truck,
        };
      case 'delivered':
        return {
          labelFr: 'Livrée & Encaissée avec succès',
          labelAr: 'تم الاستلام بنجاح',
          step: 4,
          color: '#25D366',
          badgeClass: 'bg-[#25D366]/15 text-[#25D366] border-[#25D366]/30',
          icon: CheckCircle2,
        };
      case 'cancelled':
        return {
          labelFr: 'Commande Annulée',
          labelAr: 'طلبية ملغاة',
          step: 0,
          color: '#EF4444',
          badgeClass: 'bg-red-500/15 text-red-400 border-red-500/30',
          icon: XCircle,
        };
      case 'retour':
        return {
          labelFr: 'Colis Retourné',
          labelAr: 'طرد مرتجع',
          step: 0,
          color: '#A855F7',
          badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
          icon: RotateCcw,
        };
      default:
        return {
          labelFr: status,
          labelAr: status,
          step: 1,
          color: '#A1A1AA',
          badgeClass: 'bg-white/10 text-white border-white/20',
          icon: Clock,
        };
    }
  };

  const stepsList = [
    { num: 1, fr: 'Reçue', ar: 'تم التسجيل' },
    { num: 2, fr: 'Confirmée', ar: 'مؤكدة' },
    { num: 3, fr: 'En route', ar: 'في الطريق' },
    { num: 4, fr: 'Livrée', ar: 'تم الاستلام' },
  ];

  return (
    <div className="min-h-screen bg-[var(--obsidian)] text-[var(--white-titanium)] py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Header Breadcrumb & Title */}
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-white transition-colors"
          >
            {lang === 'ar' ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
            <span>{lang === 'ar' ? 'العودة للمتجر الرئيسي' : 'Retour à la boutique'}</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#FFAA2C] flex items-center justify-center text-black shadow-xl shadow-[#FF6B00]/25 shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--white-titanium)]">
                {lang === 'ar' ? 'متابعة وتتبع طلباتي' : 'Suivi de mes Commandes'}
              </h1>
              <p className="text-xs sm:text-sm text-[#A1A1AA]">
                {lang === 'ar'
                  ? 'أدخل رقم هاتفك للاطلاع على حالة طلباتك ومراحل شحنها لحظياً'
                  : 'Entrez votre numéro de téléphone pour voir l’état de vos commandes en direct'}
              </p>
            </div>
          </div>
        </div>

        {/* Search Card */}
        <div className="bg-[#14141B] border border-white/15 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />

          <form onSubmit={handleSearch} className="space-y-3 relative z-10">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#FFAA2C]">
              {lang === 'ar' ? 'رقم الهاتف المستخدم في الطلب :' : 'Numéro de téléphone utilisé lors de la commande :'}
            </label>

            <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone className="w-4 h-4 text-[#FFAA2C]" />
                </div>
                <input
                  type="tel"
                  dir="ltr"
                  value={phoneQuery}
                  onChange={(e) => {
                    setPhoneQuery(e.target.value);
                    if (!hasSearched) setHasSearched(false);
                  }}
                  placeholder="05 XX XX XX XX / 06 / 07"
                  className="w-full bg-[#18181F] border border-white/15 focus:border-[#FF6B00] rounded-2xl pl-10 pr-4 py-3.5 text-sm sm:text-base font-mono text-white placeholder-[#A1A1AA]/50 outline-none transition-all shadow-inner"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3.5 bg-gradient-to-r from-[#FF6B00] to-[#FFAA2C] hover:opacity-95 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-[#FF6B00]/25 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>{lang === 'ar' ? 'بحث عن طلبياتي' : 'Rechercher mes commandes'}</span>
              </button>
            </div>

            <p className="text-[11px] text-[#A1A1AA] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
              <span>
                {lang === 'ar'
                  ? 'يتم تحديث حالات الشحن فورياً بالتزامن مع موزع التوصيل في ولايتك'
                  : 'Mise à jour en temps réel synchronisée avec le transporteur dans votre Wilaya'}
              </span>
            </p>
          </form>
        </div>

        {/* Results Section */}
        {hasSearched && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-[#F5F5F7]">
                {lang === 'ar'
                  ? `الطلبات المسجلة (${matchingOrders.length})`
                  : `Commandes Trouvées (${matchingOrders.length})`}
              </h2>
              {matchingOrders.length > 0 && (
                <span className="text-xs font-mono text-[#25D366]">
                  {lang === 'ar' ? '✓ نتائج مطابقة للرقم' : '✓ Résultats correspondants'}
                </span>
              )}
            </div>

            {matchingOrders.length === 0 ? (
              <div className="bg-[#14141B] border border-white/10 rounded-3xl p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#A1A1AA]">
                  <AlertCircle className="w-7 h-7 text-[#FFAA2C]" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="text-base font-bold text-white">
                    {lang === 'ar'
                      ? 'لم يتم العثور على أي طلبية بهذا الرقم'
                      : 'Aucune commande trouvée pour ce numéro'}
                  </h3>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed">
                    {lang === 'ar'
                      ? 'تأكد من كتابة نفس رقم الهاتف المستخدم عند تأكيد الطلب، أو تصفح أحدث منتجات المتجر واطلب الآن.'
                      : 'Vérifiez que le numéro correspond bien à celui saisi lors de votre commande, ou explorez nos produits.'}
                  </p>
                </div>
                <Link
                  href="/#products"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B00] text-black font-bold text-xs uppercase tracking-wider shadow-md hover:bg-[#E05E00] transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'تصفح منتجات المتجر' : 'Voir les produits'}</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {matchingOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  const StatusIcon = statusInfo.icon;

                  const whatsappLink = `https://wa.me/213550123456?text=${encodeURIComponent(
                    `Salam ! Je souhaite avoir des informations sur ma commande ${order.trackingCode} (${order.fullName} - ${order.wilayaNameFr}).`
                  )}`;

                  return (
                    <div
                      key={order.id}
                      className="bg-[#14141B] border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 relative overflow-hidden transition-all hover:border-[#FF6B00]/40"
                    >
                      {/* Top Order Row: Reference, Date & Status Badge */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-xs text-[#A1A1AA] font-mono">
                              {lang === 'ar' ? 'رمز التتبع :' : 'Réf. Suivi :'}
                            </span>
                            <span className="font-mono font-black text-[#FF6B00] text-sm tracking-wider">
                              {order.trackingCode}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(order.trackingCode)}
                              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors"
                              title="Copier le code de suivi"
                            >
                              {copiedId === order.trackingCode ? (
                                <Check className="w-3.5 h-3.5 text-[#25D366]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <p className="text-[11px] text-[#A1A1AA] mt-1 flex items-center gap-1.5 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-[#FFAA2C]" />
                            <span>
                              {new Date(order.createdAt).toLocaleDateString(
                                lang === 'ar' ? 'ar-DZ' : 'fr-DZ',
                                {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }
                              )}
                            </span>
                          </p>
                        </div>

                        {/* Status Pill */}
                        <div
                          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold ${statusInfo.badgeClass}`}
                        >
                          <StatusIcon className="w-4 h-4 shrink-0" />
                          <span>{lang === 'ar' ? statusInfo.labelAr : statusInfo.labelFr}</span>
                        </div>
                      </div>

                      {/* Visual Stepper (Only for normal flow orders) */}
                      {statusInfo.step > 0 && (
                        <div className="p-4 rounded-2xl bg-[#18181F] border border-white/5 space-y-3">
                          <div className="grid grid-cols-4 gap-2 text-center text-[10px] sm:text-xs">
                            {stepsList.map((step) => {
                              const isCompleted = step.num <= statusInfo.step;
                              const isCurrent = step.num === statusInfo.step;

                              return (
                                <div key={step.num} className="space-y-1.5">
                                  <div
                                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full mx-auto flex items-center justify-center font-mono font-bold text-xs transition-all ${
                                      isCurrent
                                        ? 'bg-[#FF6B00] text-black ring-4 ring-[#FF6B00]/20 animate-pulse'
                                        : isCompleted
                                        ? 'bg-[#25D366] text-black'
                                        : 'bg-white/10 text-[#A1A1AA]'
                                    }`}
                                  >
                                    {isCompleted ? '✓' : step.num}
                                  </div>
                                  <span
                                    className={`block font-semibold ${
                                      isCurrent
                                        ? 'text-[#FF6B00]'
                                        : isCompleted
                                        ? 'text-[#25D366]'
                                        : 'text-[#A1A1AA]'
                                    }`}
                                  >
                                    {lang === 'ar' ? step.ar : step.fr}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Items Ordered Breakdown */}
                      <div className="space-y-2.5">
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#A1A1AA]">
                          {lang === 'ar' ? 'المنتجات المطلوبة :' : 'Articles commandés :'}
                        </h4>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5"
                            >
                              <img
                                src={item.image}
                                alt={item.productNameFr}
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover bg-black/40 border border-white/10 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-xs sm:text-sm text-white truncate">
                                  {lang === 'ar' ? item.productNameAr : item.productNameFr}
                                </h5>
                                <div className="flex items-center gap-2 text-[11px] text-[#A1A1AA] mt-0.5">
                                  <span className="font-mono text-[#FFAA2C] font-bold">
                                    Qté: {item.quantity}
                                  </span>
                                  {item.selectedColor && (
                                    <span>• {item.selectedColor}</span>
                                  )}
                                  {item.selectedSize && (
                                    <span className="px-1.5 py-0.5 rounded bg-[#FF6B00]/20 border border-[#FF6B00]/30 text-[10px] text-[#FF6B00] font-mono font-bold">
                                      {item.selectedSize}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="font-mono font-bold text-xs sm:text-sm text-[#FF6B00]">
                                  {formatDZD(item.price * item.quantity, lang)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery Address & Total Summary */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10 text-xs">
                        <div className="space-y-1 text-[#A1A1AA]">
                          <p className="flex items-center gap-1.5 text-white font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-[#FF6B00]" />
                            <span>
                              {order.commune}, {lang === 'ar' ? order.wilayaNameAr : order.wilayaNameFr} ({order.wilayaCode})
                            </span>
                          </p>
                          <p className="text-[11px]">
                            {lang === 'ar' ? 'طريقة الاستلام :' : 'Mode de livraison :'}{' '}
                            <span className="text-[#FFAA2C] font-bold">
                              {order.deliveryMode === 'home'
                                ? lang === 'ar'
                                  ? 'توصيل لباب المنزل'
                                  : 'À Domicile'
                                : 'Stop Desk (Bureau)'}
                            </span>
                          </p>
                        </div>

                        <div className="text-right sm:text-end space-y-1">
                          <div className="flex items-center justify-between sm:justify-end gap-3 text-[#A1A1AA]">
                            <span>{lang === 'ar' ? 'المجموع والتوصيل :' : 'Total à payer à la livraison :'}</span>
                            <span className="text-lg font-mono font-black text-[#FF6B00]">
                              {formatDZD(order.total, lang)}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-[#25D366] block">
                            {lang === 'ar' ? 'الدفع نقداً عند الاستلام (COD)' : 'Paiement en espèces au livreur'}
                          </span>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center justify-end gap-2.5 pt-2 flex-wrap">
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{lang === 'ar' ? 'استفسار عبر واتساب' : 'Assistance WhatsApp'}</span>
                        </a>

                        <Link
                          href={`/order-success/${order.id}`}
                          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5 text-[#FFAA2C]" />
                          <span>{lang === 'ar' ? 'طباعة وصل الطلب' : 'Voir le Reçu'}</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* First Time Helper Note */}
        {!hasSearched && (
          <div className="bg-[#14141B] border border-white/10 rounded-3xl p-6 sm:p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 mx-auto flex items-center justify-center text-[#FFAA2C]">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {lang === 'ar' ? 'تتبع فوري ومجاني بدون الحاجة لكلمة سر' : 'Suivi immédiat sans mot de passe'}
            </h3>
            <p className="text-xs text-[#A1A1AA] max-w-md mx-auto leading-relaxed">
              {lang === 'ar'
                ? 'يكفي إدخال رقم الهاتف الذي استخدمته عند الشراء لمشاهدة حالة طلبيتك ومسارها مع شركة التوصيل.'
                : 'Il vous suffit de saisir le numéro de téléphone utilisé lors de votre commande pour voir son état d’acheminement.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
