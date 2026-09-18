'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Zap,
  Loader2,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const { lang, t } = useLanguage();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
            {/* Title Header (Pure Login - No Signup) */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#FFAA2C] mx-auto flex items-center justify-center shadow-lg shadow-[#FF6B00]/30">
                <Lock className="w-6 h-6 text-black" />
              </div>
              <h1 className="text-xl font-black text-[#F5F5F7] tracking-tight">
                {lang === 'ar' ? 'تسجيل الدخول' : 'Connexion'}
              </h1>
              <p className="text-xs text-[#A1A1AA]">
                {lang === 'ar'
                  ? 'أدخل بيانات حسابك للوصول إلى لوحة التحكم أو متابعة طلبياتك'
                  : 'Connectez-vous pour accéder à votre tableau de bord ou vos commandes'}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs text-center font-medium">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
                    ? (lang === 'ar' ? 'جارٍ التحقق...' : 'Vérification...')
                    : (lang === 'ar' ? 'تسجيل الدخول' : 'Se Connecter')}
                </span>
              </button>

              {/* 7-Week Session Notice for Admins */}
              <div className="pt-2 text-center">
                <span className="text-[10px] font-mono text-[#A1A1AA] flex items-center justify-center gap-1">
                  <span>🔒</span>
                  <span>
                    {lang === 'ar'
                      ? 'جلسة آمنة محفوظة لمدة 7 أسابيع للمشرفين'
                      : 'Session sécurisée active 7 semaines pour les administrateurs'}
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
        <div className="min-h-[85vh] flex items-center justify-center bg-[#0D0D11] text-[#A1A1AA]">
          <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
