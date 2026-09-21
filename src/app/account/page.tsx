'use client';

import React, { useEffect, useState } from 'react';
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
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw,
  Edit3,
  Shield,
  Check,
} from 'lucide-react';

export default function CustomerAccountPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const {
    user,
    role,
    logout,
    isAuthenticated,
    isLoading: isAuthLoading,
    changeEmail,
    changePassword,
    updateProfile,
  } = useAuth();
  const { orders } = useOrders();

  const [activeTab, setActiveTab] = useState<'orders' | 'security' | 'profile'>('orders');

  // Email form state
  const [newEmail, setNewEmail] = useState('');
  const [emailCurrentPassword, setEmailCurrentPassword] = useState('');
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  // Password form state
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [showPwdCurrent, setShowPwdCurrent] = useState(false);
  const [showPwdNew, setShowPwdNew] = useState(false);
  const [showPwdConfirm, setShowPwdConfirm] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

  // Profile info state
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/orders');
    }
  }, [isAuthLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
    }
  }, [user]);

  // Find user's orders by phone or customer match
  const customerOrders = orders.filter((o) => {
    if (!user) return false;
    const phoneMatch = user.phone && o.phone.includes(user.phone.replace(/\s+/g, ''));
    const nameMatch = o.fullName.toLowerCase().includes(user.name.toLowerCase());
    return phoneMatch || nameMatch;
  });

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(null);
    setEmailLoading(true);

    const res = await changeEmail(newEmail, emailCurrentPassword);
    setEmailLoading(false);

    if (res.success) {
      setEmailSuccess(
        lang === 'ar'
          ? 'تم تغيير البريد الإلكتروني بنجاح!'
          : 'Votre adresse email a été modifiée avec succès !'
      );
      setNewEmail('');
      setEmailCurrentPassword('');
    } else {
      setEmailError(res.error || (lang === 'ar' ? 'حدث خطأ أثناء التحديث' : 'Erreur lors de la mise à jour'));
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (pwdNew !== pwdConfirm) {
      setPwdError(
        lang === 'ar'
          ? 'كلمتا المرور غير متطابقتين'
          : 'Les nouveaux mots de passe ne correspondent pas'
      );
      return;
    }

    if (pwdNew.length < 6) {
      setPwdError(
        lang === 'ar'
          ? 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل'
          : 'Le mot de passe doit comporter au moins 6 caractères'
      );
      return;
    }

    setPwdLoading(true);
    const res = await changePassword(pwdCurrent, pwdNew);
    setPwdLoading(false);

    if (res.success) {
      setPwdSuccess(
        lang === 'ar'
          ? 'تم تغيير كلمة المرور بنجاح!'
          : 'Votre mot de passe a été mis à jour avec succès !'
      );
      setPwdCurrent('');
      setPwdNew('');
      setPwdConfirm('');
    } else {
      setPwdError(res.error || (lang === 'ar' ? 'حدث خطأ أثناء التحديث' : 'Erreur lors du changement de mot de passe'));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setProfileLoading(true);

    const res = await updateProfile({ name: profileName, phone: profilePhone });
    setProfileLoading(false);

    if (res.success) {
      setProfileSuccess(
        lang === 'ar'
          ? 'تم تحديث المعلومات الشخصية بنجاح!'
          : 'Vos informations ont été mises à jour !'
      );
    } else {
      setProfileError(res.error || (lang === 'ar' ? 'تعذر التحديث' : 'Erreur de mise à jour'));
    }
  };

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
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-gradient-to-r from-[#FF6B00] to-[#FFAA2C] text-black shadow-lg shadow-[#FF6B00]/25'
                : 'bg-white/5 text-[#A1A1AA] hover:text-white hover:bg-white/10'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{lang === 'ar' ? 'طلباتي السابقة' : 'Mes Commandes'}</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                activeTab === 'orders' ? 'bg-black/20 text-black font-black' : 'bg-white/10 text-[#F5F5F7]'
              }`}
            >
              {customerOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-gradient-to-r from-[#FF6B00] to-[#FFAA2C] text-black shadow-lg shadow-[#FF6B00]/25'
                : 'bg-white/5 text-[#A1A1AA] hover:text-white hover:bg-white/10'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>{lang === 'ar' ? 'الأمان وتغيير البيانات' : 'Sécurité & Identifiants'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-[#FF6B00] to-[#FFAA2C] text-black shadow-lg shadow-[#FF6B00]/25'
                : 'bg-white/5 text-[#A1A1AA] hover:text-white hover:bg-white/10'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>{lang === 'ar' ? 'تعديل البيانات الشخصية' : 'Informations Personnelles'}</span>
          </button>
        </div>

        {/* TAB 1: CLIENT ORDERS HISTORY */}
        {activeTab === 'orders' && (
          <div className="space-y-4 animate-in fade-in duration-150">
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
        )}

        {/* TAB 2: SECURITY & CREDENTIALS (CHANGE EMAIL & CHANGE PASSWORD) */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-150">
            {/* CARD 1: CHANGE EMAIL */}
            <div className="bg-[#18181F] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFAA2C]/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFAA2C]/15 border border-[#FFAA2C]/30 flex items-center justify-center text-[#FFAA2C]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F5F5F7]">
                    {lang === 'ar' ? 'تغيير البريد الإلكتروني' : 'Modifier l’Adresse Email'}
                  </h3>
                  <p className="text-xs text-[#A1A1AA]">
                    {lang === 'ar' ? 'البريد الحالي: ' : 'Email actuel : '}
                    <span className="font-mono text-[#FFAA2C] font-semibold">{user.email}</span>
                  </p>
                </div>
              </div>

              {emailSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{emailSuccess}</span>
                </div>
              )}

              {emailError && (
                <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{emailError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateEmail} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#A1A1AA] mb-1.5 font-semibold">
                    {lang === 'ar' ? 'البريد الإلكتروني الجديد *' : 'Nouvelle adresse email *'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="nouveau@domaine.dz"
                      className="w-full bg-[#14141B] border border-white/15 focus:border-[#FF6B00] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white font-mono outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#A1A1AA] mb-1.5 font-semibold">
                    {lang === 'ar' ? 'كلمة المرور الحالية للتأكيد *' : 'Mot de passe actuel (pour confirmer) *'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type={showEmailPassword ? 'text' : 'password'}
                      required
                      value={emailCurrentPassword}
                      onChange={(e) => setEmailCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#14141B] border border-white/15 focus:border-[#FF6B00] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white font-mono outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmailPassword(!showEmailPassword)}
                      className="absolute right-3 top-2.5 text-[#A1A1AA] hover:text-white transition-colors"
                    >
                      {showEmailPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={emailLoading}
                  className="w-full py-3 bg-gradient-to-r from-[#FF6B00] to-[#FFAA2C] hover:opacity-95 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#FF6B00]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {emailLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{lang === 'ar' ? 'جارٍ التحديث...' : 'Mise à jour...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'حفظ البريد الجديد' : 'Enregistrer le nouvel email'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* CARD 2: CHANGE PASSWORD */}
            <div className="bg-[#18181F] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#FF6B00]/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/15 border border-[#FF6B00]/30 flex items-center justify-center text-[#FF6B00]">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F5F5F7]">
                    {lang === 'ar' ? 'تغيير كلمة المرور' : 'Modifier le Mot de Passe'}
                  </h3>
                  <p className="text-xs text-[#A1A1AA]">
                    {lang === 'ar' ? 'اختر كلمة مرور قوية لحماية حسابك' : 'Sécurisez votre compte avec un mot de passe robuste'}
                  </p>
                </div>
              </div>

              {pwdSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{pwdSuccess}</span>
                </div>
              )}

              {pwdError && (
                <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{pwdError}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
                {/* Current Password */}
                <div>
                  <label className="block text-[#A1A1AA] mb-1.5 font-semibold">
                    {lang === 'ar' ? 'كلمة المرور الحالية *' : 'Mot de passe actuel *'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type={showPwdCurrent ? 'text' : 'password'}
                      required
                      value={pwdCurrent}
                      onChange={(e) => setPwdCurrent(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#14141B] border border-white/15 focus:border-[#FF6B00] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white font-mono outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwdCurrent(!showPwdCurrent)}
                      className="absolute right-3 top-2.5 text-[#A1A1AA] hover:text-white transition-colors"
                    >
                      {showPwdCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-[#A1A1AA] mb-1.5 font-semibold">
                    {lang === 'ar' ? 'كلمة المرور الجديدة *' : 'Nouveau mot de passe *'}
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#FFAA2C] absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type={showPwdNew ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={pwdNew}
                      onChange={(e) => setPwdNew(e.target.value)}
                      placeholder={lang === 'ar' ? '6 أحرف على الأقل' : 'Au moins 6 caractères'}
                      className="w-full bg-[#14141B] border border-white/15 focus:border-[#FF6B00] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white font-mono outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwdNew(!showPwdNew)}
                      className="absolute right-3 top-2.5 text-[#A1A1AA] hover:text-white transition-colors"
                    >
                      {showPwdNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {pwdNew && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className={`h-1 flex-1 rounded-full ${pwdNew.length >= 6 ? 'bg-amber-500' : 'bg-red-500'}`} />
                      <div className={`h-1 flex-1 rounded-full ${pwdNew.length >= 8 ? 'bg-emerald-500' : 'bg-white/10'}`} />
                      <div className={`h-1 flex-1 rounded-full ${pwdNew.length >= 10 && /[A-Z]/.test(pwdNew) ? 'bg-emerald-400' : 'bg-white/10'}`} />
                      <span className="text-[10px] font-mono text-[#A1A1AA] ml-1">
                        {pwdNew.length < 6
                          ? (lang === 'ar' ? 'ضعيف' : 'Faible')
                          : pwdNew.length < 8
                          ? (lang === 'ar' ? 'متوسط' : 'Moyen')
                          : (lang === 'ar' ? 'قوي' : 'Robuste')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-[#A1A1AA] mb-1.5 font-semibold">
                    {lang === 'ar' ? 'تأكيد كلمة المرور الجديدة *' : 'Confirmer le nouveau mot de passe *'}
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type={showPwdConfirm ? 'text' : 'password'}
                      required
                      value={pwdConfirm}
                      onChange={(e) => setPwdConfirm(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#14141B] border border-white/15 focus:border-[#FF6B00] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white font-mono outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwdConfirm(!showPwdConfirm)}
                      className="absolute right-3 top-2.5 text-[#A1A1AA] hover:text-white transition-colors"
                    >
                      {showPwdConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {pwdConfirm && pwdNew && (
                    <p className={`text-[10px] mt-1 font-mono flex items-center gap-1 ${pwdConfirm === pwdNew ? 'text-emerald-400' : 'text-red-400'}`}>
                      {pwdConfirm === pwdNew ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>{lang === 'ar' ? 'كلمات المرور متطابقة' : 'Les mots de passe correspondent'}</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3" />
                          <span>{lang === 'ar' ? 'غير متطابقة' : 'Ne correspondent pas'}</span>
                        </>
                      )}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="w-full py-3 bg-gradient-to-r from-[#FF6B00] to-[#FFAA2C] hover:opacity-95 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#FF6B00]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {pwdLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{lang === 'ar' ? 'جارٍ الحفظ...' : 'Mise à jour...'}</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'حفظ كلمة المرور الجديدة' : 'Changer mon mot de passe'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: PERSONAL INFORMATION */}
        {activeTab === 'profile' && (
          <div className="bg-[#18181F] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl max-w-xl mx-auto animate-in fade-in duration-150 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-60 h-60 bg-[#FF6B00]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/15 border border-[#FF6B00]/30 flex items-center justify-center text-[#FF6B00]">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F5F5F7]">
                  {lang === 'ar' ? 'المعلومات الشخصية' : 'Informations Personnelles'}
                </h3>
                <p className="text-xs text-[#A1A1AA]">
                  {lang === 'ar' ? 'تعديل اسمك ورقم هاتفك المستخدمين في التوصيل' : 'Modifiez votre nom complet et téléphone de contact'}
                </p>
              </div>
            </div>

            {profileSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A1A1AA] mb-1.5 font-semibold">
                  {lang === 'ar' ? 'الاسم الكامل *' : 'Nom complet *'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Nom et Prénom"
                    className="w-full bg-[#14141B] border border-white/15 focus:border-[#FF6B00] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A1A1AA] mb-1.5 font-semibold">
                  {lang === 'ar' ? 'رقم الهاتف للتوصيل' : 'Numéro de téléphone'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="0550123456"
                    className="w-full bg-[#14141B] border border-white/15 focus:border-[#FF6B00] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white font-mono outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="w-full py-3 bg-gradient-to-r from-[#FF6B00] to-[#FFAA2C] hover:opacity-95 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#FF6B00]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {profileLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{lang === 'ar' ? 'جارٍ الحفظ...' : 'Enregistrement...'}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'حفظ المعلومات' : 'Enregistrer les modifications'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
