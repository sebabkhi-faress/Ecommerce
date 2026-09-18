-- ==============================================================================
-- ELECTRONICS DZ — SUPABASE DATABASE SCHEMA (PUBLIC SCHEMA & STORAGE)
-- Run this script in your Supabase SQL Editor:
-- SQL Editor -> New Query -> Paste & Click Run
-- ==============================================================================

-- 1. ORDERS TABLE (Cash on Delivery / الدفع عند الاستلام)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT ('ord-' || substr(md5(random()::text), 1, 8)),
    tracking_code TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    wilaya_code TEXT NOT NULL,
    wilaya_name_fr TEXT NOT NULL,
    wilaya_name_ar TEXT NOT NULL,
    commune TEXT NOT NULL,
    delivery_mode TEXT NOT NULL DEFAULT 'home' CHECK (delivery_mode IN ('home', 'desk')),
    notes TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    delivery_fee NUMERIC NOT NULL DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_delivery', 'delivered', 'cancelled', 'retour')),
    assigned_delivery_id TEXT,
    assigned_delivery_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Migration safety for existing tables: ensure 'retour' is permitted
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'confirmed', 'in_delivery', 'delivered', 'cancelled', 'retour'));

-- 2. USERS & ROLES TABLE (Admin, Delivery Guy, Customer)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY DEFAULT ('usr-' || substr(md5(random()::text), 1, 8)),
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'delivery', 'customer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name_fr TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    tagline_fr TEXT,
    tagline_ar TEXT,
    description_fr TEXT,
    description_ar TEXT,
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    category TEXT NOT NULL,
    stock_count INTEGER NOT NULL DEFAULT 10,
    rating NUMERIC NOT NULL DEFAULT 4.9,
    reviews_count INTEGER NOT NULL DEFAULT 45,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    colors JSONB NOT NULL DEFAULT '[]'::jsonb,
    specs JSONB NOT NULL DEFAULT '[]'::jsonb,
    features_fr JSONB NOT NULL DEFAULT '[]'::jsonb,
    features_ar JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_flash_deal BOOLEAN NOT NULL DEFAULT false,
    badge_fr TEXT,
    badge_ar TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. DISABLE ROW LEVEL SECURITY (NO RLS AS REQUESTED)
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop any previous table policies
DROP POLICY IF EXISTS "Public can view orders" ON public.orders;
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Public can update orders" ON public.orders;
DROP POLICY IF EXISTS "Public can view products" ON public.products;
DROP POLICY IF EXISTS "Public can insert products" ON public.products;
DROP POLICY IF EXISTS "Public can update products" ON public.products;

-- 4. PUBLIC STORAGE BUCKET: products_images
INSERT INTO storage.buckets (id, name, public)
VALUES ('products_images', 'products_images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies for products_images bucket:

-- Public View (SELECT)
DROP POLICY IF EXISTS "Public View" ON storage.objects;
CREATE POLICY "Public View"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products_images');

-- Auth Insert (INSERT)
DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
CREATE POLICY "Auth Insert"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'products_images');

-- Auth Update (UPDATE)
DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
CREATE POLICY "Auth Update"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'products_images')
WITH CHECK (bucket_id = 'products_images');

-- Auth Delete (DELETE)
DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;
CREATE POLICY "Auth Delete"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'products_images');

-- 5. ENABLE REALTIME BROADCASTING ON ORDERS & PRODUCTS
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'products'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'users'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

-- 6. INITIAL SEED DATA FOR ORDERS
INSERT INTO public.orders (
    id, tracking_code, full_name, phone, wilaya_code, wilaya_name_fr, wilaya_name_ar,
    commune, delivery_mode, notes, subtotal, delivery_fee, total, status, created_at, items
) VALUES
(
    'ord-101', 'DZ-92841-COD', 'Yacine Brahimi', '0550123456', '16', 'Alger', 'الجزائر العاصمة',
    'Hydra, Résidence Les Pins', 'home', 'Appeler avant 14h svp', 6800, 400, 7200, 'in_delivery', now() - interval '2 hours',
    '[{"productId": "prod-1", "productNameFr": "Aura Pro 2 — Écouteurs ANC Transparent", "productNameAr": "أورا برو 2 — سماعات لاسلكية شفافة مع عزل نشط", "price": 6800, "quantity": 1, "selectedColor": "Noir Obsidian Fumé", "image": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=300&auto=format&fit=crop"}]'::jsonb
),
(
    'ord-102', 'DZ-74198-COD', 'Sara Mansouri', '0661987654', '31', 'Oran', 'وهران',
    'Akid Lotfi, Face Clinique', 'desk', NULL, 23800, 300, 24100, 'confirmed', now() - interval '5 hours',
    '[{"productId": "prod-2", "productNameFr": "Apex Studio 90 — Casque Hi-Res Wireless", "productNameAr": "أبيكس ستوديو 90 — سماعات رأس محيطية احترافية Hi-Res", "price": 14900, "quantity": 1, "selectedColor": "Gris Sidéral Brossé", "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300&auto=format&fit=crop"}, {"productId": "prod-4", "productNameFr": "MagVolt MagSafe 10000mAh", "productNameAr": "ماج فولت — باور بانك مغناطيسي MagSafe بسعة 10000mAh", "price": 8900, "quantity": 1, "selectedColor": "Noir Titane", "image": "https://images.unsplash.com/photo-1609592424369-0e7bc230e9d6?q=80&w=300&auto=format&fit=crop"}]'::jsonb
),
(
    'ord-103', 'DZ-53812-COD', 'Karim Djebbar', '0770334455', '25', 'Constantine', 'قسنطينة',
    'Ali Mendjeli, UV 05', 'home', 'Sonner à l’interphone 4B', 5400, 500, 5900, 'delivered', now() - interval '1 day',
    '[{"productId": "prod-3", "productNameFr": "HyperCharge 120W GaN 4 Ports", "productNameAr": "شاحن جاليوم نتريد HyperCharge 120W بأربعة منافذ سريعة", "price": 5400, "quantity": 1, "selectedColor": "Noir Fumé Transparent", "image": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=300&auto=format&fit=crop"}]'::jsonb
),
(
    'ord-104', 'DZ-31904-COD', 'Nadia Belkacemi', '0541223344', '06', 'Béjaïa', 'بجاية',
    'Ihddaden, Près de l’Hôpital', 'home', NULL, 10400, 600, 11000, 'pending', now() - interval '25 minutes',
    '[{"productId": "prod-5", "productNameFr": "Pulse 360 Enceinte Nomade Hi-Fi", "productNameAr": "مكبر صوت محمول Pulse 360 مقاوم للماء Hi-Fi", "price": 10400, "quantity": 1, "selectedColor": "Noir Carbone", "image": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=300&auto=format&fit=crop"}]'::jsonb
)
ON CONFLICT (tracking_code) DO NOTHING;

