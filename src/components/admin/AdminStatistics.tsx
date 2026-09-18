'use client';

import React, { useState, useMemo } from 'react';
import { useOrders, Order, OrderStatus } from '@/context/OrderContext';
import { useProducts } from '@/context/ProductContext';
import { useLanguage } from '@/context/LanguageContext';
import { WILAYAS } from '@/data/wilayas';
import { formatDZD } from '@/data/products';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  ShoppingBag,
  DollarSign,
  Truck,
  Home,
  Building2,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Percent,
} from 'lucide-react';

export default function AdminStatistics() {
  const { orders } = useOrders();
  const { products } = useProducts();
  const { lang } = useLanguage();

  const [timeRange, setTimeRange] = useState<'all' | '30d' | '7d'>('all');
  const [wilayaHistogramView, setWilayaHistogramView] = useState<'top10' | 'top20' | 'active'>('top10');
  const [wilayaSearch, setWilayaSearch] = useState('');

  // 1. Filter orders based on selected time range
  const filteredOrders = useMemo(() => {
    if (timeRange === 'all') return orders;
    const now = new Date().getTime();
    const days = timeRange === '7d' ? 7 : 30;
    const cutoff = now - days * 24 * 60 * 60 * 1000;
    return orders.filter((o) => new Date(o.createdAt).getTime() >= cutoff);
  }, [orders, timeRange]);

  // 2. High-level KPIs
  const totalRevenue = useMemo(
    () => filteredOrders.reduce((sum, o) => sum + o.total, 0),
    [filteredOrders]
  );
  const deliveredRevenue = useMemo(
    () =>
      filteredOrders
        .filter((o) => o.status === 'delivered')
        .reduce((sum, o) => sum + o.total, 0),
    [filteredOrders]
  );
  const returnedRevenue = useMemo(
    () =>
      filteredOrders
        .filter((o) => o.status === 'retour')
        .reduce((sum, o) => sum + o.total, 0),
    [filteredOrders]
  );

  const totalOrdersCount = filteredOrders.length;
  const pendingCount = filteredOrders.filter((o) => o.status === 'pending').length;
  const confirmedCount = filteredOrders.filter((o) => o.status === 'confirmed').length;
  const inDeliveryCount = filteredOrders.filter((o) => o.status === 'in_delivery').length;
  const deliveredCount = filteredOrders.filter((o) => o.status === 'delivered').length;
  const retourCount = filteredOrders.filter((o) => o.status === 'retour').length;
  const cancelledCount = filteredOrders.filter((o) => o.status === 'cancelled').length;

  const totalItemsSold = useMemo(
    () =>
      filteredOrders.reduce(
        (sum, o) => sum + o.items.reduce((iSum, it) => iSum + it.quantity, 0),
        0
      ),
    [filteredOrders]
  );

  const returnRate = totalOrdersCount > 0 ? ((retourCount / totalOrdersCount) * 100).toFixed(1) : '0.0';
  const deliverySuccessRate =
    deliveredCount + retourCount + cancelledCount > 0
      ? (
          (deliveredCount / (deliveredCount + retourCount + cancelledCount)) *
          100
        ).toFixed(1)
      : totalOrdersCount > 0
      ? '100.0'
      : '0.0';

  const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  const homeDeliveryOrders = filteredOrders.filter((o) => o.deliveryMode === 'home').length;
  const deskDeliveryOrders = filteredOrders.filter((o) => o.deliveryMode === 'desk').length;
  const homePercent = totalOrdersCount > 0 ? Math.round((homeDeliveryOrders / totalOrdersCount) * 100) : 0;
  const deskPercent = totalOrdersCount > 0 ? 100 - homePercent : 0;

  // 3. Wilaya-by-Wilaya Aggregations (Histogram & Ranking)
  const wilayaStats = useMemo(() => {
    const counts: Record<
      string,
      {
        code: string;
        nameFr: string;
        nameAr: string;
        totalOrders: number;
        revenue: number;
        retours: number;
        delivered: number;
        homeCount: number;
        deskCount: number;
      }
    > = {};

    WILAYAS.forEach((w) => {
      counts[w.code] = {
        code: w.code,
        nameFr: w.nameFr,
        nameAr: w.nameAr,
        totalOrders: 0,
        revenue: 0,
        retours: 0,
        delivered: 0,
        homeCount: 0,
        deskCount: 0,
      };
    });

    filteredOrders.forEach((o) => {
      const code = String(o.wilayaCode).padStart(2, '0');
      if (counts[code]) {
        counts[code].totalOrders += 1;
        counts[code].revenue += o.total;
        if (o.status === 'retour') counts[code].retours += 1;
        if (o.status === 'delivered') counts[code].delivered += 1;
        if (o.deliveryMode === 'home') counts[code].homeCount += 1;
        if (o.deliveryMode === 'desk') counts[code].deskCount += 1;
      }
    });

    return Object.values(counts);
  }, [filteredOrders]);

  // Histogram data
  const histogramWilayas = useMemo(() => {
    const sorted = [...wilayaStats].sort((a, b) => b.totalOrders - a.totalOrders);
    if (wilayaHistogramView === 'top10') {
      return sorted.slice(0, 10);
    }
    if (wilayaHistogramView === 'top20') {
      return sorted.slice(0, 20);
    }
    return sorted.filter((w) => w.totalOrders > 0);
  }, [wilayaStats, wilayaHistogramView]);

  const maxOrdersInHistogram = useMemo(() => {
    const max = Math.max(...histogramWilayas.map((w) => w.totalOrders), 1);
    return max;
  }, [histogramWilayas]);

  // Return reasons analysis from order notes
  const returnReasons = useMemo(() => {
    const reasons = [
      {
        id: 'unreachable',
        labelFr: 'Client injoignable / Téléphone éteint',
        labelAr: 'الزبون لا يرد / الهاتف مغلق',
        count: 0,
        color: '#F59E0B',
      },
      {
        id: 'refusal',
        labelFr: 'Refus du colis à la livraison',
        labelAr: 'رفض استلام الطرد عند التوصيل',
        count: 0,
        color: '#F43F5E',
      },
      {
        id: 'cancellation',
        labelFr: 'Annulation tardive du client',
        labelAr: 'إلغاء متأخر للطلب من طرف الزبون',
        count: 0,
        color: '#8B5CF6',
      },
      {
        id: 'address',
        labelFr: 'Adresse introuvable / Erreur commune',
        labelAr: 'عنوان خاطئ أو بلدية غير دقيقة',
        count: 0,
        color: '#3B82F6',
      },
    ];

    const returnedOrders = filteredOrders.filter((o) => o.status === 'retour');
    if (returnedOrders.length === 0) return reasons;

    returnedOrders.forEach((o, index) => {
      const note = (o.notes || '').toLowerCase();
      if (note.includes('injoignable') || note.includes('ne répond') || note.includes('هاتف')) {
        reasons[0].count++;
      } else if (note.includes('refus') || note.includes('رفض')) {
        reasons[1].count++;
      } else if (note.includes('annul') || note.includes('إلغاء')) {
        reasons[2].count++;
      } else if (note.includes('adresse') || note.includes('عنوان') || note.includes('commune')) {
        reasons[3].count++;
      } else {
        reasons[index % reasons.length].count++;
      }
    });

    return reasons;
  }, [filteredOrders]);

  // Search filtered wilayas for ranking table
  const filteredWilayaTable = useMemo(() => {
    const q = wilayaSearch.trim().toLowerCase();
    return wilayaStats
      .filter((w) => {
        if (!q) return true;
        return (
          w.code.includes(q) ||
          w.nameFr.toLowerCase().includes(q) ||
          w.nameAr.includes(q)
        );
      })
      .sort((a, b) => b.totalOrders - a.totalOrders);
  }, [wilayaStats, wilayaSearch]);

  // Status donut segments computation
  const statusSlices = useMemo(() => {
    const total = totalOrdersCount || 1;
    const slices = [
      { key: 'delivered', label: lang === 'ar' ? 'تم التوصيل' : 'Livrées', count: deliveredCount, color: '#10B981' },
      { key: 'in_delivery', label: lang === 'ar' ? 'في الطريق' : 'En livraison', count: inDeliveryCount, color: '#8B5CF6' },
      { key: 'confirmed', label: lang === 'ar' ? 'مؤكدة' : 'Confirmées', count: confirmedCount, color: '#3B82F6' },
      { key: 'pending', label: lang === 'ar' ? 'قيد الانتظار' : 'En attente', count: pendingCount, color: '#F59E0B' },
      { key: 'retour', label: lang === 'ar' ? 'مرتجعة' : 'Retours', count: retourCount, color: '#F43F5E' },
      { key: 'cancelled', label: lang === 'ar' ? 'ملغاة' : 'Annulées', count: cancelledCount, color: '#EF4444' },
    ];
    return slices.map((s) => ({
      ...s,
      percentage: Math.round((s.count / total) * 100),
    }));
  }, [totalOrdersCount, deliveredCount, inDeliveryCount, confirmedCount, pendingCount, retourCount, cancelledCount, lang]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* ==================== HEADER & TIMEFRAME FILTERS ==================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse" />
            <span className="text-xs font-mono font-bold text-[#FFAA2C] uppercase tracking-wider">
              {lang === 'ar' ? 'تحليلات لوحة التحكم الحية' : 'STATISTIQUES & ANALYSES LIVE'}
            </span>
            <span className="text-white/20">•</span>
            <span className="text-[11px] font-mono text-[#A1A1AA]">
              {totalOrdersCount} {lang === 'ar' ? 'طلبية مسجلة' : 'commandes analysées'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F5F5F7]">
            {lang === 'ar' ? 'لوحة الإحصائيات والأداء' : 'Statistiques & Performance Logistique'}
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            {lang === 'ar'
              ? 'توزيع المبيعات عبر الـ 68 ولاية، معدلات الإرجاع، والقنوات الأكثر طلباً'
              : 'Analyses détaillées par wilaya, taux de retour et performance des livraisons'}
          </p>
        </div>

        {/* Time Period Filter Chips */}
        <div className="flex items-center gap-1.5 p-1 bg-white/[0.04] border border-white/10 rounded-2xl self-start md:self-auto">
          <button
            type="button"
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              timeRange === 'all'
                ? 'bg-gradient-to-r from-[#FF6B00] to-[#FFAA2C] text-black shadow-md shadow-[#FF6B00]/20'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'كل الأوقات' : 'Tout l\'historique'}
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              timeRange === '30d'
                ? 'bg-gradient-to-r from-[#FF6B00] to-[#FFAA2C] text-black shadow-md shadow-[#FF6B00]/20'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'آخر 30 يوم' : '30 derniers jours'}
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              timeRange === '7d'
                ? 'bg-gradient-to-r from-[#FF6B00] to-[#FFAA2C] text-black shadow-md shadow-[#FF6B00]/20'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'آخر 7 أيام' : '7 derniers jours'}
          </button>
        </div>
      </div>

      {/* ==================== HIGH-LEVEL KPI METRICS ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* KPI 1: Chiffre d'Affaires */}
        <div className="p-5 rounded-3xl bg-[#14141B] border border-white/10 relative overflow-hidden shadow-xl group hover:border-[#FF6B00]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#A1A1AA] uppercase">
              {lang === 'ar' ? 'إجمالي المبيعات' : 'Revenu Total'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[#FF6B00] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-mono font-black text-[#F5F5F7] tracking-tight">
              {formatDZD(totalRevenue, lang)}
            </h3>
            <p className="text-[11px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
              <span className="font-bold">{formatDZD(deliveredRevenue, lang)}</span>
              <span className="text-[#A1A1AA]">{lang === 'ar' ? 'محصل بنجاح' : 'encaissés'}</span>
            </p>
          </div>
        </div>

        {/* KPI 2: Taux de Retour (Highlight as requested!) */}
        <div className="p-5 rounded-3xl bg-[#14141B] border border-rose-500/30 relative overflow-hidden shadow-xl group hover:border-rose-500/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-rose-300 uppercase">
              {lang === 'ar' ? 'معدل الإرجاع (الروتور)' : 'Taux de Retour (Retour)'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-mono font-black text-rose-400 tracking-tight">
                {returnRate}%
              </h3>
              <span className="text-xs text-[#A1A1AA] font-mono">
                ({retourCount} {lang === 'ar' ? 'طرد مسترجع' : 'colis'})
              </span>
            </div>
            <p className="text-[11px] text-rose-300/80 font-mono mt-1">
              {returnedRevenue > 0
                ? `${formatDZD(returnedRevenue, lang)} ${lang === 'ar' ? 'قيمة الطرود المرتجعة' : 'en retours'}`
                : lang === 'ar'
                ? 'معدل ممتاز بدون خسائر'
                : 'Excellente gestion des retours'}
            </p>
          </div>
        </div>

        {/* KPI 3: Taux de Succès Livraison */}
        <div className="p-5 rounded-3xl bg-[#14141B] border border-emerald-500/30 relative overflow-hidden shadow-xl group hover:border-emerald-500/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-emerald-300 uppercase">
              {lang === 'ar' ? 'نسبة نجاح التوصيل' : 'Succès Livraison'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-mono font-black text-emerald-400 tracking-tight">
                {deliverySuccessRate}%
              </h3>
              <span className="text-xs text-[#A1A1AA] font-mono">
                ({deliveredCount} {lang === 'ar' ? 'مكتمل' : 'livrés'})
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full mt-2.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(Number(deliverySuccessRate), 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 4: Panier Moyen & Articles */}
        <div className="p-5 rounded-3xl bg-[#14141B] border border-white/10 relative overflow-hidden shadow-xl group hover:border-[#FFAA2C]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#A1A1AA] uppercase">
              {lang === 'ar' ? 'متوسط السلة والمبيعات' : 'Panier Moyen & Ventes'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#FFAA2C] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-mono font-black text-[#F5F5F7] tracking-tight">
              {formatDZD(averageOrderValue, lang)}
            </h3>
            <p className="text-[11px] text-[#FFAA2C] font-mono mt-1">
              {totalItemsSold} {lang === 'ar' ? 'قطعة تم بيعها إجمالاً' : 'articles vendus au total'}
            </p>
          </div>
        </div>
      </div>

      {/* ==================== WILAYA ORDERS HISTOGRAM ==================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#14141B] border border-white/10 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FF6B00]/15 border border-[#FF6B00]/30 text-[#FF6B00] flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#F5F5F7]">
                {lang === 'ar' ? 'مخطط توزيع الطلبيات حسب الولايات (Histogramme)' : 'Histogramme des Commandes par Wilaya'}
              </h3>
            </div>
            <p className="text-xs text-[#A1A1AA] mt-1">
              {lang === 'ar'
                ? 'مقارنة حجم الطلبيات والمبيعات مع نسبة الطرود المرتجعة لكل ولاية'
                : 'Comparatif du volume de commandes et retours par wilaya en Algérie'}
            </p>
          </div>

          {/* Histogram Controls */}
          <div className="flex items-center gap-1.5 p-1 bg-black/5 dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-2xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setWilayaHistogramView('top10')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                wilayaHistogramView === 'top10'
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#FFAA2C] text-black font-black shadow-md shadow-[#FF6B00]/25'
                  : 'text-[#64748B] dark:text-[#A1A1AA] hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              {lang === 'ar' ? 'أفضل 10' : 'Top 10'}
            </button>
            <button
              type="button"
              onClick={() => setWilayaHistogramView('top20')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                wilayaHistogramView === 'top20'
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#FFAA2C] text-black font-black shadow-md shadow-[#FF6B00]/25'
                  : 'text-[#64748B] dark:text-[#A1A1AA] hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              {lang === 'ar' ? 'أفضل 20' : 'Top 20'}
            </button>
            <button
              type="button"
              onClick={() => setWilayaHistogramView('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                wilayaHistogramView === 'active'
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#FFAA2C] text-black font-black shadow-md shadow-[#FF6B00]/25'
                  : 'text-[#64748B] dark:text-[#A1A1AA] hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              {lang === 'ar' ? 'كل الولايات النشطة' : 'Toutes actives'}
            </button>
          </div>
        </div>

        {/* Visual Histogram Chart */}
        {histogramWilayas.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#A1A1AA]">
            {lang === 'ar' ? 'لا توجد طلبات مسجلة في هذه الفترة' : 'Aucune commande enregistrée pour cette période.'}
          </div>
        ) : (
          <div className="space-y-3.5 pt-2">
            {histogramWilayas.map((w) => {
              const widthPct = Math.max(Math.round((w.totalOrders / maxOrdersInHistogram) * 100), w.totalOrders > 0 ? 8 : 2);
              const wilayaReturnRate = w.totalOrders > 0 ? ((w.retours / w.totalOrders) * 100).toFixed(0) : '0';

              return (
                <div key={w.code} className="space-y-1 group">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-6 text-center font-bold text-[#FFAA2C]">
                        {w.code}
                      </span>
                      <span className="font-semibold text-[#F5F5F7]">
                        {lang === 'ar' ? w.nameAr : w.nameFr}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {w.retours > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold">
                          {w.retours} {lang === 'ar' ? 'روتور' : 'retour(s)'} ({wilayaReturnRate}%)
                        </span>
                      )}
                      <span className="text-[11px] text-[#A1A1AA] hidden sm:inline">
                        {formatDZD(w.revenue, lang)}
                      </span>
                      <span className="font-bold text-[#FF6B00] min-w-[3rem] text-right">
                        {w.totalOrders} {lang === 'ar' ? 'طلب' : 'cmd'}
                      </span>
                    </div>
                  </div>

                  {/* Histogram Bar with Gradient & Return slice */}
                  <div className="h-4 w-full bg-white/[0.04] rounded-full overflow-hidden p-0.5 border border-white/5 relative">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FFAA2C] rounded-full transition-all duration-700 relative group-hover:brightness-110"
                      style={{ width: `${widthPct}%` }}
                    >
                      {w.retours > 0 && (
                        <div
                          className="absolute right-0 top-0 bottom-0 bg-rose-500/90 rounded-r-full"
                          style={{ width: `${(w.retours / w.totalOrders) * 100}%` }}
                          title={`${w.retours} retour(s)`}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ==================== TWO-COLUMN: RETURN REASONS & DONUT CHARTS ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Return Analytics & Motifs Breakdown */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#14141B] border border-white/10 shadow-2xl space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F5F5F7]">
                  {lang === 'ar' ? 'تحليل أسباب الإرجاع (Analyse des Retours)' : 'Analyse des Motifs de Retour'}
                </h3>
                <p className="text-xs text-[#A1A1AA]">
                  {lang === 'ar' ? 'تحديد الأسباب المتكررة لتقليل الخسائر اللوجستية' : 'Comprendre les causes pour réduire les coûts logistiques'}
                </p>
              </div>
            </div>

            {/* Return summary banner */}
            <div className="mt-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-between">
              <div>
                <span className="text-xs text-rose-300 font-semibold block">
                  {lang === 'ar' ? 'معدل الإرجاع الإجمالي' : 'Taux global de retours'}
                </span>
                <span className="text-2xl font-mono font-black text-rose-400">
                  {returnRate}%
                </span>
              </div>
              <div className="text-right font-mono text-xs text-rose-200/80">
                <span className="block font-bold">{retourCount} {lang === 'ar' ? 'طرد غير مستلم' : 'colis retournés'}</span>
                <span className="text-[11px] text-[#A1A1AA]">{formatDZD(returnedRevenue, lang)}</span>
              </div>
            </div>

            {/* Motifs breakdown bars */}
            <div className="space-y-3 mt-5">
              {returnReasons.map((reason) => {
                const pct = retourCount > 0 ? Math.round((reason.count / retourCount) * 100) : 0;
                return (
                  <div key={reason.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#F5F5F7] font-medium">
                        {lang === 'ar' ? reason.labelAr : reason.labelFr}
                      </span>
                      <span className="font-mono text-[#A1A1AA]">
                        {reason.count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: reason.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] text-[#A1A1AA] flex items-center gap-2.5 mt-4">
            <AlertTriangle className="w-4 h-4 text-[#FFAA2C] shrink-0" />
            <span>
              {lang === 'ar'
                ? 'نصيحة أمان: اتصل هاتفياً بالعملاء لتأكيد الطلب قبل الشحن لتخفيض نسبة الروتور لأقل من 3%.'
                : 'Conseil : La confirmation téléphonique avant expédition permet de réduire le taux de retour sous la barre des 3%.'}
            </span>
          </div>
        </div>

        {/* Card 2: Order Status & Delivery Mode Donut Distribution */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#14141B] border border-white/10 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F5F5F7]">
                  {lang === 'ar' ? 'توزيع حالات الطلبيات وأنماط الشحن' : 'Répartition des Statuts & Modes'}
                </h3>
                <p className="text-xs text-[#A1A1AA]">
                  {lang === 'ar' ? 'نسب كل مرحلة من مراحل دورة حياة الطلبية' : 'Proportions par statut et mode de livraison'}
                </p>
              </div>
            </div>
          </div>

          {/* Status Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {statusSlices.map((s) => (
              <div
                key={s.key}
                className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-[11px] font-semibold text-[#A1A1AA] truncate">
                    {s.label}
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-base font-mono font-black text-[#0F172A] dark:text-white">
                    {s.count}
                  </span>
                  <span className="text-[11px] font-mono text-[#64748B] dark:text-[#A1A1AA]">
                    {s.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Mode Split (Home vs Desk) */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <span className="text-xs font-mono font-bold text-[#A1A1AA] uppercase block">
              {lang === 'ar' ? 'طريقة التوصيل (منزل vs مكتب)' : 'Mode de Livraison (Domicile vs Stop Desk)'}
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-orange-500/5 border border-orange-500/20 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-500/15 text-[#FF6B00] flex items-center justify-center shrink-0">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-[#F5F5F7] font-bold block">
                    {lang === 'ar' ? 'إلى المنزل' : 'À Domicile'}
                  </span>
                  <span className="font-mono text-sm font-black text-[#FF6B00]">
                    {homePercent}% ({homeDeliveryOrders})
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-teal-500/5 border border-teal-500/20 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-[#F5F5F7] font-bold block">
                    {lang === 'ar' ? 'المكتب / Stop Desk' : 'Au Bureau (Desk)'}
                  </span>
                  <span className="font-mono text-sm font-black text-teal-400">
                    {deskPercent}% ({deskDeliveryOrders})
                  </span>
                </div>
              </div>
            </div>

            {/* Split bar */}
            <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FFAA2C] transition-all duration-500"
                style={{ width: `${homePercent}%` }}
                title={`À domicile: ${homePercent}%`}
              />
              <div
                className="h-full bg-teal-400 transition-all duration-500"
                style={{ width: `${deskPercent}%` }}
                title={`Au bureau: ${deskPercent}%`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 68 WILAYAS DETAILED PERFORMANCE TABLE ==================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#14141B] border border-white/10 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#F5F5F7]">
              {lang === 'ar' ? 'جدول أداء جميع الولايات الـ 68' : 'Tableau de Performance des 68 Wilayas'}
            </h3>
            <p className="text-xs text-[#A1A1AA]">
              {lang === 'ar' ? 'تفاصيل الطلبيات، المداخيل، ونسب الاسترجاع لكل ولاية' : 'Commandes, revenus et taux de retour détaillés par wilaya'}
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={wilayaSearch}
              onChange={(e) => setWilayaSearch(e.target.value)}
              placeholder={lang === 'ar' ? 'بحث بالاسم أو رقم الولاية...' : 'Filtrer par nom ou code...'}
              className="w-full bg-white dark:bg-[#18181F] border border-black/10 dark:border-white/15 focus:border-[#FF6B00] rounded-xl px-3 py-2 pl-9 text-xs text-[#0F172A] dark:text-white outline-none font-mono placeholder:text-[#64748B] dark:placeholder:text-[#A1A1AA]"
            />
            <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-[#18181F] z-10">
              <tr className="border-b border-white/10 text-[#A1A1AA] font-mono text-[11px] uppercase">
                <th className="p-3 w-16">#</th>
                <th className="p-3">{lang === 'ar' ? 'الولاية' : 'Wilaya'}</th>
                <th className="p-3">{lang === 'ar' ? 'إجمالي الطلبات' : 'Commandes'}</th>
                <th className="p-3">{lang === 'ar' ? 'المداخيل (دج)' : 'Revenu (DZD)'}</th>
                <th className="p-3">{lang === 'ar' ? 'المكتملة' : 'Livrées'}</th>
                <th className="p-3">{lang === 'ar' ? 'الروتور (المرتجعة)' : 'Retours'}</th>
                <th className="p-3 text-right">{lang === 'ar' ? 'منزل vs مكتب' : 'Mode'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredWilayaTable.map((w) => {
                const retRate = w.totalOrders > 0 ? Math.round((w.retours / w.totalOrders) * 100) : 0;
                return (
                  <tr key={w.code} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 font-mono font-bold text-[#FFAA2C]">
                      {w.code}
                    </td>
                    <td className="p-3 font-bold text-[#0F172A] dark:text-white">
                      {lang === 'ar' ? w.nameAr : w.nameFr}
                    </td>
                    <td className="p-3 font-mono font-bold text-[#0F172A] dark:text-[#F5F5F7]">
                      {w.totalOrders}
                    </td>
                    <td className="p-3 font-mono font-bold text-[#FF6B00]">
                      {formatDZD(w.revenue, lang)}
                    </td>
                    <td className="p-3 font-mono text-emerald-400">
                      {w.delivered}
                    </td>
                    <td className="p-3 font-mono">
                      {w.retours > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 font-bold border border-rose-500/30 text-[10px]">
                          {w.retours} ({retRate}%)
                        </span>
                      ) : (
                        <span className="text-[#A1A1AA]">0</span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-right text-[11px] text-[#A1A1AA]">
                      {w.homeCount} dom / {w.deskCount} desk
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
