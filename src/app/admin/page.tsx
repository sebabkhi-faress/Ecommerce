'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useOrders, Order, OrderStatus } from '@/context/OrderContext';
import { useLanguage } from '@/context/LanguageContext';
import { WILAYAS } from '@/data/wilayas';
import { formatDZD } from '@/data/products';
import {
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  Truck,
  Search,
  Filter,
  Plus,
  X,
  LogOut,
  Eye,
  Phone,
  Home,
  Building2,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Database,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const { orders, updateOrderStatus, metrics, isSupabaseConnected, refreshOrders } = useOrders();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [wilayaFilter, setWilayaFilter] = useState<string>('all');

  // Quick Add Product Drawer state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProdNameFr, setNewProdNameFr] = useState('');
  const [newProdNameAr, setNewProdNameAr] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('earbuds');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdImage, setNewProdImage] = useState(
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop'
  );
  const [newProdSuccess, setNewProdSuccess] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('electronics_admin_auth');
    if (!auth) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('electronics_admin_auth');
    router.push('/admin/login');
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSupabaseConfigured && supabase) {
      const slug = newProdNameFr.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      supabase
        .from('products')
        .insert({
          id: `prod-${Date.now()}`,
          slug: slug || `prod-${Date.now()}`,
          name_fr: newProdNameFr,
          name_ar: newProdNameAr,
          price: Number(newProdPrice) || 0,
          category: newProdCategory,
          images: [newProdImage],
          stock_count: 15,
          rating: 5.0,
          reviews_count: 1,
        })
        .then(({ error }) => {
          if (error) {
            console.error('Error inserting product in Supabase:', error.message);
          }
        });
    }

    setNewProdSuccess(true);
    setTimeout(() => {
      setNewProdSuccess(false);
      setIsAddProductOpen(false);
      setNewProdNameFr('');
      setNewProdNameAr('');
      setNewProdPrice('');
    }, 1500);
  };

  // Filter orders based on queries
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.phone.includes(searchQuery) ||
        order.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.commune.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesWilaya = wilayaFilter === 'all' || order.wilayaCode === wilayaFilter;

      return matchesSearch && matchesStatus && matchesWilaya;
    });
  }, [orders, searchQuery, statusFilter, wilayaFilter]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {t('admin.status_pending')}
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {t('admin.status_confirmed')}
          </span>
        );
      case 'in_delivery':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20">
            {t('admin.status_in_delivery')}
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {t('admin.status_delivered')}
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            {t('admin.status_cancelled')}
          </span>
        );
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="py-8 bg-[#0D0D11] min-h-screen text-[#F5F5F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Bar with Admin Info & Logout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
              <span className="text-xs font-mono font-bold text-[#FFAA2C] uppercase tracking-wider">
                {t('admin.live_badge')}
              </span>
              <span className="text-white/20">•</span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${
                  isSupabaseConnected
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}
              >
                <Database className="w-3 h-3" />
                <span>
                  {isSupabaseConnected
                    ? (lang === 'ar' ? 'قاعدة بيانات Supabase متصلة' : 'Supabase DB Connecté')
                    : (lang === 'ar' ? 'وضع التخزين المحلي (Local)' : 'Stockage Local')}
                </span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
              {t('admin.title')}
            </h1>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={async () => {
                setIsRefreshing(true);
                await refreshOrders();
                setTimeout(() => setIsRefreshing(false), 500);
              }}
              className="p-2.5 rounded-xl bg-[#18181F] hover:bg-white/10 text-[#A1A1AA] hover:text-white border border-white/10 transition-colors"
              title={lang === 'ar' ? 'تحديث البيانات' : 'Rafraîchir les données'}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#FF6B00]' : ''}`} />
            </button>

            <button
              onClick={() => setIsAddProductOpen(true)}
              className="px-4 py-2.5 bg-[#FF6B00] hover:bg-[#E05E00] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-[#FF6B00]/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t('admin.add_product')}</span>
            </button>

            <Link
              href="/"
              className="px-4 py-2.5 bg-[#18181F] hover:bg-[#22222B] text-xs font-semibold rounded-xl border border-white/10 text-[#A1A1AA] hover:text-white transition-colors"
            >
              {t('admin.store')}
            </Link>

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-[#18181F] hover:bg-red-500/20 text-[#A1A1AA] hover:text-red-400 border border-white/10 transition-colors"
              title={t('admin.logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real-Time Metrics Cards in DZD */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Metric 1: Total Revenue */}
          <div className="bg-[#18181F] border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-[#FF6B00]/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-[#A1A1AA] uppercase">{t('admin.total_revenue')}</span>
              <div className="w-9 h-9 rounded-xl bg-[#FF6B00]/15 text-[#FF6B00] flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-mono font-black text-[#FF6B00]">
              {formatDZD(metrics.totalRevenue, lang)}
            </p>
            <p className="text-[11px] text-[#25D366] flex items-center gap-1 mt-2 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{t('admin.revenue_desc')}</span>
            </p>
          </div>

          {/* Metric 2: Total Orders */}
          <div className="bg-[#18181F] border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-[#FFAA2C]/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-[#A1A1AA] uppercase">{t('admin.total_orders')}</span>
              <div className="w-9 h-9 rounded-xl bg-[#FFAA2C]/15 text-[#FFAA2C] flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-mono font-black text-[#F5F5F7]">
              {metrics.ordersCount}
            </p>
            <p className="text-[11px] text-[#A1A1AA] mt-2">
              {t('admin.orders_desc')}
            </p>
          </div>

          {/* Metric 3: Pending Orders */}
          <div className="bg-[#18181F] border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-amber-500/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-[#A1A1AA] uppercase">{t('admin.pending_orders')}</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-mono font-black text-amber-400">
              {metrics.pendingCount}
            </p>
            <p className="text-[11px] text-amber-400/80 mt-2">
              {t('admin.pending_desc')}
            </p>
          </div>

          {/* Metric 4: Delivered Rate */}
          <div className="bg-[#18181F] border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-[#A1A1AA] uppercase">{t('admin.delivered_orders')}</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-mono font-black text-emerald-400">
              {metrics.deliveredCount}
            </p>
            <p className="text-[11px] text-emerald-400/80 mt-2">
              {t('admin.delivered_desc')}
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#18181F] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('admin.search_placeholder')}
              className="w-full bg-[#14141B] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F5F5F7] placeholder-[#A1A1AA]/60 outline-none focus:border-[#FF6B00]"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#14141B] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-[#F5F5F7] outline-none"
            >
              <option value="all">{t('admin.all_statuses')}</option>
              <option value="pending">{t('admin.status_pending')}</option>
              <option value="confirmed">{t('admin.status_confirmed')}</option>
              <option value="in_delivery">{t('admin.status_in_delivery')}</option>
              <option value="delivered">{t('admin.status_delivered')}</option>
              <option value="cancelled">{t('admin.status_cancelled')}</option>
            </select>

            {/* Wilaya Filter */}
            <select
              value={wilayaFilter}
              onChange={(e) => setWilayaFilter(e.target.value)}
              className="bg-[#14141B] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-[#F5F5F7] outline-none max-w-[180px]"
            >
              <option value="all">{t('admin.all_wilayas')}</option>
              {WILAYAS.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.code} - {lang === 'ar' ? w.nameAr : w.nameFr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-[#18181F] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F5F7]">
              {t('admin.recent_orders')} ({filteredOrders.length})
            </h3>
            <span className="text-xs text-[#FFAA2C] font-mono">
              {t('admin.live_update')}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-[#14141B] text-[#A1A1AA] font-mono text-[11px] uppercase">
                  <th className="p-4">{t('admin.th_tracking')}</th>
                  <th className="p-4">{t('admin.th_client')}</th>
                  <th className="p-4">{t('admin.th_phone')}</th>
                  <th className="p-4">{t('admin.th_wilaya')}</th>
                  <th className="p-4">{t('admin.th_items')}</th>
                  <th className="p-4">{t('admin.th_total')}</th>
                  <th className="p-4">{t('admin.th_status')}</th>
                  <th className="p-4 text-right">{t('admin.th_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-[#A1A1AA]">
                      {t('admin.no_orders')}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Tracking Code */}
                      <td className="p-4 font-mono font-bold text-[#FF6B00]">
                        {order.trackingCode}
                      </td>

                      {/* Client */}
                      <td className="p-4 font-semibold text-[#F5F5F7]">
                        {order.fullName}
                      </td>

                      {/* Phone */}
                      <td className="p-4 font-mono text-[#A1A1AA]">
                        <a
                          href={`tel:${order.phone}`}
                          className="hover:text-[#FFAA2C] flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-[#FFAA2C]" />
                          <span>{order.phone}</span>
                        </a>
                      </td>

                      {/* Wilaya & Mode */}
                      <td className="p-4">
                        <div className="font-semibold text-[#FFAA2C]">
                          {order.wilayaCode} - {lang === 'ar' ? order.wilayaNameAr : order.wilayaNameFr}
                        </div>
                        <div className="text-[11px] text-[#A1A1AA] truncate max-w-[160px]">
                          {order.commune}
                        </div>
                        <div className="text-[10px] text-[#A1A1AA] flex items-center gap-1 mt-0.5">
                          {order.deliveryMode === 'home' ? (
                            <>
                              <Home className="w-3 h-3 text-[#FF6B00]" />
                              <span>{t('admin.home_delivery')}</span>
                            </>
                          ) : (
                            <>
                              <Building2 className="w-3 h-3 text-[#FFAA2C]" />
                              <span>{t('admin.desk_delivery')}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="p-4">
                        <span className="font-mono text-[#F5F5F7]">
                          {order.items.reduce((s, i) => s + i.quantity, 0)} {lang === 'ar' ? 'منتج' : 'article(s)'}
                        </span>
                        <div className="text-[11px] text-[#A1A1AA] truncate max-w-[150px]">
                          {lang === 'ar' ? (order.items[0]?.productNameAr || order.items[0]?.productNameFr) : order.items[0]?.productNameFr}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="p-4 font-mono font-black text-[#FF6B00] whitespace-nowrap">
                        {formatDZD(order.total, lang)}
                      </td>

                      {/* Status Badge */}
                      <td className="p-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>

                      {/* Status Selector */}
                      <td className="p-4 text-right">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value as OrderStatus)
                          }
                          className="bg-[#14141B] border border-white/15 rounded-lg px-2.5 py-1 text-[11px] font-mono text-white outline-none focus:border-[#FF6B00]"
                        >
                          <option value="pending">{t('admin.status_pending')}</option>
                          <option value="confirmed">{t('admin.status_confirmed')}</option>
                          <option value="in_delivery">{t('admin.status_in_delivery')}</option>
                          <option value="delivered">{t('admin.status_delivered')}</option>
                          <option value="cancelled">{t('admin.status_cancelled')}</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick-Add Product Drawer Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            onClick={() => setIsAddProductOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative bg-[#14141B] border border-white/15 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
                <h3 className="text-base font-black text-[#F5F5F7] uppercase tracking-wider">
                  {t('admin.modal_add_title')}
                </h3>
                <button
                  onClick={() => setIsAddProductOpen(false)}
                  className="p-1 rounded-lg text-[#A1A1AA] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {newProdSuccess ? (
                <div className="p-8 text-center space-y-2">
                  <CheckCircle className="w-12 h-12 text-[#25D366] mx-auto animate-bounce" />
                  <p className="text-sm font-bold text-white">{t('admin.add_success')}</p>
                </div>
              ) : (
                <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
                  {/* Name FR */}
                  <div>
                    <label className="block text-[#A1A1AA] mb-1 font-semibold">
                      {t('admin.lbl_name_fr')}
                    </label>
                    <input
                      type="text"
                      required
                      value={newProdNameFr}
                      onChange={(e) => setNewProdNameFr(e.target.value)}
                      placeholder="Ex: Cyberbuds X9 — Écouteurs ANC 2026"
                      className="w-full bg-[#18181F] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#FF6B00]"
                    />
                  </div>

                  {/* Name AR */}
                  <div>
                    <label className="block text-[#A1A1AA] mb-1 font-semibold">
                      {t('admin.lbl_name_ar')}
                    </label>
                    <input
                      type="text"
                      required
                      dir="rtl"
                      value={newProdNameAr}
                      onChange={(e) => setNewProdNameAr(e.target.value)}
                      placeholder="مثال: سايبر بادز X9 — سماعات لاسلكية احترافية"
                      className="w-full bg-[#18181F] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#FF6B00]"
                    />
                  </div>

                  {/* Category & Price */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#A1A1AA] mb-1 font-semibold">
                        {t('admin.lbl_category')}
                      </label>
                      <select
                        value={newProdCategory}
                        onChange={(e) => setNewProdCategory(e.target.value)}
                        className="w-full bg-[#18181F] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none"
                      >
                        <option value="earbuds">{t('products.earbuds')}</option>
                        <option value="headphones">{t('products.headphones')}</option>
                        <option value="speakers">{t('products.speakers')}</option>
                        <option value="chargers">{t('products.chargers')}</option>
                        <option value="powerbanks">{t('products.powerbanks')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#A1A1AA] mb-1 font-semibold">
                        {t('admin.lbl_price')}
                      </label>
                      <input
                        type="number"
                        required
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                        placeholder="Ex: 8500"
                        className="w-full bg-[#18181F] border border-white/15 rounded-xl px-3 py-2.5 text-white font-mono outline-none focus:border-[#FF6B00]"
                      />
                    </div>
                  </div>

                  {/* Image URL & Instant Preview */}
                  <div>
                    <label className="block text-[#A1A1AA] mb-1 font-semibold">
                      {t('admin.lbl_image')}
                    </label>
                    <input
                      type="url"
                      required
                      value={newProdImage}
                      onChange={(e) => setNewProdImage(e.target.value)}
                      className="w-full bg-[#18181F] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#FF6B00]"
                    />

                    {newProdImage && (
                      <div className="mt-3 flex items-center gap-3 p-2 bg-[#18181F] rounded-xl border border-white/10">
                        <img
                          src={newProdImage}
                          alt="Preview"
                          className="w-14 h-14 object-cover rounded-lg bg-black"
                        />
                        <span className="text-[11px] text-[#25D366]">
                          {t('admin.img_validated')}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#FF6B00] hover:bg-[#E05E00] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#FF6B00]/30 transition-all cursor-pointer mt-4"
                  >
                    {t('admin.btn_save')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
