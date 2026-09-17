'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useOrders, Order, OrderStatus } from '@/context/OrderContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { formatDZD } from '@/data/products';
import {
  Truck,
  Phone,
  MapPin,
  Home,
  Building2,
  CheckCircle2,
  Clock,
  DollarSign,
  Package,
  AlertCircle,
  RefreshCw,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Search,
  Check,
  XCircle,
  Navigation,
} from 'lucide-react';

export default function DeliveryDashboardPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const { orders, updateOrderStatus, refreshOrders, isSupabaseConnected } = useOrders();
  const { user, role, logout, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'delivered'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Authentication check: Must be delivery guy or admin
  useEffect(() => {
    if (!isAuthLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/delivery');
      } else if (role !== 'delivery' && role !== 'admin') {
        router.push('/login?redirect=/delivery');
      }
    }
  }, [isAuthenticated, role, isAuthLoading, router]);

  // Delivery metrics
  const activeOrders = useMemo(
    () => orders.filter((o) => o.status === 'confirmed' || o.status === 'in_delivery'),
    [orders]
  );

  const deliveredOrders = useMemo(
    () => orders.filter((o) => o.status === 'delivered'),
    [orders]
  );

  const totalCashToCollect = useMemo(
    () => activeOrders.reduce((sum, o) => sum + Number(o.total || 0), 0),
    [activeOrders]
  );

  const totalCashCollected = useMemo(
    () => deliveredOrders.reduce((sum, o) => sum + Number(o.total || 0), 0),
    [deliveredOrders]
  );

  // Filtered orders for delivery guy
  const displayedOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        order.fullName.toLowerCase().includes(q) ||
        order.phone.includes(q) ||
        order.trackingCode.toLowerCase().includes(q) ||
        order.commune.toLowerCase().includes(q) ||
        order.wilayaNameFr.toLowerCase().includes(q);

      // Status filter
      let matchesStatus = true;
      if (statusFilter === 'active') {
        matchesStatus = order.status === 'confirmed' || order.status === 'in_delivery';
      } else if (statusFilter === 'delivered') {
        matchesStatus = order.status === 'delivered';
      }

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    await updateOrderStatus(orderId, newStatus);
    setTimeout(() => {
      setUpdatingId(null);
    }, 400);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-[#A1A1AA]">
        <RefreshCw className="w-8 h-8 text-[#FF6B00] animate-spin mb-2" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D11] text-[#F5F5F7] py-6 sm:py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Top Courier Header Bar */}
        <div className="bg-[#14141B] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#FFAA2C] flex items-center justify-center text-black shadow-lg shadow-[#FF6B00]/30 font-black text-lg shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#FFAA2C]">
                  {lang === 'ar' ? 'فريق التوصيل السريع DZ' : 'LIVREUR EXPRESS DZ'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-[#25D366]">
                  {isSupabaseConnected ? 'En direct Supabase' : 'Mode local'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#F5F5F7] tracking-tight mt-0.5">
                {user?.name || 'Karim Livreur Express'}
              </h1>
              {user?.phone && (
                <p className="text-xs text-[#A1A1AA] font-mono mt-0.5">
                  📞 {user.phone}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={async () => {
                setIsRefreshing(true);
                await refreshOrders();
                setTimeout(() => setIsRefreshing(false), 500);
              }}
              className="p-2.5 rounded-xl bg-[#18181F] hover:bg-white/10 border border-white/10 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
              title={lang === 'ar' ? 'تحديث الطلبيات' : 'Rafraîchir'}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#FF6B00]' : ''}`} />
            </button>

            <Link
              href="/"
              className="px-3.5 py-2 rounded-xl bg-[#18181F] hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors"
            >
              {lang === 'ar' ? 'المتجر' : 'Boutique'}
            </Link>

            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="p-2.5 rounded-xl bg-[#18181F] hover:bg-red-500/20 border border-white/10 text-[#A1A1AA] hover:text-red-400 transition-colors cursor-pointer"
              title={lang === 'ar' ? 'تسجيل الخروج' : 'Déconnexion'}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Courier KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Active Deliveries */}
          <div className="bg-[#18181F] border border-white/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-bold uppercase text-[#A1A1AA]">
                {lang === 'ar' ? 'طلبيات قيد التوصيل' : 'À Livrer'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/15 text-[#FF6B00] flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-mono font-black text-[#FF6B00]">
              {activeOrders.length}
            </p>
            <p className="text-[10px] text-[#A1A1AA] mt-1">
              {lang === 'ar' ? 'تحتاج تسليماً واستلام المبلغ' : 'Colis en cours de route'}
            </p>
          </div>

          {/* Cash to Collect */}
          <div className="bg-[#18181F] border border-white/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-bold uppercase text-[#A1A1AA]">
                {lang === 'ar' ? 'مبالغ قيد التحصيل (COD)' : 'Cash à Encaisser'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#FFAA2C]/15 text-[#FFAA2C] flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-mono font-black text-[#FFAA2C]">
              {formatDZD(totalCashToCollect, lang)}
            </p>
            <p className="text-[10px] text-[#FFAA2C]/80 mt-1">
              {lang === 'ar' ? 'الدفع عند الاستلام نقداً' : 'Total cash des colis actifs'}
            </p>
          </div>

          {/* Delivered Successfully */}
          <div className="bg-[#18181F] border border-white/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-bold uppercase text-[#A1A1AA]">
                {lang === 'ar' ? 'تم التوصيل بنجاح' : 'Livrées'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-mono font-black text-emerald-400">
              {deliveredOrders.length}
            </p>
            <p className="text-[10px] text-emerald-400/80 mt-1">
              {lang === 'ar' ? `المحصّل: ${formatDZD(totalCashCollected, lang)}` : `Encaissé: ${formatDZD(totalCashCollected, lang)}`}
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#18181F] border border-white/10 rounded-2xl p-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-[#FF6B00] text-black shadow-md shadow-[#FF6B00]/30'
                  : 'bg-[#14141B] text-[#A1A1AA] hover:text-white border border-white/10'
              }`}
            >
              {lang === 'ar' ? `قيد التوصيل (${activeOrders.length})` : `En cours (${activeOrders.length})`}
            </button>

            <button
              onClick={() => setStatusFilter('delivered')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'delivered'
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30'
                  : 'bg-[#14141B] text-[#A1A1AA] hover:text-white border border-white/10'
              }`}
            >
              {lang === 'ar' ? `المسلّمة (${deliveredOrders.length})` : `Livrées (${deliveredOrders.length})`}
            </button>

            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#FFAA2C] text-black shadow-md shadow-[#FFAA2C]/30'
                  : 'bg-[#14141B] text-[#A1A1AA] hover:text-white border border-white/10'
              }`}
            >
              {lang === 'ar' ? `الكل (${orders.length})` : `Tous (${orders.length})`}
            </button>
          </div>

          {/* Search box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ar' ? 'بحث بالاسم أو الهاتف أو الولاية...' : 'Recherche par client, tél, wilaya...'}
              className="w-full bg-[#14141B] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-[#F5F5F7] placeholder-[#A1A1AA]/60 outline-none focus:border-[#FF6B00]"
            />
          </div>
        </div>

        {/* Deliveries List */}
        <div className="space-y-4">
          {displayedOrders.length === 0 ? (
            <div className="p-12 text-center bg-[#14141B] border border-white/10 rounded-3xl space-y-3">
              <Package className="w-12 h-12 text-[#A1A1AA] mx-auto opacity-50" />
              <p className="text-sm font-semibold text-[#F5F5F7]">
                {lang === 'ar' ? 'لا توجد طلبيات تطابق الفلتر' : 'Aucune livraison dans cette catégorie'}
              </p>
              <p className="text-xs text-[#A1A1AA]">
                {lang === 'ar' ? 'سيتم تنبيهك عند تعيين طلبيات جديدة' : 'Les nouvelles commandes apparaîtront automatiquement ici en direct.'}
              </p>
            </div>
          ) : (
            displayedOrders.map((order) => (
              <div
                key={order.id}
                className={`bg-[#14141B] border rounded-3xl p-5 sm:p-6 shadow-xl transition-all ${
                  order.status === 'in_delivery'
                    ? 'border-[#FF6B00]/40 shadow-[#FF6B00]/10 ring-1 ring-[#FF6B00]/20'
                    : order.status === 'delivered'
                    ? 'border-emerald-500/30'
                    : 'border-white/10'
                }`}
              >
                {/* Order Top Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-black text-sm text-[#FF6B00]">
                      {order.trackingCode}
                    </span>
                    <span className="text-white/20">•</span>
                    <span className="text-xs text-[#A1A1AA] font-mono">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {order.status === 'in_delivery' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/40 animate-pulse">
                        🚚 {lang === 'ar' ? 'قيد التوصيل الآن' : 'EN COURS DE LIVRAISON'}
                      </span>
                    )}

                    {order.status === 'confirmed' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">
                        ⏳ {lang === 'ar' ? 'مؤكدة — جاهزة للتسليم' : 'CONFIRMÉE — PRÊTE'}
                      </span>
                    )}

                    {order.status === 'delivered' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        ✅ {lang === 'ar' ? 'تم التوصيل والتحصيل' : 'LIVRÉE & ENCAISSÉE'}
                      </span>
                    )}

                    {order.status === 'cancelled' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                        ❌ {lang === 'ar' ? 'ملغية' : 'ANNULÉE'}
                      </span>
                    )}
                  </div>

                  {/* COD Cash Amount */}
                  <div className="text-right sm:text-right">
                    <span className="text-[10px] uppercase font-mono text-[#A1A1AA] block">
                      {lang === 'ar' ? 'المبلغ المستحق نقداً' : 'Montant à Encaisser'}
                    </span>
                    <span className="text-xl sm:text-2xl font-mono font-black text-[#FF6B00]">
                      {formatDZD(order.total, lang)}
                    </span>
                  </div>
                </div>

                {/* Client & Address Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-b border-white/10 text-xs">
                  {/* Left: Customer Info & Call */}
                  <div className="space-y-2">
                    <p className="font-bold text-base text-[#F5F5F7]">
                      {order.fullName}
                    </p>

                    {/* 1-Tap Quick Dial Link */}
                    <a
                      href={`tel:${order.phone}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-black font-extrabold rounded-xl shadow-md shadow-[#25D366]/30 transition-transform active:scale-95"
                    >
                      <Phone className="w-4 h-4 fill-black" />
                      <span>{lang === 'ar' ? `اتصال فوري: ${order.phone}` : `Appeler le client (${order.phone})`}</span>
                    </a>

                    {order.notes && (
                      <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-[#FFAA2C] mt-2">
                        <span className="font-semibold block">{lang === 'ar' ? 'ملاحظة الزبون:' : 'Note client :'}</span>
                        <span>{order.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Destination Wilaya & Delivery Mode */}
                  <div className="space-y-2 bg-[#18181F] p-3 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#FFAA2C] shrink-0" />
                      <div>
                        <span className="font-extrabold text-[#FFAA2C] block">
                          {order.wilayaCode} - {lang === 'ar' ? order.wilayaNameAr : order.wilayaNameFr}
                        </span>
                        <span className="text-[#A1A1AA] block mt-0.5">
                          {order.commune}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#F5F5F7] pt-1">
                      {order.deliveryMode === 'home' ? (
                        <>
                          <Home className="w-3.5 h-3.5 text-[#FF6B00]" />
                          <span>{lang === 'ar' ? 'توصيل إلى باب المنزل' : 'Livraison à Domicile'}</span>
                        </>
                      ) : (
                        <>
                          <Building2 className="w-3.5 h-3.5 text-[#FFAA2C]" />
                          <span>{lang === 'ar' ? 'استلام من مكتب التوصيل' : 'Point Relais / Bureau'}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items in Package */}
                <div className="py-3 text-xs text-[#A1A1AA] flex items-center gap-2 flex-wrap">
                  <Package className="w-4 h-4 text-[#FFAA2C]" />
                  <span className="font-semibold text-white">
                    {order.items.reduce((s, i) => s + i.quantity, 0)} {lang === 'ar' ? 'منتج:' : 'article(s) :'}
                  </span>
                  {order.items.map((item, idx) => (
                    <span key={idx} className="bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 text-white font-medium">
                      {lang === 'ar' ? (item.productNameAr || item.productNameFr) : item.productNameFr} (x{item.quantity})
                    </span>
                  ))}
                </div>

                {/* Action Buttons with 1-Click Transitions */}
                <div className="pt-3 flex items-center justify-end gap-2 flex-wrap">
                  {order.status === 'confirmed' && (
                    <button
                      disabled={updatingId === order.id}
                      onClick={() => handleStatusChange(order.id, 'in_delivery')}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#FF6B00] to-[#FFAA2C] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#FF6B00]/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Truck className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'بدء التوصيل الآن' : 'Prendre en charge (En route)'}</span>
                    </button>
                  )}

                  {order.status === 'in_delivery' && (
                    <>
                      <button
                        disabled={updatingId === order.id}
                        onClick={() => handleStatusChange(order.id, 'cancelled')}
                        className="px-4 py-2.5 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>{lang === 'ar' ? 'تعذّر التسليم' : 'Échec / Annulé'}</span>
                      </button>

                      <button
                        disabled={updatingId === order.id}
                        onClick={() => handleStatusChange(order.id, 'delivered')}
                        className="px-5 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#25D366]/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>{lang === 'ar' ? 'تم التسليم وقبض المبلغ ✅' : 'Colis Livré & Encaissé ✅'}</span>
                      </button>
                    </>
                  )}

                  {order.status === 'delivered' && (
                    <div className="flex items-center gap-1.5 text-xs text-[#25D366] font-semibold py-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'تم إكمال هذه المهمة بنجاح' : 'Commande terminée et archivée'}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
