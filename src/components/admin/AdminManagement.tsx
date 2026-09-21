'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, hashPassword, User } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getInitials } from '@/components/layout/AdminNavbar';
import {
  ShieldCheck,
  UserPlus,
  Search,
  KeyRound,
  Trash2,
  Mail,
  Phone,
  Clock,
  Shield,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Lock,
  Eye,
  EyeOff,
  User as UserIcon,
  Check,
  AlertTriangle,
  Database,
  Crown,
} from 'lucide-react';

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'admin';
  created_at: string;
  is_root?: boolean;
}

const DEFAULT_FALLBACK_ADMIN: AdminAccount = {
  id: 'usr-admin-01',
  name: 'Directeur Admin DZ',
  email: 'admin@bikastore.dz',
  phone: '0550123456',
  role: 'admin',
  created_at: new Date().toISOString(),
  is_root: true,
};

export default function AdminManagement() {
  const { user: currentUser } = useAuth();
  const { lang } = useLanguage();

  const [admins, setAdmins] = useState<AdminAccount[]>([DEFAULT_FALLBACK_ADMIN]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Admin Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newConfirmPassword, setNewConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showNewConfirmPassword, setShowNewConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Reset Password Modal State
  const [resetAdmin, setResetAdmin] = useState<AdminAccount | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  // Delete Admin Confirmation Modal State
  const [deleteAdmin, setDeleteAdmin] = useState<AdminAccount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // General Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Admins from Supabase
  const fetchAdmins = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email, phone, role, created_at')
          .eq('role', 'admin')
          .order('created_at', { ascending: true });

        if (error) {
          console.warn('Error fetching admins from Supabase:', error);
        } else if (data && data.length > 0) {
          const formatted: AdminAccount[] = data.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            role: 'admin',
            created_at: u.created_at || new Date().toISOString(),
            is_root: u.id === 'usr-admin-01' || u.email.includes('admin@electronics.dz') || u.email.includes('admin@bikastore.dz'),
          }));
          setAdmins(formatted);
          setIsLoading(false);
          return;
        }
      }

      // Check localStorage for offline created admins
      const cached = localStorage.getItem('electronics_custom_admins');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAdmins(parsed);
            setIsLoading(false);
            return;
          }
        } catch {}
      }

      setAdmins([DEFAULT_FALLBACK_ADMIN]);
    } catch (err) {
      console.warn('fetchAdmins error:', err);
      setAdmins([DEFAULT_FALLBACK_ADMIN]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // Handle Create Admin
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const name = newName.trim();
    const email = newEmail.trim().toLowerCase();
    const phone = newPhone.trim();
    const password = newPassword.trim();
    const confirmPassword = newConfirmPassword.trim();

    if (!name || !email || !password) {
      setFormError(lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError(lang === 'ar' ? 'صيغة البريد الإلكتروني غير صحيحة' : 'Format d’email invalide');
      return;
    }

    if (password.length < 6) {
      setFormError(lang === 'ar' ? 'كلمة المرور يجب أن تتكون من 6 أحرف على الأقل' : 'Le mot de passe doit comporter au moins 6 caractères');
      return;
    }

    if (password !== confirmPassword) {
      setFormError(lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Les mots de passe ne correspondent pas');
      return;
    }

    // Check if email is already taken in current list
    if (admins.some((a) => a.email.toLowerCase() === email)) {
      setFormError(lang === 'ar' ? 'هذا البريد الإلكتروني مسجل مسبقاً' : 'Cette adresse email est déjà enregistrée');
      return;
    }

    setIsSubmitting(true);

    try {
      const newId = `usr-admin-${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`;
      const hashedPassword = hashPassword(password);
      const createdAt = new Date().toISOString();

      if (isSupabaseConfigured && supabase) {
        // Check uniqueness in database
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .ilike('email', email)
          .maybeSingle();

        if (existingUser) {
          setFormError(lang === 'ar' ? 'هذا البريد الإلكتروني مسجل مسبقاً في قاعدة البيانات' : 'Cette adresse email existe déjà dans la base de données');
          setIsSubmitting(false);
          return;
        }

        const { error: insertErr } = await supabase.from('users').insert({
          id: newId,
          name,
          email,
          phone: phone || null,
          password: hashedPassword,
          role: 'admin',
          created_at: createdAt,
        });

        if (insertErr) {
          setFormError(insertErr.message);
          setIsSubmitting(false);
          return;
        }
      }

      const newAdminItem: AdminAccount = {
        id: newId,
        name,
        email,
        phone: phone || null,
        role: 'admin',
        created_at: createdAt,
        is_root: false,
      };

      const updated = [...admins, newAdminItem];
      setAdmins(updated);
      try {
        localStorage.setItem('electronics_custom_admins', JSON.stringify(updated));
      } catch {}

      setFormSuccess(lang === 'ar' ? 'تمت إضافة المسؤول الجديد بنجاح!' : 'Nouvel administrateur ajouté avec succès !');
      showToast(lang === 'ar' ? 'تمت إضافة المسؤول بنجاح' : 'Administrateur ajouté avec succès', 'success');

      // Reset form
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setNewPassword('');
      setNewConfirmPassword('');

      setTimeout(() => {
        setIsAddModalOpen(false);
        setFormSuccess(null);
      }, 1500);
    } catch (err: any) {
      setFormError(err?.message || (lang === 'ar' ? 'حدث خطأ غير متوقع' : 'Une erreur inattendue est survenue'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Reset Password for an Admin
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetAdmin) return;

    setResetError(null);
    setResetSuccess(null);

    const password = resetPassword.trim();
    if (password.length < 6) {
      setResetError(lang === 'ar' ? 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل' : 'Au moins 6 caractères');
      return;
    }

    if (password !== resetConfirmPassword.trim()) {
      setResetError(lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Les mots de passe ne correspondent pas');
      return;
    }

    setIsResetting(true);

    try {
      const hashedPassword = hashPassword(password);

      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('users')
          .update({ password: hashedPassword })
          .eq('id', resetAdmin.id);

        if (error) {
          setResetError(error.message);
          setIsResetting(false);
          return;
        }
      }

      setResetSuccess(
        lang === 'ar'
          ? `تم تحديث كلمة المرور للمسؤول ${resetAdmin.name} بنجاح!`
          : `Mot de passe réinitialisé pour ${resetAdmin.name} !`
      );
      showToast(lang === 'ar' ? 'تم تغيير كلمة المرور بنجاح' : 'Mot de passe mis à jour', 'success');

      setResetPassword('');
      setResetConfirmPassword('');
      setTimeout(() => {
        setResetAdmin(null);
        setResetSuccess(null);
      }, 1500);
    } catch (err: any) {
      setResetError(err?.message || (lang === 'ar' ? 'تعذر تحديث كلمة المرور' : 'Erreur de réinitialisation'));
    } finally {
      setIsResetting(false);
    }
  };

  // Handle Delete Admin
  const handleDeleteAdmin = async () => {
    if (!deleteAdmin) return;
    setDeleteError(null);

    // Safety checks
    if (deleteAdmin.is_root) {
      setDeleteError(
        lang === 'ar'
          ? 'لا يمكن حذف حساب المشرف الرئيسي للنظام (Root Admin)'
          : 'Impossible de supprimer le compte Super Administrateur racine'
      );
      return;
    }

    if (currentUser && (currentUser.id === deleteAdmin.id || currentUser.email.toLowerCase() === deleteAdmin.email.toLowerCase())) {
      setDeleteError(
        lang === 'ar'
          ? 'لا يمكنك حذف حسابك الحالي الذي تستخدمه لتسجيل الدخول'
          : 'Vous ne pouvez pas supprimer votre propre compte actif'
      );
      return;
    }

    setIsDeleting(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('users').delete().eq('id', deleteAdmin.id);
        if (error) {
          setDeleteError(error.message);
          setIsDeleting(false);
          return;
        }
      }

      const updated = admins.filter((a) => a.id !== deleteAdmin.id);
      setAdmins(updated);
      try {
        localStorage.setItem('electronics_custom_admins', JSON.stringify(updated));
      } catch {}

      showToast(lang === 'ar' ? 'تم حذف حساب المسؤول' : 'Administrateur supprimé', 'success');
      setDeleteAdmin(null);
    } catch (err: any) {
      setDeleteError(err?.message || (lang === 'ar' ? 'تعذر الحذف' : 'Erreur lors de la suppression'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Admins by Search
  const filteredAdmins = admins.filter((a) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      (a.phone && a.phone.includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200 ${
            toast.type === 'success'
              ? 'bg-[#14141B] border-emerald-500/40 text-emerald-300'
              : 'bg-[#14141B] border-red-500/40 text-red-300'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      {/* Header Card & Quick Action */}
      <div className="bg-[#18181F] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF6B00]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#FFAA2C] flex items-center justify-center text-black shadow-lg shadow-[#FF6B00]/25">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-[#F5F5F7]">
                  {lang === 'ar' ? 'إدارة مسؤولي النظام' : 'Gestion des Administrateurs'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FF6B00]/20 text-[#FFAA2C] border border-[#FF6B00]/30 text-xs font-mono font-bold">
                  {admins.length} {lang === 'ar' ? 'مسؤولين' : `admin${admins.length > 1 ? 's' : ''}`}
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA] mt-1">
                {lang === 'ar'
                  ? 'أضف مسؤولي متجر جدد، وقم بإدارة صلاحياتهم وبيانات تسجيل الدخول وتغيير كلمات المرور.'
                  : 'Créez de nouveaux administrateurs pour la boutique, gérez leurs accès et réinitialisez leurs mots de passe.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 flex-wrap">
          <button
            type="button"
            onClick={fetchAdmins}
            disabled={isLoading}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-[#A1A1AA] hover:text-white border border-white/10 transition-colors cursor-pointer"
            title={lang === 'ar' ? 'تحديث القائمة' : 'Actualiser'}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#FF6B00]' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setFormSuccess(null);
              setIsAddModalOpen(true);
            }}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#FF6B00] via-[#FFAA2C] to-[#FF6B00] text-black font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-[#FF6B00]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-black stroke-[2.5]" />
            <span>{lang === 'ar' ? 'إضافة مسؤول جديد' : 'Ajouter un Administrateur'}</span>
          </button>
        </div>
      </div>

      {/* Security & System Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-[#18181F] border border-white/10 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-[#A1A1AA] uppercase block">
              {lang === 'ar' ? 'حالة قاعدة البيانات' : 'Base de données'}
            </span>
            <span className="font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {isSupabaseConfigured ? 'Supabase PostgreSQL (En ligne)' : 'Stockage Local Résilient'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#18181F] border border-white/10 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#FFAA2C]/15 border border-[#FFAA2C]/30 flex items-center justify-center text-[#FFAA2C] shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-[#A1A1AA] uppercase block">
              {lang === 'ar' ? 'تشفير كلمات المرور' : 'Chiffrement'}
            </span>
            <span className="font-bold text-[#F5F5F7] mt-0.5 block">
              Bcrypt Hash (10 Rounds)
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#18181F] border border-white/10 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/15 border border-[#FF6B00]/30 flex items-center justify-center text-[#FF6B00] shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-[#A1A1AA] uppercase block">
              {lang === 'ar' ? 'صلاحية جلسة الدخول' : 'Durée de Session'}
            </span>
            <span className="font-bold text-[#FFAA2C] mt-0.5 block font-mono">
              {lang === 'ar' ? '7 أسابيع (49 يوماً)' : '7 semaines (49 jours)'}
            </span>
          </div>
        </div>
      </div>

      {/* Admins Table & Search Toolbar */}
      <div className="bg-[#18181F] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F5F7] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FF6B00]" />
              <span>{lang === 'ar' ? 'قائمة مسؤولي النظام المصرح لهم' : 'Liste des Administrateurs Autorisés'}</span>
              <span className="text-xs font-mono text-[#A1A1AA]">({filteredAdmins.length})</span>
            </h3>
            <p className="text-xs text-[#A1A1AA] mt-0.5">
              {lang === 'ar'
                ? 'كل حساب يملك حق الوصول الكامل إلى لوحة التحكم والطلبات والمنتجات.'
                : 'Chaque compte dispose d’un accès complet au tableau de bord, commandes et catalogue.'}
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ar' ? 'بحث بالاسم أو البريد...' : 'Rechercher par nom, email...'}
              className="w-full bg-[#14141B] border border-white/10 focus:border-[#FF6B00] rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-[#A1A1AA]/60 outline-none transition-colors font-mono"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#14141B] text-[#A1A1AA] font-mono text-[11px] uppercase">
                <th className="p-4">{lang === 'ar' ? 'المسؤول' : 'Administrateur'}</th>
                <th className="p-4">{lang === 'ar' ? 'الهاتف' : 'Téléphone'}</th>
                <th className="p-4">{lang === 'ar' ? 'الرتبة' : 'Rôle'}</th>
                <th className="p-4">{lang === 'ar' ? 'تاريخ الإنشاء' : 'Date d’ajout'}</th>
                <th className="p-4">{lang === 'ar' ? 'الحالة' : 'Statut'}</th>
                <th className="p-4 text-right">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-[#A1A1AA]">
                    <RefreshCw className="w-8 h-8 text-[#FF6B00] animate-spin mx-auto mb-2" />
                    <p className="text-xs font-mono">{lang === 'ar' ? 'جارٍ تحميل المشرفين...' : 'Chargement des administrateurs...'}</p>
                  </td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-[#A1A1AA]">
                    <AlertCircle className="w-8 h-8 text-[#FFAA2C] mx-auto mb-2 opacity-80" />
                    <p className="font-semibold text-white">
                      {lang === 'ar' ? 'لا يوجد مسؤولون مطابقون' : 'Aucun administrateur trouvé'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => {
                  const isCurrent = currentUser && (currentUser.id === admin.id || currentUser.email.toLowerCase() === admin.email.toLowerCase());
                  const initials = getInitials(admin.name, admin.email);

                  return (
                    <tr key={admin.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Name and Email */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B00] via-[#FFAA2C] to-[#E05E00] text-black font-black text-xs font-mono flex items-center justify-center shadow-md shadow-[#FF6B00]/25 shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#F5F5F7] truncate">{admin.name}</span>
                              {admin.is_root && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold">
                                  <Crown className="w-3 h-3 text-amber-400" />
                                  <span>Root</span>
                                </span>
                              )}
                              {isCurrent && (
                                <span className="px-2 py-0.2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
                                  {lang === 'ar' ? 'أنت' : 'Vous'}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#A1A1AA] font-mono block mt-0.5 truncate">
                              {admin.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="p-4 font-mono text-[#A1A1AA] whitespace-nowrap">
                        {admin.phone ? (
                          <div className="flex items-center gap-1.5 text-white">
                            <Phone className="w-3.5 h-3.5 text-[#25D366]" />
                            <span>{admin.phone}</span>
                          </div>
                        ) : (
                          <span className="text-white/20">—</span>
                        )}
                      </td>

                      {/* Role Badge */}
                      <td className="p-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FF6B00]/15 text-[#FFAA2C] border border-[#FF6B00]/30 text-[10px] font-mono font-bold uppercase">
                          <ShieldCheck className="w-3 h-3 text-[#FF6B00]" />
                          <span>Admin</span>
                        </span>
                      </td>

                      {/* Created At */}
                      <td className="p-4 font-mono text-[#A1A1AA] whitespace-nowrap">
                        {new Date(admin.created_at).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Status */}
                      <td className="p-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>{lang === 'ar' ? 'نشط ومصرح' : 'Actif'}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setResetError(null);
                              setResetSuccess(null);
                              setResetPassword('');
                              setResetConfirmPassword('');
                              setResetAdmin(admin);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#FFAA2C] border border-white/10 hover:border-[#FFAA2C]/30 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                            title={lang === 'ar' ? 'تغيير كلمة المرور' : 'Réinitialiser mot de passe'}
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{lang === 'ar' ? 'كلمة المرور' : 'Mot de passe'}</span>
                          </button>

                          {!admin.is_root && !isCurrent && (
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteError(null);
                                setDeleteAdmin(admin);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                              title={lang === 'ar' ? 'حذف المسؤول' : 'Supprimer'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">{lang === 'ar' ? 'حذف' : 'Supprimer'}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================== MODAL: ADD NEW ADMIN ==================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#14141B] border border-white/15 rounded-3xl w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 relative"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#FFAA2C] flex items-center justify-center text-black shadow-lg shadow-[#FF6B00]/25 shrink-0">
                  <UserPlus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#F5F5F7]">
                    {lang === 'ar' ? 'إضافة مسؤول نظام جديد' : 'Ajouter un Administrateur'}
                  </h3>
                  <p className="text-[11px] text-[#A1A1AA]">
                    {lang === 'ar' ? 'سيتمكن من تسجيل الدخول بكلمة المرور هذه' : 'Ce compte aura un accès complet au tableau de bord'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-[#A1A1AA] hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Alerts */}
            {formSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{formSuccess}</span>
              </div>
            )}

            {formError && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A1A1AA] mb-1.5 font-semibold">
                  {lang === 'ar' ? 'الاسم الكامل *' : 'Nom et Prénom *'}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ahmed Benali"
                    className="w-full bg-[#18181F] border border-white/15 focus:border-[#FF6B00] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A1A1AA] mb-1.5 font-semibold">
                  {lang === 'ar' ? 'البريد الإلكتروني لتسجيل الدخول *' : 'Adresse Email *'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="ahmed.admin@bikastore.dz"
                    className="w-full bg-[#18181F] border border-white/15 focus:border-[#FF6B00] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white font-mono outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A1A1AA] mb-1.5 font-semibold">
                  {lang === 'ar' ? 'رقم الهاتف (اختياري)' : 'Numéro de Téléphone (optionnel)'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="0550123456"
                    className="w-full bg-[#18181F] border border-white/15 focus:border-[#FF6B00] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white font-mono outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A1A1AA] mb-1.5 font-semibold">
                  {lang === 'ar' ? 'كلمة المرور الأولية *' : 'Mot de passe initial *'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#FFAA2C] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#18181F] border border-white/15 focus:border-[#FF6B00] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white font-mono outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-[#A1A1AA] hover:text-white transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-[#A1A1AA] mt-1">
                  {lang === 'ar' ? '6 أحرف على الأقل' : 'Minimum 6 caractères'}
                </p>
              </div>

              <div>
                <label className="block text-[#A1A1AA] mb-1.5 font-semibold">
                  {lang === 'ar' ? 'تأكيد كلمة المرور *' : 'Confirmer le mot de passe *'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type={showNewConfirmPassword ? 'text' : 'password'}
                    required
                    value={newConfirmPassword}
                    onChange={(e) => setNewConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#18181F] border border-white/15 focus:border-[#FF6B00] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white font-mono outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewConfirmPassword(!showNewConfirmPassword)}
                    className="absolute right-3 top-2.5 text-[#A1A1AA] hover:text-white transition-colors"
                  >
                    {showNewConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newConfirmPassword && newPassword && (
                  <p className={`text-[10px] mt-1 font-mono flex items-center gap-1 ${newConfirmPassword === newPassword ? 'text-emerald-400' : 'text-red-400'}`}>
                    {newConfirmPassword === newPassword ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>{lang === 'ar' ? 'كلمات المرور متطابقة' : 'Mots de passe identiques'}</span>
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

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Annuler'}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] via-[#FFAA2C] to-[#FF6B00] text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#FF6B00]/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{lang === 'ar' ? 'جارٍ الإنشاء...' : 'Création...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'تأكيد وإضافة المسؤول' : 'Ajouter l’Administrateur'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: RESET ADMIN PASSWORD ==================== */}
      {resetAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#14141B] border border-white/15 rounded-3xl w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFAA2C]/15 border border-[#FFAA2C]/30 flex items-center justify-center text-[#FFAA2C] shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#F5F5F7]">
                    {lang === 'ar' ? 'تغيير كلمة المرور' : 'Réinitialiser le Mot de Passe'}
                  </h3>
                  <p className="text-[11px] text-[#A1A1AA] truncate max-w-[220px]">
                    {resetAdmin.name} ({resetAdmin.email})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResetAdmin(null)}
                className="p-1.5 text-[#A1A1AA] hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Alerts */}
            {resetSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{resetSuccess}</span>
              </div>
            )}

            {resetError && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{resetError}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A1A1AA] mb-1.5 font-semibold">
                  {lang === 'ar' ? 'كلمة المرور الجديدة *' : 'Nouveau mot de passe *'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#FFAA2C] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#18181F] border border-white/15 focus:border-[#FF6B00] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white font-mono outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3 top-2.5 text-[#A1A1AA] hover:text-white transition-colors"
                  >
                    {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[#A1A1AA] mb-1.5 font-semibold">
                  {lang === 'ar' ? 'تأكيد كلمة المرور الجديدة *' : 'Confirmer le mot de passe *'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={resetConfirmPassword}
                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#18181F] border border-white/15 focus:border-[#FF6B00] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white font-mono outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setResetAdmin(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Annuler'}
                </button>

                <button
                  type="submit"
                  disabled={isResetting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FFAA2C] text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#FF6B00]/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isResetting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{lang === 'ar' ? 'جارٍ التحديث...' : 'En cours...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'حفظ كلمة المرور' : 'Sauvegarder'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: CONFIRM DELETE ADMIN ==================== */}
      {deleteAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#14141B] border border-red-500/30 rounded-3xl w-[95vw] sm:max-w-md p-5 sm:p-7 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#F5F5F7]">
                  {lang === 'ar' ? 'تأكيد حذف حساب المسؤول' : 'Supprimer l’administrateur'}
                </h3>
                <span className="text-[10px] font-mono text-red-400 uppercase">
                  {lang === 'ar' ? 'عملية غير قابلة للإلغاء' : 'Action irréversible'}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              {lang === 'ar'
                ? `هل أنت متأكد من حذف حساب المسؤول "${deleteAdmin.name}" (${deleteAdmin.email})؟ لن يتمكن من تسجيل الدخول إلى لوحة التحكم بعد الآن.`
                : `Êtes-vous sûr de vouloir supprimer l’accès administrateur de ${deleteAdmin.name} (${deleteAdmin.email}) ? Ce compte ne pourra plus accéder au tableau de bord.`}
            </p>

            {deleteError && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setDeleteAdmin(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'إلغاء' : 'Annuler'}
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteAdmin}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{lang === 'ar' ? 'جارٍ الحذف...' : 'Suppression...'}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'تأكيد الحذف' : 'Confirmer la suppression'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
