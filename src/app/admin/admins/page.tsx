'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import AdminNavbar from '@/components/layout/AdminNavbar';
import AdminManagement from '@/components/admin/AdminManagement';
import { ArrowLeft, ArrowRight, LayoutDashboard, ShieldCheck } from 'lucide-react';

export default function AdminAdminsPage() {
  const router = useRouter();
  const { user, role: authRole } = useAuth();
  const { lang } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const legacyAuth = typeof window !== 'undefined' ? localStorage.getItem('electronics_admin_auth') : null;
    if (authRole && authRole !== 'admin') {
      router.push('/login');
    } else if (!legacyAuth && !authRole) {
      router.push('/login?redirect=/admin/admins');
    } else {
      setIsAuthenticated(true);
    }
  }, [router, authRole]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0E] text-[#F5F5F7]">
      <AdminNavbar />

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Breadcrumb & Return to Main Dashboard */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#A1A1AA] hover:text-white border border-white/10 transition-colors cursor-pointer"
          >
            {lang === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{lang === 'ar' ? 'العودة إلى لوحة التحكم الرئيسية' : 'Retour au Tableau de Bord'}</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/admin?tab=admins"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF6B00]/10 hover:bg-[#FF6B00]/20 text-[#FFAA2C] text-xs font-mono font-bold border border-[#FF6B00]/30 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>ADMINS CONSOLE</span>
            </Link>
          </div>
        </div>

        {/* The Admin Management Suite */}
        <AdminManagement />
      </main>
    </div>
  );
}
