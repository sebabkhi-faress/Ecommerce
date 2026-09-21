'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import ThemeToggle from '@/components/common/ThemeToggle';
import {
  Zap,
  Menu,
  ChevronDown,
  User,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Database,
  Moon,
  Sun,
  Globe,
} from 'lucide-react';

/**
 * Dynamically generates 1-2 letter uppercase initials from an admin's name.
 * Examples:
 * - "Fares" -> "F"
 * - "Fares Eddine" -> "FE"
 * - "John Smith" -> "JS"
 * - "John" -> "J"
 */
export function getInitials(name?: string | null, email?: string | null): string {
  const clean = (name && name.trim().length > 0 ? name : email?.split('@')[0] || 'Admin').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'A';
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

interface AdminNavbarProps {
  onToggleSidebar?: () => void;
  isDbConnected?: boolean;
}

export default function AdminNavbar({ onToggleSidebar, isDbConnected = true }: AdminNavbarProps) {
  const { user, role, logout } = useAuth();
  const { lang, toggleLanguage } = useLanguage();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Dynamically extract name & role label
  const adminName = user?.name?.trim() || user?.email?.split('@')[0] || (lang === 'ar' ? 'مسؤول النظام' : 'Administrateur');
  const initials = getInitials(user?.name, user?.email);
  const roleLabel = user?.role === 'admin' || role === 'admin'
    ? (lang === 'ar' ? 'مسؤول النظام' : 'Administrateur')
    : (user?.role || 'Administrateur');

  const handleSidebarToggle = () => {
    if (onToggleSidebar) {
      onToggleSidebar();
    } else {
      window.dispatchEvent(new CustomEvent('toggle-admin-sidebar'));
    }
  };

  const handleProfileClick = () => {
    setIsProfileOpen(false);
    window.dispatchEvent(new CustomEvent('open-admin-tab', { detail: { tab: 'users' } }));
    window.dispatchEvent(new CustomEvent('open-admin-profile-modal'));
  };

  const handleSettingsClick = () => {
    setIsProfileOpen(false);
    window.dispatchEvent(new CustomEvent('open-admin-tab', { detail: { tab: 'users' } }));
    window.dispatchEvent(new CustomEvent('open-admin-settings-modal'));
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0D0D11]/95 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 lg:px-8 py-2.5 transition-colors">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left Section: Mobile menu toggle + Store Brand / Admin Badge */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSidebarToggle}
            className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#A1A1AA] hover:text-white border border-white/10 transition-colors cursor-pointer"
            title="Toggle Menu"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          <Link href="/admin" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF6B00] via-[#FFAA2C] to-[#FF6B00] flex items-center justify-center shadow-md shadow-[#FF6B00]/25 group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 text-black fill-black" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-black tracking-tight text-[#F5F5F7]">
                Bika Store<span className="text-[#FF6B00]">.</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#FF6B00]/20 to-[#FFAA2C]/20 border border-[#FF6B00]/30 text-[#FFAA2C] font-mono font-bold text-[10px] uppercase tracking-wider">
                ADMIN
              </span>
            </div>
          </Link>

          {/* Database Live Connectivity Status Pill */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/10 text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            <span className="text-[#A1A1AA]">
              {isDbConnected ? (lang === 'ar' ? 'قاعدة البيانات متصلة' : 'Base de données Connectée') : 'Local'}
            </span>
          </div>
        </div>

        {/* Right Section: Storefront Link + Dynamic Admin Profile Avatar & Dropdown */}
        <div className="flex items-center gap-3">
          {/* Quick link to preview storefront */}
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#A1A1AA] hover:text-white border border-white/10 transition-colors"
            title={lang === 'ar' ? 'معاينة المتجر' : 'Voir la boutique'}
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#FFAA2C]" />
            <span>{lang === 'ar' ? 'المتجر' : 'Boutique'}</span>
          </Link>

          {/* Theme Toggle (Dark ⇄ Light) */}
          <ThemeToggle size="md" />

          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#A1A1AA] hover:text-white border border-white/10 transition-colors text-xs font-bold"
            title="Changer de langue / تغيير اللغة"
          >
            <span className="font-mono text-[11px]">{lang === 'ar' ? 'FR' : 'عر'}</span>
          </button>

          {/* ADMIN PROFILE BUTTON & DROPDOWN */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="flex items-center gap-2.5 p-1.5 pr-2.5 sm:pr-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#FF6B00]/40 transition-all cursor-pointer group"
              aria-expanded={isProfileOpen}
              aria-haspopup="true"
            >
              {/* Dynamic Circular Avatar with generated initials (F, FE, JS, etc.) */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#FF6B00] via-[#FFAA2C] to-[#E05E00] text-black font-black text-xs font-mono flex items-center justify-center shadow-md shadow-[#FF6B00]/25 group-hover:scale-105 transition-transform shrink-0">
                {initials}
              </div>

              {/* Compact Name & Role Info */}
              <div className="text-left hidden sm:block leading-tight">
                <p className="text-xs font-bold text-[#F5F5F7] group-hover:text-white transition-colors truncate max-w-[120px]">
                  {adminName}
                </p>
                <p className="text-[10px] font-mono text-[#A1A1AA]">
                  {roleLabel}
                </p>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-[#A1A1AA] group-hover:text-white transition-transform duration-200 ${
                  isProfileOpen ? 'rotate-180 text-[#FF6B00]' : ''
                }`}
              />
            </button>

            {/* PROFILE DROPDOWN MENU */}
            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-[#14141B] border border-white/15 rounded-3xl shadow-2xl shadow-black/90 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl">
                {/* Dropdown Header Card */}
                <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/5 mb-1.5 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#FF6B00] via-[#FFAA2C] to-[#E05E00] text-black font-black text-sm font-mono flex items-center justify-center shadow-lg shadow-[#FF6B00]/30 shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#F5F5F7] truncate">
                      {adminName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="px-2 py-0.2 rounded-full bg-[#FF6B00]/15 text-[#FFAA2C] border border-[#FF6B00]/30 text-[10px] font-mono font-bold uppercase">
                        {roleLabel}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                    </div>
                    {user?.email && (
                      <p className="text-[11px] text-[#A1A1AA] truncate mt-1 font-mono">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Dropdown Actions */}
                <div className="space-y-0.5 py-1 text-xs">
                  {/* Profile Option */}
                  <button
                    type="button"
                    onClick={handleProfileClick}
                    className="w-full px-3 py-2.5 rounded-xl text-left flex items-center gap-2.5 text-[#F5F5F7] hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-[#FFAA2C]" />
                    <div className="flex-1">
                      <span className="font-semibold block">{lang === 'ar' ? 'الملف الشخصي' : 'Mon Profil'}</span>
                      <span className="text-[10px] text-[#A1A1AA] block">
                        {lang === 'ar' ? 'معلومات حساب المسؤول' : 'Détails du compte admin'}
                      </span>
                    </div>
                  </button>

                  {/* Admins Management Option */}
                  <Link
                    href="/admin/admins"
                    onClick={() => {
                      setIsProfileOpen(false);
                      window.dispatchEvent(new CustomEvent('open-admin-tab', { detail: { tab: 'admins' } }));
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-left flex items-center gap-2.5 text-[#F5F5F7] hover:bg-white/10 transition-colors cursor-pointer group"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#FF6B00] group-hover:scale-110 transition-transform" />
                    <div className="flex-1">
                      <span className="font-semibold block text-[#FFAA2C]">{lang === 'ar' ? 'إدارة المسؤولين' : 'Gestion des Admins'}</span>
                      <span className="text-[10px] text-[#A1A1AA] block">
                        {lang === 'ar' ? 'إضافة وتعديل حسابات المشرفين' : 'Ajouter et gérer les administrateurs'}
                      </span>
                    </div>
                  </Link>

                  {/* Account Settings Option */}
                  <button
                    type="button"
                    onClick={handleSettingsClick}
                    className="w-full px-3 py-2.5 rounded-xl text-left flex items-center gap-2.5 text-[#F5F5F7] hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-[#A1A1AA]" />
                    <div className="flex-1">
                      <span className="font-semibold block">{lang === 'ar' ? 'إعدادات الحساب' : 'Paramètres du compte'}</span>
                      <span className="text-[10px] text-[#A1A1AA] block">
                        {lang === 'ar' ? 'الجلسة والأمان (49 يوماً)' : 'Sécurité & session (7 sem.)'}
                      </span>
                    </div>
                  </button>
                </div>

                {/* Divider */}
                <div className="my-1.5 border-t border-white/10" />

                {/* Logout Option */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-3 py-2.5 rounded-xl text-left flex items-center gap-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/15 transition-colors cursor-pointer text-xs font-bold group"
                >
                  <LogOut className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                  <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Déconnexion'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
