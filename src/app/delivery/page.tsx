'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useOrders, Order, OrderStatus } from '@/context/OrderContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { formatDZD } from '@/data/products';
import { WILAYAS } from '@/data/wilayas';
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
  RotateCcw,
  MessageCircle,
  Filter,
  X,
  AlertTriangle,
  FileText,
  ChevronDown,
} from 'lucide-react';

const COMMON_RETURN_REASONS = [
  { id: 'unreachable', fr: 'Client injoignable (Ne répond pas au téléphone)', ar: 'الزبون لا يرد على الهاتف بعد عدة محاولات' },
  { id: 'refused', fr: 'Refus du colis (Le client refuse la commande à la livraison)', ar: 'رفض استلام الطرد عند وصول الموزع' },
  { id: 'wrong_address', fr: 'Adresse erronée ou introuvable dans la commune', ar: 'العنوان غير دقيق أو غير متوفر في البلدية' },
  { id: 'no_cash', fr: 'Client sans liquidité / Demande d’annulation sur place', ar: 'الزبون لا يملك السيولة الكافية / طلب الإلغاء' },
  { id: 'postponed', fr: 'Client absent / Demande de report indéterminé', ar: 'الزبون مسافر أو غير متواجد / طلب تأجيل غير محدد' },
  { id: 'other', fr: 'Autre motif personnalisé', ar: 'سبب آخر مخصص' },
];

