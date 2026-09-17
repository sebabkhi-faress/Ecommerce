'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'fr' | 'ar';

interface LanguageContextType {
  lang: Language;
  dir: 'ltr' | 'rtl';
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  fr: {
    // Header & Navigation
    'announcement.marquee': '🔥 LIVRAISON EXPRESS SUR 68 WILAYAS — PAIEMENT À LA LIVRAISON (COD) — GARANTIE 1 AN 🔥',
    'nav.home': 'Accueil',
    'nav.products': 'Produits',
    'nav.deals': 'Offres Flash',
    'nav.categories': 'Catégories',
    'nav.guarantees': 'Garanties',
    'nav.admin': 'Portail Admin',
    'nav.cart': 'Panier',
    'nav.search': 'Rechercher un produit high-tech...',
    'nav.quick_order': 'Achat Express',

    // Hero
    'hero.badge': 'NOUVELLE COLLECTION TECH 2026',
    'hero.title_part1': 'L’ÉLÉGANCE TECH',
    'hero.title_part2': 'PURE & MINIMALISTE.',
    'hero.subtitle': 'Découvrez une sélection exclusive de gadgets audio Hi-Fi, chargeurs GaN et accessoires MagSafe. Conçus pour les passionnés de design et de haute performance en Algérie.',
    'hero.cta_buy': 'Acheter maintenant',
    'hero.cta_explore': 'Explorer le catalogue',
    'hero.stat_wilayas': '68 Wilayas desservies',
    'hero.stat_delivery': 'Livraison 24 - 48h',
    'hero.stat_cod': 'Paiement à la livraison',
    'hero.stat_warranty': 'Garantie Authentique',

    // Flash Deals
    'deals.title': 'VENTES FLASH DU JOUR',
    'deals.subtitle': 'Stocks limités au prix de lancement. Expédition immédiate.',
    'deals.ends_in': 'Se termine dans :',
    'deals.days': 'J',
    'deals.hours': 'H',
    'deals.minutes': 'M',
    'deals.seconds': 'S',
    'deals.claimed': 'vendus',

    // Categories
    'categories.title': 'UNIVERS HIGH-TECH',
    'categories.subtitle': 'Une gamme d’équipements premium pensée pour votre quotidien numérique.',
    'categories.view_all': 'Voir toute la collection',

    // Products
    'products.featured_title': 'SÉLECTION FLAGSHIP',
    'products.featured_subtitle': 'Les appareils les plus plébiscités par la communauté tech algérienne.',
    'products.all': 'Tous',
    'products.earbuds': 'Écouteurs',
    'products.headphones': 'Casques',
    'products.speakers': 'Enceintes',
    'products.chargers': 'GaN 100W+',
    'products.powerbanks': 'Power Banks',
    'products.buy_now': 'Commander (1-Clic)',
    'products.add_to_cart': 'Ajouter au panier',
    'products.in_stock': 'En stock immédiat',
    'products.limited_stock': 'Pièces restantes',
    'products.reviews': 'avis vérifiés',
    'products.original_product': '100% Produit Certifié',

    // Trust Pillars
    'trust.title': 'POURQUOI COMMANDER CHEZ ELECTRONICS ?',
    'trust.subtitle': 'Une expérience d’achat sans compromis, sécurisée et rapide.',
    'trust.p1_title': 'Livraison Rapide 68 Wilayas',
    'trust.p1_desc': 'Expédition soignée en 24h à Alger, Oran, Constantine et 48h dans toute l’Algérie.',
    'trust.p2_title': 'Paiement à la Livraison (COD)',
    'trust.p2_desc': 'Vous ne payez rien d’avance. Vérifiez votre colis avant de régler le livreur.',
    'trust.p3_title': 'Garantie Remplacement 1 An',
    'trust.p3_desc': 'Tous nos produits sont neufs, testés et accompagnés d’un SAV réactif.',
    'trust.p4_title': 'Support Client DZ 7j/7',
    'trust.p4_desc': 'Assistance directe par WhatsApp et appel téléphonique pour toutes vos questions.',

    // Testimonials
    'testimonials.title': 'CE QU’EN DISENT NOS CLIENTS',
    'testimonials.subtitle': 'Plus de 3 500 clients satisfaits à travers toute l’Algérie.',

    // COD Checkout Form
    'checkout.modal_title': 'COMMANDE EXPRESS (1-CLIC)',
    'checkout.modal_subtitle': 'Remplissez le formulaire ci-dessous pour valider votre commande. Paiement en espèces à la livraison.',
    'checkout.full_name': 'Nom et Prénom',
    'checkout.full_name_placeholder': 'Ex: Amine Benali',
    'checkout.phone': 'Numéro de Téléphone',
    'checkout.phone_placeholder': '05 XX XX XX XX / 06 / 07',
    'checkout.phone_hint': 'Votre numéro servira au livreur pour convenir du créneau de livraison.',
    'checkout.wilaya': 'Sélectionnez votre Wilaya (01-68)',
    'checkout.commune': 'Commune / Adresse de livraison',
    'checkout.commune_placeholder': 'Ex: Bab Ezzouar, Cité 5 Juillet, Bât 12',
    'checkout.delivery_mode': 'Mode de livraison :',
    'checkout.home_delivery': 'Livraison à Domicile',
    'checkout.desk_delivery': 'Point Relais / Bureau (Stop Desk)',
    'checkout.notes': 'Remarques éventuelles (optionnel)',
    'checkout.notes_placeholder': 'Heure de disponibilité préférée...',
    'checkout.order_summary': 'Récapitulatif de votre commande',
    'checkout.subtotal': 'Sous-total articles :',
    'checkout.delivery_fee': 'Frais de livraison :',
    'checkout.total': 'Total à payer à la livraison :',
    'checkout.confirm_button': 'CONFIRMER LA COMMANDE — PAIEMENT À LA LIVRAISON',
    'checkout.security_note': '🔒 Aucun paiement en ligne requis. Vos informations sont strictement confidentielles.',
    'checkout.select_wilaya_alert': 'Veuillez choisir votre wilaya.',
    'checkout.phone_error': 'Numéro invalide. Format algérien requis : 05/06/07 suivi de 8 chiffres.',

    // Order Success
    'success.title': 'COMMANDE ENREGISTRÉE AVEC SUCCÈS !',
    'success.subtitle': 'Merci pour votre confiance. Notre équipe logistique prépare votre colis.',
    'success.order_id': 'Référence commande :',
    'success.next_steps_title': 'Que va-t-il se passer maintenant ?',
    'success.step1': 'Notre service client vous appellera sous 1 à 2 heures pour confirmer l’adresse.',
    'success.step2': 'Votre colis est expédié via notre transporteur express avec numéro de suivi.',
    'success.step3': 'Vous réglez le montant en espèces au livreur lors de la remise en main propre.',
    'success.whatsapp_confirm': 'Confirmer rapidement sur WhatsApp',
    'success.back_home': 'Retourner à la boutique',
    'success.print': 'Imprimer le reçu',

    // Cart Drawer
    'cart.title': 'VOTRE PANIER TECH',
    'cart.empty': 'Votre panier est actuellement vide.',
    'cart.empty_cta': 'Découvrir nos produits',
    'cart.qty': 'Quantité :',
    'cart.remove': 'Supprimer',
    'cart.checkout': 'Passer la commande express',
    'cart.continue': 'Continuer mes achats',

    // Product Detail Page
    'pdp.back': 'Retour aux produits',
    'pdp.color': 'Couleur / Finition :',
    'pdp.key_features': 'Points forts & Technologies',
    'pdp.specs': 'Fiche technique détaillée',
    'pdp.delivery_calc': 'Calculateur de livraison par Wilaya',
    'pdp.choose_wilaya': 'Choisissez votre wilaya :',
    'pdp.est_delay': 'Délai estimé :',
    'pdp.sticky_buy': 'Commander maintenant (COD)',

    // WhatsApp Assistance
    'whatsapp.badge': 'Besoin d’aide ? Contactez-nous',
    'whatsapp.agent': 'Support Client Algérie',
    'whatsapp.status': 'En ligne — Réponse rapide',
    'whatsapp.message': 'Salam ! Je souhaite avoir des informations ou commander sur Electronics.',

    // Footer
    'footer.description': 'La boutique en ligne référence en Algérie pour le matériel high-tech de nouvelle génération. Écouteurs, casques, chargeurs GaN et batteries MagSafe.',
    'footer.quick_links': 'Navigation Rapide',
    'footer.support': 'Aide & Logistique',
    'footer.payment_methods': 'Modes de règlement acceptés :',
    'footer.copyright': '© 2026 Electronics Algérie. Tous droits réservés. Designed for modern life.',
  },
  ar: {
    // Header & Navigation
    'announcement.marquee': '🔥 توصيل سريع لجميع الـ 68 ولاية — الدفع عند الاستلام — ضمان حقيقي لمدة سنة كاملة 🔥',
    'nav.home': 'الرئيسية',
    'nav.products': 'المنتجات',
    'nav.deals': 'العروض الحصرية',
    'nav.categories': 'التصنيفات',
    'nav.guarantees': 'الضمانات',
    'nav.admin': 'لوحة الإدارة',
    'nav.cart': 'السلة',
    'nav.search': 'ابحث عن أحدث المنتجات التقنية...',
    'nav.quick_order': 'طلب سريع',

    // Hero
    'hero.badge': 'تشكيلة التكنولوجيا الحديثة 2026',
    'hero.title_part1': 'أناقة التكنولوجيا',
    'hero.title_part2': 'بأعلى المعايير العالمية.',
    'hero.subtitle': 'اكتشف تشكيلة حصرية من السماعات اللاسلكية الاحترافية، شواحن GaN فائقة السرعة، وبطاريات ماغ سيف الذكية، مع توصيل سريع والدفع عند الاستلام في كل الجزائر.',
    'hero.cta_buy': 'تسوق الآن',
    'hero.cta_explore': 'استكشف الكتالوج',
    'hero.stat_wilayas': 'تغطية 68 ولاية',
    'hero.stat_delivery': 'توصيل خلال 24-48 ساعة',
    'hero.stat_cod': 'الدفع بعد فحص المنتج',
    'hero.stat_warranty': 'ضمان محلي معتمد',

    // Flash Deals
    'deals.title': 'عروض البرق الحصرية',
    'deals.subtitle': 'كميات محدودة بأسعار ترويجية مباشرة من المصنع.',
    'deals.ends_in': 'ينتهي العرض خلال :',
    'deals.days': 'يوم',
    'deals.hours': 'ساعة',
    'deals.minutes': 'دقيقة',
    'deals.seconds': 'ثانية',
    'deals.claimed': 'تم طلبها',

    // Categories
    'categories.title': 'أقسام المنتجات',
    'categories.subtitle': 'أجهزة وإكسسوارات مختارة بعناية لتلبي طموحاتك اليومية والمهنية.',
    'categories.view_all': 'عرض جميع الأقسام',

    // Products
    'products.featured_title': 'المنتجات الأكثر طلباً',
    'products.featured_subtitle': 'الأجهزة المفضلة لدى عشاق التقنية في الجزائر.',
    'products.all': 'الكل',
    'products.earbuds': 'سماعات البلوتوث',
    'products.headphones': 'سماعات الرأس',
    'products.speakers': 'مكبرات الصوت',
    'products.chargers': 'شواحن GaN 100W',
    'products.powerbanks': 'بطاريات ماغ سيف',
    'products.buy_now': 'طلب فوري (1-كليك)',
    'products.add_to_cart': 'إضافة إلى السلة',
    'products.in_stock': 'متوفر في المخزن فوراً',
    'products.limited_stock': 'قطع متبقية فقط',
    'products.reviews': 'تقييم موثق',
    'products.original_product': '100% منتج أصلي ومضمون',

    // Trust Pillars
    'trust.title': 'لماذا تختار متجر ELECTRONICS ؟',
    'trust.subtitle': 'تجربة شراء استثنائية، سريعة وآمنة 100% في الجزائر.',
    'trust.p1_title': 'توصيل فائق السرعة لـ 68 ولاية',
    'trust.p1_desc': 'شحن احترافي خلال 24 ساعة للجزائر والمدن الكبرى، و 48 ساعة لكافة الولايات.',
    'trust.p2_title': 'الدفع عند الاستلام (COD)',
    'trust.p2_desc': 'لا تدفع أي سنتيم مسبقاً، افحص علبة طلبك وتأكد منها قبل تسليم المبلغ للناقل.',
    'trust.p3_title': 'ضمان استبدال حقيقي 1 سنة',
    'trust.p3_desc': 'جميع أجهزتنا أصلية ومفحوصة مع خدمة ما بعد البيع ومتابعة مستمرة.',
    'trust.p4_title': 'خدمة عملاء جزائرية 7/7',
    'trust.p4_desc': 'تواصل مباشر عبر الواتساب والمكالمات الهاتفية للرد على استفساراتكم ومتابعة شحناتكم.',

    // Testimonials
    'testimonials.title': 'آراء وتجارب زبائننا',
    'testimonials.subtitle': 'أكثر من 3500 زبون يثقون في متجرنا عبر كافة الولايات.',

    // COD Checkout Form
    'checkout.modal_title': 'الطلب السريع المباشر (الدفع عند الاستلام)',
    'checkout.modal_subtitle': 'املأ بياناتك بدقة لتأكيد طلبك في ثوانٍ معدودة بدون الحاجة لأي بطاقة بنكية.',
    'checkout.full_name': 'الاسم واللقب',
    'checkout.full_name_placeholder': 'مثال: محمد بن علي',
    'checkout.phone': 'رقم الهاتف الشخصي',
    'checkout.phone_placeholder': '05 XX XX XX XX / 06 / 07',
    'checkout.phone_hint': 'سيتصل بك الموزع على هذا الرقم لتحديد موعد ومكان التسليم.',
    'checkout.wilaya': 'اختر الولاية (من 01 إلى 68)',
    'checkout.commune': 'البلدية وعنوان السكن بالتفصيل',
    'checkout.commune_placeholder': 'مثال: باب الزوار، حي 5 جويلية، عمارة 12',
    'checkout.delivery_mode': 'مكان الاستلام المفضل :',
    'checkout.home_delivery': 'توصيل حتى باب المنزل',
    'checkout.desk_delivery': 'استلام من مكتب شركة التوصيل (Stop Desk)',
    'checkout.notes': 'ملاحظات إضافية (اختياري)',
    'checkout.notes_placeholder': 'الوقت المفضل للتسليم أو أي توجيه للموزع...',
    'checkout.order_summary': 'ملخص الطلب',
    'checkout.subtotal': 'سعر المنتجات :',
    'checkout.delivery_fee': 'تكلفة التوصيل :',
    'checkout.total': 'المبلغ الإجمالي عند الاستلام :',
    'checkout.confirm_button': 'تأكيد الطلب — الدفع عند الاستلام',
    'checkout.security_note': '🔒 لا يوجد أي دفع عبر الإنترنت. بياناتك محمية وتستخدم للتوصيل فقط.',
    'checkout.select_wilaya_alert': 'يرجى تحديد الولاية للاستمرار.',
    'checkout.phone_error': 'رقم الهاتف غير صالح. يرجى إدخال رقم جزائري صحيح يبدأ بـ 05 أو 06 أو 07.',

    // Order Success
    'success.title': 'تم تسجيل طلبك بنجاح تام !',
    'success.subtitle': 'شكراً لثقتكم. جاري الآن تجهيز وتغليف طلبكم باحترافية.',
    'success.order_id': 'رقم تتبع الطلب :',
    'success.next_steps_title': 'ما هي الخطوة القادمة ؟',
    'success.step1': 'سيتصل بك موظف خدمة العملاء خلال 1-2 ساعة لتأكيد العنوان والطلبية.',
    'success.step2': 'يتم شحن الطرد فوراً مع شركة التوصيل السريع وإرسال رسالة نصية.',
    'success.step3': 'تدفع المبلغ نقداً للموزع عند استلام الطرد وفحصه.',
    'success.whatsapp_confirm': 'تأكيد فوري وسريع عبر واتساب',
    'success.back_home': 'العودة للصفحة الرئيسية',
    'success.print': 'طباعة وصل الطلب',

    // Cart Drawer
    'cart.title': 'سلة المشتريات',
    'cart.empty': 'سلتك فارغة حالياً.',
    'cart.empty_cta': 'تصفح أحدث المنتجات',
    'cart.qty': 'الكمية :',
    'cart.remove': 'حذف',
    'cart.checkout': 'إتمام الطلب السريع',
    'cart.continue': 'متابعة التسوق',

    // Product Detail Page
    'pdp.back': 'العودة للمنتجات',
    'pdp.color': 'اللون / الإصدار :',
    'pdp.key_features': 'أبرز المزايا والتقنيات',
    'pdp.specs': 'المواصفات التقنية الدقيقة',
    'pdp.delivery_calc': 'حاسبة تكلفة التوصيل حسب الولاية',
    'pdp.choose_wilaya': 'اختر ولايتك لمعرفة التكلفة والمدة :',
    'pdp.est_delay': 'مدة الوصول التقديرية :',
    'pdp.sticky_buy': 'اطلب الآن (الدفع عند الاستلام)',

    // WhatsApp Assistance
    'whatsapp.badge': 'هل لديك استفسار ؟ نحن في الخدمة',
    'whatsapp.agent': 'خدمة الزبائن الجزائر',
    'whatsapp.status': 'متواجدون حالياً — رد فوري',
    'whatsapp.message': 'السلام عليكم ! أود الاستفسار أو الطلب عبر متجركم Electronics.',

    // Footer
    'footer.description': 'المتجر الإلكتروني الأول في الجزائر للأجهزة والملحقات التقنية الحديثة. سماعات احترافية، شواحن GaN فائقة السرعة وبطاريات ماغ سيف الذكية.',
    'footer.quick_links': 'روابط سريعة',
    'footer.support': 'المساعدة والتوصيل',
    'footer.payment_methods': 'طرق الدفع المعتمدة :',
    'footer.copyright': '© 2026 Electronics الجزائر. جميع الحقوق محفوظة. صُمم للمستقبل.',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('fr');

  useEffect(() => {
    // Read preference from localStorage
    const saved = localStorage.getItem('electronics_lang') as Language | null;
    if (saved === 'ar' || saved === 'fr') {
      setLangState(saved);
      applyLang(saved);
    } else {
      applyLang('fr');
    }
  }, []);

  const applyLang = (targetLang: Language) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.lang = targetLang;
    root.dir = targetLang === 'ar' ? 'rtl' : 'ltr';
    if (targetLang === 'ar') {
      root.classList.add('font-arabic');
      root.classList.remove('font-latin');
      document.body?.classList.add('font-arabic');
      document.body?.classList.remove('font-latin');
    } else {
      root.classList.add('font-latin');
      root.classList.remove('font-arabic');
      document.body?.classList.add('font-latin');
      document.body?.classList.remove('font-arabic');
    }
  };

  const setLanguage = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('electronics_lang', newLang);
    applyLang(newLang);
  };

  const toggleLanguage = () => {
    const nextLang = lang === 'fr' ? 'ar' : 'fr';
    setLanguage(nextLang);
  };

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations['fr']?.[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        dir: lang === 'ar' ? 'rtl' : 'ltr',
        toggleLanguage,
        setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
