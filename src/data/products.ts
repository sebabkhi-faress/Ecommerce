export interface ProductColor {
  nameFr: string;
  nameAr: string;
  hex: string;
}

export interface Product {
  id: string;
  slug: string;
  nameFr: string;
  nameAr: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  isFlashDeal?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  inStock: boolean;
  stockCount: number;
  badgeFr?: string;
  badgeAr?: string;
  taglineFr: string;
  taglineAr: string;
  descriptionFr: string;
  descriptionAr: string;
  featuresFr: string[];
  featuresAr: string[];
  specs: { labelFr: string; labelAr: string; value: string }[];
  colors: ProductColor[];
  sizes?: string[];
  images: string[];
}

export const CATEGORIES = [
  {
    id: 'earbuds',
    nameFr: 'Écouteurs Sans Fil',
    nameAr: 'سماعات لاسلكية ANC',
    descriptionFr: 'Réduction active du bruit & son studio 24-bit',
    descriptionAr: 'عزل ضوضاء هجين وصوت نقي 24-بت',
    icon: 'Headphones',
    count: 3,
  },
  {
    id: 'headphones',
    nameFr: 'Casques ANC Pro',
    nameAr: 'سماعات رأس احترافية',
    descriptionFr: 'Confort supra-aural, 60h d’autonomie',
    descriptionAr: 'تصميم مريح فوق الأذن وبطارية تدوم 60 ساعة',
    icon: 'Radio',
    count: 2,
  },
  {
    id: 'speakers',
    nameFr: 'Enceintes Portables',
    nameAr: 'مكبرات صوت محمولة',
    descriptionFr: 'Étanchéité IPX7 & basses explosives 360°',
    descriptionAr: 'مقاومة للماء بمعيار IPX7 وصوت محيطي 360°',
    icon: 'Volume2',
    count: 2,
  },
  {
    id: 'chargers',
    nameFr: 'Chargeurs GaN 100W+',
    nameAr: 'شواحن GaN فائقة السرعة',
    descriptionFr: 'Technologie Nitrure de Gallium & câbles blindés',
    descriptionAr: 'تقنية نتريد الغاليوم لشحن الهواتف والحواسيب',
    icon: 'Zap',
    count: 3,
  },
  {
    id: 'powerbanks',
    nameFr: 'Power Banks MagSafe',
    nameAr: 'بطاريات وملحقات ذكية',
    descriptionFr: 'Aimantation Qi2 forte & design transparent cyber',
    descriptionAr: 'شحن مغناطيسي لاسلكي سريع وتصميم شفاف',
    icon: 'BatteryCharging',
    count: 2,
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    slug: 'aura-pro-2-anc',
    nameFr: 'Aura Pro 2 — Écouteurs ANC Transparent',
    nameAr: 'أورا برو 2 — سماعات لاسلكية شفافة مع عزل نشط',
    category: 'earbuds',
    price: 6800,
    originalPrice: 9500,
    rating: 4.9,
    reviewsCount: 142,
    isFlashDeal: true,
    isFeatured: true,
    isBestSeller: true,
    inStock: true,
    stockCount: 14,
    badgeFr: 'OFFRE FLASH -28%',
    badgeAr: 'عرض حصري -28%',
    taglineFr: 'Design transparent cyberpunk avec réduction de bruit -45dB',
    taglineAr: 'تصميم زجاجي مستقبلي شفاف مع عزل فائق للضوضاء -45dB',
    descriptionFr:
      'Les Aura Pro 2 combinent une esthétique translucide ultra-futuriste avec des transducteurs dynamiques de 11.6 mm. Profitez d’un son spatial immersif et d’une autonomie record de 36 heures avec l’écrin de charge.',
    descriptionAr:
      'تجمع سماعات أورا برو 2 بين التصميم المستقبلي الشفاف ومكبرات صوت ديناميكية 11.6 مم. استمتع بتجربة صوت ثلاثي الأبعاد وعزل هجين للضوضاء مع بطارية تدوم حتى 36 ساعة مع علبة الشحن.',
    featuresFr: [
      'Réduction active de bruit adaptative jusqu’à -45 dB',
      'Transducteur custom 11.6 mm avec diaphragme graphène',
      'Mode Transparence Smart Ambient 2.0',
      'Autonomie 36h avec boîtier compatible recharge sans fil Qi',
      'Certification IP54 résistante à la sueur et la poussière',
    ],
    featuresAr: [
      'عزل ذكي متكيف للضوضاء يصل إلى -45 ديسيبل',
      'مكبر صوت حصري 11.6 مم بغشاء الجرافين عالي النقاوة',
      'وضع الشفافية الذكي لسماع المحيط بوضوح',
      'بطارية 36 ساعة تدعم الشحن السريع والشحن اللاسلكي',
      'مقاومة للرذاذ والتعرق بمعيار IP54',
    ],
    specs: [
      { labelFr: 'Bluetooth', labelAr: 'البلوتوث', value: 'v5.4 Dual-Band Low Latency' },
      { labelFr: 'Autonomie écouteurs', labelAr: 'بطارية السماعة', value: '8.5 Heures (ANC Off)' },
      { labelFr: 'Autonomie totale', labelAr: 'البطارية الإجمالية', value: '36 Heures avec boîtier' },
      { labelFr: 'Port de charge', labelAr: 'منفذ الشحن', value: 'USB-C Ultra Fast + Qi Wireless' },
      { labelFr: 'Latence gaming', labelAr: 'تأخير الألعاب', value: '38ms Ultra-Low' },
    ],
    colors: [
      { nameFr: 'Noir Obsidian Fumé', nameAr: 'أسود بركاني مدخن', hex: '#121217' },
      { nameFr: 'Blanc Glace Transparent', nameAr: 'أبيض جليدي شفاف', hex: '#E2E8F0' },
    ],
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?q=80&w=1000&auto=format&fit=crop',
    ],
  },
  {
    id: 'prod-2',
    slug: 'apex-studio-90-anc',
    nameFr: 'Apex Studio 90 — Casque Hi-Res Wireless',
    nameAr: 'أبيكس ستوديو 90 — سماعات رأس محيطية احترافية Hi-Res',
    category: 'headphones',
    price: 14900,
    originalPrice: 18500,
    rating: 5.0,
    reviewsCount: 88,
    isFlashDeal: false,
    isFeatured: true,
    isBestSeller: true,
    inStock: true,
    stockCount: 7,
    badgeFr: 'BEST SELLER',
    badgeAr: 'الأكثر طلباً',
    taglineFr: 'Confort aluminium mat, certification Hi-Res Audio & 65h non-stop',
    taglineAr: 'هيكل ألومنيوم مطفي فاخر، شهادة صوت Hi-Res و 65 ساعة استماع متواصلة',
    descriptionFr:
      'L’Apex Studio 90 délivre une clarté acoustique digne des studios professionnels grâce à ses coussinets magnétiques en mousse mémoire de forme et ses haut-parleurs en titane de 40mm.',
    descriptionAr:
      'تقدم سماعات أبيكس ستوديو 90 نقاء صوتياً استثنائياً يضاهي استوديوهات التسجيل بفضل وسائد الأذن المغناطيسية المريحة ومحركات التيتانيوم 40 مم مع دعم كوديك LDAC عالي الدقة.',
    featuresFr: [
      'Haut-parleurs 40mm en bio-cellulose plaqué titane',
      'Codec LDAC certifié Hi-Res Audio Wireless 990 kbps',
      'Double micro beamforming anti-vent pour appels cristallins',
      'Coussinets en mousse à mémoire respirante ultra-doux',
      'Charge rapide : 10 minutes = 6 heures d’écoute',
    ],
    featuresAr: [
      'محركات 40 مم مغلفة بالتيتانيوم لصوت نقي وجهير عميق',
      'دعم بروتوكول LDAC وصوت Hi-Res اللاسلكي فائق الدقة',
      'ميكروفونات متعددة لعزل أصوات الرياح وضجيج المكالمات',
      'وسائد إسفنجية ناعمة تتنفس ومريحة للاستخدام الطويل',
      'شحن فائق السرعة: 10 دقائق تمنحك 6 ساعات من التشغيل',
    ],
    specs: [
      { labelFr: 'Autonomie', labelAr: 'عمر البطارية', value: '65 Heures (45h avec ANC)' },
      { labelFr: 'Poids', labelAr: 'الوزن', value: '254g ultra-léger' },
      { labelFr: 'Connexions', labelAr: 'الاتصال', value: 'Bluetooth 5.4 + Jack 3.5mm Hi-Fi' },
      { labelFr: 'Annulation active', labelAr: 'مستوى العزل', value: 'Hybride 4 micros (-48dB)' },
    ],
    colors: [
      { nameFr: 'Gris Sidéral Brossé', nameAr: 'رمادي فلكي معدني', hex: '#26262E' },
      { nameFr: 'Noir Titane Mat', nameAr: 'تيتانيوم أسود مطفي', hex: '#0F0F14' },
    ],
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=1000&auto=format&fit=crop',
    ],
  },
  {
    id: 'prod-3',
    slug: 'vibe-storm-cyber-speaker',
    nameFr: 'Vibe Storm Cyber — Enceinte 40W IPX7',
    nameAr: 'فايب ستورم سايبر — مكبر صوت مضاد للماء بقوة 40 واط',
    category: 'speakers',
    price: 8500,
    originalPrice: 11000,
    rating: 4.8,
    reviewsCount: 95,
    isFlashDeal: true,
    isFeatured: true,
    inStock: true,
    stockCount: 19,
    badgeFr: 'FLASH DEAL',
    badgeAr: 'تخفيض البرق',
    taglineFr: 'Basses profondes à 360°, anneau LED RGB ambre chaud & étanche IPX7',
    taglineAr: 'صوت جهير 360 درجة، حلقة إضاءة RGB كهرمانية دافئة ومقاومة كاملة للماء',
    descriptionFr:
      'L’enceinte portable par excellence pour toutes vos aventures en Algérie. De Tipaza aux dunes de Taghit, profitez d’un son surpuissant avec radiateurs passifs doubles et 24h d’autonomie.',
    descriptionAr:
      'المكبر المثالي لرحلاتك وتجمعاتك في كل أنحاء الجزائر. من شواطئ تيبازة إلى صحراء تاغيت، صوت بقوة 40 واط مع إشعاع صوتي 360 درجة وبطارية تدوم 24 ساعة.',
    featuresFr: [
      'Puissance 40W RMS avec technologie BassBoost Pro',
      'Étanche norme IPX7 (immersion 1 mètre pendant 30 min)',
      'Anneau lumineux synchrone avec lueurs ambrées tech',
      'Fonction TWS : couplez 2 enceintes pour un son stéréo 80W',
      'Powerbank intégré pour recharger votre smartphone',
    ],
    featuresAr: [
      'قوة صوت حقيقية 40 واط مع تقنية تضخيم البيس المتطورة',
      'مقاومة كاملة للغمر بالماء وفق معيار IPX7',
      'إضاءة نبضية كهرمانية تتفاعل بسلاسة مع الموسيقى',
      'إمكانية ربط سماعتين معاً بتقنية TWS لقوة 80 واط',
      'منفذ شحن مدمج لشحن هاتفك كبنك طاقة للطوارئ',
    ],
    specs: [
      { labelFr: 'Puissance', labelAr: 'القوة', value: '40W RMS (Peak 60W)' },
      { labelFr: 'Étanchéité', labelAr: 'معيار الحماية', value: 'IPX7 Waterproof certifié' },
      { labelFr: 'Batterie', labelAr: 'سعة البطارية', value: '6000 mAh (24h de musique)' },
      { labelFr: 'Poids', labelAr: 'الوزن', value: '680g' },
    ],
    colors: [
      { nameFr: 'Noir Carbone Cyber', nameAr: 'كربون أسود مدرع', hex: '#16161D' },
      { nameFr: 'Orange Cyberpunk', nameAr: 'برتقالي شمسي', hex: '#FF6B00' },
    ],
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=1000&auto=format&fit=crop',
    ],
  },
  {
    id: 'prod-4',
    slug: 'hypergan-120w-matrix-charger',
    nameFr: 'HyperGaN 120W — Chargeur 4 Ports Ultra-Compact',
    nameAr: 'هايبر جان 120 واط — شاحن GaN فائق السرعة بـ 4 منافذ',
    category: 'chargers',
    price: 7200,
    originalPrice: 8900,
    rating: 4.9,
    reviewsCount: 210,
    isFlashDeal: false,
    isFeatured: true,
    isBestSeller: true,
    inStock: true,
    stockCount: 32,
    badgeFr: 'TOP SÉLECTION',
    badgeAr: 'الأعلى تقييماً',
    taglineFr: 'Chargez MacBook Pro, iPhone & écouteurs simultanément à pleine vitesse',
    taglineAr: 'اشحن حاسوبك المحمول وهاتفك وسماعاتك معاً بأقصى سرعة وأمان',
    descriptionFr:
      'Grâce aux puces semi-conductrices GaN III de dernière génération, ce chargeur réduit la taille de 50% tout en restant glacé sous charge continue 120W. Livré avec câble tressé 100W renforcé Kevlar.',
    descriptionAr:
      'بفضل رقائق نيتريد الغاليوم GaN III الأحدث عالمياً، يأتي الشاحن بحجم أصغر بـ 50% مع حماية ذكية من الحرارة وشحن 120 واط مستمر. يشمل كابل مجدول 100 واط معزز بالألياف.',
    featuresFr: [
      'Technologie GaN III (Nitrure de Gallium) haute efficacité 96%',
      '3 ports USB-C Power Delivery 3.0 + 1 port USB-A Quick Charge 4+',
      'Prend en charge MacBook Pro 16", Galaxy S24 Ultra, iPhone 16 Pro Max',
      'Contrôle thermique intelligent 60 fois par seconde',
      'Câble tressé ultra-durable 100W 1.8m inclus dans la boîte',
    ],
    featuresAr: [
      'تقنية GaN III الأحدث بكفاءة طاقة استثنائية 96%',
      '3 منافذ Type-C سريعة + منفذ USB-A بتقنية Quick Charge',
      'شحن فائق لأحدث الهواتف وحواسيب ماك بوك والحواسيب المحمولة',
      'نظام أمان حراري يراقب درجات الحرارة 60 مرة في الثانية',
      'كابل شحن مجدول متين جداً بقدرة 100 واط مرفق مع العلبة',
    ],
    specs: [
      { labelFr: 'Puissance maximale', labelAr: 'أقصى طاقة', value: '120 Watts Power Delivery' },
      { labelFr: 'Ports', labelAr: 'المنافذ', value: '3x USB-C + 1x USB-A' },
      { labelFr: 'Compatibilité', labelAr: 'التوافق', value: 'MacBook, Dell, iPhone, Samsung, Xiaomi' },
      { labelFr: 'Prise', labelAr: 'المقبس', value: 'Format EU Algérie 220V standard' },
    ],
    colors: [
      { nameFr: 'Noir Mat Graphite', nameAr: 'جرافيت أسود مطفي', hex: '#1C1C24' },
      { nameFr: 'Gris Minéral', nameAr: 'رمادي معدني', hex: '#2A2A38' },
    ],
    images: [
      'https://images.unsplash.com/photo-1622445262464-84b1456045b6?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=1000&auto=format&fit=crop',
    ],
  },
  {
    id: 'prod-5',
    slug: 'titanmag-10000-qi2-powerbank',
    nameFr: 'TitanMag 10000 — Batterie MagSafe Transparent',
    nameAr: 'تيتان ماج 10000 — بطارية ماغ سيف شفافة سريعة Qi2',
    category: 'powerbanks',
    price: 6400,
    originalPrice: 7900,
    rating: 4.8,
    reviewsCount: 77,
    isFlashDeal: true,
    isFeatured: true,
    inStock: true,
    stockCount: 11,
    badgeFr: 'NOUVEAU',
    badgeAr: 'جديد ومبتكر',
    taglineFr: 'Dos en verre trempé révélant les circuits cuivrés, aimants 15N ultra-forts',
    taglineAr: 'زجاج مقسى يكشف الدارات النحاسية والملفات، مع مغناطيس 15N قوي جداً',
    descriptionFr:
      'La batterie externe qui ne ressemble à aucune autre. Boîtier métallique robuste, dos en verre résistant et béquille pliable en zinc intégrée pour regarder des vidéos pendant la charge.',
    descriptionAr:
      'بنك طاقة بتصميم غير مسبوق يكشف التفاصيل الإلكترونية الداخلية. مزود بحامل خلفي معدني مدمج قابل للطي لتثبيت الهاتف ومتابعة الفيديوهات أثناء الشحن المغناطيسي.',
    featuresFr: [
      'Recharge magnétique certifiée Qi2 15W sans fil',
      'Sortie filaire USB-C bi-directionnelle 22.5W rapide',
      'Affichage numérique LED blanc du niveau exact de batterie (0-100%)',
      'Béquille intégrée rétractable en alliage de zinc pour mode paysage/portrait',
      'Sécurités multiples : surchauffe, surtension, détection de corps étrangers',
    ],
    featuresAr: [
      'شحن لاسلكي مغناطيسي سريع بقوة 15 واط متوافق مع آيفون وسامسونغ',
      'منفذ سلكي Type-C سريع بقدرة 22.5 واط ثنائي الاتجاه',
      'شاشة رقمية LED دقيقة تعرض نسبة الشحن المتبقية من 0 إلى 100%',
      'حامل معدني مدمج وقابل للطي للمشاهدة العمودية أو الأفقية',
      'حماية مدمجة من الحرارة الزائدة والمجالات المغناطيسية العشوائية',
    ],
    specs: [
      { labelFr: 'Capacité', labelAr: 'السعة', value: '10 000 mAh (38.5 Wh)' },
      { labelFr: 'Puissance MagSafe', labelAr: 'قوة الشحن المغناطيسي', value: '15W Max Qi2' },
      { labelFr: 'Puissance Filaire', labelAr: 'الشحن السلكي', value: '22.5W PD & SCP' },
      { labelFr: 'Poids', labelAr: 'الوزن', value: '198g compact' },
    ],
    colors: [
      { nameFr: 'Noir Fumé Transparent', nameAr: 'أسود دخاني شفاف', hex: '#14141B' },
      { nameFr: 'Ambre Titane', nameAr: 'كهرماني تيتانيوم', hex: '#805B20' },
    ],
    images: [
      'https://images.unsplash.com/photo-1609592426804-03a1fa062776?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618478594486-c65b899c4936?q=80&w=1000&auto=format&fit=crop',
    ],
  },
  {
    id: 'prod-6',
    slug: 'pulse-anc-carbon-buds',
    nameFr: 'Pulse ANC Carbon — Écouteurs Hi-Fi Bass',
    nameAr: 'بالس كربون — سماعات أذن رياضية مع عزل متكيف',
    category: 'earbuds',
    price: 5200,
    originalPrice: 6500,
    rating: 4.7,
    reviewsCount: 64,
    inStock: true,
    stockCount: 22,
    badgeFr: 'VALEUR SÛRE',
    badgeAr: 'الأكثر شعبية',
    taglineFr: 'Légèreté plume 4.1g, maintien parfait et basses percutantes',
    taglineAr: 'خفيفة بوزن 4.1 غرام مع ثبات استثنائي وبطارية تدوم طويلاً',
    descriptionFr:
      'Conçus pour le rythme de vie dynamique : réduction de bruit pour les transports et le sport, commandes tactiles intuitives et étui galet ultra-plat.',
    descriptionAr:
      'مصممة لنمط الحياة السريع: عزل ضوضاء ممتاز للمواصلات والتمارين، وتحكم باللمس مع علبة بحجم الجيب مريحة للغاية.',
    featuresFr: [
      'Réduction active de bruit -38dB',
      'Autonomie 28h au total',
      'Contrôle tactile capacitif précis',
      'Résistant IPX5 à la sueur',
    ],
    featuresAr: [
      'عزل نشط للضوضاء حتى -38 ديسيبل',
      'بطارية 28 ساعة إجمالية مع العلبة',
      'أزرار لمس حساسة ودقيقة للتحكم بالصوت والمكالمات',
      'مقاومة للعرق والماء بمعيار IPX5',
    ],
    specs: [
      { labelFr: 'Bluetooth', labelAr: 'البلوتوث', value: '5.3 Instant Pair' },
      { labelFr: 'Poids oreillette', labelAr: 'وزن السماعة', value: '4.1g' },
      { labelFr: 'Autonomie', labelAr: 'البطارية', value: '7h + 21h boîtier' },
    ],
    colors: [
      { nameFr: 'Noir Mat Intense', nameAr: 'أسود مطفي قاتم', hex: '#111116' },
    ],
    images: [
      'https://images.unsplash.com/photo-1598331668826-20cecc596b86?q=80&w=1000&auto=format&fit=crop',
    ],
  },
  {
    id: 'prod-7',
    slug: 'armored-kevlar-100w-cable-kit',
    nameFr: 'Pack Câbles Armored Kevlar 240W (Lot de 2)',
    nameAr: 'حزمة كابلات كيفلار المدرعة 240 واط (قطعتين)',
    category: 'chargers',
    price: 3200,
    originalPrice: 4200,
    rating: 4.9,
    reviewsCount: 168,
    inStock: true,
    stockCount: 45,
    badgeFr: 'INDISPENSABLE',
    badgeAr: 'عرض مميز',
    taglineFr: 'Gainage nylon tressé indestructible, puce E-Marker certifiée 240W',
    taglineAr: 'مغلف بألياف كيفلار غير قابلة للقطع مع شريحة E-Marker الذكية',
    descriptionFr:
      'Le kit de câbles ultime résistant à plus de 30 000 torsions. Supporte la charge ultra-rapide jusqu’à 240W pour smartphones, consoles et ordinateurs portables.',
    descriptionAr:
      'الكابل الذي يدوم معك طويلاً، يتحمل أكثر من 30 ألف انحناء بدون تلف. يدعم سرعات شحن حتى 240 واط ونقل بيانات سريع للهواتف والحواسيب.',
    featuresFr: [
      'Blindage interne en fibre aramide Kevlar',
      'Supporte 48V/5A Power Delivery 3.1 (240W)',
      'Embouts renforcés en alliage d’aluminium usiné',
      'Longueurs pratiques : 1.2m et 2m inclus dans le pack',
    ],
    featuresAr: [
      'درع داخلي من ألياف كيفلار فائقة المتانة',
      'دعم كامل لمعيار الشحن السريع PD 3.1 حتى 240 واط',
      'رؤوس ألومنيوم صلبة مقاومة للكسر والحرارة',
      'طولان ممتازان: كابل 1.2 متر وكابل 2 متر في العلبة',
    ],
    specs: [
      { labelFr: 'Puissance max', labelAr: 'أقصى طاقة', value: '240W (48V / 5A)' },
      { labelFr: 'Transfert', labelAr: 'نقل البيانات', value: '480 Mbps Hi-Speed' },
      { labelFr: 'Connecteurs', labelAr: 'المنافذ', value: 'USB-C vers USB-C' },
    ],
    colors: [
      { nameFr: 'Noir & Tissage Orange', nameAr: 'أسود مع لمسات برتقالية', hex: '#18181F' },
    ],
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop',
    ],
  },
  {
    id: 'prod-8',
    slug: 'blade-sound-bar-rgb',
    nameFr: 'Blade Bar Cyber Soundbar 50W',
    nameAr: 'شريط صوتي بلايد بار 50 واط للألعاب والمكتب',
    category: 'speakers',
    price: 9800,
    originalPrice: 12500,
    rating: 4.8,
    reviewsCount: 51,
    inStock: true,
    stockCount: 8,
    badgeFr: 'SETUP GAMING',
    badgeAr: 'سيت اب مثالي',
    taglineFr: 'Barre de son compacte pour bureau & TV, illumination ambre Nothing-Tech',
    taglineAr: 'شريط صوتي مدمج لشاشات الحواسيب والتلفاز مع إضاءة برتقالية تقنية',
    descriptionFr:
      'Sublimez votre setup gaming ou votre bureau avec la barre Blade Sound. Double tweeter, caisson de basse intégré et connexion sans fil ou AUX/USB sans latence.',
    descriptionAr:
      'ارتقِ بمكتبك وشاشتك مع ساوند بار بلايد. مكبرات مزدوجة مع مضخم صوت مدمج واتصال فوري بالبلوتوث أو كابل AUX بدون أي تأخير.',
    featuresFr: [
      'Son immersif stéréo 2.1 puissant 50W',
      'Effets d’éclairage d’ambiance RGB et Ambre chaud',
      'Connexion Bluetooth 5.3, USB, Optique et Auxiliaire',
      'Télécommande sans fil et bouton rotatif en aluminium',
    ],
    featuresAr: [
      'نظام صوت ستيريو 2.1 نقي بقوة 50 واط',
      'إضاءة محيطية ساحرة بلون كهرماني متدرج',
      'منافذ متعددة: بلوتوث، USB، كابل بصري ومدخل AUX',
      'مقبض تحكم بمستوى الصوت مصنوع من الألومنيوم وجهاز تحكم',
    ],
    specs: [
      { labelFr: 'Puissance', labelAr: 'القوة', value: '50W Peak Audio' },
      { labelFr: 'Dimensions', labelAr: 'الأبعاد', value: '420 x 70 x 65 mm' },
      { labelFr: 'Alimentation', labelAr: 'التغذية', value: 'USB-C DC 5V/2A' },
    ],
    colors: [
      { nameFr: 'Noir Obsidian', nameAr: 'أسود بركاني', hex: '#0D0D11' },
    ],
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=1000&auto=format&fit=crop',
    ],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function formatDZD(amount: number, lang: 'ar' | 'fr' = 'fr'): string {
  const formatted = amount.toLocaleString('fr-DZ');
  return lang === 'ar' ? `${formatted} د.ج` : `${formatted} DZD`;
}
