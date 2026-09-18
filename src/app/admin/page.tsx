'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useOrders, Order, OrderStatus, useDeliveryFees, WilayaDeliveryFee } from '@/context/OrderContext';
import { useLanguage } from '@/context/LanguageContext';
import { WILAYAS } from '@/data/wilayas';
import { formatDZD, Product } from '@/data/products';
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
  UploadCloud,
  Layers,
  Trash2,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  Ban,
  Tag,
  ShieldAlert,
  UserX,
  FolderPlus,
  PhoneOff,
  Check,
  Percent,
  Calendar,
  Flame,
  Sliders,
  Edit3,
  Save,
  MapPin,
  RotateCcw,
  Sparkles,
  LayoutDashboard,
  ShoppingBag,
  BarChart3,
  Users,
  User,
  Settings,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { supabase, isSupabaseConfigured, uploadProductImage } from '@/lib/supabase';
import { useProducts, usePromotions, Promotion } from '@/context/ProductContext';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/components/layout/AdminNavbar';
import AdminStatistics from '@/components/admin/AdminStatistics';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const {
    orders,
    updateOrderStatus,
    deleteOrders,
    metrics,
    isSupabaseConnected,
    refreshOrders,
    bannedPhones,
    banPhone,
    unbanPhone,
    isPhoneBanned,
    refreshBannedPhones,
  } = useOrders();
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    deleteProducts,
    addCategory,
    deleteCategory,
    refreshProducts,
    refreshCategories,
    isDbConnected: isProductsDbConnected,
  } = useProducts();
  const {
    promotions,
    addPromotion,
    deletePromotion,
    togglePromotion,
    refreshPromotions,
  } = usePromotions();
  const {
    deliveryFees,
    updateDeliveryFee,
    bulkUpdateDeliveryFees,
    refreshDeliveryFees,
  } = useDeliveryFees();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  type AdminTabType = 'overview' | 'orders' | 'products' | 'categories' | 'promotions' | 'delivery_fees' | 'users' | 'banned' | 'statics';
  const [adminTab, setAdminTabState] = useState<AdminTabType>('overview');

  const setAdminTab = useCallback((tab: AdminTabType) => {
    setAdminTabState(tab);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('admin_active_tab', tab);
        const url = new URL(window.location.href);
        url.searchParams.set('tab', tab);
        window.history.replaceState(null, '', url.toString());
      } catch (e) {}
    }
  }, []);

  // Restore active tab on mount so refresh ALWAYS stays on current tab
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab') as AdminTabType | null;
      const validTabs: AdminTabType[] = ['overview', 'orders', 'products', 'categories', 'promotions', 'delivery_fees', 'users', 'banned', 'statics'];
      if (tabParam && validTabs.includes(tabParam)) {
        setAdminTabState(tabParam);
      } else {
        const savedTab = localStorage.getItem('admin_active_tab') as AdminTabType | null;
        if (savedTab && validTabs.includes(savedTab)) {
          setAdminTabState(savedTab);
        }
      }
    } catch (e) {}
  }, []);

  // Edit Product State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editNameFr, setEditNameFr] = useState('');
  const [editNameAr, setEditNameAr] = useState('');
  const [editPrice, setEditPrice] = useState<number | string>('');
  const [editOriginalPrice, setEditOriginalPrice] = useState<number | string>('');
  const [editStockCount, setEditStockCount] = useState<number | string>('');
  const [editCategory, setEditCategory] = useState('');
  const [editIsFlashDeal, setEditIsFlashDeal] = useState(false);
  const [editTaglineFr, setEditTaglineFr] = useState('');
  const [editTaglineAr, setEditTaglineAr] = useState('');
  const [editDescFr, setEditDescFr] = useState('');
  const [editDescAr, setEditDescAr] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setEditNameFr(p.nameFr);
    setEditNameAr(p.nameAr);
    setEditPrice(p.price);
    setEditOriginalPrice(p.originalPrice || '');
    setEditStockCount(p.stockCount);
    setEditCategory(p.category);
    setEditIsFlashDeal(Boolean(p.isFlashDeal));
    setEditTaglineFr(p.taglineFr || '');
    setEditTaglineAr(p.taglineAr || '');
    setEditDescFr(p.descriptionFr || '');
    setEditDescAr(p.descriptionAr || '');
    setEditError(null);
  };

  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setEditSaving(true);
    setEditError(null);

    const priceNum = Number(editPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setEditError(lang === 'ar' ? 'السعر غير صحيح' : 'Prix invalide');
      setEditSaving(false);
      return;
    }

    const updates: Partial<Product> = {
      nameFr: editNameFr.trim(),
      nameAr: editNameAr.trim(),
      price: priceNum,
      originalPrice: editOriginalPrice ? Number(editOriginalPrice) : undefined,
      stockCount: Number(editStockCount) || 0,
      category: editCategory,
      isFlashDeal: editIsFlashDeal,
      taglineFr: editTaglineFr.trim(),
      taglineAr: editTaglineAr.trim(),
      descriptionFr: editDescFr.trim(),
      descriptionAr: editDescAr.trim(),
    };

    const res = await updateProduct(editingProduct.id, updates);
    setEditSaving(false);

    if (res.success) {
      setEditingProduct(null);
      showToast(
        lang === 'ar' ? 'تم تعديل المنتج بنجاح' : 'Produit modifié avec succès',
        'success',
        lang === 'ar' ? `تم حفظ التعديلات على ${updates.nameAr || updates.nameFr}` : `Modifications enregistrées pour ${updates.nameFr}`
      );
    } else {
      setEditError(res.error || (lang === 'ar' ? 'حدث خطأ أثناء حفظ التعديل' : 'Erreur lors de la mise à jour'));
    }
  };

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [productSubTab, setProductSubTab] = useState<'catalog' | 'categories'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Generic responsive confirmation modal state (0 default browser window.confirm!)
  const [genericConfirmModal, setGenericConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    isLoading?: boolean;
    onConfirm: () => Promise<void> | void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  // Products Multiselect state
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Delete confirmation modal with linked orders checking
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    products: Product[];
    linkedOrders: Order[];
    isDeleting: boolean;
    isConfirmed: boolean;
  }>({
    isOpen: false,
    products: [],
    linkedOrders: [],
    isDeleting: false,
    isConfirmed: false,
  });

  // Floating confirmation toast state
  const [toast, setToast] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
    details?: string;
  }>({
    isOpen: false,
    type: 'success',
    message: '',
    details: undefined,
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success', details?: string) => {
    setToast({ isOpen: true, type, message, details });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, isOpen: false }));
    }, 4500);
  };

  // Admin Profile Modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [wilayaFilter, setWilayaFilter] = useState<string>('all');

  // Promotion management states
  const [isAddPromoOpen, setIsAddPromoOpen] = useState(false);
  const [newPromoName, setNewPromoName] = useState('');
  const [newPromoTargetType, setNewPromoTargetType] = useState<'category' | 'product'>('category');
  const [newPromoTargetId, setNewPromoTargetId] = useState('earbuds');
  const [newPromoDiscountType, setNewPromoDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [newPromoDiscountValue, setNewPromoDiscountValue] = useState('20');
  const [newPromoDurationPreset, setNewPromoDurationPreset] = useState<'24h' | '3d' | '7d' | '30d' | 'custom'>('7d');
  const [newPromoStartAt, setNewPromoStartAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [newPromoEndAt, setNewPromoEndAt] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 16);
  });
  const [newPromoBannerFr, setNewPromoBannerFr] = useState('');
  const [newPromoBannerAr, setNewPromoBannerAr] = useState('');
  const [newPromoError, setNewPromoError] = useState<string | null>(null);
  const [newPromoSuccess, setNewPromoSuccess] = useState(false);
  const [promoSearchQuery, setPromoSearchQuery] = useState('');

  // Delivery fee management states
  const [feeSearchQuery, setFeeSearchQuery] = useState('');
  const [feeZoneFilter, setFeeZoneFilter] = useState<'all' | 'centre' | 'est' | 'ouest' | 'sud'>('all');
  const [feeEditedRows, setFeeEditedRows] = useState<Record<string, { homeFee: number; deskFee: number; isActive: boolean; isSaving?: boolean; isSaved?: boolean }>>({});
  const [isBulkFeeOpen, setIsBulkFeeOpen] = useState(false);
  const [bulkTarget, setBulkTarget] = useState<'home' | 'desk' | 'both'>('both');
  const [bulkMode, setBulkMode] = useState<'set' | 'add'>('set');
  const [bulkAmount, setBulkAmount] = useState('500');
  const [bulkSuccess, setBulkSuccess] = useState<string | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  // Category management modal states
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatNameFr, setNewCatNameFr] = useState('');
  const [newCatNameAr, setNewCatNameAr] = useState('');
  const [newCatDescFr, setNewCatDescFr] = useState('');
  const [newCatDescAr, setNewCatDescAr] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Layers');
  const [newCatError, setNewCatError] = useState<string | null>(null);
  const [newCatSuccess, setNewCatSuccess] = useState(false);

  // Phone ban management states
  const [banPhoneInput, setBanPhoneInput] = useState('');
  const [banReasonInput, setBanReasonInput] = useState('Refus de colis à la livraison (Retour répété)');
  const [banNotesInput, setBanNotesInput] = useState('');
  const [banSearchQuery, setBanSearchQuery] = useState('');
  const [banError, setBanError] = useState<string | null>(null);
  const [banSuccess, setBanSuccess] = useState<string | null>(null);
  const [quickBanOrder, setQuickBanOrder] = useState<any | null>(null);

  // Quick Add Product Drawer state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProdNameFr, setNewProdNameFr] = useState('');
  const [newProdNameAr, setNewProdNameAr] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('earbuds');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdOriginalPrice, setNewProdOriginalPrice] = useState('');
  const [newProdStock, setNewProdStock] = useState('20');
  const [newProdTaglineFr, setNewProdTaglineFr] = useState('');
  const [newProdTaglineAr, setNewProdTaglineAr] = useState('');
  const [newProdDescFr, setNewProdDescFr] = useState('');
  const [newProdDescAr, setNewProdDescAr] = useState('');
  const [newProdIsFlashDeal, setNewProdIsFlashDeal] = useState(false);
  const [newProdBadge, setNewProdBadge] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdSuccess, setNewProdSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  const { user, role: authRole, logout: authLogout } = useAuth();

  useEffect(() => {
    const legacyAuth = typeof window !== 'undefined' ? localStorage.getItem('electronics_admin_auth') : null;
    if (authRole && authRole !== 'admin') {
      router.push('/login');
    } else if (!legacyAuth && !authRole) {
      router.push('/login?redirect=/admin');
    } else {
      setIsAuthenticated(true);
    }
  }, [router, authRole]);

  useEffect(() => {
    const handleToggleSidebar = () => setIsMobileSidebarOpen((prev) => !prev);
    const handleOpenTab = (e: any) => {
      if (e.detail?.tab) {
        setAdminTab(e.detail.tab);
      }
    };
    const handleOpenProfile = () => {
      setIsProfileModalOpen(true);
    };
    const handleOpenSettings = () => {
      setAdminTab('users');
      setIsProfileModalOpen(false);
    };

    window.addEventListener('toggle-admin-sidebar', handleToggleSidebar);
    window.addEventListener('open-admin-tab', handleOpenTab);
    window.addEventListener('open-admin-profile-modal', handleOpenProfile);
    window.addEventListener('open-admin-settings-modal', handleOpenSettings);

    return () => {
      window.removeEventListener('toggle-admin-sidebar', handleToggleSidebar);
      window.removeEventListener('open-admin-tab', handleOpenTab);
      window.removeEventListener('open-admin-profile-modal', handleOpenProfile);
      window.removeEventListener('open-admin-settings-modal', handleOpenSettings);
    };
  }, []);

  const handleLogout = () => {
    authLogout('/login');
  };

  // Products Multiselect & Delete Handlers
  const toggleSelectAllProducts = () => {
    if (selectedProductIds.length === products.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products.map((p) => p.id));
    }
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const openDeleteConfirmation = (targetProducts: Product[]) => {
    if (!targetProducts || targetProducts.length === 0) return;
    const targetIds = new Set(targetProducts.map((p) => p.id));
    const targetNamesFr = new Set(targetProducts.map((p) => p.nameFr?.trim().toLowerCase()));
    const targetNamesAr = new Set(targetProducts.map((p) => p.nameAr?.trim()));

    const linked = orders.filter((order) =>
      order.items.some(
        (item) =>
          targetIds.has(item.productId) ||
          (item.productNameFr && targetNamesFr.has(item.productNameFr.trim().toLowerCase())) ||
          (item.productNameAr && targetNamesAr.has(item.productNameAr.trim()))
      )
    );

    setDeleteModal({
      isOpen: true,
      products: targetProducts,
      linkedOrders: linked,
      isDeleting: false,
      isConfirmed: false,
    });
  };

  const handleConfirmDeleteProducts = async () => {
    if (deleteModal.products.length === 0) return;
    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));

    const productIdsToDelete = deleteModal.products.map((p) => p.id);
    const orderIdsToDelete = deleteModal.linkedOrders.map((o) => o.id);

    try {
      await deleteProducts(productIdsToDelete);
      if (orderIdsToDelete.length > 0) {
        await deleteOrders(orderIdsToDelete);
      }
      setSelectedProductIds((prev) => prev.filter((id) => !productIdsToDelete.includes(id)));
      setDeleteModal({
        isOpen: false,
        products: [],
        linkedOrders: [],
        isDeleting: false,
        isConfirmed: false,
      });

      showToast(
        lang === 'ar' ? 'تم تأكيد الحذف بنجاح' : 'Confirmation : Suppression effectuée',
        'success',
        orderIdsToDelete.length > 0
          ? (lang === 'ar'
              ? `تم حذف ${productIdsToDelete.length} منتج و ${orderIdsToDelete.length} طلبية مرتبطة بنجاح من قاعدة البيانات.`
              : `${productIdsToDelete.length} produit(s) et ${orderIdsToDelete.length} commande(s) associée(s) ont été définitivement supprimés.`)
          : (lang === 'ar'
              ? `تم حذف ${productIdsToDelete.length} منتج بنجاح من الكتالوج.`
              : `${productIdsToDelete.length} produit(s) supprimé(s) du catalogue avec succès.`)
      );
    } catch (err) {
      console.error('Failed to delete product(s)/order(s)', err);
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
      showToast(
        lang === 'ar' ? 'حدث خطأ أثناء الحذف' : 'Erreur lors de la suppression',
        'error'
      );
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    const nameFr = newProdNameFr.trim() || newProdNameAr.trim();
    const nameAr = newProdNameAr.trim() || newProdNameFr.trim();
    if (!nameFr && !nameAr) {
      setUploadError(lang === 'ar' ? 'يرجى إدخال اسم المنتج (بالعربية أو الفرنسية)' : 'Veuillez renseigner le nom du produit');
      return;
    }

    const priceNum = Number(newProdPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setUploadError(lang === 'ar' ? 'يرجى إدخال سعر صالح أكبر من 0 دج' : 'Veuillez saisir un prix valide');
      return;
    }

    const stockNum = Number(newProdStock);
    if (isNaN(stockNum) || stockNum < 0 || newProdStock === '') {
      setUploadError(lang === 'ar' ? 'الكمية في المخزون إجبارية (يرجى إدخال رقم 0 أو أكثر)' : 'La quantité en stock est obligatoire');
      return;
    }

    if (!newProdImage) {
      setUploadError(lang === 'ar' ? 'صورة المنتج إجبارية (يرجى رفع صورة من جهازك)' : 'L’image du produit est obligatoire (téléversez depuis votre appareil)');
      return;
    }

    const origPriceNum = newProdOriginalPrice ? Number(newProdOriginalPrice) : undefined;

    const result = await addProduct({
      nameFr,
      nameAr,
      price: priceNum,
      originalPrice: origPriceNum && origPriceNum > priceNum ? origPriceNum : undefined,
      category: newProdCategory,
      stockCount: stockNum,
      images: [newProdImage],
      taglineFr: newProdTaglineFr.trim() || undefined,
      taglineAr: newProdTaglineAr.trim() || undefined,
      descriptionFr: newProdDescFr.trim() || undefined,
      descriptionAr: newProdDescAr.trim() || undefined,
      isFlashDeal: newProdIsFlashDeal,
      badgeFr: newProdBadge.trim() || (newProdIsFlashDeal ? 'PROMO' : undefined),
      badgeAr: newProdBadge.trim() || (newProdIsFlashDeal ? 'تخفيض' : undefined),
    });

    if (result.success) {
      setNewProdSuccess(true);
      showToast(
        lang === 'ar' ? 'تمت إضافة المنتج بنجاح' : 'Produit ajouté avec succès',
        'success',
        lang === 'ar' ? `تم نشر ${nameAr || nameFr} في المتجر` : `${nameFr} est maintenant disponible`
      );
      setTimeout(() => {
        setNewProdSuccess(false);
        setIsAddProductOpen(false);
        // Reset form fields
        setNewProdNameFr('');
        setNewProdNameAr('');
        setNewProdPrice('');
        setNewProdOriginalPrice('');
        setNewProdStock('20');
        setNewProdImage('');
        setNewProdTaglineFr('');
        setNewProdTaglineAr('');
        setNewProdDescFr('');
        setNewProdDescAr('');
        setNewProdIsFlashDeal(false);
        setNewProdBadge('');
        setShowOptionalFields(false);
      }, 1000);
    } else {
      setUploadError(result.error || (lang === 'ar' ? 'حدث خطأ أثناء حفظ المنتج' : 'Erreur lors de l’enregistrement'));
    }
  };

  // Category Actions
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewCatError(null);
    if (!newCatSlug.trim() || !newCatNameFr.trim() || !newCatNameAr.trim()) {
      setNewCatError('Veuillez renseigner le slug et les noms FR/AR');
      return;
    }

    const res = await addCategory({
      slug: newCatSlug,
      nameFr: newCatNameFr,
      nameAr: newCatNameAr,
      descriptionFr: newCatDescFr,
      descriptionAr: newCatDescAr,
      icon: newCatIcon,
    });

    if (res.success) {
      setNewCatSuccess(true);
      setTimeout(() => {
        setNewCatSuccess(false);
        setIsAddCategoryOpen(false);
        setNewCatSlug('');
        setNewCatNameFr('');
        setNewCatNameAr('');
        setNewCatDescFr('');
        setNewCatDescAr('');
      }, 1000);
    } else {
      setNewCatError(res.error || 'Erreur lors de la création');
    }
  };

  const handleDeleteCategory = (id: string, name: string) => {
    setGenericConfirmModal({
      isOpen: true,
      title: lang === 'ar' ? 'حذف القسم' : 'Supprimer la catégorie',
      description: lang === 'ar'
        ? `هل أنت متأكد من حذف القسم "${name}"؟ قد يؤثر ذلك على المنتجات المرتبطة به.`
        : `Êtes-vous sûr de vouloir supprimer la catégorie "${name}" ? Cette action est définitive.`,
      confirmText: lang === 'ar' ? 'نعم، احذف القسم' : 'Oui, supprimer',
      cancelText: lang === 'ar' ? 'إلغاء' : 'Annuler',
      isDanger: true,
      onConfirm: async () => {
        await deleteCategory(id);
        setGenericConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast(
          lang === 'ar' ? 'تم تأكيد حذف القسم بنجاح' : 'Catégorie supprimée avec succès',
          'success',
          lang === 'ar' ? `تمت إزالة القسم "${name}" من النظام.` : `La catégorie "${name}" a été définitivement retirée.`
        );
      },
    });
  };

  // Phone Ban Actions
  const handleManualBanPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanError(null);
    setBanSuccess(null);
    const digitsOnly = banPhoneInput.replace(/\D/g, '');
    if (!digitsOnly) {
      setBanError(
        lang === 'ar'
          ? 'يرجى إدخال رقم الهاتف'
          : 'Veuillez saisir un numéro de téléphone'
      );
      return;
    }

    if (digitsOnly.length !== 10 || !/^0[567]\d{8}$/.test(digitsOnly)) {
      setBanError(
        lang === 'ar'
          ? 'رقم غير صحيح! يجب أن يتكون من 10 أرقام ويبدأ بـ 05 أو 06 أو 07 (مثال: 0677898762)'
          : 'Numéro algérien invalide ! Il doit comporter 10 chiffres et commencer par 05, 06 ou 07 (Ex: 0677898762)'
      );
      return;
    }

    const res = await banPhone(digitsOnly, banReasonInput, banNotesInput);
    if (res.success) {
      setBanSuccess(
        lang === 'ar'
          ? `تم حظر الرقم ${digitsOnly} بنجاح ومنعه من الطلب!`
          : `Numéro ${digitsOnly} bloqué avec succès !`
      );
      setBanPhoneInput('');
      setBanNotesInput('');
      setTimeout(() => setBanSuccess(null), 3500);
    } else {
      setBanError(res.error || 'Erreur lors du blocage');
    }
  };

  const handleUnbanPhone = (phoneToUnban: string) => {
    setGenericConfirmModal({
      isOpen: true,
      title: lang === 'ar' ? 'رفع الحظر عن الرقم' : 'Débloquer le numéro',
      description: lang === 'ar'
        ? `هل تريد رفع الحظر عن الرقم ${phoneToUnban} والسماح له بالطلب مجدداً؟`
        : `Débloquer le numéro ${phoneToUnban} et lui réautoriser les commandes ?`,
      confirmText: lang === 'ar' ? 'رفع الحظر' : 'Débloquer',
      cancelText: lang === 'ar' ? 'إلغاء' : 'Annuler',
      isDanger: false,
      onConfirm: async () => {
        await unbanPhone(phoneToUnban);
        setGenericConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast(
          lang === 'ar' ? 'تم رفع الحظر بنجاح' : 'Numéro débloqué',
          'success',
          lang === 'ar' ? `تم السماح للرقم ${phoneToUnban} بالطلب مجدداً.` : `Le numéro ${phoneToUnban} peut à nouveau passer des commandes.`
        );
      },
    });
  };

  const handleQuickBanOrder = (order: Order) => {
    const reason = `Refus / Annulation commande ${order.trackingCode}`;
    setGenericConfirmModal({
      isOpen: true,
      title: lang === 'ar' ? 'حظر الزبون' : 'Bloquer le client',
      description: lang === 'ar'
        ? `هل تريد حظر رقم الزبون ${order.phone} (${order.fullName}) ومنعه من الطلب مجدداً؟`
        : `Voulez-vous bloquer le numéro ${order.phone} (${order.fullName}) et interdire ses futures commandes ?`,
      confirmText: lang === 'ar' ? 'نعم، احظر الرقم' : 'Oui, bloquer',
      cancelText: lang === 'ar' ? 'إلغاء' : 'Annuler',
      isDanger: true,
      onConfirm: async () => {
        await banPhone(order.phone, reason, `Client: ${order.fullName}, Wilaya: ${order.wilayaCode}`);
        setGenericConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast(
          lang === 'ar' ? 'تم حظر الرقم بنجاح' : 'Numéro bloqué avec succès',
          'success',
          lang === 'ar' ? `تم إدراج ${order.phone} في القائمة السوداء.` : `Le numéro ${order.phone} a été mis sur liste noire.`
        );
      },
    });
  };

  // Filtered Banned Phones
  const filteredBannedPhones = useMemo(() => {
    if (!banSearchQuery.trim()) return bannedPhones;
    const q = banSearchQuery.toLowerCase().trim();
    return bannedPhones.filter(
      (b) =>
        b.phone.includes(q) ||
        b.reason.toLowerCase().includes(q) ||
        (b.notes && b.notes.toLowerCase().includes(q))
    );
  }, [bannedPhones, banSearchQuery]);

  // Promotion Actions & Duration Presets
  const handlePresetDurationChange = (preset: '24h' | '3d' | '7d' | '30d' | 'custom') => {
    setNewPromoDurationPreset(preset);
    const start = new Date();
    setNewPromoStartAt(start.toISOString().slice(0, 16));
    const end = new Date(start);
    if (preset === '24h') end.setHours(end.getHours() + 24);
    else if (preset === '3d') end.setDate(end.getDate() + 3);
    else if (preset === '7d') end.setDate(end.getDate() + 7);
    else if (preset === '30d') end.setDate(end.getDate() + 30);
    if (preset !== 'custom') {
      setNewPromoEndAt(end.toISOString().slice(0, 16));
    }
  };

  const handleCreatePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewPromoError(null);

    const trimmedName = newPromoName.trim();
    if (!trimmedName) {
      setNewPromoError(lang === 'ar' ? 'يرجى إدخال اسم العرض الترويجي' : 'Veuillez saisir le nom de la promotion');
      return;
    }

    const val = Number(newPromoDiscountValue);
    if (isNaN(val) || val <= 0) {
      setNewPromoError(lang === 'ar' ? 'قيمة الخصم يجب أن تكون أكبر من 0' : 'La valeur de remise doit être supérieure à 0');
      return;
    }

    if (newPromoDiscountType === 'percentage' && val > 95) {
      setNewPromoError(lang === 'ar' ? 'نسبة الخصم لا يمكن أن تتجاوز 95%' : 'Le pourcentage ne peut pas dépasser 95%');
      return;
    }

    const startDate = new Date(newPromoStartAt).toISOString();
    const endDate = new Date(newPromoEndAt).toISOString();
    if (new Date(endDate).getTime() <= new Date(startDate).getTime()) {
      setNewPromoError(lang === 'ar' ? 'تاريخ نهاية العرض يجب أن يكون بعد تاريخ البداية' : 'La date de fin doit être postérieure à la date de début');
      return;
    }

    const targetId = newPromoTargetType === 'category'
      ? (newPromoTargetId || (categories[0]?.slug || 'earbuds'))
      : (newPromoTargetId || (products[0]?.id || ''));

    const res = await addPromotion({
      name: trimmedName,
      targetType: newPromoTargetType,
      targetId,
      discountType: newPromoDiscountType,
      discountValue: val,
      startAt: startDate,
      endAt: endDate,
      isActive: true,
      bannerTextFr: newPromoBannerFr.trim() || undefined,
      bannerTextAr: newPromoBannerAr.trim() || undefined,
    });

    if (res.success) {
      setNewPromoSuccess(true);
      setTimeout(() => {
        setNewPromoSuccess(false);
        setIsAddPromoOpen(false);
        setNewPromoName('');
        setNewPromoBannerFr('');
        setNewPromoBannerAr('');
      }, 1200);
    } else {
      setNewPromoError(res.error || 'Erreur lors de la création de la promotion');
    }
  };

  const handleDeletePromotion = (id: string, name: string) => {
    setGenericConfirmModal({
      isOpen: true,
      title: lang === 'ar' ? 'حذف العرض الترويجي' : 'Supprimer la promotion',
      description: lang === 'ar'
        ? `هل أنت متأكد من حذف العرض الترويجي "${name}"؟`
        : `Êtes-vous sûr de vouloir supprimer la promotion "${name}" ?`,
      confirmText: lang === 'ar' ? 'نعم، احذف العرض' : 'Oui, supprimer',
      cancelText: lang === 'ar' ? 'إلغاء' : 'Annuler',
      isDanger: true,
      onConfirm: async () => {
        await deletePromotion(id);
        setGenericConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast(
          lang === 'ar' ? 'تم تأكيد حذف العرض الترويجي بنجاح' : 'Promotion supprimée avec succès',
          'success',
          lang === 'ar' ? `تمت إزالة العرض "${name}" من النظام.` : `La promotion "${name}" a été définitivement retirée.`
        );
      },
    });
  };

  const handleTogglePromoStatus = async (promo: Promotion) => {
    await togglePromotion(promo.id, !promo.isActive);
  };

  // Delivery Fees Actions
  const handleFeeRowChange = (code: string, field: 'homeFee' | 'deskFee' | 'isActive', value: any) => {
    setFeeEditedRows((prev) => {
      const current = prev[code] || {
        homeFee: deliveryFees.find((f) => f.code === code)?.homeFee ?? 600,
        deskFee: deliveryFees.find((f) => f.code === code)?.deskFee ?? 350,
        isActive: deliveryFees.find((f) => f.code === code)?.isActive ?? true,
      };
      return {
        ...prev,
        [code]: {
          ...current,
          [field]: value,
          isSaved: false,
        },
      };
    });
  };

  const handleSaveFeeRow = async (code: string) => {
    const current = feeEditedRows[code];
    const original = deliveryFees.find((f) => f.code === code);
    const homeFee = current?.homeFee ?? original?.homeFee ?? 600;
    const deskFee = current?.deskFee ?? original?.deskFee ?? 350;
    const isActive = current?.isActive ?? original?.isActive ?? true;

    setFeeEditedRows((prev) => ({
      ...prev,
      [code]: { homeFee, deskFee, isActive, isSaving: true, isSaved: false },
    }));

    const res = await updateDeliveryFee(code, homeFee, deskFee, isActive);

    setFeeEditedRows((prev) => ({
      ...prev,
      [code]: {
        homeFee,
        deskFee,
        isActive,
        isSaving: false,
        isSaved: res.success,
      },
    }));

    if (res.success) {
      setTimeout(() => {
        setFeeEditedRows((prev) => {
          if (prev[code]?.isSaved) {
            return {
              ...prev,
              [code]: { ...prev[code], isSaved: false },
            };
          }
          return prev;
        });
      }, 2000);
    }
  };

  const handleBulkApplyFees = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkError(null);
    setBulkSuccess(null);

    const amount = Number(bulkAmount);
    if (isNaN(amount) || amount < 0) {
      setBulkError(lang === 'ar' ? 'يرجى إدخال مبلغ صحيح' : 'Veuillez saisir un montant valide');
      return;
    }

    setIsBulkSaving(true);
    const res = await bulkUpdateDeliveryFees(bulkTarget, amount, bulkMode);
    setIsBulkSaving(false);

    if (res.success) {
      setBulkSuccess(
        lang === 'ar'
          ? 'تم تحديث أسعار جميع الولايات الـ 68 بنجاح في قاعدة البيانات!'
          : 'Les tarifs des 68 Wilayas ont été mis à jour avec succès dans la base de données !'
      );
      setFeeEditedRows({});
      setTimeout(() => {
        setIsBulkFeeOpen(false);
        setBulkSuccess(null);
      }, 1500);
    } else {
      setBulkError(res.error || 'Erreur lors de la mise à jour groupée');
    }
  };

  // Filtered promotions
  const filteredPromotions = useMemo(() => {
    const q = promoSearchQuery.trim().toLowerCase();
    if (!q) return promotions;
    return promotions.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.targetId.toLowerCase().includes(q) ||
        (p.bannerTextFr && p.bannerTextFr.toLowerCase().includes(q)) ||
        (p.bannerTextAr && p.bannerTextAr.includes(q))
    );
  }, [promotions, promoSearchQuery]);

  // Filtered delivery fees
  const filteredDeliveryFees = useMemo(() => {
    const q = feeSearchQuery.trim().toLowerCase();
    return deliveryFees.filter((fee) => {
      const matchesZone = feeZoneFilter === 'all' || fee.zone === feeZoneFilter;
      if (!matchesZone) return false;
      if (!q) return true;
      return (
        fee.code.includes(q) ||
        fee.nameFr.toLowerCase().includes(q) ||
        fee.nameAr.includes(q)
      );
    });
  }, [deliveryFees, feeSearchQuery, feeZoneFilter]);

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
      case 'retour':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            🔄 {t('admin.status_retour')}
          </span>
        );
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-[calc(100vh-57px)] bg-[#0A0A0E] text-[#F5F5F7] flex flex-col lg:flex-row relative">
      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden animate-in fade-in cursor-pointer"
        />
      )}

      {/* ==================== ADMIN SIDEBAR ==================== */}
      <aside
        className={`fixed lg:sticky top-[57px] left-0 h-[calc(100vh-57px)] z-40 w-64 xl:w-72 bg-[#0E0E14] border-r border-white/10 p-4 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 shrink-0 ${
          isMobileSidebarOpen ? 'translate-x-0 shadow-2xl shadow-black' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Sidebar Top Header */}
          <div className="flex items-center justify-between px-2 pt-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#A1A1AA] uppercase">
              {lang === 'ar' ? 'التنقل في لوحة التحكم' : 'NAVIGATION ADMIN'}
            </span>
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1 text-[#A1A1AA] hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 6 Required Sidebar Navigation Sections */}
          <nav className="space-y-1.5">
            {/* 1. Overview */}
            <button
              type="button"
              onClick={() => {
                setAdminTab('overview');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer group ${
                adminTab === 'overview'
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#FFAA2C] text-black font-black shadow-lg shadow-[#FF6B00]/25'
                  : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className={`w-4 h-4 transition-transform group-hover:scale-110 ${adminTab === 'overview' ? 'text-black' : 'text-[#FFAA2C]'}`} />
                <span>{lang === 'ar' ? 'نظرة عامة' : "Vue d'ensemble"}</span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${adminTab === 'overview' ? 'bg-black/20 text-black font-extrabold' : 'bg-white/5 text-[#A1A1AA]'}`}>
                {lang === 'ar' ? 'مباشر' : 'En direct'}
              </span>
            </button>

            {/* 2. Products */}
            <button
              type="button"
              onClick={() => {
                setAdminTab('products');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer group ${
                adminTab === 'products' || adminTab === 'categories'
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#FFAA2C] text-black font-black shadow-lg shadow-[#FF6B00]/25'
                  : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className={`w-4 h-4 transition-transform group-hover:scale-110 ${adminTab === 'products' || adminTab === 'categories' ? 'text-black' : 'text-[#FFAA2C]'}`} />
                <span>{lang === 'ar' ? 'المنتجات' : 'Produits'}</span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${adminTab === 'products' || adminTab === 'categories' ? 'bg-black/20 text-black font-extrabold' : 'bg-white/5 text-[#A1A1AA]'}`}>
                {products.length}
              </span>
            </button>

            {/* 3. Orders */}
            <button
              type="button"
              onClick={() => {
                setAdminTab('orders');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer group ${
                adminTab === 'orders'
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#FFAA2C] text-black font-black shadow-lg shadow-[#FF6B00]/25'
                  : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className={`w-4 h-4 transition-transform group-hover:scale-110 ${adminTab === 'orders' ? 'text-black' : 'text-[#FFAA2C]'}`} />
                <span>{lang === 'ar' ? 'الطلبيات' : 'Commandes'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {metrics.pendingCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${adminTab === 'orders' ? 'bg-black/20 text-black font-extrabold' : 'bg-white/5 text-[#A1A1AA]'}`}>
                  {orders.length}
                </span>
              </div>
            </button>

            {/* Statistiques & Wilayas */}
            <button
              type="button"
              onClick={() => {
                setAdminTab('statics');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer group ${
                adminTab === 'statics'
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#FFAA2C] text-black font-black shadow-lg shadow-[#FF6B00]/25'
                  : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-3">
                <BarChart3 className={`w-4 h-4 transition-transform group-hover:scale-110 ${adminTab === 'statics' ? 'text-black' : 'text-[#FFAA2C]'}`} />
                <span>{lang === 'ar' ? 'الإحصائيات والتحليلات' : 'Statistiques'}</span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${adminTab === 'statics' ? 'bg-black/20 text-black font-extrabold' : 'bg-[#FF6B00]/10 text-[#FFAA2C]'}`}>
                68 Wilayas
              </span>
            </button>

            {/* 4. Delivery */}
            <button
              type="button"
              onClick={() => {
                setAdminTab('delivery_fees');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer group ${
                adminTab === 'delivery_fees'
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#FFAA2C] text-black font-black shadow-lg shadow-[#FF6B00]/25'
                  : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Truck className={`w-4 h-4 transition-transform group-hover:scale-110 ${adminTab === 'delivery_fees' ? 'text-black' : 'text-[#FFAA2C]'}`} />
                <span>{lang === 'ar' ? 'أسعار التوصيل' : 'Livraison'}</span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${adminTab === 'delivery_fees' ? 'bg-black/20 text-black font-extrabold' : 'bg-white/5 text-[#A1A1AA]'}`}>
                68
              </span>
            </button>

            {/* 5. Promotions */}
            <button
              type="button"
              onClick={() => {
                setAdminTab('promotions');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer group ${
                adminTab === 'promotions'
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#FFAA2C] text-black font-black shadow-lg shadow-[#FF6B00]/25'
                  : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Flame className={`w-4 h-4 transition-transform group-hover:scale-110 ${adminTab === 'promotions' ? 'text-black' : 'text-[#FFAA2C]'}`} />
                <span>{lang === 'ar' ? 'العروض والترويج' : 'Promotions'}</span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${adminTab === 'promotions' ? 'bg-black/20 text-black font-extrabold' : 'bg-white/5 text-[#A1A1AA]'}`}>
                {promotions.length}
              </span>
            </button>

            {/* 6. Users */}
            <button
              type="button"
              onClick={() => {
                setAdminTab('users');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer group ${
                adminTab === 'users' || adminTab === 'banned'
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#FFAA2C] text-black font-black shadow-lg shadow-[#FF6B00]/25'
                  : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className={`w-4 h-4 transition-transform group-hover:scale-110 ${adminTab === 'users' || adminTab === 'banned' ? 'text-black' : 'text-[#FFAA2C]'}`} />
                <span>{lang === 'ar' ? 'المستخدمون والأمان' : 'Utilisateurs'}</span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${adminTab === 'users' || adminTab === 'banned' ? 'bg-black/20 text-black font-extrabold' : 'bg-white/5 text-[#A1A1AA]'}`}>
                {bannedPhones.length > 0 ? (lang === 'ar' ? `${bannedPhones.length} محظور` : `${bannedPhones.length} bloqué${bannedPhones.length > 1 ? 's' : ''}`) : (lang === 'ar' ? 'الأمان' : 'Sécurité')}
              </span>
            </button>
          </nav>
        </div>

        {/* Dynamic Admin Profile Section at Sidebar bottom (Mobile & Desktop) */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          {/* Clickable Profile Card */}
          <div
            onClick={() => {
              setIsProfileModalOpen(true);
              setIsMobileSidebarOpen(false);
            }}
            className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B00] via-[#FFAA2C] to-[#E05E00] text-black font-black text-xs font-mono flex items-center justify-center shrink-0 shadow-md shadow-[#FF6B00]/30 group-hover:scale-105 transition-transform">
                  {getInitials(user?.name, user?.email)}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#25D366] ring-2 ring-[#0E0E14]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#F5F5F7] group-hover:text-white transition-colors truncate">
                  {user?.name?.trim() || (lang === 'ar' ? 'مسؤول النظام' : 'Directeur Admin DZ')}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-[#FFAA2C] font-mono font-semibold">
                    {lang === 'ar' ? 'مسؤول النظام' : 'Administrateur'}
                  </span>
                </div>
                {user?.email && (
                  <p className="text-[10px] text-[#A1A1AA] truncate font-mono mt-0.5">
                    {user.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions: Mon Profil & Déconnexion */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsProfileModalOpen(true);
                setIsMobileSidebarOpen(false);
              }}
              className="px-2 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-[#F5F5F7] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title={lang === 'ar' ? 'الملف الشخصي' : 'Mon Profil'}
            >
              <User className="w-3.5 h-3.5 text-[#FFAA2C]" />
              <span>{lang === 'ar' ? 'الملف الشخصي' : 'Mon Profil'}</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="px-2 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-[11px] font-semibold text-red-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title={lang === 'ar' ? 'تسجيل الخروج' : 'Déconnexion'}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'خروج' : 'Quitter'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto">
        {/* ==================== OVERVIEW SECTION ==================== */}
        {adminTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Overview Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                  <span className="text-xs font-mono font-bold text-[#FFAA2C] uppercase tracking-wider">
                    {t('admin.live_badge')}
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    {isSupabaseConnected ? (lang === 'ar' ? 'متصل بالسحابة' : 'Base de données Connectée') : 'Local'}
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="text-[11px] font-mono text-[#FFAA2C] bg-orange-500/10 border border-[#FF6B00]/30 px-2.5 py-0.5 rounded-full">
                    {lang === 'ar' ? 'جلسة نشطة 7 أسابيع' : 'Session 7 semaines active'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  {lang === 'ar' ? 'لوحة التحكم - نظرة عامة' : "Tableau de Bord - Vue d'ensemble"}
                </h1>
                <p className="text-xs text-[#A1A1AA] mt-0.5">
                  {lang === 'ar' ? 'متابعة شاملة لجميع مؤشرات الأداء والطلبيات والمنتجات' : 'Suivi global des commandes, des revenus en direct et de l\'inventaire'}
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={async () => {
                    setIsRefreshing(true);
                    await Promise.all([refreshOrders(), refreshProducts()]);
                    setTimeout(() => setIsRefreshing(false), 500);
                  }}
                  className="p-2.5 rounded-xl bg-[#18181F] hover:bg-white/10 text-[#A1A1AA] hover:text-white border border-white/10 transition-colors cursor-pointer"
                  title={lang === 'ar' ? 'تحديث البيانات' : 'Rafraîchir les données'}
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#FF6B00]' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(true)}
                  className="px-4 py-2.5 bg-[#FF6B00] hover:bg-[#E05E00] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-[#FF6B00]/30 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{t('admin.add_product')}</span>
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

              {/* Metric 4: Total Products in DB */}
              <div className="bg-[#18181F] border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-[#A1A1AA] uppercase">{lang === 'ar' ? 'المنتجات في المتجر' : 'Catalogue Produits'}</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-mono font-black text-emerald-400">
                  {products.length}
                </p>
                <p className="text-[11px] text-emerald-400/80 mt-2">
                  {lang === 'ar' ? 'منتجات متزامنة ومحدثة' : 'Synchronisés en direct'}
                </p>
              </div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setAdminTab('delivery_fees')}
                className="p-5 rounded-2xl bg-[#14141B] border border-white/10 hover:border-emerald-500/40 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#F5F5F7] group-hover:text-emerald-400 transition-colors">
                      {lang === 'ar' ? 'أسعار التوصيل' : 'Tarifs de Livraison'}
                    </h4>
                    <span className="text-[10px] font-mono text-[#A1A1AA]">68 Wilayas Actives</span>
                  </div>
                </div>
                <p className="text-xs text-[#A1A1AA]">
                  {lang === 'ar' ? 'تعديل أسعار التوصيل للمنزل أو المكتب لكل ولاية في الجزائر' : 'Gérez les frais à domicile et stop desk pour chaque wilaya'}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAdminTab('promotions')}
                className="p-5 rounded-2xl bg-[#14141B] border border-white/10 hover:border-[#FF6B00]/40 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/15 text-[#FF6B00] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#F5F5F7] group-hover:text-[#FFAA2C] transition-colors">
                      {lang === 'ar' ? 'العروض الترويجية' : 'Promotions & Réductions'}
                    </h4>
                    <span className="text-[10px] font-mono text-[#A1A1AA]">{promotions.length} {lang === 'ar' ? 'عروض نشطة' : 'offres actives'}</span>
                  </div>
                </div>
                <p className="text-xs text-[#A1A1AA]">
                  {lang === 'ar' ? 'تطبيق خصومات مؤقتة على تصنيفات أو منتجات معينة مع لافتة إعلانية' : 'Créez des remises par catégorie ou produit avec minuterie'}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAdminTab('users')}
                className="p-5 rounded-2xl bg-[#14141B] border border-white/10 hover:border-red-500/40 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#F5F5F7] group-hover:text-red-400 transition-colors">
                      {lang === 'ar' ? 'المستخدمون والحظر' : 'Gestion Utilisateurs'}
                    </h4>
                    <span className="text-[10px] font-mono text-[#A1A1AA]">{bannedPhones.length} {lang === 'ar' ? 'أرقام محظورة' : 'numéros blacklistés'}</span>
                  </div>
                </div>
                <p className="text-xs text-[#A1A1AA]">
                  {lang === 'ar' ? 'بيانات الحساب وتفاصيل الجلسة وإدارة قائمة الأرقام الممنوعة' : 'Profil admin, sécurité de session et liste noire anti-fraude'}
                </p>
              </button>
            </div>

            {/* Recent Orders Snapshot Table */}
            <div className="bg-[#18181F] border border-white/10 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#FFAA2C]" />
                  <h3 className="text-sm font-bold text-[#F5F5F7]">
                    {lang === 'ar' ? 'أحدث الطلبيات المسجلة' : 'Dernières commandes enregistrées'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setAdminTab('orders')}
                  className="text-xs font-bold text-[#FFAA2C] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{lang === 'ar' ? 'عرض الكل' : 'Voir tout'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-10 text-[#A1A1AA] text-xs">
                  {lang === 'ar' ? 'لا توجد طلبيات مسجلة حتى الآن' : 'Aucune commande enregistrée pour le moment'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-[11px] font-mono text-[#A1A1AA] uppercase">
                        <th className="pb-3 font-semibold">{lang === 'ar' ? 'الرمز' : 'Code'}</th>
                        <th className="pb-3 font-semibold">{lang === 'ar' ? 'العميل' : 'Client'}</th>
                        <th className="pb-3 font-semibold">{lang === 'ar' ? 'الولاية' : 'Wilaya'}</th>
                        <th className="pb-3 font-semibold">{lang === 'ar' ? 'المبلغ' : 'Montant'}</th>
                        <th className="pb-3 font-semibold">{lang === 'ar' ? 'الحالة' : 'Statut'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {orders.slice(0, 6).map((ord) => (
                        <tr key={ord.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 font-mono font-bold text-[#FFAA2C]">{ord.trackingCode}</td>
                          <td className="py-3 text-[#F5F5F7]">
                            <p className="font-semibold">{ord.fullName}</p>
                            <p className="text-[10px] text-[#A1A1AA] font-mono">{ord.phone}</p>
                          </td>
                          <td className="py-3 text-[#A1A1AA]">{ord.wilayaCode} - {ord.commune}</td>
                          <td className="py-3 font-mono font-bold text-[#F5F5F7]">{formatDZD(ord.total, lang)}</td>
                          <td className="py-3">{getStatusBadge(ord.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {adminTab === 'orders' && (
          <>
            {/* Filter & Search Bar for Orders */}
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

              <div className="grid grid-cols-2 gap-2.5 w-full md:w-auto md:flex md:items-center">
                {/* Status Filter */}
                <div className="relative flex-1">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full appearance-none bg-[#14141B] border border-white/10 rounded-xl px-3 py-2.5 ltr:pr-8 rtl:pl-8 text-base sm:text-xs text-[#F5F5F7] outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-[#18181F] text-[#F5F5F7]">{t('admin.all_statuses')}</option>
                    <option value="pending" className="bg-[#18181F] text-[#F5F5F7]">{t('admin.status_pending')}</option>
                    <option value="confirmed" className="bg-[#18181F] text-[#F5F5F7]">{t('admin.status_confirmed')}</option>
                    <option value="in_delivery" className="bg-[#18181F] text-[#F5F5F7]">{t('admin.status_in_delivery')}</option>
                    <option value="delivered" className="bg-[#18181F] text-[#F5F5F7]">{t('admin.status_delivered')}</option>
                    <option value="cancelled" className="bg-[#18181F] text-[#F5F5F7]">{t('admin.status_cancelled')}</option>
                    <option value="retour" className="bg-[#18181F] text-[#F5F5F7]">{t('admin.status_retour')}</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 ltr:right-2.5 rtl:left-2.5 flex items-center text-[#A1A1AA]">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Wilaya Filter */}
                <div className="relative flex-1">
                  <select
                    value={wilayaFilter}
                    onChange={(e) => setWilayaFilter(e.target.value)}
                    className="w-full appearance-none bg-[#14141B] border border-white/10 rounded-xl px-3 py-2.5 ltr:pr-8 rtl:pl-8 text-base sm:text-xs text-[#F5F5F7] outline-none cursor-pointer md:max-w-[180px]"
                  >
                    <option value="all" className="bg-[#18181F] text-[#F5F5F7]">{t('admin.all_wilayas')}</option>
                    {WILAYAS.map((w) => (
                      <option key={w.code} value={w.code} className="bg-[#18181F] text-[#F5F5F7]">
                        {w.code} - {lang === 'ar' ? w.nameAr : w.nameFr}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 ltr:right-2.5 rtl:left-2.5 flex items-center text-[#A1A1AA]">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
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
                          <td className="p-4 font-mono font-bold text-[#FF6B00]">
                            {order.trackingCode}
                          </td>
                          <td className="p-4 font-semibold text-[#F5F5F7]">
                            <div>{order.fullName}</div>
                            {order.notes && (
                              <div className="text-[10px] text-[#FFAA2C] mt-0.5 max-w-[180px] truncate font-normal" title={order.notes}>
                                📝 {order.notes}
                              </div>
                            )}
                          </td>
                          <td className="p-4 font-mono text-[#A1A1AA]">
                            <a
                              href={`tel:${order.phone}`}
                              className="hover:text-[#FFAA2C] flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3 text-[#FFAA2C]" />
                              <span>{order.phone}</span>
                            </a>
                            {isPhoneBanned(order.phone) && (
                              <div className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-bold">
                                <Ban className="w-2.5 h-2.5" />
                                <span>{lang === 'ar' ? 'محظور' : 'Banni'}</span>
                              </div>
                            )}
                          </td>
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
                          <td className="p-4">
                            <span className="font-mono text-[#F5F5F7]">
                              {order.items.reduce((s, i) => s + i.quantity, 0)} {lang === 'ar' ? 'منتج' : 'article(s)'}
                            </span>
                            <div className="text-[11px] text-[#A1A1AA] truncate max-w-[150px]">
                              {lang === 'ar' ? (order.items[0]?.productNameAr || order.items[0]?.productNameFr) : order.items[0]?.productNameFr}
                            </div>
                          </td>
                          <td className="p-4 font-mono font-black text-[#FF6B00] whitespace-nowrap">
                            {formatDZD(order.total, lang)}
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="relative inline-block">
                                <select
                                  value={order.status}
                                  onChange={(e) =>
                                    updateOrderStatus(order.id, e.target.value as OrderStatus)
                                  }
                                  className="appearance-none bg-[#14141B] border border-white/15 rounded-lg px-2.5 py-1.5 ltr:pr-7 rtl:pl-7 text-xs font-mono text-white outline-none focus:border-[#FF6B00] cursor-pointer"
                                >
                                  <option value="pending" className="bg-[#18181F] text-[#F5F5F7]">{t('admin.status_pending')}</option>
                                  <option value="confirmed" className="bg-[#18181F] text-[#F5F5F7]">{t('admin.status_confirmed')}</option>
                                  <option value="in_delivery" className="bg-[#18181F] text-[#F5F5F7]">{t('admin.status_in_delivery')}</option>
                                  <option value="delivered" className="bg-[#18181F] text-[#F5F5F7]">{t('admin.status_delivered')}</option>
                                  <option value="cancelled" className="bg-[#18181F] text-[#F5F5F7]">{t('admin.status_cancelled')}</option>
                                  <option value="retour" className="bg-[#18181F] text-[#F5F5F7]">{t('admin.status_retour')}</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 ltr:right-2 rtl:left-2 flex items-center text-[#A1A1AA]">
                                  <ChevronDown className="w-3 h-3" />
                                </div>
                              </div>

                              {/* 1-Click Ban/Unban Button */}
                              {isPhoneBanned(order.phone) ? (
                                <button
                                  type="button"
                                  onClick={() => handleUnbanPhone(order.phone)}
                                  title={lang === 'ar' ? 'رفع الحظر عن هذا الرقم' : 'Débloquer ce numéro'}
                                  className="p-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                  <span className="text-[10px] font-bold hidden xl:inline">
                                    {lang === 'ar' ? 'فك الحظر' : 'Débloquer'}
                                  </span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleQuickBanOrder(order)}
                                  title={lang === 'ar' ? 'حظر هذا الرقم ومنعه من الطلب' : 'Bannir ce numéro de téléphone'}
                                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/50 transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                  <span className="text-[10px] font-bold hidden xl:inline">
                                    {lang === 'ar' ? 'حظر' : 'Bannir'}
                                  </span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {adminTab === 'products' && (
          /* Products Catalog Management Table */
          <div className="bg-[#18181F] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F5F7]">
                  {lang === 'ar' ? 'كتالوج المنتجات الحية' : 'Catalogue Produits en Direct'} ({products.length})
                </h3>
                <p className="text-xs text-[#A1A1AA] mt-0.5">
                  {lang === 'ar' ? 'متزامن لحظياً مع قاعدة البيانات' : 'Synchronisé en direct avec la base de données'}
                </p>
              </div>

              <button
                onClick={() => setIsAddProductOpen(true)}
                className="px-3.5 py-2 bg-[#FF6B00] hover:bg-[#E05E00] text-black font-extrabold text-xs uppercase rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>{t('admin.add_product')}</span>
              </button>
            </div>

            {/* Multiselect Bulk Action Bar */}
            {selectedProductIds.length > 0 && (
              <div className="p-3.5 bg-gradient-to-r from-[#FF6B00]/15 via-[#FFAA2C]/10 to-transparent border-b border-[#FF6B00]/30 flex items-center justify-between flex-wrap gap-3 animate-in fade-in duration-150">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-[#FF6B00] text-black font-black text-xs flex items-center justify-center">
                    {selectedProductIds.length}
                  </span>
                  <span className="text-xs font-bold text-[#F5F5F7]">
                    {lang === 'ar'
                      ? `تم تحديد ${selectedProductIds.length} منتج`
                      : `${selectedProductIds.length} produit${selectedProductIds.length > 1 ? 's' : ''} sélectionné${selectedProductIds.length > 1 ? 's' : ''}`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProductIds([])}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                  >
                    {lang === 'ar' ? 'إلغاء التحديد' : 'Désélectionner tout'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const targets = products.filter((p) => selectedProductIds.includes(p.id));
                      openDeleteConfirmation(targets);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-red-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'حذف المنتجات المحددة' : 'Supprimer la sélection'}</span>
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-[#14141B] text-[#A1A1AA] font-mono text-[11px] uppercase">
                    <th className="p-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={products.length > 0 && selectedProductIds.length === products.length}
                        onChange={toggleSelectAllProducts}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#FF6B00] focus:ring-[#FF6B00] cursor-pointer accent-[#FF6B00]"
                        title={lang === 'ar' ? 'تحديد الكل' : 'Tout sélectionner'}
                      />
                    </th>
                    <th className="p-4">{lang === 'ar' ? 'المنتج' : 'Produit'}</th>
                    <th className="p-4">{lang === 'ar' ? 'القسم' : 'Catégorie'}</th>
                    <th className="p-4">{lang === 'ar' ? 'السعر' : 'Prix'}</th>
                    <th className="p-4">{lang === 'ar' ? 'المخزون' : 'Stock'}</th>
                    <th className="p-4">{lang === 'ar' ? 'الحالة' : 'Statut'}</th>
                    <th className="p-4 text-right">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map((product) => {
                    const isSelected = selectedProductIds.includes(product.id);
                    return (
                      <tr
                        key={product.id}
                        className={`hover:bg-white/[0.02] transition-colors ${
                          isSelected ? 'bg-[#FF6B00]/[0.06]' : ''
                        }`}
                      >
                        <td className="p-4 w-12 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectProduct(product.id)}
                            className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#FF6B00] focus:ring-[#FF6B00] cursor-pointer accent-[#FF6B00]"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.images[0]}
                              alt={product.nameFr}
                              className="w-12 h-12 rounded-xl object-cover bg-black/40 border border-white/10 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-[#F5F5F7] truncate max-w-xs sm:max-w-md">
                                {lang === 'ar' ? product.nameAr : product.nameFr}
                              </p>
                              <p className="text-[11px] text-[#A1A1AA] font-mono truncate max-w-xs">
                                /{product.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-white/5 border border-white/10 text-[#FFAA2C]">
                            {product.category}
                          </span>
                        </td>

                        <td className="p-4 font-mono font-black text-[#FF6B00]">
                          {formatDZD(product.price, lang)}
                        </td>

                        <td className="p-4">
                          <span className="font-mono text-emerald-400 font-bold">
                            {product.stockCount} {lang === 'ar' ? 'قطعة' : 'pcs'}
                          </span>
                        </td>

                        <td className="p-4">
                          {product.isFlashDeal ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/40">
                              FLASH DEAL
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-[#A1A1AA]">
                              STANDARD
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/products/${product.slug}`}
                              target="_blank"
                              className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/15 text-[#64748B] dark:text-[#A1A1AA] hover:text-[#0F172A] dark:hover:text-white transition-colors"
                              title={lang === 'ar' ? 'عرض في المتجر' : 'Voir dans le magasin'}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleOpenEditProduct(product)}
                              className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
                              title={lang === 'ar' ? 'تعديل المنتج' : 'Modifier le produit'}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => openDeleteConfirmation([product])}
                              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 transition-colors cursor-pointer"
                              title={lang === 'ar' ? 'حذف المنتج' : 'Supprimer le produit'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Categories Tab View */}
        {adminTab === 'categories' && (
          <div className="space-y-4">
            <div className="bg-[#18181F] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-[#F5F5F7] flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-400" />
                  <span>{lang === 'ar' ? 'إدارة أقسام المتجر (Categories)' : 'Gestion des Catégories de Produits'}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono font-bold">
                    {categories.length}
                  </span>
                </h3>
                <p className="text-xs text-[#A1A1AA] mt-1">
                  {lang === 'ar'
                    ? 'الأقسام المعتمدة لتنظيم وتصنيف المنتجات في المتجر'
                    : 'Synchronisées en direct pour organiser le catalogue'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddCategoryOpen(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer shrink-0"
              >
                <FolderPlus className="w-4 h-4" />
                <span>{lang === 'ar' ? 'إضافة قسم جديد' : 'Nouvelle Catégorie'}</span>
              </button>
            </div>

            {/* Categories Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => {
                const prodCount = products.filter((p) => p.category === cat.slug).length;
                return (
                  <div
                    key={cat.id || cat.slug}
                    className="bg-[#18181F] border border-white/10 rounded-2xl p-5 hover:border-blue-500/40 transition-all flex flex-col justify-between group shadow-lg"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-[11px] font-bold">
                          /{cat.slug}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-[#A1A1AA]">
                          <Layers className="w-3.5 h-3.5 text-[#FFAA2C]" />
                          <span className="font-mono font-bold text-white">{prodCount}</span>
                          <span>{lang === 'ar' ? 'منتج' : 'prod.'}</span>
                        </div>
                      </div>

                      <h4 className="text-base font-bold text-[#F5F5F7] mb-0.5">
                        {cat.nameFr}
                      </h4>
                      <p className="text-sm font-bold text-[#FFAA2C] mb-2" dir="rtl">
                        {cat.nameAr}
                      </p>

                      {cat.descriptionFr && (
                        <p className="text-xs text-[#A1A1AA] line-clamp-2 mb-3">
                          {cat.descriptionFr}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between mt-3">
                      <span className="text-[10px] text-[#A1A1AA] font-mono">
                        {cat.createdAt ? new Date(cat.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-FR') : 'Par défaut'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id, cat.nameFr)}
                        className="p-1.5 px-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                        title={lang === 'ar' ? 'حذف هذا القسم' : 'Supprimer cette catégorie'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'حذف' : 'Supprimer'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== USERS & SECURITY SECTION ==================== */}
        {(adminTab === 'users' || adminTab === 'banned') && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Admin Profile & Account Information Card */}
            <div className="bg-[#18181F] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF6B00]/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#FF6B00] via-[#FFAA2C] to-[#E05E00] text-black font-black text-xl sm:text-2xl font-mono flex items-center justify-center shadow-xl shadow-[#FF6B00]/30 shrink-0">
                    {getInitials(user?.name, user?.email)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-black text-[#F5F5F7]">
                        {user?.name?.trim() || user?.email?.split('@')[0] || (lang === 'ar' ? 'مسؤول النظام' : 'Administrateur')}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FF6B00]/20 text-[#FFAA2C] border border-[#FF6B00]/40 text-[11px] font-mono font-bold uppercase tracking-wider">
                        {lang === 'ar' ? 'مسؤول النظام' : 'Administrator'}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                    </div>
                    <p className="text-xs text-[#A1A1AA] font-mono mt-1">
                      {user?.email || 'admin@bikastore.dz'}
                    </p>
                    <p className="text-[11px] text-[#A1A1AA] mt-1 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{lang === 'ar' ? 'جلسة تسجيل دخول نشطة لمدة 7 أسابيع (49 يوماً)' : 'Session authentifiée valide pendant 7 semaines (49 jours)'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-4 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'تسجيل الخروج من الحساب' : 'Déconnexion du compte'}</span>
                  </button>
                </div>
              </div>

              {/* Account Security & Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] font-mono text-[#A1A1AA] uppercase block mb-1">
                    {lang === 'ar' ? 'حالة الحساب' : 'Statut du Compte'}
                  </span>
                  <span className="font-bold text-[#25D366] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#25D366]" />
                    {lang === 'ar' ? 'نشط ومصرح بالكامل' : 'Actif & Autorisé (Admin)'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] font-mono text-[#A1A1AA] uppercase block mb-1">
                    {lang === 'ar' ? 'نظام الحماية' : 'Sécurité & Chiffrement'}
                  </span>
                  <span className="font-bold text-[#F5F5F7] flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#FFAA2C]" />
                    {lang === 'ar' ? 'كلمات مرور مشفرة PBKDF2' : 'Mots de passe hachés'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] font-mono text-[#A1A1AA] uppercase block mb-1">
                    {lang === 'ar' ? 'قاعدة البيانات' : 'Base de données'}
                  </span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" />
                    {isSupabaseConnected ? 'PostgreSQL Supabase RLS' : 'Stockage Local'}
                  </span>
                </div>
              </div>
            </div>

            {/* Banned Phones Blacklist Management */}
            <div className="bg-[#18181F] border border-red-500/20 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-base font-black text-[#F5F5F7] uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                    <span>{lang === 'ar' ? 'حظر رقم هاتف ومنعه من الطلب' : 'Bloquer un Numéro de Téléphone'}</span>
                  </h3>
                  <p className="text-xs text-[#A1A1AA] mt-1">
                    {lang === 'ar'
                      ? 'أي رقم مسجل في هذه القائمة سيتم منعه فوراً في صفحة الدفع (Checkout) من إتمام أي طلبية.'
                      : 'Tout numéro ajouté ici sera instantanément rejeté lors de la validation du formulaire de commande.'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-mono font-bold">
                    {bannedPhones.length} {lang === 'ar' ? 'رقم محظور' : 'numéros bloqués'}
                  </span>
                </div>
              </div>

              {banSuccess && (
                <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{banSuccess}</span>
                </div>
              )}

              {banError && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{banError}</span>
                </div>
              )}

              <form onSubmit={handleManualBanPhone} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end text-xs">
                <div>
                  <label className="block text-[#A1A1AA] mb-1 font-semibold flex items-center justify-between">
                    <span>{lang === 'ar' ? 'رقم الهاتف المراد حظره *' : 'Numéro à bloquer *'}</span>
                    <span className="text-[10px] font-mono text-[#A1A1AA]">
                      {banPhoneInput.length}/10 {lang === 'ar' ? 'أرقام' : 'chiffres'}
                    </span>
                  </label>
                  <div className="relative">
                    <PhoneOff className="w-4 h-4 text-red-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="tel"
                      required
                      maxLength={10}
                      value={banPhoneInput}
                      onChange={(e) => {
                        // Strictly numbers only: strip letters, spaces, special chars, max 10 digits
                        const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setBanPhoneInput(cleaned);
                        if (banError) setBanError(null);
                      }}
                      placeholder="0677898762"
                      className="w-full bg-[#14141B] border border-white/15 focus:border-red-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white font-mono outline-none tracking-wider"
                    />
                  </div>
                  <p className="text-[10px] text-[#A1A1AA] mt-1 font-mono">
                    {lang === 'ar' ? '10 أرقام تبدأ بـ 05 أو 06 أو 07 (مثال: 0677898762)' : '10 chiffres : 05, 06 ou 07 (Ex: 0677898762)'}
                  </p>
                </div>

                <div>
                  <label className="block text-[#A1A1AA] mb-1 font-semibold">
                    {lang === 'ar' ? 'سبب الحظر *' : 'Motif du blocage *'}
                  </label>
                  <select
                    value={banReasonInput}
                    onChange={(e) => setBanReasonInput(e.target.value)}
                    className="w-full bg-[#14141B] border border-white/15 focus:border-red-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="Refus de colis à la livraison (Retour répété)">Refus de colis à la livraison (Retour répété)</option>
                    <option value="Numéro injoignable après commande (Faux client)">Numéro injoignable après commande (Faux client)</option>
                    <option value="Commandes multiples non confirmées (Spam)">Commandes multiples non confirmées (Spam)</option>
                    <option value="Fraude ou tentative de tromperie">Fraude ou tentative de tromperie</option>
                    <option value="Autre motif">Autre motif</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#A1A1AA] mb-1 font-semibold">
                    {lang === 'ar' ? 'ملاحظات إضافية (اختياري)' : 'Notes internes (optionnel)'}
                  </label>
                  <input
                    type="text"
                    value={banNotesInput}
                    onChange={(e) => setBanNotesInput(e.target.value)}
                    placeholder="Ex: Client d'Alger, 2 retours successifs"
                    className="w-full bg-[#14141B] border border-white/15 focus:border-red-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Ban className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'حظر هذا الرقم الآن' : 'Bloquer le Numéro'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Banned Phones List & Search Table */}
            <div className="bg-[#18181F] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F5F7]">
                    {lang === 'ar' ? 'قائمة الأرقام المحظورة' : 'Liste Noire des Numéros Bloqués'} ({filteredBannedPhones.length})
                  </h3>
                  <p className="text-xs text-[#A1A1AA] mt-0.5">
                    {lang === 'ar'
                      ? 'يمكنك فك الحظر عن أي رقم في أي وقت بضغطة واحدة'
                      : 'Vous pouvez débloquer un numéro à tout moment en un clic'}
                  </p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-3" />
                  <input
                    type="text"
                    value={banSearchQuery}
                    onChange={(e) => setBanSearchQuery(e.target.value)}
                    placeholder={lang === 'ar' ? 'بحث عن رقم أو سبب...' : 'Rechercher un numéro, motif...'}
                    className="w-full bg-[#14141B] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#A1A1AA]/60 outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#14141B] text-[#A1A1AA] font-mono text-[11px] uppercase">
                      <th className="p-4">{lang === 'ar' ? 'رقم الهاتف' : 'Téléphone'}</th>
                      <th className="p-4">{lang === 'ar' ? 'سبب الحظر' : 'Motif'}</th>
                      <th className="p-4">{lang === 'ar' ? 'ملاحظات' : 'Notes'}</th>
                      <th className="p-4">{lang === 'ar' ? 'تاريخ الحظر' : 'Date d’ajout'}</th>
                      <th className="p-4 text-right">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredBannedPhones.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-[#A1A1AA]">
                          <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                          <p className="font-semibold">
                            {lang === 'ar' ? 'لا توجد أرقام محظورة مطابقة' : 'Aucun numéro bloqué'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredBannedPhones.map((item) => (
                        <tr key={item.phone} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 font-mono font-bold text-red-400 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <PhoneOff className="w-3.5 h-3.5 text-red-500 shrink-0" />
                              <span>{item.phone}</span>
                            </div>
                          </td>
                          <td className="p-4 text-white font-medium">
                            <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-300 text-[11px]">
                              {item.reason}
                            </span>
                          </td>
                          <td className="p-4 text-[#A1A1AA] max-w-xs truncate">
                            {item.notes || '—'}
                          </td>
                          <td className="p-4 font-mono text-[#A1A1AA] whitespace-nowrap">
                            {new Date(item.createdAt).toLocaleString(lang === 'ar' ? 'ar-DZ' : 'fr-FR', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </td>
                          <td className="p-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleUnbanPhone(item.phone)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer text-xs font-bold inline-flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{lang === 'ar' ? 'رفع الحظر' : 'Débloquer'}</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PROMOTIONS & DISCOUNTS ENGINE */}
        {adminTab === 'promotions' && (
          <div className="space-y-6">
            {/* Promotions Header & Quick Action */}
            <div className="bg-[#18181F] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-orange-500/10 text-[#FF6B00] border border-[#FF6B00]/20">
                    <Flame className="w-5 h-5" />
                  </span>
                  <h2 className="text-lg font-black text-[#F5F5F7]">
                    {lang === 'ar' ? 'إدارة العروض الترويجية والتخفيضات' : 'Gestion des Promotions & Réductions'}
                  </h2>
                </div>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  {lang === 'ar'
                    ? 'أنشئ تخفيضات مباشرة على قسم كامل (مثل كل السماعات) أو منتج معين مع تحديد مدة العرض والعد التنازلي التلقائي.'
                    : 'Appliquez des remises sur une catégorie complète ou un produit spécifique avec durée automatique et compte à rebours en temps réel.'}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setIsAddPromoOpen(true)}
                  className="w-full md:w-auto px-5 py-3 bg-gradient-to-r from-[#FF6B00] via-[#FFAA2C] to-[#FF6B00] hover:scale-[1.02] active:scale-[0.98] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#FF6B00]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{lang === 'ar' ? 'إنشاء عرض جديد' : 'Nouvelle Promotion'}</span>
                </button>
              </div>
            </div>

            {/* Promotions Search Bar */}
            <div className="bg-[#18181F] border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={promoSearchQuery}
                  onChange={(e) => setPromoSearchQuery(e.target.value)}
                  placeholder={lang === 'ar' ? 'بحث عن عرض بالاسم أو القسم أو المنتج...' : 'Rechercher une promotion par nom, cible...'}
                  className="w-full bg-[#14141B] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F5F5F7] placeholder-[#A1A1AA]/60 outline-none focus:border-[#FF6B00]"
                />
              </div>
              <span className="text-xs font-mono font-bold text-[#FFAA2C] whitespace-nowrap">
                {filteredPromotions.length} {lang === 'ar' ? 'عروض' : 'promotions'}
              </span>
            </div>

            {/* Promotions Cards Grid */}
            {filteredPromotions.length === 0 ? (
              <div className="bg-[#18181F] border border-white/10 rounded-3xl p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-[#FFAA2C] flex items-center justify-center mx-auto">
                  <Percent className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {lang === 'ar' ? 'لا توجد عروض ترويجية نشطة' : 'Aucune promotion active'}
                  </h3>
                  <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto mt-1">
                    {lang === 'ar'
                      ? 'قم بإنشاء أول عرض ترويجي لجذب الزبائن وتخفيض الأسعار تلقائياً.'
                      : 'Créez votre première promotion pour booster vos ventes et appliquer des remises immédiates.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddPromoOpen(true)}
                  className="px-5 py-2.5 bg-[#FF6B00] text-black font-extrabold text-xs rounded-xl shadow-md cursor-pointer inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'إنشاء عرض الآن' : 'Créer une promotion'}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPromotions.map((promo) => {
                  const now = Date.now();
                  const startTime = new Date(promo.startAt).getTime();
                  const endTime = new Date(promo.endAt).getTime();
                  const isExpired = now > endTime;
                  const isUpcoming = now < startTime;
                  const isLive = promo.isActive && !isExpired && !isUpcoming;

                  let targetLabel = '';
                  if (promo.targetType === 'category') {
                    const cat = categories.find((c) => c.slug === promo.targetId);
                    targetLabel = cat ? (lang === 'ar' ? `قسم: ${cat.nameAr}` : `Catégorie: ${cat.nameFr}`) : `Catégorie: ${promo.targetId}`;
                  } else {
                    const prod = products.find((p) => p.id === promo.targetId || p.slug === promo.targetId);
                    targetLabel = prod ? (lang === 'ar' ? `منتج: ${prod.nameAr}` : `Produit: ${prod.nameFr}`) : `Produit: ${promo.targetId}`;
                  }

                  const remainingDiff = endTime - now;
                  const remainingDays = Math.max(0, Math.floor(remainingDiff / (1000 * 3600 * 24)));
                  const remainingHours = Math.max(0, Math.floor((remainingDiff % (1000 * 3600 * 24)) / (1000 * 3600)));

                  return (
                    <div
                      key={promo.id}
                      className={`bg-[#18181F] border rounded-3xl p-5 relative overflow-hidden transition-all flex flex-col justify-between ${
                        isLive
                          ? 'border-orange-500/40 shadow-xl shadow-orange-950/20'
                          : 'border-white/10 opacity-75'
                      }`}
                    >
                      <div>
                        {/* Top Target Badge & Status */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-[#FFAA2C]">
                            {promo.targetType === 'category' ? <Layers className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                            <span className="truncate max-w-[140px]">{targetLabel}</span>
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                              isLive
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 animate-pulse'
                                : isExpired
                                ? 'bg-red-500/15 border-red-500/30 text-red-400'
                                : 'bg-gray-500/15 border-gray-500/30 text-gray-400'
                            }`}
                          >
                            {isLive
                              ? (lang === 'ar' ? 'نشط الآن' : 'En cours')
                              : isExpired
                              ? (lang === 'ar' ? 'منتهي' : 'Expirée')
                              : isUpcoming
                              ? (lang === 'ar' ? 'مجدول قريباً' : 'À venir')
                              : (lang === 'ar' ? 'معطل' : 'Désactivée')}
                          </span>
                        </div>

                        {/* Title & Discount Highlight */}
                        <h3 className="text-base font-bold text-[#F5F5F7] line-clamp-1 mb-2">
                          {promo.name}
                        </h3>

                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-2xl font-mono font-black text-[#FF6B00]">
                            {promo.discountType === 'percentage'
                              ? `-${promo.discountValue}%`
                              : `-${formatDZD(promo.discountValue, lang)}`}
                          </span>
                          <span className="text-xs text-[#A1A1AA] font-mono">
                            {promo.discountType === 'percentage'
                              ? (lang === 'ar' ? 'تخفيض نسبي' : 'Remise en %')
                              : (lang === 'ar' ? 'تخفيض نقدي ثابت' : 'Montant fixe déduit')}
                          </span>
                        </div>

                        {/* Dates & Duration Countdown */}
                        <div className="bg-[#14141B] rounded-2xl p-3 border border-white/5 space-y-1.5 text-xs font-mono">
                          <div className="flex items-center justify-between text-[#A1A1AA]">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#FFAA2C]" />
                              <span>{lang === 'ar' ? 'تاريخ النهاية:' : 'Fin le :'}</span>
                            </span>
                            <span className="text-[#F5F5F7]">
                              {new Date(promo.endAt).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          {!isExpired && isLive && (
                            <div className="flex items-center justify-between text-[#FFAA2C] pt-1 border-t border-white/5 font-bold">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{lang === 'ar' ? 'الوقت المتبقي:' : 'Temps restant :'}</span>
                              </span>
                              <span>
                                {remainingDays > 0 ? `${remainingDays}j ` : ''}{remainingHours}h
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Optional Banner Text Preview */}
                        {(promo.bannerTextFr || promo.bannerTextAr) && (
                          <p className="text-[11px] text-[#A1A1AA] italic bg-white/[0.02] p-2 rounded-xl border border-white/5 mt-3 line-clamp-2">
                            "{lang === 'ar' ? (promo.bannerTextAr || promo.bannerTextFr) : (promo.bannerTextFr || promo.bannerTextAr)}"
                          </p>
                        )}
                      </div>

                      {/* Card Actions Footer */}
                      <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => handleTogglePromoStatus(promo)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                            promo.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                              : 'bg-white/5 text-[#A1A1AA] hover:text-white border border-white/10'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${promo.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
                          <span>{promo.isActive ? (lang === 'ar' ? 'مفعل' : 'Actif') : (lang === 'ar' ? 'معطل' : 'Inactif')}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePromotion(promo.id, promo.name)}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors cursor-pointer"
                          title={lang === 'ar' ? 'حذف العرض' : 'Supprimer'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: 68 WILAYAS DELIVERY FEES ENGINE */}
        {adminTab === 'delivery_fees' && (
          <div className="space-y-6">
            {/* Delivery Fees Header */}
            <div className="bg-[#18181F] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Truck className="w-5 h-5" />
                  </span>
                  <h2 className="text-lg font-black text-[#F5F5F7]">
                    {lang === 'ar' ? 'التحكم في أسعار التوصيل — 68 ولاية جزائرية' : 'Contrôle des Tarifs de Livraison — 68 Wilayas'}
                  </h2>
                </div>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  {lang === 'ar'
                    ? 'تحكم كامل ومباشر في أسعار التوصيل إلى المنزل أو المكتب (Point Relais / Desk) لجميع الولايات الـ 68 مع الحفظ التلقائي في قاعدة البيانات.'
                    : 'Gérez directement les frais de livraison à domicile et en bureau (point relais) pour l’ensemble des 68 wilayas d’Algérie avec mise à jour immédiate en base de données.'}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setIsBulkFeeOpen(true)}
                  className="w-full md:w-auto px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:scale-[1.02] active:scale-[0.98] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sliders className="w-4 h-4 stroke-[2.5]" />
                  <span>{lang === 'ar' ? 'تعديل جماعي للأسعار' : 'Ajustement Groupé'}</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-[#18181F] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={feeSearchQuery}
                  onChange={(e) => setFeeSearchQuery(e.target.value)}
                  placeholder={lang === 'ar' ? 'بحث بالرقم أو اسم الولاية (مثال: 16 أو الجزائر أو Oran)...' : 'Rechercher par code (16, 31) ou nom (Alger, Oran)...'}
                  className="w-full bg-[#14141B] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F5F5F7] placeholder-[#A1A1AA]/60 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Zone Filter */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                {(['all', 'centre', 'est', 'ouest', 'sud'] as const).map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => setFeeZoneFilter(z)}
                    className={`px-3 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-colors whitespace-nowrap cursor-pointer ${
                      feeZoneFilter === z
                        ? 'bg-emerald-500 text-black'
                        : 'bg-[#14141B] text-[#A1A1AA] hover:text-white border border-white/10'
                    }`}
                  >
                    {z === 'all' ? (lang === 'ar' ? 'الكل' : 'Toutes') : z}
                  </button>
                ))}
              </div>
            </div>

            {/* Wilayas Delivery Fees Table */}
            <div className="bg-[#18181F] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#14141B] text-[#A1A1AA] font-mono text-[11px] uppercase">
                      <th className="p-4">{lang === 'ar' ? 'الرقم' : 'Code'}</th>
                      <th className="p-4">{lang === 'ar' ? 'الولاية' : 'Wilaya'}</th>
                      <th className="p-4">{lang === 'ar' ? 'المنطقة' : 'Zone'}</th>
                      <th className="p-4">{lang === 'ar' ? 'توصيل للمنزل (دج)' : 'À Domicile (DZD)'}</th>
                      <th className="p-4">{lang === 'ar' ? 'توصيل للمكتب (دج)' : 'Au Bureau / Desk (DZD)'}</th>
                      <th className="p-4">{lang === 'ar' ? 'المدة المقدرة' : 'Délai'}</th>
                      <th className="p-4 text-center">{lang === 'ar' ? 'الحالة' : 'Statut'}</th>
                      <th className="p-4 text-right">{lang === 'ar' ? 'حفظ' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredDeliveryFees.map((fee) => {
                      const edited = feeEditedRows[fee.code];
                      const currentHomeFee = edited?.homeFee ?? fee.homeFee;
                      const currentDeskFee = edited?.deskFee ?? fee.deskFee;
                      const currentIsActive = edited?.isActive ?? fee.isActive;
                      const isSaving = edited?.isSaving;
                      const isSaved = edited?.isSaved;

                      return (
                        <tr key={fee.code} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 font-mono font-bold text-[#FFAA2C] whitespace-nowrap">
                            {fee.code}
                          </td>

                          <td className="p-4 whitespace-nowrap">
                            <span className="font-bold text-[#F5F5F7] block">
                              {fee.nameFr}
                            </span>
                            <span className="text-[11px] text-[#A1A1AA] font-arabic">
                              {fee.nameAr}
                            </span>
                          </td>

                          <td className="p-4 whitespace-nowrap font-mono text-xs">
                            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#A1A1AA] uppercase text-[10px]">
                              {fee.zone}
                            </span>
                          </td>

                          {/* Home Delivery Fee Input */}
                          <td className="p-4 whitespace-nowrap">
                            <div className="relative w-28">
                              <input
                                type="number"
                                inputMode="numeric"
                                min={0}
                                step={50}
                                value={currentHomeFee}
                                onChange={(e) =>
                                  handleFeeRowChange(fee.code, 'homeFee', Number(e.target.value))
                                }
                                className="w-full bg-[#14141B] border border-white/15 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs text-white font-mono font-bold outline-none"
                              />
                              <span className="absolute right-2 top-2 text-[10px] text-[#A1A1AA] pointer-events-none">
                                DA
                              </span>
                            </div>
                          </td>

                          {/* Desk Delivery Fee Input */}
                          <td className="p-4 whitespace-nowrap">
                            <div className="relative w-28">
                              <input
                                type="number"
                                inputMode="numeric"
                                min={0}
                                step={50}
                                value={currentDeskFee}
                                onChange={(e) =>
                                  handleFeeRowChange(fee.code, 'deskFee', Number(e.target.value))
                                }
                                className="w-full bg-[#14141B] border border-white/15 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs text-white font-mono font-bold outline-none"
                              />
                              <span className="absolute right-2 top-2 text-[10px] text-[#A1A1AA] pointer-events-none">
                                DA
                              </span>
                            </div>
                          </td>

                          <td className="p-4 font-mono text-[11px] text-[#A1A1AA] whitespace-nowrap">
                            {fee.estimatedDays} {t('checkout.days')}
                          </td>

                          {/* Active switch */}
                          <td className="p-4 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() =>
                                handleFeeRowChange(fee.code, 'isActive', !currentIsActive)
                              }
                              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer border ${
                                currentIsActive
                                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                  : 'bg-red-500/15 border-red-500/30 text-red-400'
                              }`}
                            >
                              {currentIsActive ? (lang === 'ar' ? 'متاح' : 'Actif') : (lang === 'ar' ? 'موقوف' : 'Inactif')}
                            </button>
                          </td>

                          {/* Save Button */}
                          <td className="p-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleSaveFeeRow(fee.code)}
                              disabled={isSaving}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                                isSaved
                                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                                  : 'bg-[#14141B] hover:bg-emerald-500 hover:text-black text-[#F5F5F7] border border-white/15'
                              }`}
                            >
                              {isSaving ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                              ) : isSaved ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{lang === 'ar' ? 'تم الحفظ' : 'Enregistré'}</span>
                                </>
                              ) : (
                                <>
                                  <Save className="w-3.5 h-3.5" />
                                  <span>{lang === 'ar' ? 'حفظ' : 'Sauvegarder'}</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 8. Statistics & Analytics Tab */}
        {adminTab === 'statics' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <AdminStatistics />
          </div>
        )}
      </main>

      {/* Add Category Modal Dialog */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            onClick={() => setIsAddCategoryOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative bg-[#14141B] border border-white/15 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
                <h3 className="text-base font-black text-[#F5F5F7] uppercase tracking-wider flex items-center gap-2">
                  <FolderPlus className="w-5 h-5 text-blue-400" />
                  <span>{lang === 'ar' ? 'إضافة قسم جديد' : 'Nouvelle Catégorie'}</span>
                </h3>
                <button
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="p-1 rounded-lg text-[#A1A1AA] hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {newCatSuccess ? (
                <div className="p-8 text-center space-y-2">
                  <CheckCircle className="w-12 h-12 text-[#25D366] mx-auto animate-bounce" />
                  <p className="text-sm font-bold text-white">
                    {lang === 'ar' ? 'تمت إضافة القسم بنجاح!' : 'Catégorie ajoutée avec succès !'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleAddCategory} className="space-y-4 text-xs">
                  {newCatError && (
                    <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold">
                      {newCatError}
                    </div>
                  )}

                  <div>
                    <label className="block text-[#A1A1AA] mb-1 font-semibold">
                      {lang === 'ar' ? 'معرّف القسم بالإنجليزية (Slug) *' : 'Identifiant unique (Slug) *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newCatSlug}
                      onChange={(e) => setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      placeholder="smartwatches, gaming, audio..."
                      className="w-full bg-[#18181F] border border-white/15 rounded-xl px-3 py-2.5 text-white font-mono outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[#A1A1AA] mb-1 font-semibold">
                      {lang === 'ar' ? 'اسم القسم بالفرنسية *' : 'Nom en Français *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newCatNameFr}
                      onChange={(e) => setNewCatNameFr(e.target.value)}
                      placeholder="Ex: Montres Connectées"
                      className="w-full bg-[#18181F] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[#A1A1AA] mb-1 font-semibold">
                      {lang === 'ar' ? 'اسم القسم بالعربية *' : 'Nom en Arabe *'}
                    </label>
                    <input
                      type="text"
                      required
                      dir="rtl"
                      value={newCatNameAr}
                      onChange={(e) => setNewCatNameAr(e.target.value)}
                      placeholder="مثال: ساعات ذكية"
                      className="w-full bg-[#18181F] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[#A1A1AA] mb-1 font-semibold">
                      {lang === 'ar' ? 'وصف القسم بالفرنسية (اختياري)' : 'Description (FR)'}
                    </label>
                    <input
                      type="text"
                      value={newCatDescFr}
                      onChange={(e) => setNewCatDescFr(e.target.value)}
                      placeholder="Brève description..."
                      className="w-full bg-[#18181F] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer mt-4"
                  >
                    {lang === 'ar' ? 'حفظ القسم' : 'Enregistrer la catégorie'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick-Add Product Drawer Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            onClick={() => setIsAddProductOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <div className="min-h-full flex items-center justify-center p-3 sm:p-4">
            <div className="relative bg-[#14141B] border border-white/15 rounded-3xl w-[95vw] sm:max-w-xl max-h-[92vh] overflow-y-auto p-4 sm:p-7 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FF6B00]/15 border border-[#FF6B00]/30 text-[#FF6B00] flex items-center justify-center">
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-[#F5F5F7]">
                      {lang === 'ar' ? 'إضافة منتج جديد للمتجر' : 'Ajouter un Nouveau Produit'}
                    </h3>
                    <p className="text-[11px] text-[#A1A1AA]">
                      {lang === 'ar' ? 'الحقول بعلامة (*) إجبارية' : 'Les champs marqués d’une (*) sont obligatoires'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddProductOpen(false)}
                  className="p-1.5 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {newProdSuccess ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-[#25D366] mx-auto flex items-center justify-center animate-bounce">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-black text-white">{t('admin.add_success')}</p>
                </div>
              ) : (
                <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
                  {uploadError && (
                    <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* 1. Product Names (AR & FR) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#A1A1AA] mb-1 font-bold flex items-center justify-between">
                        <span>{lang === 'ar' ? 'اسم المنتج بالعربية *' : 'Nom en Arabe *'}</span>
                        <span className="text-[10px] text-[#FF6B00] font-bold">{lang === 'ar' ? 'إجباري *' : 'Requis *'}</span>
                      </label>
                      <input
                        type="text"
                        required
                        dir="rtl"
                        value={newProdNameAr}
                        onChange={(e) => {
                          setNewProdNameAr(e.target.value);
                          if (!newProdNameFr) setNewProdNameFr(e.target.value);
                        }}
                        placeholder={lang === 'ar' ? 'مثال: Cyberbuds X9 — سماعات بلوتوث' : 'Ex: سماعات بلوتوث'}
                        className="w-full bg-[#18181F] border border-white/15 focus:border-[#FF6B00] rounded-xl px-3 py-2.5 text-white outline-none text-right"
                      />
                    </div>

                    <div>
                      <label className="block text-[#A1A1AA] mb-1 font-bold flex items-center justify-between">
                        <span>{lang === 'ar' ? 'اسم المنتج بالفرنسية *' : 'Nom en Français *'}</span>
                        <span className="text-[10px] text-[#FF6B00] font-bold">{lang === 'ar' ? 'إجباري *' : 'Requis *'}</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newProdNameFr}
                        onChange={(e) => {
                          setNewProdNameFr(e.target.value);
                          if (!newProdNameAr) setNewProdNameAr(e.target.value);
                        }}
                        placeholder="Ex: Cyberbuds X9 ANC Earbuds"
                        className="w-full bg-[#18181F] border border-white/15 focus:border-[#FF6B00] rounded-xl px-3 py-2.5 text-white outline-none"
                      />
                    </div>
                  </div>

                  {/* 2. Category & Mandatory Quantity (Stock) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#A1A1AA] mb-1 font-bold flex items-center justify-between">
                        <span>{t('admin.lbl_category')} *</span>
                        <span className="text-[10px] text-[#FF6B00] font-bold">{lang === 'ar' ? 'إجباري *' : 'Requis *'}</span>
                      </label>
                      <div className="relative">
                        <select
                          value={newProdCategory}
                          onChange={(e) => setNewProdCategory(e.target.value as any)}
                          className="w-full appearance-none bg-[#18181F] border border-white/15 focus:border-[#FF6B00] rounded-xl px-3 py-2.5 ltr:pr-8 rtl:pl-8 text-xs text-white outline-none cursor-pointer"
                        >
                          {categories.length > 0 ? (
                            categories.map((c) => (
                              <option key={c.id || c.slug} value={c.slug} className="bg-[#18181F] text-[#F5F5F7]">
                                {lang === 'ar' ? c.nameAr : c.nameFr} ({c.slug})
                              </option>
                            ))
                          ) : (
                            <>
                              <option value="earbuds" className="bg-[#18181F] text-[#F5F5F7]">{t('products.earbuds')}</option>
                              <option value="headphones" className="bg-[#18181F] text-[#F5F5F7]">{t('products.headphones')}</option>
                              <option value="speakers" className="bg-[#18181F] text-[#F5F5F7]">{t('products.speakers')}</option>
                              <option value="chargers" className="bg-[#18181F] text-[#F5F5F7]">{t('products.chargers')}</option>
                              <option value="powerbanks" className="bg-[#18181F] text-[#F5F5F7]">{t('products.powerbanks')}</option>
                            </>
                          )}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 ltr:right-2.5 rtl:left-2.5 flex items-center text-[#A1A1AA]">
                          <ChevronDown className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#A1A1AA] mb-1 font-bold flex items-center justify-between">
                        <span>{lang === 'ar' ? 'الكمية في المخزون (Stock) *' : 'Quantité en Stock *'}</span>
                        <span className="text-[10px] text-[#FF6B00] font-bold">{lang === 'ar' ? 'إجباري *' : 'Obligatoire *'}</span>
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        required
                        value={newProdStock}
                        onChange={(e) => setNewProdStock(e.target.value)}
                        placeholder="20"
                        className="w-full bg-[#18181F] border border-white/15 focus:border-[#FF6B00] rounded-xl px-3 py-2.5 text-white font-mono font-bold outline-none"
                      />
                    </div>
                  </div>

                  {/* 3. Price & Original Price */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#A1A1AA] mb-1 font-bold flex items-center justify-between">
                        <span>{t('admin.lbl_price')} (DZD) *</span>
                        <span className="text-[10px] text-[#FF6B00] font-bold">{lang === 'ar' ? 'إجباري *' : 'Requis *'}</span>
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        required
                        min="1"
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                        placeholder="Ex: 8500"
                        className="w-full bg-[#18181F] border border-white/15 focus:border-[#FF6B00] rounded-xl px-3 py-2.5 text-white font-mono font-bold outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[#A1A1AA] mb-1 font-bold flex items-center justify-between">
                        <span>{lang === 'ar' ? 'السعر القديم المشطوب (د.ج)' : 'Prix barré (DZD)'}</span>
                        <span className="text-[10px] text-[#A1A1AA] font-normal">{lang === 'ar' ? 'اختياري' : 'Optionnel'}</span>
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={newProdOriginalPrice}
                        onChange={(e) => setNewProdOriginalPrice(e.target.value)}
                        placeholder="Ex: 11000"
                        className="w-full bg-[#18181F] border border-white/15 focus:border-[#FF6B00] rounded-xl px-3 py-2.5 text-white font-mono outline-none"
                      />
                    </div>
                  </div>

                  {/* 4. Product Image (DEVICE UPLOAD ONLY - NO URL LINK INPUT) */}
                  <div className="space-y-2">
                    <label className="block text-[#A1A1AA] font-bold flex items-center justify-between">
                      <span>{lang === 'ar' ? 'صورة المنتج *' : 'Photo du Produit *'}</span>
                      <span className="text-[10px] text-[#FF6B00] font-bold">
                        {lang === 'ar' ? 'رفع من جهازك (إجباري) *' : 'Téléversement obligatoire *'}
                      </span>
                    </label>

                    {!newProdImage ? (
                      <div>
                        <label className={`flex flex-col items-center justify-center p-5 bg-[#18181F] hover:bg-[#22222B] border-2 border-dashed ${uploadError && !newProdImage ? 'border-red-500/50' : 'border-white/20'} hover:border-[#FF6B00] rounded-2xl cursor-pointer transition-all group text-center`}>
                          <UploadCloud className={`w-8 h-8 mb-2 transition-transform group-hover:scale-110 ${isUploading ? 'animate-bounce text-[#FF6B00]' : 'text-[#FFAA2C]'}`} />
                          <span className="font-bold text-xs text-white mb-1">
                            {isUploading
                              ? (lang === 'ar' ? 'جارٍ رفع الصورة ومعالجتها...' : 'Téléversement en cours...')
                              : (lang === 'ar' ? 'اضغط هنا لرفع صورة المنتج من هاتفك أو جهازك' : 'Cliquez pour téléverser une photo')}
                          </span>
                          <span className="text-[10px] text-[#A1A1AA]">
                            PNG, JPG, WEBP — {lang === 'ar' ? 'تُحفظ تلقائياً في السيرفر' : 'Stockage cloud instantané'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploading}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setIsUploading(true);
                              setUploadError(null);
                              const { url, error } = await uploadProductImage(file);
                              setIsUploading(false);
                              if (url) {
                                setNewProdImage(url);
                              } else if (error) {
                                setUploadError(error);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-[#18181F] rounded-2xl border border-emerald-500/40">
                        <img
                          src={newProdImage}
                          alt="Preview"
                          className="w-16 h-16 object-cover rounded-xl bg-black shrink-0 border border-white/10"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-xs text-[#25D366] font-bold flex items-center gap-1.5 mb-1">
                            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{lang === 'ar' ? 'تم رفع الصورة وتثبيتها بنجاح' : 'Image téléversée avec succès'}</span>
                          </span>
                          <span className="text-[10px] text-[#A1A1AA] truncate block font-mono">
                            {newProdImage.split('/').pop()}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNewProdImage('')}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                          title={lang === 'ar' ? 'حذف واختيار صورة أخرى' : 'Supprimer'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{lang === 'ar' ? 'حذف الصورة' : 'Supprimer'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 5. Optional Fields Toggle (Taglines, Descriptions, Flash Deal, Badge) */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowOptionalFields(!showOptionalFields)}
                      className="w-full py-2.5 px-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Sliders className="w-3.5 h-3.5 text-[#FFAA2C]" />
                        <span>
                          {lang === 'ar'
                            ? (showOptionalFields ? 'إخفاء الحقول الإضافية' : 'إظهار الحقول الإضافية (الوصف، الشعارات، العروض)')
                            : (showOptionalFields ? 'Masquer les champs optionnels' : 'Afficher les champs optionnels (Description, Slogans, Offres)')}
                        </span>
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showOptionalFields ? 'rotate-180 text-[#FFAA2C]' : ''}`} />
                    </button>

                    {showOptionalFields && (
                      <div className="mt-3 p-3.5 bg-white/[0.02] border border-white/10 rounded-2xl space-y-3">
                        {/* Taglines */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[#A1A1AA] mb-1 font-semibold flex items-center justify-between">
                              <span>{lang === 'ar' ? 'عبارة تسويقية بالعربية' : 'Slogan court (Arabe)'}</span>
                              <span className="text-[10px] text-[#A1A1AA]">{lang === 'ar' ? 'اختياري' : 'Optionnel'}</span>
                            </label>
                            <input
                              type="text"
                              dir="rtl"
                              value={newProdTaglineAr}
                              onChange={(e) => setNewProdTaglineAr(e.target.value)}
                              placeholder={lang === 'ar' ? 'مثال: عزل ضوضاء فائق وبطارية تدوم 40 ساعة' : 'Slogan en arabe'}
                              className="w-full bg-[#18181F] border border-white/15 focus:border-[#FF6B00] rounded-xl px-3 py-2 text-white outline-none text-right"
                            />
                          </div>

                          <div>
                            <label className="block text-[#A1A1AA] mb-1 font-semibold flex items-center justify-between">
                              <span>{lang === 'ar' ? 'عبارة تسويقية بالفرنسية' : 'Slogan court (Français)'}</span>
                              <span className="text-[10px] text-[#A1A1AA]">{lang === 'ar' ? 'اختياري' : 'Optionnel'}</span>
                            </label>
                            <input
                              type="text"
                              value={newProdTaglineFr}
                              onChange={(e) => setNewProdTaglineFr(e.target.value)}
                              placeholder="Ex: Réduction active du bruit & 40h d'autonomie"
                              className="w-full bg-[#18181F] border border-white/15 focus:border-[#FF6B00] rounded-xl px-3 py-2 text-white outline-none"
                            />
                          </div>
                        </div>

                        {/* Detailed Descriptions */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[#A1A1AA] mb-1 font-semibold flex items-center justify-between">
                              <span>{lang === 'ar' ? 'الوصف التفصيلي بالعربية' : 'Description détaillée (Arabe)'}</span>
                              <span className="text-[10px] text-[#A1A1AA]">{lang === 'ar' ? 'اختياري' : 'Optionnel'}</span>
                            </label>
                            <textarea
                              rows={3}
                              dir="rtl"
                              value={newProdDescAr}
                              onChange={(e) => setNewProdDescAr(e.target.value)}
                              placeholder={lang === 'ar' ? 'اكتب تفاصيل وميزات المنتج هنا...' : 'Description en arabe'}
                              className="w-full bg-[#18181F] border border-white/15 focus:border-[#FF6B00] rounded-xl px-3 py-2 text-white outline-none text-right resize-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[#A1A1AA] mb-1 font-semibold flex items-center justify-between">
                              <span>{lang === 'ar' ? 'الوصف التفصيلي بالفرنسية' : 'Description détaillée (Français)'}</span>
                              <span className="text-[10px] text-[#A1A1AA]">{lang === 'ar' ? 'اختياري' : 'Optionnel'}</span>
                            </label>
                            <textarea
                              rows={3}
                              value={newProdDescFr}
                              onChange={(e) => setNewProdDescFr(e.target.value)}
                              placeholder="Description complète du produit, caractéristiques..."
                              className="w-full bg-[#18181F] border border-white/15 focus:border-[#FF6B00] rounded-xl px-3 py-2 text-white outline-none resize-none"
                            />
                          </div>
                        </div>

                        {/* Flash Deal & Badge */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
                          <label className="flex items-center gap-3 p-3 bg-[#18181F] rounded-xl border border-white/10 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newProdIsFlashDeal}
                              onChange={(e) => setNewProdIsFlashDeal(e.target.checked)}
                              className="w-4 h-4 rounded text-[#FF6B00] accent-[#FF6B00] cursor-pointer"
                            />
                            <div>
                              <span className="font-bold text-white text-xs block flex items-center gap-1.5">
                                <Flame className="w-3.5 h-3.5 text-[#FF6B00]" />
                                <span>{lang === 'ar' ? 'عرض فلاش خاص (Flash Deal)' : 'Offre Flash Spéciale'}</span>
                              </span>
                              <span className="text-[10px] text-[#A1A1AA]">
                                {lang === 'ar' ? 'يظهر مع عداد وتأثير بصري ترويجي' : 'Badge promo avec compte à rebours'}
                              </span>
                            </div>
                          </label>

                          <div>
                            <label className="block text-[#A1A1AA] mb-1 font-semibold flex items-center justify-between">
                              <span>{lang === 'ar' ? 'نص شارة العرض' : 'Badge Promo'}</span>
                              <span className="text-[10px] text-[#A1A1AA]">{lang === 'ar' ? 'اختياري' : 'Optionnel'}</span>
                            </label>
                            <input
                              type="text"
                              value={newProdBadge}
                              onChange={(e) => setNewProdBadge(e.target.value)}
                              placeholder="Ex: PROMO, جديد, الأكثر طلباً"
                              className="w-full bg-[#18181F] border border-white/15 focus:border-[#FF6B00] rounded-xl px-3 py-2 text-white outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 6. Modal Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddProductOpen(false)}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-[#A1A1AA] hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                    >
                      {lang === 'ar' ? 'إلغاء' : 'Annuler'}
                    </button>

                    <button
                      type="submit"
                      disabled={isUploading}
                      className="flex-[2] py-3 bg-gradient-to-r from-[#FF6B00] to-[#FFAA2C] hover:from-[#E05E00] hover:to-[#FF9900] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#FF6B00]/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>{t('admin.btn_save')}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal Dialog */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            onClick={() => setEditingProduct(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <div className="min-h-full flex items-center justify-center p-3 sm:p-4">
            <div className="relative bg-white dark:bg-[#14141B] border border-black/10 dark:border-white/15 rounded-3xl w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-8 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-500 flex items-center justify-center">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#0F172A] dark:text-[#F5F5F7]">
                      {lang === 'ar' ? 'تعديل بيانات المنتج' : 'Modifier le Produit'}
                    </h3>
                    <p className="text-[11px] text-[#64748B] dark:text-[#A1A1AA] font-mono">
                      /{editingProduct.slug}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="p-1 rounded-lg text-[#64748B] dark:text-[#A1A1AA] hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {editError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold">
                  {editError}
                </div>
              )}

              <form onSubmit={handleSaveProductEdit} className="space-y-4 text-xs">
                {/* Product Names (FR / AR) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#475569] dark:text-[#A1A1AA] mb-1 font-bold">
                      Nom (Français) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editNameFr}
                      onChange={(e) => setEditNameFr(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#18181F] border border-black/10 dark:border-white/15 rounded-xl px-3 py-2.5 text-[#0F172A] dark:text-white outline-none focus:border-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#475569] dark:text-[#A1A1AA] mb-1 font-bold text-right">
                      * (العربية) اسم المنتج
                    </label>
                    <input
                      type="text"
                      required
                      dir="rtl"
                      value={editNameAr}
                      onChange={(e) => setEditNameAr(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#18181F] border border-black/10 dark:border-white/15 rounded-xl px-3 py-2.5 text-[#0F172A] dark:text-white outline-none focus:border-[#FF6B00] text-right"
                    />
                  </div>
                </div>

                {/* Category & Stock */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#475569] dark:text-[#A1A1AA] mb-1 font-bold">
                      {t('admin.lbl_category')}
                    </label>
                    <div className="relative">
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full appearance-none bg-slate-50 dark:bg-[#18181F] border border-black/10 dark:border-white/15 rounded-xl px-3 py-2.5 ltr:pr-8 rtl:pl-8 text-xs text-[#0F172A] dark:text-white outline-none cursor-pointer"
                      >
                        {categories.map((c) => (
                          <option key={c.id || c.slug} value={c.slug} className="bg-white dark:bg-[#18181F] text-[#0F172A] dark:text-[#F5F5F7]">
                            {lang === 'ar' ? c.nameAr : c.nameFr} ({c.slug})
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 ltr:right-2.5 rtl:left-2.5 flex items-center text-[#64748B] dark:text-[#A1A1AA]">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#475569] dark:text-[#A1A1AA] mb-1 font-bold">
                      {lang === 'ar' ? 'المخزون المتوفر' : 'Stock'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editStockCount}
                      onChange={(e) => setEditStockCount(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#18181F] border border-black/10 dark:border-white/15 rounded-xl px-3 py-2.5 text-[#0F172A] dark:text-white font-mono outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                </div>

                {/* Price & Original Price */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#475569] dark:text-[#A1A1AA] mb-1 font-bold">
                      {t('admin.lbl_price')} (DZD) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#18181F] border border-black/10 dark:border-white/15 rounded-xl px-3 py-2.5 text-[#0F172A] dark:text-white font-mono font-bold outline-none focus:border-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#475569] dark:text-[#A1A1AA] mb-1 font-bold">
                      {lang === 'ar' ? 'السعر القديم المشطوب (اختياري)' : 'Prix barré (Optionnel)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editOriginalPrice}
                      onChange={(e) => setEditOriginalPrice(e.target.value)}
                      placeholder="Ex: 11000"
                      className="w-full bg-slate-50 dark:bg-[#18181F] border border-black/10 dark:border-white/15 rounded-xl px-3 py-2.5 text-[#0F172A] dark:text-white font-mono outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                </div>

                {/* Flash Deal Toggle */}
                <div className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#0F172A] dark:text-[#F5F5F7] block text-xs">
                      {lang === 'ar' ? 'عرض فلاش خاص (Flash Deal)' : 'Offre Flash Spéciale'}
                    </span>
                    <span className="text-[11px] text-[#64748B] dark:text-[#A1A1AA]">
                      {lang === 'ar' ? 'إظهار شارة التخفيض المميز على المنتج' : 'Afficher un badge promotionnel'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={editIsFlashDeal}
                    onChange={(e) => setEditIsFlashDeal(e.target.checked)}
                    className="w-4 h-4 rounded text-[#FF6B00] accent-[#FF6B00] cursor-pointer"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/10 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    disabled={editSaving}
                    className="px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold text-[#64748B] dark:text-[#A1A1AA] hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer"
                  >
                    {lang === 'ar' ? 'إلغاء' : 'Annuler'}
                  </button>

                  <button
                    type="submit"
                    disabled={editSaving}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#FF6B00] to-[#FFAA2C] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#FF6B00]/25 transition-all cursor-pointer flex items-center gap-2"
                  >
                    {editSaving ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{lang === 'ar' ? 'جارٍ الحفظ...' : 'Enregistrement...'}</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'حفظ التعديلات' : 'Enregistrer'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Promotion Creation Modal Dialog */}
      {isAddPromoOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            onClick={() => setIsAddPromoOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative bg-[#14141B] border border-white/15 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-[#FF6B00]" />
                  <h3 className="text-base font-black text-[#F5F5F7] uppercase tracking-wider">
                    {lang === 'ar' ? 'إنشاء عرض ترويجي جديد' : 'Nouvelle Promotion'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddPromoOpen(false)}
                  className="p-1 rounded-lg text-[#A1A1AA] hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {newPromoSuccess ? (
                <div className="p-8 text-center space-y-2">
                  <CheckCircle className="w-12 h-12 text-[#25D366] mx-auto animate-bounce" />
                  <p className="text-sm font-bold text-white">
                    {lang === 'ar' ? 'تم تفعيل العرض الترويجي بنجاح!' : 'Promotion activée avec succès !'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCreatePromotion} className="space-y-4 text-xs">
                  {newPromoError && (
                    <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold">
                      {newPromoError}
                    </div>
                  )}

                  {/* Promo Name */}
                  <div>
                    <label className="block text-[#A1A1AA] mb-1 font-semibold">
                      {lang === 'ar' ? 'اسم العرض الترويجي *' : 'Nom de l’offre promotionnelle *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newPromoName}
                      onChange={(e) => setNewPromoName(e.target.value)}
                      placeholder={lang === 'ar' ? 'مثال: تخفيضات الصيف على السماعات -20%' : 'Ex: Solde d’été Écouteurs -20%'}
                      className="w-full bg-[#18181F] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#FF6B00]"
                    />
                  </div>

                  {/* Target Type Selector: Category vs Product */}
                  <div>
                    <label className="block text-[#A1A1AA] mb-1.5 font-semibold">
                      {lang === 'ar' ? 'تطبيق العرض على: *' : 'Appliquer la remise sur : *'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setNewPromoTargetType('category');
                          if (!newPromoTargetId || !categories.some((c) => c.slug === newPromoTargetId)) {
                            setNewPromoTargetId(categories[0]?.slug || 'earbuds');
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                          newPromoTargetType === 'category'
                            ? 'bg-[#FF6B00]/15 border-[#FF6B00] text-[#FF6B00]'
                            : 'bg-[#18181F] border-white/10 text-[#A1A1AA] hover:text-white'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'قسم كامل' : 'Une Catégorie'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setNewPromoTargetType('product');
                          if (!newPromoTargetId || !products.some((p) => p.id === newPromoTargetId)) {
                            setNewPromoTargetId(products[0]?.id || '');
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                          newPromoTargetType === 'product'
                            ? 'bg-[#FF6B00]/15 border-[#FF6B00] text-[#FF6B00]'
                            : 'bg-[#18181F] border-white/10 text-[#A1A1AA] hover:text-white'
                        }`}
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'منتج معين' : 'Un Produit spécifique'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Target Choice Dropdown */}
                  <div>
                    <label className="block text-[#A1A1AA] mb-1 font-semibold">
                      {newPromoTargetType === 'category'
                        ? (lang === 'ar' ? 'اختر القسم المستهدف *' : 'Choisir la catégorie cible *')
                        : (lang === 'ar' ? 'اختر المنتج المستهدف *' : 'Choisir le produit cible *')}
                    </label>
                    <div className="relative">
                      <select
                        value={newPromoTargetId}
                        onChange={(e) => setNewPromoTargetId(e.target.value)}
                        className="w-full appearance-none bg-[#18181F] border border-white/15 rounded-xl px-3 py-2.5 ltr:pr-8 rtl:pl-8 text-white outline-none cursor-pointer text-xs"
                      >
                        {newPromoTargetType === 'category' ? (
                          categories.length > 0 ? (
                            categories.map((c) => (
                              <option key={c.id || c.slug} value={c.slug} className="bg-[#18181F] text-white">
                                {lang === 'ar' ? c.nameAr : c.nameFr} ({c.slug})
                              </option>
                            ))
                          ) : (
                            <>
                              <option value="earbuds" className="bg-[#18181F] text-white">{t('products.earbuds')}</option>
                              <option value="headphones" className="bg-[#18181F] text-white">{t('products.headphones')}</option>
                              <option value="speakers" className="bg-[#18181F] text-white">{t('products.speakers')}</option>
                              <option value="chargers" className="bg-[#18181F] text-white">{t('products.chargers')}</option>
                              <option value="powerbanks" className="bg-[#18181F] text-white">{t('products.powerbanks')}</option>
                            </>
                          )
                        ) : (
                          products.map((p) => (
                            <option key={p.id} value={p.id} className="bg-[#18181F] text-white">
                              {p.nameFr} — {formatDZD(p.price, lang)}
                            </option>
                          ))
                        )}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 ltr:right-2.5 rtl:left-2.5 flex items-center text-[#A1A1AA]">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Discount Type & Value */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#A1A1AA] mb-1 font-semibold">
                        {lang === 'ar' ? 'نوع التخفيض *' : 'Type de remise *'}
                      </label>
                      <select
                        value={newPromoDiscountType}
                        onChange={(e) => setNewPromoDiscountType(e.target.value as any)}
                        className="w-full bg-[#18181F] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none cursor-pointer text-xs"
                      >
                        <option value="percentage" className="bg-[#18181F]">Pourcentage (%)</option>
                        <option value="fixed" className="bg-[#18181F]">Montant Fixe (DZD)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#A1A1AA] mb-1 font-semibold">
                        {newPromoDiscountType === 'percentage'
                          ? (lang === 'ar' ? 'النسبة المئوية (%) *' : 'Valeur (%) *')
                          : (lang === 'ar' ? 'المبلغ بالدينار (DZD) *' : 'Valeur (DZD) *')}
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={newPromoDiscountType === 'percentage' ? 95 : 100000}
                        required
                        value={newPromoDiscountValue}
                        onChange={(e) => setNewPromoDiscountValue(e.target.value)}
                        placeholder={newPromoDiscountType === 'percentage' ? '20' : '1500'}
                        className="w-full bg-[#18181F] border border-white/15 rounded-xl px-3 py-2.5 text-white font-mono font-bold outline-none focus:border-[#FF6B00]"
                      />
                    </div>
                  </div>

                  {/* Duration Presets */}
                  <div>
                    <label className="block text-[#A1A1AA] mb-1.5 font-semibold flex items-center justify-between">
                      <span>{lang === 'ar' ? 'مدة العرض الترويجي: *' : 'Durée de la promotion : *'}</span>
                      <span className="text-[10px] text-[#FFAA2C] font-mono">
                        {newPromoDurationPreset}
                      </span>
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {(['24h', '3d', '7d', '30d', 'custom'] as const).map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handlePresetDurationChange(preset)}
                          className={`py-1.5 rounded-lg font-mono text-[11px] font-bold border transition-colors cursor-pointer ${
                            newPromoDurationPreset === preset
                              ? 'bg-[#FF6B00] text-black border-[#FF6B00]'
                              : 'bg-[#18181F] border-white/10 text-[#A1A1AA] hover:text-white'
                          }`}
                        >
                          {preset === '24h' ? '24h' : preset === '3d' ? '3 Jours' : preset === '7d' ? '7 Jours' : preset === '30d' ? '30 Jours' : 'Manuel'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Pickers */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#A1A1AA] mb-1 text-[11px]">
                        {lang === 'ar' ? 'تاريخ البداية' : 'Date de début'}
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={newPromoStartAt}
                        onChange={(e) => setNewPromoStartAt(e.target.value)}
                        className="w-full bg-[#18181F] border border-white/15 rounded-xl px-2.5 py-2 text-[11px] text-white font-mono outline-none focus:border-[#FF6B00]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#A1A1AA] mb-1 text-[11px]">
                        {lang === 'ar' ? 'تاريخ النهاية' : 'Date de fin'}
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={newPromoEndAt}
                        onChange={(e) => {
                          setNewPromoEndAt(e.target.value);
                          setNewPromoDurationPreset('custom');
                        }}
                        className="w-full bg-[#18181F] border border-white/15 rounded-xl px-2.5 py-2 text-[11px] text-white font-mono outline-none focus:border-[#FF6B00]"
                      />
                    </div>
                  </div>

                  {/* Optional Banner Text */}
                  <div>
                    <label className="block text-[#A1A1AA] mb-1 font-semibold">
                      {lang === 'ar' ? 'رسالة الشريط الترويجي (اختياري)' : 'Texte de la bannière promo (optionnel)'}
                    </label>
                    <input
                      type="text"
                      value={newPromoBannerFr}
                      onChange={(e) => setNewPromoBannerFr(e.target.value)}
                      placeholder="Ex: Profitez de 20% de remise immédiate !"
                      className="w-full bg-[#18181F] border border-white/15 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FF6B00]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-[#FF6B00] via-[#FFAA2C] to-[#FF6B00] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#FF6B00]/30 transition-all cursor-pointer mt-2"
                  >
                    {lang === 'ar' ? 'تفعيل العرض الترويجي الآن' : 'Lancer la Promotion'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delivery Fees Adjustment Modal */}
      {isBulkFeeOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            onClick={() => setIsBulkFeeOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative bg-[#14141B] border border-white/15 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-black text-[#F5F5F7] uppercase tracking-wider">
                    {lang === 'ar' ? 'تعديل جماعي لأسعار الـ 68 ولاية' : 'Ajustement Groupé (68 Wilayas)'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsBulkFeeOpen(false)}
                  className="p-1 rounded-lg text-[#A1A1AA] hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {bulkSuccess && (
                <div className="p-3 mb-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{bulkSuccess}</span>
                </div>
              )}

              {bulkError && (
                <div className="p-3 mb-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold">
                  {bulkError}
                </div>
              )}

              <form onSubmit={handleBulkApplyFees} className="space-y-4 text-xs">
                {/* Target Delivery Mode */}
                <div>
                  <label className="block text-[#A1A1AA] mb-1.5 font-semibold">
                    {lang === 'ar' ? 'التعرفة المستهدفة بالعملية: *' : 'Tarifs ciblés par la mise à jour : *'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setBulkTarget('home')}
                      className={`p-2.5 rounded-xl border text-[11px] font-bold transition-colors cursor-pointer text-center ${
                        bulkTarget === 'home'
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                          : 'bg-[#18181F] border-white/10 text-[#A1A1AA] hover:text-white'
                      }`}
                    >
                      {lang === 'ar' ? 'المنزل فقط' : 'À Domicile'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setBulkTarget('desk')}
                      className={`p-2.5 rounded-xl border text-[11px] font-bold transition-colors cursor-pointer text-center ${
                        bulkTarget === 'desk'
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                          : 'bg-[#18181F] border-white/10 text-[#A1A1AA] hover:text-white'
                      }`}
                    >
                      {lang === 'ar' ? 'المكتب فقط' : 'En Bureau'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setBulkTarget('both')}
                      className={`p-2.5 rounded-xl border text-[11px] font-bold transition-colors cursor-pointer text-center ${
                        bulkTarget === 'both'
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                          : 'bg-[#18181F] border-white/10 text-[#A1A1AA] hover:text-white'
                      }`}
                    >
                      {lang === 'ar' ? 'كلاهما معاً' : 'Les deux'}
                    </button>
                  </div>
                </div>

                {/* Adjustment Mode */}
                <div>
                  <label className="block text-[#A1A1AA] mb-1.5 font-semibold">
                    {lang === 'ar' ? 'نوع العملية: *' : 'Mode d’ajustement : *'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBulkMode('set')}
                      className={`p-2.5 rounded-xl border text-[11px] font-bold transition-colors cursor-pointer text-center ${
                        bulkMode === 'set'
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                          : 'bg-[#18181F] border-white/10 text-[#A1A1AA] hover:text-white'
                      }`}
                    >
                      {lang === 'ar' ? 'تعيين سعر موحد' : 'Fixer un prix uniforme'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setBulkMode('add')}
                      className={`p-2.5 rounded-xl border text-[11px] font-bold transition-colors cursor-pointer text-center ${
                        bulkMode === 'add'
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                          : 'bg-[#18181F] border-white/10 text-[#A1A1AA] hover:text-white'
                      }`}
                    >
                      {lang === 'ar' ? 'زيادة مبلغ (+دج)' : 'Ajouter (+DZD)'}
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-[#A1A1AA] mb-1 font-semibold">
                    {bulkMode === 'set'
                      ? (lang === 'ar' ? 'المبلغ الجديد (دج) *' : 'Nouveau prix uniforme (DZD) *')
                      : (lang === 'ar' ? 'المبلغ المراد إضافته (دج) *' : 'Montant à ajouter (DZD) *')}
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={50}
                    required
                    value={bulkAmount}
                    onChange={(e) => setBulkAmount(e.target.value)}
                    placeholder="Ex: 500"
                    className="w-full bg-[#18181F] border border-white/15 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-white font-mono font-bold outline-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-[#A1A1AA] leading-relaxed">
                  ⚠️ {lang === 'ar'
                    ? 'سيتم تطبيق هذا التعديل مباشرة على جميع الولايات الـ 68 وحفظه في قاعدة البيانات.'
                    : 'Cette opération s’appliquera immédiatement aux 68 Wilayas dans la base de données.'}
                </div>

                <button
                  type="submit"
                  disabled={isBulkSaving}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isBulkSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>
                    {isBulkSaving
                      ? (lang === 'ar' ? 'جارٍ التحديث...' : 'Mise à jour en cours...')
                      : (lang === 'ar' ? 'تطبيق على جميع الـ 68 ولاية' : 'Appliquer aux 68 Wilayas')}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ==================== FLOATING TOAST CONFIRMATION NOTIFICATION ==================== */}
      {toast.isOpen && (
        <div className="fixed top-20 ltr:right-4 rtl:left-4 sm:ltr:right-8 sm:rtl:left-8 z-50 max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#14141B] border border-emerald-500/40 shadow-2xl shadow-emerald-500/15 flex items-start gap-3 backdrop-blur-xl">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-[#0F172A] dark:text-white">
                {toast.message}
              </h4>
              {toast.details && (
                <p className="text-[11px] text-[#475569] dark:text-[#A1A1AA] mt-0.5 leading-relaxed font-medium">
                  {toast.details}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setToast((prev) => ({ ...prev, isOpen: false }))}
              className="p-1 text-[#64748B] dark:text-[#A1A1AA] hover:text-[#0F172A] dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ==================== PRODUCT DELETE CONFIRMATION MODAL WITH ORDER CHECK ==================== */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#14141B] border border-white/15 rounded-3xl w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F5F5F7]">
                    {lang === 'ar' ? 'تأكيد حذف المنتج' : 'Confirmer la suppression'}
                  </h3>
                  <p className="text-xs text-[#A1A1AA]">
                    {deleteModal.products.length === 1
                      ? (lang === 'ar' ? 'سيتم إزالة هذا المنتج من الكتالوج' : 'Ce produit sera retiré du catalogue')
                      : (lang === 'ar' ? `سيتم إزالة ${deleteModal.products.length} منتجات محددة` : `${deleteModal.products.length} produits sélectionnés seront retirés`)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, products: [], linkedOrders: [], isDeleting: false, isConfirmed: false })}
                className="p-1 text-[#A1A1AA] hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Products Preview */}
            <div className="max-h-36 overflow-y-auto space-y-2 p-2 bg-white/[0.02] border border-white/5 rounded-2xl">
              {deleteModal.products.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-1.5">
                  <img
                    src={p.images?.[0] || '/placeholder.png'}
                    alt={p.nameFr}
                    className="w-10 h-10 rounded-xl object-cover bg-black/40 border border-white/10 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#F5F5F7] truncate">
                      {lang === 'ar' ? p.nameAr : p.nameFr}
                    </p>
                    <p className="text-[10px] text-[#FFAA2C] font-mono">
                      {formatDZD(p.price, lang)} • {p.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* LINKED ORDERS CRITICAL WARNING OR SAFE NOTICE */}
            {deleteModal.linkedOrders.length > 0 ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 space-y-1.5">
                  <div className="flex items-center gap-2 font-black text-xs text-red-400 uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>
                      {lang === 'ar'
                        ? `⚠️ تحذير: هذا المنتج مرتبط بـ ${deleteModal.linkedOrders.length} طلبية مسجلة!`
                        : `⚠️ ATTENTION : Lié à ${deleteModal.linkedOrders.length} commande(s) active(s) !`}
                    </span>
                  </div>
                  <p className="text-xs text-red-200/90 leading-relaxed font-medium">
                    {lang === 'ar'
                      ? `هناك ${deleteModal.linkedOrders.length} طلبية حالية مسجلة تحتوي على هذا المنتج. حذف المنتج سيؤدي تلقائياً إلى حذف وإلغاء هذه الطلبيات المرتبطة أيضاً!`
                      : `Ce produit est inclus dans ${deleteModal.linkedOrders.length} commande(s). La confirmation supprimera définitivement le produit ET toutes ces commandes associées !`}
                  </p>
                </div>

                {/* Linked Orders List */}
                <div className="space-y-1.5">
                  <p className="text-[11px] font-mono font-bold text-[#A1A1AA] uppercase">
                    {lang === 'ar' ? 'الطلبيات التي ستُحذف:' : 'Commandes associées qui seront supprimées :'}
                  </p>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                    {deleteModal.linkedOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#FF6B00] dark:text-[#FFAA2C]">
                              {ord.trackingCode}
                            </span>
                            <span className="text-[11px] text-[#0F172A] dark:text-white font-bold truncate">
                              {ord.fullName}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#A1A1AA] font-mono truncate">
                            {ord.phone} • {lang === 'ar' ? ord.wilayaNameAr : ord.wilayaNameFr}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-[#FF6B00] block text-xs">
                            {formatDZD(ord.total, lang)}
                          </span>
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/5 text-[#A1A1AA] font-mono">
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>
                  {lang === 'ar'
                    ? 'لا توجد أي طلبية سابقة تحتوي على هذا المنتج. الحذف آمن ولن يؤثر على سجل الطلبيات.'
                    : 'Aucune commande existante ne contient ce produit. Le produit peut être retiré en toute sécurité.'}
                </span>
              </div>
            )}

            {/* EXPLICIT CONFIRMATION MESSAGE & CHECKBOX */}
            <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={deleteModal.isConfirmed}
                  onChange={(e) => setDeleteModal((prev) => ({ ...prev, isConfirmed: e.target.checked }))}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-white/20 bg-white dark:bg-white/5 text-red-500 focus:ring-red-500 cursor-pointer accent-red-500"
                />
                <div className="text-xs">
                  <p className="font-bold text-[#0F172A] dark:text-[#F5F5F7]">
                    {lang === 'ar'
                      ? 'رسالة تأكيد الحذف النهائي وغير القابل للاسترجاع'
                      : 'Confirmation explicite de suppression irréversible'}
                  </p>
                  <p className="text-[#64748B] dark:text-[#A1A1AA] text-[11px] mt-0.5 leading-relaxed font-medium">
                    {deleteModal.linkedOrders.length > 0
                      ? (lang === 'ar'
                          ? `أؤكد رغبتي الكاملة في حذف هذا المنتج وأوافق على حذف جميع الـ ${deleteModal.linkedOrders.length} طلبية المرتبطة به نهائياً.`
                          : `Je confirme vouloir supprimer ce produit et j'accepte la suppression définitive de toutes les ${deleteModal.linkedOrders.length} commande(s) associée(s).`)
                      : (lang === 'ar'
                          ? 'أؤكد رغبتي في حذف هذا المنتج نهائياً من قاعدة البيانات والكتالوج.'
                          : 'Je confirme vouloir supprimer définitivement ce produit du catalogue et de la base de données.')}
                  </p>
                </div>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-black/10 dark:border-white/10">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, products: [], linkedOrders: [], isDeleting: false, isConfirmed: false })}
                disabled={deleteModal.isDeleting}
                className="px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold text-[#64748B] dark:text-[#A1A1AA] hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {lang === 'ar' ? 'إلغاء' : 'Annuler'}
              </button>

              <button
                type="button"
                onClick={handleConfirmDeleteProducts}
                disabled={deleteModal.isDeleting || !deleteModal.isConfirmed}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
                  deleteModal.isConfirmed && !deleteModal.isDeleting
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30 cursor-pointer'
                    : 'bg-red-950/40 text-red-400/50 border border-red-500/20 cursor-not-allowed'
                }`}
                title={!deleteModal.isConfirmed ? (lang === 'ar' ? 'يرجى تحديد مربع التأكيد للمتابعة' : 'Veuillez cocher la confirmation pour continuer') : ''}
              >
                {deleteModal.isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{lang === 'ar' ? 'جارٍ الحذف...' : 'Suppression...'}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>
                      {deleteModal.linkedOrders.length > 0
                        ? (lang === 'ar'
                            ? `تأكيد الحذف ومعها ${deleteModal.linkedOrders.length} طلبية`
                            : `Supprimer (${deleteModal.linkedOrders.length} commande(s) incluses)`)
                        : (lang === 'ar' ? 'تأكيد الحذف النهائي' : 'Confirmer la suppression')}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ADMIN PROFILE & ACCOUNT MODAL ==================== */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#14141B] border border-white/15 rounded-3xl w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-5 sm:space-y-6 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FF6B00]/15 border border-[#FF6B00]/30 flex items-center justify-center text-[#FF6B00]">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-[#F5F5F7]">
                  {lang === 'ar' ? 'الملف الشخصي للمسؤول' : 'Profil Administrateur'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1 text-[#A1A1AA] hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Hero Card */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FF6B00] via-[#FFAA2C] to-[#E05E00] text-black font-black text-lg font-mono flex items-center justify-center shadow-lg shadow-[#FF6B00]/30 shrink-0">
                  {getInitials(user?.name, user?.email)}
                </div>
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#25D366] ring-2 ring-[#14141B]" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-[#F5F5F7] truncate">
                  {user?.name?.trim() || (lang === 'ar' ? 'مسؤول النظام' : 'Directeur Admin DZ')}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-full bg-[#FF6B00]/15 text-[#FFAA2C] border border-[#FF6B00]/30 text-[10px] font-mono font-bold uppercase">
                    {lang === 'ar' ? 'مسؤول النظام' : 'Administrateur'}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {lang === 'ar' ? 'متصل' : 'En ligne'}
                  </span>
                </div>
                <p className="text-xs text-[#A1A1AA] font-mono mt-1 truncate">
                  {user?.email || 'admin@bikastore.dz'}
                </p>
              </div>
            </div>

            {/* Session & Security Info */}
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <span className="text-[#A1A1AA]">{lang === 'ar' ? 'نوع المصادقة' : 'Authentification'}</span>
                <span className="font-mono text-emerald-400 font-semibold">Supabase Auth (Cloud)</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <span className="text-[#A1A1AA]">{lang === 'ar' ? 'صلاحيات الحساب' : 'Permissions'}</span>
                <span className="font-mono text-[#FFAA2C] font-semibold">{lang === 'ar' ? 'تحكم كامل (Root Admin)' : 'Accès Total (Root Admin)'}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <span className="text-[#A1A1AA]">{lang === 'ar' ? 'مدة الجلسة' : 'Durée de session'}</span>
                <span className="font-mono text-[#F5F5F7]">{lang === 'ar' ? '7 أسابيع (نشطة)' : '7 semaines (Active)'}</span>
              </div>
            </div>

            {/* Quick Navigation Shortcuts */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setAdminTab('users');
                  setIsProfileModalOpen(false);
                }}
                className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#F5F5F7] flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#FFAA2C]" />
                  <span>{lang === 'ar' ? 'إدارة المستخدمين والأمان' : 'Gérer les utilisateurs et sécurité'}</span>
                </div>
                <span className="text-[10px] text-[#A1A1AA] font-mono">→</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdminTab('delivery_fees');
                  setIsProfileModalOpen(false);
                }}
                className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#F5F5F7] flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#FFAA2C]" />
                  <span>{lang === 'ar' ? 'إعدادات أسعار التوصيل' : 'Gérer les tarifs de livraison'}</span>
                </div>
                <span className="text-[10px] text-[#A1A1AA] font-mono">→</span>
              </button>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setIsProfileModalOpen(false);
                  handleLogout();
                }}
                className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Déconnexion'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'إغلاق' : 'Fermer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== GENERIC CUSTOM RESPONSIVE CONFIRMATION MODAL (NO BROWSER DEFAULT POPUP) ==================== */}
      {genericConfirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#14141B] border border-white/15 rounded-3xl w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                    genericConfirmModal.isDanger
                      ? 'bg-red-500/15 border-red-500/30 text-red-400'
                      : 'bg-[#FF6B00]/15 border-[#FF6B00]/30 text-[#FFAA2C]'
                  }`}
                >
                  {genericConfirmModal.isDanger ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F5F5F7]">
                    {genericConfirmModal.title}
                  </h3>
                  <span className="text-[10px] font-mono text-[#A1A1AA] uppercase">
                    {lang === 'ar' ? 'تأكيد العملية' : 'Action Requise'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGenericConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="p-1.5 text-[#A1A1AA] hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description Body */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/10 dark:border-white/10">
              <p className="text-xs sm:text-sm text-[#0F172A] dark:text-[#E4E4E7] leading-relaxed font-semibold">
                {genericConfirmModal.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-black/10 dark:border-white/10">
              <button
                type="button"
                onClick={() => setGenericConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                disabled={genericConfirmModal.isLoading}
                className="px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold text-[#64748B] dark:text-[#A1A1AA] hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {genericConfirmModal.cancelText || (lang === 'ar' ? 'إلغاء' : 'Annuler')}
              </button>

              <button
                type="button"
                disabled={genericConfirmModal.isLoading}
                onClick={async () => {
                  try {
                    setGenericConfirmModal((prev) => ({ ...prev, isLoading: true }));
                    await genericConfirmModal.onConfirm();
                  } catch (err) {
                    console.error('Confirm modal action failed:', err);
                  } finally {
                    setGenericConfirmModal((prev) => ({ ...prev, isLoading: false }));
                  }
                }}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg cursor-pointer ${
                  genericConfirmModal.isDanger
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                    : 'bg-gradient-to-r from-[#FF6B00] to-[#FFAA2C] text-black shadow-[#FF6B00]/25'
                }`}
              >
                {genericConfirmModal.isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{lang === 'ar' ? 'جارٍ المعالجة...' : 'En cours...'}</span>
                  </>
                ) : (
                  <span>{genericConfirmModal.confirmText || (lang === 'ar' ? 'تأكيد' : 'Confirmer')}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
