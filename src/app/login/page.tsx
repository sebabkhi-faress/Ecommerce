'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/common/ThemeToggle';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Zap,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  X,
  Sun,
  Moon,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const { lang, toggleLanguage } = useLanguage();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  // Check Caps Lock state on key events
  const handlePasswordKeyEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (typeof e.getModifierState === 'function') {
      setIsCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  const handleQuickFill = (presetEmail: string, presetPassword: string) => {
    setEmail(presetEmail);
    setPassword(presetPassword);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || isSuccess) return;

    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);

      if (result.success && result.user) {
        setIsSuccess(true);
        // Short pause for satisfying visual feedback before routing
        setTimeout(() => {
          if (redirectParam) {
            router.push(redirectParam);
          } else if (result.user?.role === 'admin') {
            router.push('/admin');
          } else if (result.user?.role === 'delivery') {
            router.push('/delivery');
          } else {
            router.push('/account');
          }
        }, 500);
      } else {
        setLoading(false);
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setError(
          result.error ||
            (lang === 'ar'
              ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التحقق وإعادة المحاولة.'
              : 'Identifiants invalides. Veuillez vérifier votre adresse email et mot de passe.')
        );
      }
    } catch (err: any) {
      setLoading(false);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setError(
        lang === 'ar'
          ? 'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.'
          : 'Erreur de connexion au serveur. Veuillez vérifier votre connexion.'
      );
    }
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center px-4 py-10 bg-[#F8F9FA] dark:bg-[#0A0A0E] text-[#0F172A] dark:text-[#F5F5F7] relative overflow-hidden select-none transition-colors duration-200">
      {/* Dynamic Warm Radial Glow Backgrounds */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#FF6B00]/15 via-[#FFAA2C]/10 to-transparent rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute -top-10 right-10 w-80 h-80 bg-[#FF6B00]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-80 h-80 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-4">
        {/* Top Utility Bar: Back to Store + Theme Switcher + Language Switcher */}
        <div className="flex items-center justify-between px-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-[#A1A1AA] dark:hover:text-white transition-colors group"
          >
            {lang === 'ar' ? (
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            ) : (
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            )}
            <span>{lang === 'ar' ? 'العودة إلى المتجر' : 'Retour à la boutique'}</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Unified Theme Toggle Control */}
            <ThemeToggle size="sm" />

            {/* Language Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-2.5 py-1 rounded-xl bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white border border-black/10 dark:border-white/10 transition-colors text-xs font-mono font-bold cursor-pointer"
              title="Changer de langue / تغيير اللغة"
            >
              {lang === 'ar' ? 'FR' : 'عر'}
            </button>
          </div>
        </div>

        {/* Main Card with Gradient Border */}
        <div
          className={`relative rounded-3xl p-[1px] bg-gradient-to-b from-[#FF6B00]/40 via-black/10 dark:via-white/15 to-transparent shadow-xl shadow-slate-200/60 dark:shadow-2xl dark:shadow-black/90 transition-transform ${
            shake ? 'animate-shake' : ''
          }`}
        >
          <div className="bg-white dark:bg-[#121217] rounded-[23px] p-6 sm:p-8 space-y-6 backdrop-blur-2xl border border-slate-200/80 dark:border-white/5 transition-colors duration-200">
            {/* Header: Logo, Icon, and Title */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF6B00] via-[#FFAA2C] to-[#E05E00] mx-auto flex items-center justify-center shadow-lg shadow-[#FF6B00]/30 ring-4 ring-[#FF6B00]/10">
                <Lock className="w-6 h-6 text-black" />
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/15 border border-[#FF6B00]/25 dark:border-[#FF6B00]/30 text-[#E05E00] dark:text-[#FFAA2C] text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{lang === 'ar' ? 'بوابة الدخول الآمنة' : 'ESPACE SÉCURISÉ'}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-[#F5F5F7] tracking-tight">
                  {lang === 'ar' ? 'تسجيل الدخول' : 'Connexion au Compte'}
                </h1>
                <p className="text-xs text-slate-600 dark:text-[#A1A1AA] leading-relaxed max-w-xs mx-auto">
                  {lang === 'ar'
                    ? 'أدخل بيانات اعتمادك للوصول إلى لوحة التحكم أو متابعة العمليات'
                    : 'Accédez à votre espace d\'administration ou de gestion de commandes'}
                </p>
              </div>
            </div>

            {/* Error Message Box */}
            {error && (
              <div className="p-3.5 bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 rounded-2xl text-xs flex items-start gap-2.5 animate-in fade-in zoom-in-95 duration-150">
                <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{error}</div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Email Input */}
              <div>
                <label className="block font-semibold text-slate-800 dark:text-[#F5F5F7] mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#FF6B00] dark:text-[#FFAA2C]" />
                    <span>{lang === 'ar' ? 'البريد الإلكتروني' : 'Adresse Email'}</span>
                  </span>
                  {email && !loading && (
                    <button
                      type="button"
                      onClick={() => setEmail('')}
                      className="text-[10px] text-slate-400 hover:text-slate-700 dark:text-[#A1A1AA] dark:hover:text-white transition-colors"
                      title="Effacer / مسح"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    disabled={loading || isSuccess}
                    autoCapitalize="none"
                    autoCorrect="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@electronics.dz"
                    className="w-full bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-white/15 focus:border-[#FF6B00] dark:focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/15 rounded-xl px-4 py-3 text-slate-900 dark:text-[#F5F5F7] font-mono outline-none transition-all disabled:opacity-60 placeholder:text-slate-400 dark:placeholder:text-[#A1A1AA]/50"
                  />
                </div>
              </div>

              {/* Password Input with Show/Hide & CapsLock Warning */}
              <div>
                <label className="block font-semibold text-slate-800 dark:text-[#F5F5F7] mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#FF6B00] dark:text-[#FFAA2C]" />
                    <span>{lang === 'ar' ? 'كلمة المرور' : 'Mot de passe'}</span>
                  </span>
                  {isCapsLockOn && (
                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/30 px-1.5 py-0.5 rounded animate-pulse">
                      {lang === 'ar' ? '⚠️ VERR MAJ' : '⚠️ CAPS LOCK'}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={loading || isSuccess}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handlePasswordKeyEvent}
                    onKeyUp={handlePasswordKeyEvent}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-white/15 focus:border-[#FF6B00] dark:focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/15 rounded-xl px-4 py-3 text-slate-900 dark:text-[#F5F5F7] font-mono outline-none transition-all pr-11 disabled:opacity-60 placeholder:text-slate-400 dark:placeholder:text-[#A1A1AA]/50"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    disabled={loading || isSuccess}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 dark:text-[#A1A1AA] dark:hover:text-white transition-colors cursor-pointer p-0.5"
                    title={showPassword ? (lang === 'ar' ? 'إخفاء كلمة المرور' : 'Masquer') : (lang === 'ar' ? 'إظهار كلمة المرور' : 'Afficher')}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button with Dynamic Loading Spinner and Success State */}
              <button
                type="submit"
                disabled={loading || isSuccess}
                className={`w-full py-3.5 px-4 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-3 select-none ${
                  isSuccess
                    ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 text-black shadow-emerald-500/30'
                    : loading
                    ? 'bg-gradient-to-r from-[#FF6B00] via-[#FFAA2C] to-[#FF6B00] text-black opacity-85 cursor-wait'
                    : 'bg-gradient-to-r from-[#FF6B00] via-[#FFAA2C] to-[#FF6B00] text-black shadow-[#FF6B00]/30 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black stroke-[3]" />
                    <span className="font-bold">
                      {lang === 'ar' ? 'جارٍ التحقق والدخول...' : 'Vérification en cours...'}
                    </span>
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-black stroke-[3] animate-bounce" />
                    <span className="font-bold">
                      {lang === 'ar' ? 'تم التحقق بنجاح! جارٍ التوجيه...' : 'Authentification réussie !'}
                    </span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-black" />
                    <span>{lang === 'ar' ? 'تسجيل الدخول' : 'Se Connecter'}</span>
                  </>
                )}
              </button>

              {/* Quick Helper Chips for Smooth Testing */}
              <div className="pt-2">
                <p className="text-[10px] text-slate-500 dark:text-[#A1A1AA] text-center mb-1.5 font-mono">
                  {lang === 'ar' ? 'أمثلة الحسابات السريعة:' : 'Identifiants rapides :'}
                </p>
                <div className="flex items-center justify-center gap-1.5 flex-wrap text-[10px]">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin@electronics.dz', 'admin2026')}
                    className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 dark:bg-white/5 dark:hover:bg-white/10 dark:text-[#FFAA2C] dark:border-[#FF6B00]/30 font-mono font-medium transition-colors cursor-pointer"
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('delivery@electronics.dz', 'delivery2026')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-white/5 dark:hover:bg-white/10 dark:text-emerald-400 dark:border-emerald-500/30 font-mono font-medium transition-colors cursor-pointer"
                  >
                    Livreur
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('client@electronics.dz', 'client2026')}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 dark:bg-white/5 dark:hover:bg-white/10 dark:text-blue-400 dark:border-blue-500/30 font-mono font-medium transition-colors cursor-pointer"
                  >
                    Client
                  </button>
                </div>
              </div>

              {/* 7-Week Session Security Notice */}
              <div className="pt-2 text-center border-t border-slate-200/60 dark:border-white/5">
                <span className="text-[10px] font-mono text-slate-500 dark:text-[#A1A1AA] flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    {lang === 'ar'
                      ? 'جلسة تسجيل دخول آمنة محفوظة لمدة 7 أسابيع (49 يوماً)'
                      : 'Session sécurisée active 7 semaines (49 jours) pour les administrateurs'}
                  </span>
                </span>
              </div>
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
        <div className="min-h-[85vh] flex items-center justify-center bg-slate-50 dark:bg-[#0A0A0E] text-slate-600 dark:text-[#A1A1AA]">
          <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