export default function DeliveryDashboardPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const { orders, updateOrderStatus, refreshOrders, isSupabaseConnected } = useOrders();
  const { user, role, logout, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [wilayaFilter, setWilayaFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Return modal state
  const [returnTargetOrder, setReturnTargetOrder] = useState<Order | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>(COMMON_RETURN_REASONS[0].fr);
  const [customReasonText, setCustomReasonText] = useState('');

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

  // Logistics metrics
  const inDeliveryOrders = useMemo(
    () => orders.filter((o) => o.status === 'in_delivery'),
    [orders]
  );

  const retourOrders = useMemo(
    () => orders.filter((o) => o.status === 'retour'),
    [orders]
  );

  const deliveredOrders = useMemo(
    () => orders.filter((o) => o.status === 'delivered'),
    [orders]
  );

  const confirmedOrders = useMemo(
    () => orders.filter((o) => o.status === 'confirmed'),
    [orders]
  );

  const cashOnRoad = useMemo(
    () => inDeliveryOrders.reduce((sum, o) => sum + Number(o.total || 0), 0),
    [inDeliveryOrders]
  );

  const cashCollected = useMemo(
    () => deliveredOrders.reduce((sum, o) => sum + Number(o.total || 0), 0),
    [deliveredOrders]
  );

  // Filtered orders list
  const displayedOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search query filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        order.fullName.toLowerCase().includes(q) ||
        order.phone.includes(q) ||
        order.trackingCode.toLowerCase().includes(q) ||
        order.commune.toLowerCase().includes(q) ||
        order.wilayaNameFr.toLowerCase().includes(q) ||
        order.wilayaNameAr.includes(q) ||
        (order.notes && order.notes.toLowerCase().includes(q));

      // Status filter
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      // Wilaya filter
      const matchesWilaya = wilayaFilter === 'all' || order.wilayaCode === wilayaFilter;

      return matchesSearch && matchesStatus && matchesWilaya;
    });
  }, [orders, searchQuery, statusFilter, wilayaFilter]);

  const handleQuickStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    await updateOrderStatus(orderId, newStatus);
    setTimeout(() => setUpdatingId(null), 350);
  };

  const handleOpenRetourModal = (order: Order) => {
    setReturnTargetOrder(order);
    setSelectedReason(COMMON_RETURN_REASONS[0].fr);
    setCustomReasonText('');
  };

  const handleConfirmRetour = async () => {
    if (!returnTargetOrder) return;
    const finalReason =
      selectedReason === 'Autre motif personnalisé' && customReasonText.trim()
        ? customReasonText.trim()
        : selectedReason;

    setUpdatingId(returnTargetOrder.id);
    await updateOrderStatus(returnTargetOrder.id, 'retour', finalReason);
    setReturnTargetOrder(null);
    setTimeout(() => setUpdatingId(null), 350);
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Top Operations Header Bar */}
        <div className="bg-[#14141B] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#FFAA2C] flex items-center justify-center text-black shadow-lg shadow-[#FF6B00]/30 font-black text-lg shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#FFAA2C]">
                  {lang === 'ar' ? 'لوحة إدارة التوصيل والطرود المرتجعة' : 'DASHBOARD OPÉRATIONS LIVRAISON & RETOURS'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-[#25D366]">
                  {isSupabaseConnected ? (lang === 'ar' ? 'متزامن لحظياً' : 'En direct') : (lang === 'ar' ? 'وضع دون اتصال' : 'Hors ligne')}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#F5F5F7] tracking-tight mt-0.5">
                {user?.name || (lang === 'ar' ? 'فريق إدارة الشحنات واللوجستيك' : 'Opérateur Logistique DZ')}
              </h1>
              <p className="text-xs text-[#A1A1AA] font-mono mt-0.5">
                {lang === 'ar' ? 'تحديث حالة الطرود إلى «مرتجع»، «قيد التوصيل»، أو «مستلم» لجميع الولايات' : 'Gestion globale des statuts : En livraison, Livré, et Retours colis (Refus / Injoignable)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
            <button
              onClick={async () => {
                setIsRefreshing(true);
                await refreshOrders();
                setTimeout(() => setIsRefreshing(false), 500);
              }}
              className="p-2.5 rounded-xl bg-[#18181F] hover:bg-white/10 border border-white/10 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
              title={lang === 'ar' ? 'تحديث الطلبيات' : 'Rafraîchir les commandes'}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#FF6B00]' : ''}`} />
            </button>

            {role === 'admin' && (
              <Link
                href="/admin"
                className="px-3.5 py-2 rounded-xl bg-[#18181F] hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#FFAA2C] hover:text-white transition-colors"
              >
                {lang === 'ar' ? 'لوحة الأدمن' : 'Admin'}
              </Link>
            )}

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

        {/* Operational Logistics KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Orders */}
          <div className="bg-[#18181F] border border-white/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-bold uppercase text-[#A1A1AA]">
                {lang === 'ar' ? 'إجمالي الطرود' : 'Total Commandes'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-mono font-black text-[#F5F5F7]">
              {orders.length}
            </p>
            <p className="text-[10px] text-[#A1A1AA] mt-1">
              {lang === 'ar' ? 'عبر كافة الولايات (68)' : 'Flux logistique total'}
            </p>
          </div>

          {/* En cours de livraison */}
          <div className="bg-[#18181F] border border-white/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-[#FF6B00]/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-bold uppercase text-[#A1A1AA]">
                {lang === 'ar' ? 'قيد التوصيل الآن' : 'En Livraison'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/15 text-[#FF6B00] flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-mono font-black text-[#FF6B00]">
              {inDeliveryOrders.length}
            </p>
            <p className="text-[10px] text-[#FFAA2C] mt-1 font-mono">
              {formatDZD(cashOnRoad, lang)} {lang === 'ar' ? 'على الطريق' : 'en transit'}
            </p>
          </div>

          {/* Colis RETOURS (Returns) */}
          <div className="bg-[#18181F] border border-rose-500/20 bg-rose-500/5 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-rose-500/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-bold uppercase text-rose-400">
                {lang === 'ar' ? 'الطرود المرتجعة (RETOUR)' : 'Colis Retournés (Retours)'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <RotateCcw className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-mono font-black text-rose-400">
              {retourOrders.length}
            </p>
            <p className="text-[10px] text-rose-400/80 mt-1">
              {lang === 'ar' ? 'زبائن لا يردون أو رفضوا الاستلام' : 'Non livrés (Injoignable, Refus...)'}
            </p>
          </div>

          {/* Livrées avec succès */}
          <div className="bg-[#18181F] border border-emerald-500/20 bg-emerald-500/5 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-bold uppercase text-emerald-400">
                {lang === 'ar' ? 'تم التوصيل والقبض' : 'Livrées & Encaissées'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-mono font-black text-emerald-400">
              {deliveredOrders.length}
            </p>
            <p className="text-[10px] text-emerald-400/80 mt-1 font-mono">
              {formatDZD(cashCollected, lang)} {lang === 'ar' ? 'مبالغ مقبوضة' : 'encaissés'}
            </p>
          </div>
        </div>

        {/* Filter Pills, Wilaya Selector & Search Bar */}
        <div className="space-y-3 bg-[#18181F] border border-white/10 rounded-2xl p-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-black shadow-md'
                  : 'bg-[#14141B] text-[#A1A1AA] hover:text-white border border-white/10'
              }`}
            >
              {lang === 'ar' ? `الكل (${orders.length})` : `Toutes (${orders.length})`}
            </button>

            <button
              onClick={() => setStatusFilter('in_delivery')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'in_delivery'
                  ? 'bg-[#FF6B00] text-black shadow-md shadow-[#FF6B00]/30'
                  : 'bg-[#14141B] text-[#A1A1AA] hover:text-white border border-white/10'
              }`}
            >
              🚚 {lang === 'ar' ? `قيد التوصيل (${inDeliveryOrders.length})` : `En livraison (${inDeliveryOrders.length})`}
            </button>

            <button
              onClick={() => setStatusFilter('retour')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'retour'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 ring-2 ring-rose-400'
                  : 'bg-rose-500/10 text-rose-400 hover:text-white border border-rose-500/30'
              }`}
            >
              🔄 {lang === 'ar' ? `المرتجعات (${retourOrders.length})` : `Retours (${retourOrders.length})`}
            </button>

            <button
              onClick={() => setStatusFilter('confirmed')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'confirmed'
                  ? 'bg-blue-500 text-black shadow-md shadow-blue-500/30'
                  : 'bg-[#14141B] text-[#A1A1AA] hover:text-white border border-white/10'
              }`}
            >
              ⏳ {lang === 'ar' ? `المؤكدة (${confirmedOrders.length})` : `Confirmées (${confirmedOrders.length})`}
            </button>

            <button
              onClick={() => setStatusFilter('delivered')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'delivered'
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30'
                  : 'bg-[#14141B] text-[#A1A1AA] hover:text-white border border-white/10'
              }`}
            >
              ✅ {lang === 'ar' ? `المسلّمة (${deliveredOrders.length})` : `Livrées (${deliveredOrders.length})`}
            </button>
          </div>

          {/* Search and Wilaya filter inputs */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'ar' ? 'بحث بالاسم، رقم الهاتف، كود التتبع DZ، البلدية، أو سبب الارجاع...' : 'Rechercher par client, téléphone, code suivi DZ, commune, motif...'}
                className="w-full bg-[#14141B] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-[#F5F5F7] placeholder-[#A1A1AA]/60 outline-none focus:border-[#FF6B00]"
              />
            </div>

            <div className="relative w-full sm:w-auto">
              <select
                value={wilayaFilter}
                onChange={(e) => setWilayaFilter(e.target.value)}
                className="w-full appearance-none bg-[#14141B] border border-white/10 rounded-xl px-3 py-2.5 ltr:pr-8 rtl:pl-8 text-base sm:text-xs text-[#F5F5F7] outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#18181F] text-[#F5F5F7]">{lang === 'ar' ? 'جميع الولايات (68)' : 'Toutes les wilayas (68)'}</option>
                {WILAYAS.map((w) => (
                  <option key={w.code} value={w.code} className="bg-[#18181F] text-[#F5F5F7]">
                    {w.code} - {lang === 'ar' ? w.nameAr : w.nameFr}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 ltr:right-2.5 rtl:left-2.5 flex items-center text-[#A1A1AA]">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Orders Listing */}
        <div className="space-y-4">
          {displayedOrders.length === 0 ? (
            <div className="p-12 text-center bg-[#14141B] border border-white/10 rounded-3xl space-y-3">
              <Package className="w-12 h-12 text-[#A1A1AA] mx-auto opacity-50" />
              <p className="text-sm font-semibold text-[#F5F5F7]">
                {lang === 'ar' ? 'لا توجد طلبيات مطابقة للفلتر المحدد' : 'Aucune commande ne correspond aux filtres.'}
              </p>
              <p className="text-xs text-[#A1A1AA]">
                {lang === 'ar' ? 'يمكنك تجربة إزالة الفلاتر أو البحث عن رقم هاتف آخر.' : 'Modifiez vos filtres ou réinitialisez la recherche.'}
              </p>
            </div>
          ) : (
            displayedOrders.map((order) => {
              const isUpdating = updatingId === order.id;

              return (
                <div
                  key={order.id}
                  className={`bg-[#14141B] border rounded-3xl p-5 sm:p-6 shadow-xl transition-all ${
                    order.status === 'retour'
                      ? 'border-rose-500/50 bg-rose-500/[0.03] ring-1 ring-rose-500/20'
                      : order.status === 'in_delivery'
                      ? 'border-[#FF6B00]/40 shadow-[#FF6B00]/10 ring-1 ring-[#FF6B00]/20'
                      : order.status === 'delivered'
                      ? 'border-emerald-500/30'
                      : 'border-white/10'
                  }`}
                >
                  {/* Top Order Row: Tracking, Status, COD Cash */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-black text-sm text-[#FF6B00]">
                        {order.trackingCode}
                      </span>
                      <span className="text-white/20">•</span>
                      <span className="text-xs text-[#A1A1AA] font-mono">
                        {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      {/* Status Badges */}
                      {order.status === 'in_delivery' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/40 animate-pulse">
                          🚚 {lang === 'ar' ? 'قيد التوصيل' : 'EN LIVRAISON'}
                        </span>
                      )}

                      {order.status === 'retour' && (
                        <span className="px-3 py-1 rounded-full text-[11px] font-mono font-black bg-rose-500/20 text-rose-400 border border-rose-500/50 flex items-center gap-1">
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{lang === 'ar' ? 'طرد مرتجع (RETOUR)' : 'COLIS RETOURNÉ (RETOUR)'}</span>
                        </span>
                      )}

                      {order.status === 'confirmed' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">
                          ⏳ {lang === 'ar' ? 'مؤكدة — جاهزة' : 'CONFIRMÉE'}
                        </span>
                      )}

                      {order.status === 'delivered' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          ✅ {lang === 'ar' ? 'تم التسليم والقبض' : 'LIVRÉE & ENCAISSÉE'}
                        </span>
                      )}

                      {order.status === 'pending' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                          ⏱ {lang === 'ar' ? 'قيد التأكيد' : 'EN ATTENTE'}
                        </span>
                      )}

                      {order.status === 'cancelled' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                          ❌ {lang === 'ar' ? 'ملغية' : 'ANNULÉE'}
                        </span>
                      )}
                    </div>

                    {/* Cash Amount */}
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase font-mono text-[#A1A1AA] block">
                        {lang === 'ar' ? 'المبلغ المستحق نقداً (COD)' : 'Montant à Encaisser'}
                      </span>
                      <span className="text-xl sm:text-2xl font-mono font-black text-[#FF6B00]">
                        {formatDZD(order.total, lang)}
                      </span>
                    </div>
                  </div>

                  {/* Highlight for RETOUR Reason if status is retour */}
                  {order.status === 'retour' && (
                    <div className="mt-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold text-rose-300 block uppercase tracking-wide">
                          {lang === 'ar' ? 'سبب الإرجاع المسجل :' : 'Motif officiel du retour :'}
                        </span>
                        <p className="text-xs text-rose-200 mt-0.5 font-medium">
                          {order.notes || (lang === 'ar' ? 'لم يتم تحديد السبب (يرجى مراجعة سجل الاتصالات)' : 'Client injoignable ou colis refusé lors de la tentative.')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Customer, Contacts & Destination Wilaya */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-b border-white/10 text-xs">
                    {/* Left: Customer & Direct Action Buttons */}
                    <div className="space-y-3">
                      <div>
                        <p className="font-extrabold text-base text-[#F5F5F7]">
                          {order.fullName}
                        </p>
                        <p className="text-xs text-[#A1A1AA] font-mono mt-0.5">
                          📞 {order.phone}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Call button */}
                        <a
                          href={`tel:${order.phone}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-black font-extrabold rounded-xl text-xs shadow-md shadow-[#25D366]/20 transition-transform active:scale-95"
                        >
                          <Phone className="w-3.5 h-3.5 fill-black" />
                          <span>{lang === 'ar' ? 'اتصال بالزبون' : 'Appeler'}</span>
                        </a>

                        {/* WhatsApp button */}
                        {order.phone && (
                          <a
                            href={`https://wa.me/213${order.phone.replace(/^0/, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold rounded-xl text-xs transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>

                      {order.notes && order.status !== 'retour' && (
                        <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-[#FFAA2C]">
                          <span className="font-semibold block">{lang === 'ar' ? 'ملاحظة :' : 'Note :'}</span>
                          <span>{order.notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Right: Destination Wilaya & Delivery Mode */}
                    <div className="space-y-2 bg-[#18181F] p-3 rounded-2xl border border-white/5">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-[#FFAA2C] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-extrabold text-[#FFAA2C] block">
                            {order.wilayaCode} - {lang === 'ar' ? order.wilayaNameAr : order.wilayaNameFr}
                          </span>
                          <span className="text-[#A1A1AA] block mt-0.5 font-medium">
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
                            <span>{lang === 'ar' ? 'استلام من مكتب التوصيل (Stop Desk)' : 'Point Relais / Stop Desk'}</span>
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
                        {item.selectedColor ? ` — ${item.selectedColor}` : ''}
                      </span>
                    ))}
                  </div>

                  {/* Status Modification & Action Buttons */}
                  <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-white/10">
                    {/* Direct Status Selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-[#A1A1AA]">
                        {lang === 'ar' ? 'تغيير الحالة:' : 'Changer statut :'}
                      </span>
                      <div className="relative inline-block">
                        <select
                          disabled={isUpdating}
                          value={order.status}
                          onChange={(e) => {
                            const val = e.target.value as OrderStatus;
                            if (val === 'retour') {
                              handleOpenRetourModal(order);
                            } else {
                              handleQuickStatus(order.id, val);
                            }
                          }}
                          className="appearance-none bg-[#18181F] border border-white/20 rounded-xl px-3 py-2 ltr:pr-8 rtl:pl-8 text-base sm:text-xs font-mono text-white outline-none focus:border-[#FF6B00] cursor-pointer"
                        >
                          <option value="pending" className="bg-[#18181F] text-[#F5F5F7]">{lang === 'ar' ? 'قيد الانتظار' : 'En attente'}</option>
                          <option value="confirmed" className="bg-[#18181F] text-[#F5F5F7]">{lang === 'ar' ? 'مؤكدة' : 'Confirmée'}</option>
                          <option value="in_delivery" className="bg-[#18181F] text-[#F5F5F7]">{lang === 'ar' ? 'قيد التوصيل' : 'En cours de livraison'}</option>
                          <option value="delivered" className="bg-[#18181F] text-[#F5F5F7]">{lang === 'ar' ? 'تم التسليم والقبض' : 'Livrée & Encaissée'}</option>
                          <option value="retour" className="bg-[#18181F] text-[#F5F5F7]">🔄 {lang === 'ar' ? 'مرتجع (Retour)' : 'Retour (Colis retourné)'}</option>
                          <option value="cancelled" className="bg-[#18181F] text-[#F5F5F7]">{lang === 'ar' ? 'ملغية' : 'Annulée'}</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 ltr:right-2.5 rtl:left-2.5 flex items-center text-[#A1A1AA]">
                          <ChevronDown className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>

                    {/* Quick 1-Click Operations */}
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {/* 1-Click RETOUR Button */}
                      <button
                        disabled={isUpdating}
                        onClick={() => handleOpenRetourModal(order)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          order.status === 'retour'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'تسجيل كـ RETOUR' : 'Marquer RETOUR'}</span>
                      </button>

                      {/* 1-Click In Delivery */}
                      {order.status !== 'in_delivery' && order.status !== 'delivered' && (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleQuickStatus(order.id, 'in_delivery')}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FF6B00]/15 hover:bg-[#FF6B00]/25 text-[#FF6B00] border border-[#FF6B00]/30 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>{lang === 'ar' ? 'وضع في التوصيل' : 'En livraison'}</span>
                        </button>
                      )}

                      {/* 1-Click Delivered & Paid */}
                      {order.status !== 'delivered' && (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleQuickStatus(order.id, 'delivered')}
                          className="px-4 py-2 rounded-xl text-xs font-black bg-[#25D366] hover:bg-[#1EBE5D] text-black shadow-md shadow-[#25D366]/30 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>{lang === 'ar' ? 'تم التسليم والقبض ✅' : 'Livré & Encaissé ✅'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL: Enregistrer un Colis en RETOUR (Return Reason) */}
      {returnTargetOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#14141B] border border-rose-500/40 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 text-[#F5F5F7]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {lang === 'ar' ? 'تسجيل الطلبية كطرد مرتجع (RETOUR)' : 'Déclarer la commande en RETOUR'}
                  </h3>
                  <p className="text-xs text-[#A1A1AA] font-mono">
                    {returnTargetOrder.trackingCode} • {returnTargetOrder.fullName}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setReturnTargetOrder(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-[#A1A1AA] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reason Options List */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#FFAA2C] block">
                {lang === 'ar' ? 'اختر سبب الإرجاع الرئيسي :' : 'Sélectionnez le motif principal du retour :'}
              </label>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {COMMON_RETURN_REASONS.map((reason) => {
                  const text = lang === 'ar' ? reason.ar : reason.fr;
                  const isSelected = selectedReason === reason.fr;

                  return (
                    <button
                      key={reason.id}
                      type="button"
                      onClick={() => setSelectedReason(reason.fr)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-rose-500 bg-rose-500/15 text-white font-bold ring-1 ring-rose-500'
                          : 'border-white/10 bg-[#18181F] text-[#A1A1AA] hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <span>{text}</span>
                      {isSelected && <Check className="w-4 h-4 text-rose-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Notes input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#A1A1AA] block">
                {lang === 'ar' ? 'ملاحظة إضافية أو تفاصيل (اختياري) :' : 'Détails complémentaires / Horaires d’appels :'}
              </label>
              <textarea
                value={customReasonText}
                onChange={(e) => setCustomReasonText(e.target.value)}
                placeholder={lang === 'ar' ? 'مثال: تم الاتصال 3 مرات في أوقات مختلفة 11h و 15h و 18h دون رد...' : 'Ex: 3 appels sans réponse (11h, 15h, 18h), SMS envoyé...'}
                rows={2}
                className="w-full bg-[#18181F] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-[#A1A1AA]/50 outline-none focus:border-rose-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReturnTargetOrder(null)}
                className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/10 text-xs font-semibold text-[#A1A1AA] transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'إلغاء' : 'Annuler'}
              </button>

              <button
                type="button"
                onClick={handleConfirmRetour}
                className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-500/30 transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{lang === 'ar' ? 'تأكيد حالة RETOUR' : 'Valider le RETOUR'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