-- 7. INITIAL SEED DATA FOR PRODUCTS (ALL 8 STORE PRODUCTS)
INSERT INTO public.products (
    id, slug, name_fr, name_ar, tagline_fr, tagline_ar, description_fr, description_ar,
    price, original_price, category, stock_count, rating, reviews_count,
    images, colors, specs, features_fr, features_ar, is_flash_deal, badge_fr, badge_ar
) VALUES
(
    'prod-1',
    'aura-pro-2-anc',
    'Aura Pro 2 — Écouteurs ANC Transparent',
    'أورا برو 2 — سماعات لاسلكية شفافة مع عزل نشط',
    'Design transparent cyberpunk avec réduction de bruit -45dB',
    'تصميم زجاجي مستقبلي شفاف مع عزل فائق للضوضاء -45dB',
    'Les Aura Pro 2 combinent une esthétique translucide ultra-futuriste avec des transducteurs dynamiques de 11.6 mm. Profitez d’un son spatial immersif et d’une autonomie record de 36 heures avec l’écrin de charge.',
    'تجمع سماعات أورا برو 2 بين التصميم المستقبلي الشفاف ومكبرات صوت ديناميكية 11.6 مم. استمتع بتجربة صوت ثلاثي الأبعاد وعزل هجين للضوضاء مع بطارية تدوم حتى 36 ساعة مع علبة الشحن.',
    6800,
    9500,
    'earbuds',
    14,
    4.9,
    142,
    '["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1000&auto=format&fit=crop", "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?q=80&w=1000&auto=format&fit=crop", "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?q=80&w=1000&auto=format&fit=crop"]'::jsonb,
    '[{"nameFr": "Noir Obsidian Fumé", "nameAr": "أسود بركاني مدخن", "hex": "#121217"}, {"nameFr": "Blanc Glace Transparent", "nameAr": "أبيض جليدي شفاف", "hex": "#E2E8F0"}]'::jsonb,
    '[{"labelFr": "Bluetooth", "labelAr": "البلوتوث", "value": "v5.4 Dual-Band Low Latency"}, {"labelFr": "Autonomie écouteurs", "labelAr": "بطارية السماعة", "value": "8.5 Heures (ANC Off)"}, {"labelFr": "Autonomie totale", "labelAr": "البطارية الإجمالية", "value": "36 Heures avec boîtier"}, {"labelFr": "Port de charge", "labelAr": "منفذ الشحن", "value": "USB-C Ultra Fast + Qi Wireless"}, {"labelFr": "Latence gaming", "labelAr": "تأخير الألعاب", "value": "38ms Ultra-Low"}]'::jsonb,
    '["Réduction active de bruit adaptative jusqu’à -45 dB", "Transducteur custom 11.6 mm avec diaphragme graphène", "Mode Transparence Smart Ambient 2.0", "Autonomie 36h avec boîtier compatible recharge sans fil Qi", "Certification IP54 résistante à la sueur et la poussière"]'::jsonb,
    '["عزل ذكي متكيف للضوضاء يصل إلى -45 ديسيبل", "مكبر صوت حصري 11.6 مم بغشاء الجرافين عالي النقاوة", "وضع الشفافية الذكي لسماع المحيط بوضوح", "بطارية 36 ساعة تدعم الشحن السريع والشحن اللاسلكي", "مقاومة للرذاذ والتعرق بمعيار IP54"]'::jsonb,
    true,
    'OFFRE FLASH -28%',
    'عرض حصري -28%'
),
(
    'prod-2',
    'apex-studio-90-anc',
    'Apex Studio 90 — Casque Hi-Res Wireless',
    'أبيكس ستوديو 90 — سماعات رأس محيطية احترافية Hi-Res',
    'Confort aluminium mat, certification Hi-Res Audio & 65h non-stop',
    'هيكل ألومنيوم مطفي فاخر، شهادة صوت Hi-Res و 65 ساعة استماع متواصلة',
    'L’Apex Studio 90 délivre une clarté acoustique digne des studios professionnels grâce à ses coussinets magnétiques en mousse mémoire de forme et ses haut-parleurs en titane de 40mm.',
    'تقدم سماعات أبيكس ستوديو 90 نقاء صوتياً استثنائياً يضاهي استوديوهات التسجيل بفضل وسائد الأذن المغناطيسية المريحة ومحركات التيتانيوم 40 مم مع دعم كوديك LDAC عالي الدقة.',
    14900,
    18500,
    'headphones',
    7,
    5.0,
    88,
    '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop", "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=1000&auto=format&fit=crop"]'::jsonb,
    '[{"nameFr": "Gris Sidéral Brossé", "nameAr": "رمادي فلكي معدني", "hex": "#26262E"}, {"nameFr": "Noir Titane Mat", "nameAr": "تيتانيوم أسود مطفي", "hex": "#0F0F14"}]'::jsonb,
    '[{"labelFr": "Autonomie", "labelAr": "عمر البطارية", "value": "65 Heures (45h avec ANC)"}, {"labelFr": "Poids", "labelAr": "الوزن", "value": "254g ultra-léger"}, {"labelFr": "Connexions", "labelAr": "الاتصال", "value": "Bluetooth 5.4 + Jack 3.5mm Hi-Fi"}, {"labelFr": "Annulation active", "labelAr": "مستوى العزل", "value": "Hybride 4 micros (-48dB)"}]'::jsonb,
    '["Haut-parleurs 40mm en bio-cellulose plaqué titane", "Codec LDAC certifié Hi-Res Audio Wireless 990 kbps", "Double micro beamforming anti-vent pour appels cristallins", "Coussinets en mousse à mémoire respirante ultra-doux", "Charge rapide : 10 minutes = 6 heures d’écoute"]'::jsonb,
    '["محركات 40 مم مغلفة بالتيتانيوم لصوت نقي وجهير عميق", "دعم بروتوكول LDAC وصوت Hi-Res اللاسلكي فائق الدقة", "ميكروفونات متعددة لعزل أصوات الرياح وضجيج المكالمات", "وسائد إسفنجية ناعمة تتنفس ومريحة للاستخدام الطويل", "شحن فائق السرعة: 10 دقائق تمنحك 6 ساعات من التشغيل"]'::jsonb,
    false,
    'BEST SELLER',
    'الأكثر طلباً'
),
(
    'prod-3',
    'vibe-storm-cyber-speaker',
    'Vibe Storm Cyber — Enceinte 40W IPX7',
    'فايب ستورم سايبر — مكبر صوت مضاد للماء بقوة 40 واط',
    'Basses profondes à 360°, anneau LED RGB ambre chaud & étanche IPX7',
    'صوت جهير 360 درجة، حلقة إضاءة RGB كهرمانية دافئة ومقاومة كاملة للماء',
    'L’enceinte portable par excellence pour toutes vos aventures en Algérie. De Tipaza aux dunes de Taghit, profitez d’un son surpuissant avec radiateurs passifs doubles et 24h d’autonomie.',
    'المكبر المثالي لرحلاتك وتجمعاتك في كل أنحاء الجزائر. من شواطئ تيبازة إلى صحراء تاغيت، صوت بقوة 40 واط مع إشعاع صوتي 360 درجة وبطارية تدوم 24 ساعة.',
    8500,
    11000,
    'speakers',
    19,
    4.8,
    95,
    '["https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=1000&auto=format&fit=crop", "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=1000&auto=format&fit=crop"]'::jsonb,
    '[{"nameFr": "Noir Carbone Cyber", "nameAr": "كربون أسود مدرع", "hex": "#16161D"}, {"nameFr": "Orange Cyberpunk", "nameAr": "برتقالي شمسي", "hex": "#FF6B00"}]'::jsonb,
    '[{"labelFr": "Puissance", "labelAr": "القوة", "value": "40W RMS (Peak 60W)"}, {"labelFr": "Étanchéité", "labelAr": "معيار الحماية", "value": "IPX7 Waterproof certifié"}, {"labelFr": "Batterie", "labelAr": "سعة البطارية", "value": "6000 mAh (24h de musique)"}, {"labelFr": "Poids", "labelAr": "الوزن", "value": "680g"}]'::jsonb,
    '["Puissance 40W RMS avec technologie BassBoost Pro", "Étanche norme IPX7 (immersion 1 mètre pendant 30 min)", "Anneau lumineux synchrone avec lueurs ambrées tech", "Fonction TWS : couplez 2 enceintes pour un son stéréo 80W", "Powerbank intégré pour recharger votre smartphone"]'::jsonb,
    '["قوة صوت حقيقية 40 واط مع تقنية تضخيم البيس المتطورة", "مقاومة كاملة للغمر بالماء وفق معيار IPX7", "إضاءة نبضية كهرمانية تتفاعل بسلاسة مع الموسيقى", "إمكانية ربط سماعتين معاً بتقنية TWS لقوة 80 واط", "منفذ شحن مدمج لشحن هاتفك كبنك طاقة للطوارئ"]'::jsonb,
    true,
    'FLASH DEAL',
    'تخفيض البرق'
),
(
    'prod-4',
    'hypergan-120w-matrix-charger',
    'HyperGaN 120W — Chargeur 4 Ports Ultra-Compact',
    'هايبر جان 120 واط — شاحن GaN فائق السرعة بـ 4 منافذ',
    'Chargez MacBook Pro, iPhone & écouteurs simultanément à pleine vitesse',
    'اشحن حاسوبك المحمول وهاتفك وسماعاتك معاً بأقصى سرعة وأمان',
    'Grâce aux puces semi-conductrices GaN III de dernière génération, ce chargeur réduit la taille de 50% tout en restant glacé sous charge continue 120W. Livré avec câble tressé 100W renforcé Kevlar.',
    'بفضل رقائق نيتريد الغاليوم GaN III الأحدث عالمياً، يأتي الشاحن بحجم أصغر بـ 50% مع حماية ذكية من الحرارة وشحن 120 واط مستمر. يشمل كابل مجدول 100 واط معزز بالألياف.',
    7200,
    8900,
    'chargers',
    32,
    4.9,
    210,
    '["https://images.unsplash.com/photo-1622445262464-84b1456045b6?q=80&w=1000&auto=format&fit=crop", "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=1000&auto=format&fit=crop"]'::jsonb,
    '[{"nameFr": "Noir Mat Graphite", "nameAr": "جرافيت أسود مطفي", "hex": "#1C1C24"}, {"nameFr": "Gris Minéral", "nameAr": "رمادي معدني", "hex": "#2A2A38"}]'::jsonb,
    '[{"labelFr": "Puissance maximale", "labelAr": "أقصى طاقة", "value": "120 Watts Power Delivery"}, {"labelFr": "Ports", "labelAr": "المنافذ", "value": "3x USB-C + 1x USB-A"}, {"labelFr": "Compatibilité", "labelAr": "التوافق", "value": "MacBook, Dell, iPhone, Samsung, Xiaomi"}, {"labelFr": "Prise", "labelAr": "المقبس", "value": "Format EU Algérie 220V standard"}]'::jsonb,
    '["Technologie GaN III (Nitrure de Gallium) haute efficacité 96%", "3 ports USB-C Power Delivery 3.0 + 1 port USB-A Quick Charge 4+", "Prend en charge MacBook Pro 16\", Galaxy S24 Ultra, iPhone 16 Pro Max", "Contrôle thermique intelligent 60 fois par seconde", "Câble tressé ultra-durable 100W 1.8m inclus dans la boîte"]'::jsonb,
    '["تقنية GaN III الأحدث بكفاءة طاقة استثنائية 96%", "3 منافذ Type-C سريعة + منفذ USB-A بتقنية Quick Charge", "شحن فائق لأحدث الهواتف وحواسيب ماك بوك والحواسيب المحمولة", "نظام أمان حراري يراقب درجات الحرارة 60 مرة في الثانية", "كابل شحن مجدول متين جداً بقدرة 100 واط مرفق مع العلبة"]'::jsonb,
    false,
    'TOP SÉLECTION',
    'الأعلى تقييماً'
),
(
    'prod-5',
    'titanmag-10000-qi2-powerbank',
    'TitanMag 10000 — Batterie MagSafe Transparent',
    'تيتان ماج 10000 — بطارية ماغ سيف شفافة سريعة Qi2',
    'Dos en verre trempé révélant les circuits cuivrés, aimants 15N ultra-forts',
    'زجاج مقسى يكشف الدارات النحاسية والملفات، مع مغناطيس 15N قوي جداً',
    'La batterie externe qui ne ressemble à aucune autre. Boîtier métallique robuste, dos en verre résistant et béquille pliable en zinc intégrée pour regarder des vidéos pendant la charge.',
    'بنك طاقة بتصميم غير مسبوق يكشف التفاصيل الإلكترونية الداخلية. مزود بحامل خلفي معدني مدمج قابل للطي لتثبيت الهاتف ومتابعة الفيديوهات أثناء الشحن المغناطيسي.',
    6400,
    7900,
    'powerbanks',
    11,
    4.8,
    77,
    '["https://images.unsplash.com/photo-1609592426804-03a1fa062776?q=80&w=1000&auto=format&fit=crop", "https://images.unsplash.com/photo-1618478594486-c65b899c4936?q=80&w=1000&auto=format&fit=crop"]'::jsonb,
    '[{"nameFr": "Noir Fumé Transparent", "nameAr": "أسود دخاني شفاف", "hex": "#14141B"}, {"nameFr": "Ambre Titane", "nameAr": "كهرماني تيتانيوم", "hex": "#805B20"}]'::jsonb,
    '[{"labelFr": "Capacité", "labelAr": "السعة", "value": "10 000 mAh (38.5 Wh)"}, {"labelFr": "Puissance MagSafe", "labelAr": "قوة الشحن المغناطيسي", "value": "15W Max Qi2"}, {"labelFr": "Puissance Filaire", "labelAr": "الشحن السلكي", "value": "22.5W PD & SCP"}, {"labelFr": "Poids", "labelAr": "الوزن", "value": "198g compact"}]'::jsonb,
    '["Recharge magnétique certifiée Qi2 15W sans fil", "Sortie filaire USB-C bi-directionnelle 22.5W rapide", "Affichage numérique LED blanc du niveau exact de batterie (0-100%)", "Béquille intégrée rétractable en alliage de zinc pour mode paysage/portrait", "Sécurités multiples : surchauffe, surtension, détection de corps étrangers"]'::jsonb,
    '["شحن لاسلكي مغناطيسي سريع بقوة 15 واط متوافق مع آيفون وسامسونغ", "منفذ سلكي Type-C سريع بقدرة 22.5 واط ثنائي الاتجاه", "شاشة رقمية LED دقيقة تعرض نسبة الشحن المتبقية من 0 إلى 100%", "حامل معدني مدمج وقابل للطي للمشاهدة العمودية أو الأفقية", "حماية مدمجة من الحرارة الزائدة والمجالات المغناطيسية العشوائية"]'::jsonb,
    true,
    'NOUVEAU',
    'جديد ومبتكر'
),
(
    'prod-6',
    'pulse-anc-carbon-buds',
    'Pulse ANC Carbon — Écouteurs Hi-Fi Bass',
    'بالس كربون — سماعات أذن رياضية مع عزل متكيف',
    'Légèreté plume 4.1g, maintien parfait et basses percutantes',
    'خفيفة بوزن 4.1 غرام مع ثبات استثنائي وبطارية تدوم طويلاً',
    'Conçus pour le rythme de vie dynamique : réduction de bruit pour les transports et le sport, commandes tactiles intuitives et étui galet ultra-plat.',
    'مصممة لنمط الحياة السريع: عزل ضوضاء ممتاز للمواصلات والتمارين، وتحكم باللمس مع علبة بحجم الجيب مريحة للغاية.',
    5200,
    6500,
    'earbuds',
    22,
    4.7,
    64,
    '["https://images.unsplash.com/photo-1598331668826-20cecc596b86?q=80&w=1000&auto=format&fit=crop"]'::jsonb,
    '[{"nameFr": "Noir Mat Intense", "nameAr": "أسود مطفي قاتم", "hex": "#111116"}]'::jsonb,
    '[{"labelFr": "Bluetooth", "labelAr": "البلوتوث", "value": "5.3 Instant Pair"}, {"labelFr": "Poids oreillette", "labelAr": "وزن السماعة", "value": "4.1g"}, {"labelFr": "Autonomie", "labelAr": "البطارية", "value": "7h + 21h boîtier"}]'::jsonb,
    '["Réduction active de bruit -38dB", "Autonomie 28h au total", "Contrôle tactile capacitif précis", "Résistant IPX5 à la sueur"]'::jsonb,
    '["عزل نشط للضوضاء حتى -38 ديسيبل", "بطارية 28 ساعة إجمالية مع العلبة", "أزرار لمس حساسة ودقيقة للتحكم بالصوت والمكالمات", "مقاومة للعرق والماء بمعيار IPX5"]'::jsonb,
    false,
    'VALEUR SÛRE',
    'الأكثر شعبية'
),
(
    'prod-7',
    'armored-kevlar-100w-cable-kit',
    'Pack Câbles Armored Kevlar 240W (Lot de 2)',
    'حزمة كابلات كيفلار المدرعة 240 واط (قطعتين)',
    'Gainage nylon tressé indestructible, puce E-Marker certifiée 240W',
    'مغلف بألياف كيفلار غير قابلة للقطع مع شريحة E-Marker الذكية',
    'Le kit de câbles ultime résistant à plus de 30 000 torsions. Supporte la charge ultra-rapide jusqu’à 240W pour smartphones, consoles et ordinateurs portables.',
    'الكابل الذي يدوم معك طويلاً، يتحمل أكثر من 30 ألف انحناء بدون تلف. يدعم سرعات شحن حتى 240 واط ونقل بيانات سريع للهواتف والحواسيب.',
    3200,
    4200,
    'chargers',
    45,
    4.9,
    168,
    '["https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop"]'::jsonb,
    '[{"nameFr": "Noir & Tissage Orange", "nameAr": "أسود مع لمسات برتقالية", "hex": "#18181F"}]'::jsonb,
    '[{"labelFr": "Puissance max", "labelAr": "أقصى طاقة", "value": "240W (48V / 5A)"}, {"labelFr": "Transfert", "labelAr": "نقل البيانات", "value": "480 Mbps Hi-Speed"}, {"labelFr": "Connecteurs", "labelAr": "المنافذ", "value": "USB-C vers USB-C"}]'::jsonb,
    '["Blindage interne en fibre aramide Kevlar", "Supporte 48V/5A Power Delivery 3.1 (240W)", "Embouts renforcés en alliage d’aluminium usiné", "Longueurs pratiques : 1.2m et 2m inclus dans le pack"]'::jsonb,
    '["درع داخلي من ألياف كيفلار فائقة المتانة", "دعم كامل لمعيار الشحن السريع PD 3.1 حتى 240 واط", "رؤوس ألومنيوم صلبة مقاومة للكسر والحرارة", "طولان ممتازان: كابل 1.2 متر وكابل 2 متر في العلبة"]'::jsonb,
    false,
    'INDISPENSABLE',
    'عرض مميز'
),
(
    'prod-8',
    'blade-sound-bar-rgb',
    'Blade Bar Cyber Soundbar 50W',
    'شريط صوتي بلايد بار 50 واط للألعاب والمكتب',
    'Barre de son compacte pour bureau & TV, illumination ambre Nothing-Tech',
    'شريط صوتي مدمج لشاشات الحواسيب والتلفاز مع إضاءة برتقالية تقنية',
    'Sublimez votre setup gaming ou votre bureau avec la barre Blade Sound. Double tweeter, caisson de basse intégré et connexion sans fil ou AUX/USB sans latence.',
    'ارتقِ بمكتبك وشاشتك مع ساوند بار بلايد. مكبرات مزدوجة مع مضخم صوت مدمج واتصال فوري بالبلوتوث أو كابل AUX بدون أي تأخير.',
    9800,
    12500,
    'speakers',
    8,
    4.8,
    51,
    '["https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=1000&auto=format&fit=crop"]'::jsonb,
    '[{"nameFr": "Noir Obsidian", "nameAr": "أسود بركاني", "hex": "#0D0D11"}]'::jsonb,
    '[{"labelFr": "Puissance", "labelAr": "القوة", "value": "50W Peak Audio"}, {"labelFr": "Dimensions", "labelAr": "الأبعاد", "value": "420 x 70 x 65 mm"}, {"labelFr": "Alimentation", "labelAr": "التغذية", "value": "USB-C DC 5V/2A"}]'::jsonb,
    '["Son immersif stéréo 2.1 puissant 50W", "Effets d’éclairage d’ambiance RGB et Ambre chaud", "Connexion Bluetooth 5.3, USB, Optique et Auxiliaire", "Télécommande sans fil et bouton rotatif en aluminium"]'::jsonb,
    '["نظام صوت ستيريو 2.1 نقي بقوة 50 واط", "إضاءة محيطية ساحرة بلون كهرماني متدرج", "منافذ متعددة: بلوتوث، USB، كابل بصري ومدخل AUX", "مقبض تحكم بمستوى الصوت مصنوع من الألومنيوم وجهاز تحكم"]'::jsonb,
    false,
    'SETUP GAMING',
    'سيت اب مثالي'
)
ON CONFLICT (id) DO UPDATE SET
    name_fr = EXCLUDED.name_fr,
    name_ar = EXCLUDED.name_ar,
    price = EXCLUDED.price,
    images = EXCLUDED.images,
    category = EXCLUDED.category;

