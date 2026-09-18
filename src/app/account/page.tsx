'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useOrders, Order } from '@/context/OrderContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatDZD } from '@/data/products';
import {
  User,
  Package,
  Phone,
  Mail,
  ShieldCheck,
  Truck,
  LogOut,
  ShoppingBag,
  ExternalLink,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  LayoutDashboard,
} from 'lucide-react';

export default function CustomerAccountPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const { user, role, logout, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { orders } = useOrders();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/orders');
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // Find user's orders by phone or customer match
  const customerOrders = orders.filter((o) => {
    if (!user) return false;
    const phoneMatch = user.phone && o.phone.includes(user.phone.replace(/\s+/g, ''));
    const nameMatch = o.fullName.toLowerCase().includes(user.name.toLowerCase());
    return phoneMatch || nameMatch;
  });

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-[#A1A1AA]">
        <Clock className="w-8 h-8 text-[#FF6B00] animate-spin mb-2" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D11] text-[#F5F5F7] py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Top Profile Card */}
        <div className="bg-[#14141B] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#FFAA2C] flex items-center justify-center text-black font-black text-2xl shadow-xl shadow-[#FF6B00]/25">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-[#F5F5F7]">
                  {user.name}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/40">
                  {user.role === 'admin' ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Administrateur</span>
                    </>
                  ) : user.role === 'delivery' ? (
                    <>
                      <Truck className="w-3.5 h-3.5" />
                      <span>Livreur Express</span>
                    </>
                  ) : (
                    <>
                      <User className="w-3.5 h-3.5" />
                      <span>Client VIP</span>
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-[#A1A1AA] mt-1.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#FFAA2C]" />
                  <span>{user.email}</span>
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>{user.phone}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Role Navigation Button */}
          <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto justify-end flex-wrap">
            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="px-4 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#FF6B00]/30 transition-all flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{lang === 'ar' ? 'لوحة التحكم' : 'Tableau de bord'}</span>
              </Link>
            )}

            {user.role === 'delivery' && (
              <Link
                href="/delivery"
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2"
              >
                <Truck className="w-4 h-4" />
                <span>{lang === 'ar' ? 'بوابة التوصيل' : 'Portail Livreur'}</span>
              </Link>
            )}

            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-red-400 border border-red-500/20 font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Déconnexion'}</span>
            </button>
          </div>
        </div>

        {/* Client Orders History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#F5F5F7] flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#FF6B00]" />
              <span>{lang === 'ar' ? 'طلباتي السابقة' : 'Mes Commandes'}</span>
            </h2>
            <span className="text-xs font-mono text-[#A1A1AA]">
              {customerOrders.length} {lang === 'ar' ? 'طلبيات' : 'commande(s)'}
            </span>
          </div>

          {customerOrders.length === 0 ? (
            <div className="bg-[#18181F] border border-white/10 rounded-3xl p-8 sm:p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#A1A1AA]">
                <Package className="w-8 h-8 text-[#FFAA2C]" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-[#F5F5F7]">
                  {lang === 'ar' ? 'لا توجد طلبات مسجلة بعد' : 'Aucune commande enregistrée'}
                </p>
                <p className="text-xs text-[#A1A1AA]">
                  {lang === 'ar'
                    ? 'اكتشف منتجاتنا التقنية المميزة واطلب بكل سهولة بالدفع عند الاستلام.'
                    : 'Parcourez notre catalogue et profitez du paiement à la livraison.'}
                </p>
              </div>
              <Link
                href="/#products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#FF6B00] hover:bg-[#E05E00] text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#FF6B00]/30 transition-all"
              >
                <span>{lang === 'ar' ? 'تصفح الكتالوج' : 'Voir les produits'}</span>
                {lang === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customerOrders.map((order: Order) => (
                <div
                  key={order.id}
                  className="bg-[#18181F] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                    <span className="font-mono font-black text-[#FF6B00]">
                      {order.trackingCode}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/40">
                      {order.status === 'in_delivery' ? (
                        <>
                          <Truck className="w-3 h-3" />
                          <span>En cours de livraison</span>
                        </>
                      ) : order.status === 'delivered' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Livrée</span>
                        </>
                      ) : order.status === 'confirmed' ? (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>Confirmée</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>En attente</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                    <div>
                      <p className="text-[#F5F5F7] font-semibold">
                        {order.items.map((i: any) => i.productNameFr).join(', ')}
                      </p>
                      <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                        {order.commune}, {order.wilayaCode} - {order.wilayaNameFr}
                      </p>
                    </div>

                    <span className="text-base font-mono font-black text-[#FF6B00]">
                      {formatDZD(order.total, lang)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
