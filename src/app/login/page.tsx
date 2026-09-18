'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth, UserRole } from '@/context/AuthContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Zap,
  Sparkles,
  Phone,
  User as UserIcon,
  Loader2,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const { lang, t } = useLanguage();
  const { login, register, isAuthenticated, role: currentRole } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (mode === 'login') {
      const result = await login(email, password);
      setLoading(false);
      if (result.success && result.user) {
        if (redirectParam) {
          router.push(redirectParam);
        } else if (result.user.role === 'admin') {
          router.push('/admin');
        } else if (result.user.role === 'delivery') {
          router.push('/delivery');
        } else {
          router.push('/account');
        }
      } else {
        setError(
          result.error ||
            (lang === 'ar'
              ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
              : 'Identifiants invalides')
        );
      }
    } else {
      // Register
      if (!name.trim()) {
        setError(lang === 'ar' ? 'يرجى إدخال الاسم' : 'Veuillez saisir votre nom');
        setLoading(false);
        return;
      }
      const result = await register({
        name,
        email,
        password,
        phone,
        role: regRole,
      });
      setLoading(false);
      if (result.success && result.user) {
        if (result.user.role === 'admin') {
          router.push('/admin');
        } else if (result.user.role === 'delivery') {
          router.push('/delivery');
        } else {
          router.push('/account');
        }
      } else {
        setError(result.error || 'Erreur lors de l’inscription');
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#0D0D11] relative overflow-hidden">
      {/* Dynamic Warm Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#FF6B00]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/4 right-10 w-72 h-72 bg-[#FFAA2C]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-white transition-colors"
        >
          {lang === 'ar' ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
          <span>{lang === 'ar' ? 'العودة إلى المتجر' : 'Retour à la boutique'}</span>
        </Link>

        {/* Main Card */}
        <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-[#FF6B00]/40 via-white/10 to-transparent shadow-2xl shadow-black/90">
          <div className="bg-[#14141B] rounded-[23px] p-6 sm:p-8 space-y-6 backdrop-blur-2xl">
            {/* Mode Switcher Tabs */}
            <div className="flex bg-[#18181F] p-1 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-[#FF6B00] text-black shadow-md'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                {lang === 'ar' ? 'تسجيل الدخول' : 'Connexion'}
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-[#FFAA2C] text-black shadow-md'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                {lang === 'ar' ? 'حساب جديد' : 'Créer un compte'}
              </button>
            </div>

            {/* Title Header */}
            <div className="text-center space-y-1">
              <h1 className="text-xl font-black text-[#F5F5F7] tracking-tight">
                {mode === 'login'
                  ? (lang === 'ar' ? 'مرحباً بك مجدداً' : 'Espace Utilisateur')
                  : (lang === 'ar' ? 'إنشاء حساب جديد' : 'Nouveau Compte')}
              </h1>
              <p className="text-xs text-[#A1A1AA]">
                {mode === 'login'
                  ? (lang === 'ar' ? 'سجّل الدخول للوصول إلى لوحة التحكم أو متابعة طلبياتك' : 'Connectez-vous avec vos identifiants ou compte public')
                  : (lang === 'ar' ? 'اختر نوع الحساب للانضمام إلى الفريق' : 'Rejoignez la plateforme Electronics DZ')}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs text-center font-medium">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block font-semibold text-[#F5F5F7] mb-1.5 flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-[#FFAA2C]" />
                      <span>{lang === 'ar' ? 'الاسم الكامل' : 'Nom complet'}</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Yacine Benali"
                      className="w-full bg-[#18181F] border border-white/15 focus:border-[#FF6B00] rounded-xl px-4 py-3 text-[#F5F5F7] outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#F5F5F7] mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#25D366]" />
                      <span>{lang === 'ar' ? 'رقم الهاتف' : 'Numéro de téléphone'}</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0550123456"
                      className="w-full bg-[#18181F] border border-white/15 focus:border-[#FF6B00] rounded-xl px-4 py-3 text-[#F5F5F7] font-mono outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#F5F5F7] mb-1.5">
                      {lang === 'ar' ? 'الدور / الوظيفة' : 'Rôle souhaité'}
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                      className="w-full bg-[#18181F] border border-white/15 focus:border-[#FFAA2C] rounded-xl px-3 py-2.5 text-[#F5F5F7] outline-none"
                    >
                      <option value="customer">{lang === 'ar' ? 'زبون (متابعة الطلبات)' : 'Client (Suivi commandes)'}</option>
                      <option value="delivery">{lang === 'ar' ? 'عامل توصيل (Livreur Express)' : 'Livreur (Gestion livraisons)'}</option>
                      <option value="admin">{lang === 'ar' ? 'مشرف إدارة (Admin)' : 'Administrateur'}</option>
                    </select>
                  </div>
                </>
              )}

              {/* Email */}
              <div>
                <label className="block font-semibold text-[#F5F5F7] mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#FFAA2C]" />
                  <span>{lang === 'ar' ? 'البريد الإلكتروني' : 'Adresse Email'}</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  className="w-full bg-[#18181F] border border-white/15 focus:border-[#FF6B00] rounded-xl px-4 py-3 text-[#F5F5F7] font-mono outline-none transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block font-semibold text-[#F5F5F7] mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#FFAA2C]" />
                  <span>{lang === 'ar' ? 'كلمة المرور' : 'Mot de passe'}</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#18181F] border border-white/15 focus:border-[#FF6B00] rounded-xl px-4 py-3 text-[#F5F5F7] font-mono outline-none transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[#A1A1AA] hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#FF6B00] via-[#FFAA2C] to-[#FF6B00] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-[#FF6B00]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>
                  {loading
                    ? (lang === 'ar' ? 'جارٍ المعالجة...' : 'Traitement...')
                    : mode === 'login'
                    ? (lang === 'ar' ? 'دخول فوري' : 'Se Connecter')
                    : (lang === 'ar' ? 'تأكيد الحساب' : 'Créer le compte')}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center bg-[#0D0D11] text-[#A1A1AA]">
          <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