-- 8. INITIAL SEED DATA FOR USERS & ROLES (Admin, Delivery Guy, Customer)
-- Passwords hashed with bcrypt (Cost factor 10):
-- 'admin2026'    -> '$2b$10$Nw/dXAXCE1zIyL8p9FBTPO1StSsQltcb4xsjxV3uMVf1u3dM.dIDy'
-- 'delivery2026' -> '$2b$10$wlN2gLUB7Gsb8I8KOzPuCeBvdgt0IxKwuFBbwccY9cSRrvx9FzjtG'
-- 'client2026'   -> '$2b$10$9Ras8tjUZQXG1Vijx0qes.iyXEMeKPCPV3.z25ak0lHwpclwhOhZu'

INSERT INTO public.users (id, email, password, name, phone, role)
VALUES
(
    'usr-admin-01',
    'admin@electronics.dz',
    '$2b$10$Nw/dXAXCE1zIyL8p9FBTPO1StSsQltcb4xsjxV3uMVf1u3dM.dIDy',
    'Directeur Admin DZ',
    '0550123456',
    'admin'
),
(
    'usr-delivery-01',
    'delivery@electronics.dz',
    '$2b$10$wlN2gLUB7Gsb8I8KOzPuCeBvdgt0IxKwuFBbwccY9cSRrvx9FzjtG',
    'Karim Livreur Express',
    '0661987654',
    'delivery'
),
(
    'usr-customer-01',
    'client@electronics.dz',
    '$2b$10$9Ras8tjUZQXG1Vijx0qes.iyXEMeKPCPV3.z25ak0lHwpclwhOhZu',
    'Amine Client VIP',
    '0770334455',
    'customer'
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    password = EXCLUDED.password,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role;

-- ==============================================================================
-- 9. CATEGORIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name_fr TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description_fr TEXT,
    description_ar TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

-- Initial Seed Categories
INSERT INTO public.categories (id, slug, name_fr, name_ar, description_fr, description_ar, icon)
VALUES
(
    'cat-earbuds',
    'earbuds',
    'Écouteurs sans fil',
    'سماعات أذن لاسلكية',
    'Écouteurs True Wireless avec réduction de bruit active et design transparent',
    'سماعات بلوتوث لاسلكية بتقنية إلغاء الضوضاء وتصميم عصري شفاف',
    'Headphones'
),
(
    'cat-headphones',
    'headphones',
    'Casques Audio Hi-Fi',
    'سماعات رأس صوتية',
    'Casques circum-auriculaires ANC haute fidélité pour audiophiles et studio',
    'سماعات رأس محيطية احترافية بجودة صوت فائقة ومريحة للمكتب والألعاب',
    'Headphones'
),
(
    'cat-speakers',
    'speakers',
    'Enceintes & Soundbars',
    'مكبرات صوت وساوند بار',
    'Enceintes Bluetooth nomades étanches et barres de son pour setups TV',
    'مكبرات صوت مقاومة للماء وأشرطة صوت ساوند بار للمكاتب والشاشات',
    'Speaker'
),
(
    'cat-chargers',
    'chargers',
    'Chargeurs GaN & Câbles',
    'شواحن سريعة GaN وكابلات',
    'Blocs de charge rapide GaN jusqu’à 140W et câbles renforcés haute vitesse',
    'شواحن بتقنية النيتريد فائقة السرعة وكابلات مضفرة مدرعة',
    'Zap'
),
(
    'cat-powerbanks',
    'powerbanks',
    'Batteries MagSafe',
    'بنوك طاقة وميج سيف',
    'Batteries magnétiques ultra-fines MagSafe et stations sans fil induction',
    'بطاريات شحن لاسلكية مغناطيسية متوافقة مع الآيفون وأجهزة الأندرويد',
    'BatteryCharging'
)
ON CONFLICT (id) DO UPDATE SET
    name_fr = EXCLUDED.name_fr,
    name_ar = EXCLUDED.name_ar,
    slug = EXCLUDED.slug,
    description_fr = EXCLUDED.description_fr,
    description_ar = EXCLUDED.description_ar,
    icon = EXCLUDED.icon;

-- ==============================================================================
-- 10. BANNED PHONES TABLE (Fraud Prevention & Anti-Abuse / حظر أرقام الهاتف)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.banned_phones (
    phone TEXT PRIMARY KEY,
    reason TEXT NOT NULL DEFAULT 'Refus répété ou commande factice',
    banned_by TEXT DEFAULT 'Admin DZ',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.banned_phones DISABLE ROW LEVEL SECURITY;

-- Initial Seed Blacklist / Sample
INSERT INTO public.banned_phones (phone, reason, banned_by, notes)
VALUES
(
    '0500000000',
    'Numéro de test bloqué / رقم تجريبي محظور',
    'Système',
    'Exemple de numéro bloqué pour vérification'
)
ON CONFLICT (phone) DO NOTHING;

-- ==============================================================================
-- 11. PROMOTIONS TABLE (Category or Product Specific with Duration / العروض الترويجية والخصومات)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.promotions (
    id TEXT PRIMARY KEY DEFAULT ('prm-' || substr(md5(random()::text), 1, 8)),
    name TEXT NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('category', 'product')),
    target_id TEXT NOT NULL,
    discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC NOT NULL,
    start_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    end_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    banner_text_fr TEXT,
    banner_text_ar TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.promotions DISABLE ROW LEVEL SECURITY;

-- Seed Sample Promotion (e.g. 20% off all Earbuds for 7 days)
INSERT INTO public.promotions (id, name, target_type, target_id, discount_type, discount_value, start_at, end_at, is_active, banner_text_fr, banner_text_ar)
VALUES
(
    'prm-sample-1',
    'Offre Spéciale Écouteurs Sans Fil (-20%)',
    'category',
    'earbuds',
    'percentage',
    20,
    now(),
    now() + INTERVAL '7 days',
    true,
    'Remise exceptionnelle de 20% sur tous les écouteurs sans fil !',
    'تخفيض استثنائي 20% على جميع السماعات اللاسلكية لفترة محدودة !'
)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 12. DELIVERY FEES TABLE (68 Wilayas - Full Desk & Home Control / أسعار التوصيل لجميع الولايات)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.delivery_fees (
    code TEXT PRIMARY KEY,
    name_fr TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    zone TEXT NOT NULL DEFAULT 'centre',
    home_fee NUMERIC NOT NULL,
    desk_fee NUMERIC NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    estimated_days TEXT NOT NULL DEFAULT '1-2',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.delivery_fees DISABLE ROW LEVEL SECURITY;

-- Seed all 68 Wilayas with standard home & desk fees
INSERT INTO public.delivery_fees (code, name_fr, name_ar, zone, home_fee, desk_fee, estimated_days)
VALUES
('01', 'Adrar', 'أدرار', 'sud', 1000, 650, '3-4'),
('02', 'Chlef', 'الشلف', 'centre', 600, 350, '1-2'),
('03', 'Laghouat', 'الأغواط', 'hauts_plateaux', 750, 450, '2-3'),
('04', 'Oum El Bouaghi', 'أم البواقي', 'est', 650, 400, '2-3'),
('05', 'Batna', 'باتنة', 'est', 650, 400, '2'),
('06', 'Béjaïa', 'بجاية', 'centre', 600, 350, '1-2'),
('07', 'Biskra', 'بسكرة', 'hauts_plateaux', 750, 450, '2-3'),
('08', 'Béchar', 'بشار', 'sud', 950, 600, '3-4'),
('09', 'Blida', 'البليدة', 'centre', 450, 250, '1'),
('10', 'Bouira', 'البويرة', 'centre', 550, 300, '1-2'),
('11', 'Tamanrasset', 'تمنراست', 'grand_sud', 1350, 850, '4-5'),
('12', 'Tébessa', 'تبسة', 'est', 700, 400, '2-3'),
('13', 'Tlemcen', 'تلمسان', 'ouest', 650, 400, '2'),
('14', 'Tiaret', 'تيارت', 'hauts_plateaux', 700, 400, '2'),
('15', 'Tizi Ouzou', 'تيزي وزو', 'centre', 500, 300, '1-2'),
('16', 'Alger', 'الجزائر العاصمة', 'centre', 400, 200, '1'),
('17', 'Djelfa', 'الجلفة', 'hauts_plateaux', 700, 400, '2-3'),
('18', 'Jijel', 'جيجل', 'est', 650, 350, '2'),
('19', 'Sétif', 'سطيف', 'est', 600, 350, '1-2'),
('20', 'Saïda', 'سعيدة', 'ouest', 700, 400, '2-3'),
('21', 'Skikda', 'سكيكدة', 'est', 650, 350, '2'),
('22', 'Sidi Bel Abbès', 'سيدي بلعباس', 'ouest', 650, 350, '2'),
('23', 'Annaba', 'عنابة', 'est', 650, 350, '2'),
('24', 'Guelma', 'قالمة', 'est', 650, 350, '2'),
('25', 'Constantine', 'قسنطينة', 'est', 600, 350, '1-2'),
('26', 'Médéa', 'المدية', 'centre', 500, 300, '1-2'),
('27', 'Mostaganem', 'مستغانم', 'ouest', 650, 350, '2'),
('28', 'M''Sila', 'المسيلة', 'hauts_plateaux', 700, 400, '2'),
('29', 'Mascara', 'معسكر', 'ouest', 650, 350, '2'),
('30', 'Ouargla', 'ورقلة', 'sud', 850, 500, '2-3'),
('31', 'Oran', 'وهران', 'ouest', 550, 300, '1-2'),
('32', 'El Bayadh', 'البيض', 'hauts_plateaux', 800, 500, '2-3'),
('33', 'Illizi', 'إليزي', 'grand_sud', 1400, 900, '4-5'),
('34', 'Bordj Bou Arreridj', 'برج بوعريريج', 'est', 600, 350, '1-2'),
('35', 'Boumerdès', 'بومرداس', 'centre', 450, 250, '1'),
('36', 'El Tarf', 'الطارف', 'est', 700, 400, '2-3'),
('37', 'Tindouf', 'تندوف', 'grand_sud', 1400, 900, '4-6'),
('38', 'Tissemsilt', 'تيسمسيلت', 'hauts_plateaux', 700, 400, '2'),
('39', 'El Oued', 'الوادي', 'sud', 800, 500, '2-3'),
('40', 'Khenchela', 'خنشلة', 'est', 700, 400, '2'),
('41', 'Souk Ahras', 'سوق أهراس', 'est', 700, 400, '2'),
('42', 'Tipaza', 'تيبازة', 'centre', 450, 250, '1'),
('43', 'Mila', 'ميلة', 'est', 650, 350, '2'),
('44', 'Aïn Defla', 'عين الدفلى', 'centre', 550, 300, '1-2'),
('45', 'Naâma', 'النعامة', 'hauts_plateaux', 800, 500, '2-3'),
('46', 'Aïn Témouchent', 'عين تموشنت', 'ouest', 650, 350, '2'),
('47', 'Ghardaïa', 'غرداية', 'sud', 800, 500, '2-3'),
('48', 'Relizane', 'غليزان', 'ouest', 650, 350, '2'),
('49', 'El M''Ghair', 'المغير', 'sud', 850, 500, '2-3'),
('50', 'El Meniaa', 'المنيعة', 'sud', 900, 550, '3'),
('51', 'Ouled Djellal', 'أولاد جلال', 'hauts_plateaux', 750, 450, '2'),
('52', 'Bordj Baji Mokhtar', 'برج باجي مختار', 'grand_sud', 1450, 950, '4-6'),
('53', 'Béni Abbès', 'بني عباس', 'sud', 950, 600, '3-4'),
('54', 'Timimoun', 'تيميمون', 'sud', 950, 600, '3-4'),
('55', 'Touggourt', 'تقرت', 'sud', 850, 500, '2-3'),
('56', 'Djanet', 'جانت', 'grand_sud', 1450, 950, '4-6'),
('57', 'In Salah', 'عين صالح', 'grand_sud', 1200, 750, '3-5'),
('58', 'In Guezzam', 'عين قزام', 'grand_sud', 1500, 1000, '4-6'),
('59', 'Aflou', 'أفلو', 'hauts_plateaux', 750, 450, '2-3'),
('60', 'Barika', 'بريكة', 'est', 650, 400, '2'),
('61', 'Ksar Chellala', 'قصر الشلالة', 'hauts_plateaux', 750, 450, '2'),
('62', 'Messaad', 'مسعد', 'hauts_plateaux', 750, 450, '2-3'),
('63', 'Aïn Oussera', 'عين وسارة', 'hauts_plateaux', 700, 400, '2'),
('64', 'Bousaâda', 'بوسعادة', 'hauts_plateaux', 700, 400, '2'),
('65', 'El Eulma', 'العلمة', 'est', 600, 350, '1-2'),
('66', 'Sour El Ghozlane', 'سور الغزلان', 'centre', 550, 300, '1-2'),
('67', 'Akbou', 'أقبو', 'centre', 600, 350, '1-2'),
('68', 'El Abiodh Sidi Cheikh', 'الأبيض سيدي الشيخ', 'sud', 900, 550, '3')
ON CONFLICT (code) DO UPDATE SET
    name_fr = EXCLUDED.name_fr,
    name_ar = EXCLUDED.name_ar,
    zone = EXCLUDED.zone,
    estimated_days = EXCLUDED.estimated_days;

