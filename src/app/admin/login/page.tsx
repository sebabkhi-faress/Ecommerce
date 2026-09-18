'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Zap, Lock, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success && res.user) {
      if (res.user.role === 'admin') {
        router.push('/admin');
      } else if (res.user.role === 'delivery') {
        router.push('/delivery');
      } else {
        router.push('/');
      }
    } else {
      setError(
        res.error ||
          (lang === 'ar'
            ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
            : 'Identifiants invalides')
      );
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#0D0D11] relative overflow-hidden">
      {/* Glow Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Return to shop */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('admin.back_shop')}</span>
        </Link>

        {/* Centered Glass Card with Warm Gradient Border */}
        <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-[#FF6B00]/50 via-white/10 to-transparent shadow-2xl shadow-black/90">
          <div className="bg-[#14141B] rounded-[23px] p-8 space-y-6 backdrop-blur-2xl">
            {/* Logo and Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#FFAA2C] mx-auto flex items-center justify-center shadow-lg shadow-[#FF6B00]/30">
                <Lock className="w-6 h-6 text-black" />
              </div>
              <h1 className="text-xl font-black text-[#F5F5F7] tracking-tight">
                {t('admin.login_title')}
              </h1>
              <p className="text-xs text-[#A1A1AA]">
                {t('admin.login_subtitle')}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs text-center">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#F5F5F7] mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#FFAA2C]" />
                  <span>{t('admin.email_label')}</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#18181F] border border-white/15 focus:border-[#FF6B00] rounded-xl px-4 py-3 text-xs text-[#F5F5F7] font-mono outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F5F5F7] mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#FFAA2C]" />
                  <span>{t('admin.password_label')}</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#18181F] border border-white/15 focus:border-[#FF6B00] rounded-xl px-4 py-3 text-xs text-[#F5F5F7] font-mono outline-none transition-colors pr-10"
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

              {/* Orange Glow Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#FF6B00] via-[#FFAA2C] to-[#FF6B00] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-[#FF6B00]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>
                  {loading ? t('admin.logging_in') : t('admin.btn_login')}
                </span>
              </button>

              {/* 7-Week Session Notice */}
              <div className="pt-2 text-center">
                <span className="text-[10px] font-mono text-[#A1A1AA] flex items-center justify-center gap-1.5">
                  <Lock className="w-3 h-3 text-[#FFAA2C] shrink-0" />
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
