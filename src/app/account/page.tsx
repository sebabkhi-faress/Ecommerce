'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/context/OrderContext';
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
      router.push('/login?redirect=/account');
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
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/40">
                  {user.role === 'admin'
                    ? '👑 Administrateur'
                    : user.role === 'delivery'
                    ? '🚚 Livreur Express'
                    : '👤 Client VIP'}
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

          {/* Action Links */}
          <div className="flex items-center gap-2 relative z-10 w-full sm:w-auto justify-end flex-wrap">
            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E05E00] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-1.5 transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard Admin</span>
              </Link>
            )}

            {user.role === 'delivery' && (
              <Link
                href="/delivery"
                className="px-4 py-2 bg-[#FFAA2C] hover:bg-[#E09920] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-1.5 transition-all"
              >
                <Truck className="w-4 h-4" />
                <span>Espace Livreur</span>
              </Link>
            )}

            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="p-2.5 rounded-xl bg-[#18181F] hover:bg-red-500/20 text-[#A1A1AA] hover:text-red-400 border border-white/10 transition-colors cursor-pointer"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Customer Orders History */}
        <div className="bg-[#14141B] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 className="text-base font-black uppercase tracking-wider text-[#F5F5F7]">
                {lang === 'ar' ? 'طلبياتي المسجلة' : 'Mes Commandes'}
              </h2>
              <p className="text-xs text-[#A1A1AA]">
                {lang === 'ar' ? 'تتبع مسار طلبياتك والدفع عند الاستلام' : 'Suivi en direct de vos livraisons Cash on Delivery'}
              </p>
            </div>

            <Link
              href="/#products"
              className="px-3.5 py-1.5 rounded-xl bg-[#18181F] hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#FFAA2C] flex items-center gap-1.5 transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'متابعة التسوق' : 'Boutique'}</span>
            </Link>
          </div>

          {customerOrders.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <Package className="w-12 h-12 text-[#A1A1AA] mx-auto opacity-50" />
              <p className="text-sm font-bold text-[#F5F5F7]">
                {lang === 'ar' ? 'لم تقم بأي طلبية حتى الآن' : 'Aucune commande enregistrée pour ce profil'}
              </p>
              <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto">
                {lang === 'ar'
                  ? 'اختر أي منتج واطلب بسهولة عبر الدفع عند الاستلام مع توصيل لكافة الولايات.'
                  : 'Commandez en 1 clic avec paiement Cash on Delivery à la réception.'}
              </p>
              <Link
                href="/#products"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FF6B00] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#FF6B00]/30 hover:scale-105 transition-all mt-2"
              >
                <span>{lang === 'ar' ? 'استكشف العروض' : 'Découvrir nos produits'}</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {customerOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-[#18181F] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                    <span className="font-mono font-black text-[#FF6B00]">
                      {order.trackingCode}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/40">
                      {order.status === 'in_delivery'
                        ? '🚚 En cours de livraison'
                        : order.status === 'delivered'
                        ? '✅ Livrée'
                        : order.status === 'confirmed'
                        ? '⏳ Confirmée'
                        : '🕒 En attente'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                    <div>
                      <p className="text-[#F5F5F7] font-semibold">
                        {order.items.map((i) => i.productNameFr).join(', ')}
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
