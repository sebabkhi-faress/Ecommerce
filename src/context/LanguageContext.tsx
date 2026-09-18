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
    'trust.title': 'POURQUOI COMMANDER CHEZ BIKA STORE ?',
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
    'whatsapp.message': 'Salam ! Je souhaite avoir des informations ou commander sur Bika Store.',

    // Announcement & Eyebrows
    'announcement.badge_cod': 'COD ALGÉRIE 2026',
    'announcement.badge_aesthetic': 'TECH PURE & DESIGN MINIMALISTE',
    'categories.eyebrow': 'ÉCOSYSTÈME HIGH-TECH',
    'products.eyebrow': 'SÉLECTION OFFICIELLE 2026',
    'trust.eyebrow': 'COMMERCE SÉCURISÉ & LOCAL',
    'testimonials.eyebrow': 'COMMUNAUTÉ TECH DZ',

    // Admin Dashboard
    'admin.live_badge': 'ADMIN CONSOLE DZ • EN DIRECT',
    'admin.title': 'Tableau de bord — Commandes COD',
    'admin.add_product': 'Ajouter un produit',
    'admin.store': 'Boutique',
    'admin.logout': 'Déconnexion',
    'admin.total_revenue': 'Revenu Global (DZD)',
    'admin.revenue_desc': 'Chiffre d’affaires encaissé & en cours',
    'admin.total_orders': 'Total Commandes',
    'admin.orders_desc': 'Sur l’ensemble des 68 Wilayas',
    'admin.pending_orders': 'En Attente Confirmation',
    'admin.pending_desc': 'Appels de confirmation à effectuer',
    'admin.delivered_orders': 'Livrées avec Succès',
    'admin.delivered_desc': 'Colis remis et fonds reçus',
    'admin.search_placeholder': 'Rechercher par nom, téléphone, wilaya, code suivi...',
    'admin.all_statuses': 'Tous les statuts',
    'admin.all_wilayas': 'Toutes les wilayas (68)',
    'admin.recent_orders': 'Commandes récentes',
    'admin.live_update': 'Mise à jour instantanée',
    'admin.th_tracking': 'Réf. Suivi',
    'admin.th_client': 'Client',
    'admin.th_phone': 'Téléphone',
    'admin.th_wilaya': 'Wilaya & Commune',
    'admin.th_items': 'Articles',
    'admin.th_total': 'Total (DZD)',
    'admin.th_status': 'Statut Actuel',
    'admin.th_actions': 'Modifier Statut',
    'admin.status_pending': 'En attente',
    'admin.status_confirmed': 'Confirmée',
    'admin.status_in_delivery': 'En cours d’acheminement',
    'admin.status_delivered': 'Livrée & Encaissée',
    'admin.status_cancelled': 'Annulée',
    'admin.status_retour': 'Retour (Colis retourné)',
    'admin.no_orders': 'Aucune commande ne correspond aux filtres sélectionnés.',
    'admin.home_delivery': 'À domicile',
    'admin.desk_delivery': 'Stop Desk',
    'admin.modal_add_title': 'Ajouter un produit (FR & AR)',
    'admin.add_success': 'Produit ajouté avec succès au catalogue !',
    'admin.lbl_name_fr': 'Nom du produit (Français) *',
    'admin.lbl_name_ar': 'اسم المنتج (باللغة العربية) *',
    'admin.lbl_category': 'Catégorie',
    'admin.lbl_price': 'Prix en DZD *',
    'admin.lbl_image': 'URL de l’image',
    'admin.img_validated': '✓ Aperçu instantané validé',
    'admin.btn_save': 'Valider et Enregistrer',

    // Footer
    'footer.description': 'La boutique en ligne référence en Algérie pour le matériel high-tech de nouvelle génération. Écouteurs, casques, chargeurs GaN et batteries MagSafe.',
    'footer.quick_links': 'Navigation Rapide',
    'footer.support': 'Aide & Logistique',
    'footer.payment_methods': 'Modes de règlement acceptés :',
    'footer.copyright': '© 2026 Bika Store Algérie. Tous droits réservés. Designed for modern life.',

    // Extra UI titles & labels
    'hero.flagship_badge': 'FLAGSHIP 2026',
    'deals.limited_offer': 'OFFRE À DURÉE LIMITÉE',
    'products.original_badge': '100% ORIGINAL',
    'pdp.not_found_title': 'Produit non trouvé',
    'pdp.not_found_desc': 'Le produit que vous recherchez n’existe pas ou a été déplacé.',
    'pdp.back_home': 'Retour à l’accueil',
    'pdp.fast_order_title': 'Formulaire de commande express immédiate',
    'pdp.delivery_home': 'Livraison à Domicile :',
    'pdp.delivery_desk': 'Stop Desk (Bureau) :',
    'pdp.delivery_delay': 'Délai :',
    'pdp.business_days': 'jours ouvrés',
    'pdp.cod_badge': 'Paiement COD',
    'pdp.price_label': 'Prix :',
    'pdp.remaining_pieces': 'restantes',
    'success.badge': 'PAIEMENT À LA LIVRAISON CONFIRMÉ',
    'success.recipient': 'Destinataire :',
    'success.delivery_location': 'Lieu de livraison :',
    'success.mode': 'Mode :',
    'success.home_delivery': 'À domicile',
    'success.desk_delivery': 'Stop Desk (Point relais)',
    'success.ordered_items': 'Articles commandés',
    'success.qty': 'Qté :',
    'success.subtotal': 'Sous-total articles :',
    'success.delivery_fee_label': 'Frais de livraison',
    'success.total_cash': 'Total en espèces :',
    'success.copy_tooltip': 'Copier le code',
    'checkout.express_badge': 'EXPRESS COD CHECKOUT',
    'checkout.cart_empty_note': 'Note : Votre panier était vide, nous avons pré-sélectionné le flagship Aura Pro 2 pour votre commande.',
    'checkout.return_shop': 'Retour à la boutique',
    'checkout.order_title': 'Validation de commande — Paiement à la livraison',
    'checkout.order_subtitle': 'Renseignez vos coordonnées de livraison. Votre commande sera expédiée avec suivi dans toute l’Algérie.',
    'checkout.inspect_guarantee': 'Vérification du colis avant paiement garantie',
    'checkout.days': 'j',
    'checkout.articles_count': 'article(s)',
    'checkout.qty_label': 'Qté :',
    'footer.wilayas_badge': '68 Wilayas Express',
    'footer.cod_badge': '100% Cash on Delivery',
    'footer.contact_title': 'Algérie & Contact',
    'footer.address': 'Bab Ezzouar & Hydra, Alger, Algérie',
    'footer.opening_hours': '7j/7 : 08:30 — 21:00',
    'footer.bottom_cod': 'DZ • COD PAYMENT',
    'footer.bottom_aesthetic': 'NOTHING TECH AESTHETIC',
    'trust.p1_tag': '24-48H DZ',
    'trust.p2_tag': '100% COD',
    'trust.p3_tag': '1 AN SAV',
    'trust.p4_tag': '7J/7 DZ',
    'admin.login_title': 'PORTAIL ADMIN BIKA STORE',
    'admin.login_subtitle': 'Gestion logistique des 68 Wilayas & Commandes COD',
    'admin.default_creds': 'Identifiants par défaut :',
    'admin.email_label': 'Email Administrateur',
    'admin.password_label': 'Mot de passe',
    'admin.btn_login': 'Accéder au Dashboard',
    'admin.logging_in': 'Connexion...',
    'admin.back_shop': 'Retour à la boutique',
    'cart.estimated_total': 'Total estimé',
    'cart.calculated_by_wilaya': 'Calculé selon la wilaya',
    'cart.cash_guarantee': 'Paiement en espèces à la livraison',
    'cart.delete': 'Supprimer',
  },
  ar: {
    // Header & Navigation
    'announcement.marquee': '🔥 توصيل سريع لجميع الـ 68 ولاية — الدفع عند الاستلام — ضمان حقيقي لمدة سنة كاملة 🔥',
    'announcement.badge_cod': 'الدفع عند الاستلام الجزائر 2026',
    'announcement.badge_aesthetic': 'تكنولوجيا فائقة وتصميم استثنائي',
    'categories.eyebrow': 'منظومة الأجهزة الذكية',
    'products.eyebrow': 'التشكيلة الحصرية 2026',
    'trust.eyebrow': 'تسوق آمن ومحلي 100%',
    'testimonials.eyebrow': 'مجتمع عشاق التقنية في الجزائر',

    // Admin Dashboard
    'admin.live_badge': 'لوحة الإدارة الجزائر • مباشر',
    'admin.title': 'لوحة التحكم — طلبات الدفع عند الاستلام',
    'admin.add_product': 'إضافة منتج',
    'admin.store': 'المتجر',
    'admin.logout': 'تسجيل الخروج',
    'admin.total_revenue': 'الدخل الإجمالي (د.ج)',
    'admin.revenue_desc': 'رقم الأعمال المحصل وقيد المعالجة',
    'admin.total_orders': 'إجمالي الطلبات',
    'admin.orders_desc': 'عبر كافة الـ 68 ولاية',
    'admin.pending_orders': 'في انتظار التأكيد',
    'admin.pending_desc': 'مكالمات التأكيد المطلوبة',
    'admin.delivered_orders': 'تم التوصيل بنجاح',
    'admin.delivered_desc': 'تم تسليم الطرود واستلام الأموال',
    'admin.search_placeholder': 'البحث بالاسم، الهاتف، الولاية، رقم التتبع...',
    'admin.all_statuses': 'جميع الحالات',
    'admin.all_wilayas': 'جميع الولايات (68)',
    'admin.recent_orders': 'الطلبات الأخيرة',
    'admin.live_update': 'تحديث فوري',
    'admin.th_tracking': 'رقم التتبع',
    'admin.th_client': 'الزبون',
    'admin.th_phone': 'الهاتف',
    'admin.th_wilaya': 'الولاية والبلدية',
    'admin.th_items': 'المنتجات',
    'admin.th_total': 'الإجمالي (د.ج)',
    'admin.th_status': 'الحالة الحالية',
    'admin.th_actions': 'تعديل الحالة',
    'admin.status_pending': 'في الانتظار',
    'admin.status_confirmed': 'مؤكدة',
    'admin.status_in_delivery': 'قيد التوصيل',
    'admin.status_delivered': 'تم التسليم والتحصيل',
    'admin.status_cancelled': 'ملغاة',
    'admin.status_retour': 'مرتجع (طرد غير مستلم)',
    'admin.no_orders': 'لا توجد طلبات تطابق معايير البحث المحددة.',
    'admin.home_delivery': 'لباب المنزل',
    'admin.desk_delivery': 'مكتب التوصيل',
    'admin.modal_add_title': 'إضافة منتج جديد (باللغتين)',
    'admin.add_success': 'تمت إضافة المنتج بنجاح إلى الكتالوج !',
    'admin.lbl_name_fr': 'اسم المنتج (بالفرنسية) *',
    'admin.lbl_name_ar': 'اسم المنتج (بالعربية) *',
    'admin.lbl_category': 'القسم',
    'admin.lbl_price': 'السعر بالدينار (د.ج) *',
    'admin.lbl_image': 'رابط صورة المنتج',
    'admin.img_validated': '✓ تم التحقق من معاينة الصورة',
    'admin.btn_save': 'حفظ وإضافة للمتجر',
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
    'trust.title': 'لماذا تختار متجر Bika Store ؟',
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
    'whatsapp.message': 'السلام عليكم ! أود الاستفسار أو الطلب عبر متجركم Bika Store.',

    // Footer
    'footer.description': 'المتجر الإلكتروني الأول في الجزائر للأجهزة والملحقات التقنية الحديثة. سماعات احترافية، شواحن GaN فائقة السرعة وبطاريات ماغ سيف الذكية.',
    'footer.quick_links': 'روابط سريعة',
    'footer.support': 'المساعدة والتوصيل',
    'footer.payment_methods': 'طرق الدفع المعتمدة :',
    'footer.copyright': '© 2026 Bika Store الجزائر. جميع الحقوق محفوظة. صُمم للمستقبل.',

    // Extra UI titles & labels
    'hero.flagship_badge': 'رائد 2026',
    'deals.limited_offer': 'عرض لفترة محدودة',
    'products.original_badge': '100% أصلي ومضمون',
    'pdp.not_found_title': 'المنتج غير متوفر',
    'pdp.not_found_desc': 'المنتج الذي تبحث عنه غير موجود أو تم نقله.',
    'pdp.back_home': 'العودة للرئيسية',
    'pdp.fast_order_title': 'طلب فوري مباشر دون مغادرة الصفحة',
    'pdp.delivery_home': 'توصيل لباب المنزل :',
    'pdp.delivery_desk': 'مكتب التوصيل (Stop Desk) :',
    'pdp.delivery_delay': 'المدة :',
    'pdp.business_days': 'أيام عمل',
    'pdp.cod_badge': 'دفع عند الاستلام',
    'pdp.price_label': 'السعر :',
    'pdp.remaining_pieces': 'قطع',
    'success.badge': 'تم تأكيد الدفع عند الاستلام',
    'success.recipient': 'المستلم :',
    'success.delivery_location': 'مكان التوصيل :',
    'success.mode': 'طريقة الاستلام :',
    'success.home_delivery': 'لباب المنزل',
    'success.desk_delivery': 'مكتب التوصيل (Stop Desk)',
    'success.ordered_items': 'المنتجات المطلوبة',
    'success.qty': 'الكمية :',
    'success.subtotal': 'المجموع الفرعي :',
    'success.delivery_fee_label': 'تكلفة التوصيل',
    'success.total_cash': 'المبلغ الإجمالي نقداً :',
    'success.copy_tooltip': 'نسخ الرمز',
    'checkout.express_badge': 'طلب فوري — دفع عند الاستلام',
    'checkout.cart_empty_note': 'ملاحظة: تم تحميل المنتج الأكثر طلباً تلقائياً (Aura Pro 2). يمكنك تعديل السلة في أي وقت.',
    'checkout.return_shop': 'العودة للمتجر',
    'checkout.order_title': 'إتمام الطلب — الدفع عند الاستلام',
    'checkout.order_subtitle': 'أدخل معلومات التوصيل الخاصة بك وسيتم إرسال طلبيتك إلى أي ولاية في الجزائر فوراً.',
    'checkout.inspect_guarantee': 'فحص ومعاينة الطرد قبل الدفع مضمونة 100%',
    'checkout.days': 'أيام',
    'checkout.articles_count': 'منتجات',
    'checkout.qty_label': 'الكمية :',
    'footer.wilayas_badge': 'توصيل لـ 68 ولاية سريعا',
    'footer.cod_badge': '100% الدفع عند الاستلام',
    'footer.contact_title': 'الجزائر والتواصل',
    'footer.address': 'باب الزوار وحيدرة، الجزائر العاصمة',
    'footer.opening_hours': 'طيلة أيام الأسبوع : 08:30 — 21:00',
    'footer.bottom_cod': 'الجزائر • الدفع عند الاستلام',
    'footer.bottom_aesthetic': 'تصميم عصري فائق الجودة',
    'trust.p1_tag': '24-48 ساعة',
    'trust.p2_tag': 'دفع عند الاستلام',
    'trust.p3_tag': 'ضمان سنة كاملة',
    'trust.p4_tag': 'خدمة 7/7',
    'admin.login_title': 'بوابة إدارة Bika Store',
    'admin.login_subtitle': 'إدارة لوجستية لـ 68 ولاية وطلبات الدفع عند الاستلام',
    'admin.default_creds': 'بيانات الدخول التجريبية :',
    'admin.email_label': 'البريد الإلكتروني للإدارة',
    'admin.password_label': 'كلمة المرور',
    'admin.btn_login': 'تسجيل الدخول للوحة التحكم',
    'admin.logging_in': 'جارٍ الدخول...',
    'admin.back_shop': 'العودة للمتجر الرئيسي',
    'cart.estimated_total': 'المجموع المقدر',
    'cart.calculated_by_wilaya': 'يُحسب حسب الولاية',
    'cart.cash_guarantee': 'الدفع نقداً عند استلام الطرد',
    'cart.delete': 'حذف',
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
