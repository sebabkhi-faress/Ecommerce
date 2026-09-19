-- ==============================================================================
-- ELECTRONICS DZ — SUPABASE MIGRATION
-- Migration: Category Sizes, Colors & Variant Types (Clothes, Shoes, Phones...)
-- File: supabase/migrations/20260919_category_sizes_and_colors.sql
-- ==============================================================================

-- 1. ADD SIZES, COLORS AND VARIANT_TYPE COLUMNS TO CATEGORIES TABLE
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS sizes JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS colors JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS variant_type TEXT NOT NULL DEFAULT 'none';

-- 2. ENSURE PRODUCTS TABLE HAS SIZES & COLORS COLUMNS
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS sizes JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS colors JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 3. SEED & UPSERT CATEGORIES WITH SIZES, COLORS, AND VARIANT TYPES
INSERT INTO public.categories (id, slug, name_fr, name_ar, description_fr, description_ar, icon, variant_type, sizes, colors)
VALUES
(
    'cat-clothing',
    'clothing',
    'Vêtements & Mode',
    'ملابس وأزياء',
    'T-shirts, hoodies, vestes et pantalons tendance de haute qualité',
    'تشكيلة ملابس عصرية، أقمصة وسترات فاخرة بمقاسات وألوان متعددة',
    'Shirt',
    'clothing',
    '["XS", "S", "M", "L", "XL", "XXL", "3XL"]'::jsonb,
    '[
        {"nameFr": "Noir Profond", "nameAr": "أسود داكن", "hex": "#111111"},
        {"nameFr": "Blanc Pur", "nameAr": "أبيض ناصع", "hex": "#FFFFFF"},
        {"nameFr": "Gris Anthracite", "nameAr": "رمادي فحمي", "hex": "#4A4D52"},
        {"nameFr": "Bleu Marine", "nameAr": "أزرق داكن", "hex": "#1E3A8A"},
        {"nameFr": "Beige Sable", "nameAr": "بيج رملي", "hex": "#D4B996"},
        {"nameFr": "Vert Olive", "nameAr": "أخضر زيتوني", "hex": "#4D5D43"},
        {"nameFr": "Bordeaux", "nameAr": "عنابي", "hex": "#722F37"}
    ]'::jsonb
),
(
    'cat-shoes',
    'shoes',
    'Chaussures & Sneakers',
    'أحذية وسنيكرز',
    'Baskets de sport, sneakers urbaines et chaussures de confort (39 à 45)',
    'أحذية رياضية وسنيكرز عصرية مريحة بجميع المقاسات من 39 إلى 45',
    'Footprints',
    'shoes',
    '["39", "40", "41", "42", "43", "44", "45"]'::jsonb,
    '[
        {"nameFr": "Noir Total", "nameAr": "أسود كامل", "hex": "#0D0D0D"},
        {"nameFr": "Blanc Pur", "nameAr": "أبيض ناصع", "hex": "#F8FAFC"},
        {"nameFr": "Gris / Blanc", "nameAr": "رمادي / أبيض", "hex": "#94A3B8"},
        {"nameFr": "Noir & Orange Sunset", "nameAr": "أسود وبرتقالي", "hex": "#FF6B00"},
        {"nameFr": "Bleu Nuit", "nameAr": "أزرق ليلي", "hex": "#1E293B"},
        {"nameFr": "Kaki Militaire", "nameAr": "كاكي عسكري", "hex": "#556B2F"}
    ]'::jsonb
),
(
    'cat-phones',
    'phones',
    'Smartphones & Téléphones',
    'هواتف ذكية وسمارت فون',
    'Smartphones de pointe avec différentes capacités de stockage et coloris titane',
    'أحدث الهواتف الذكية بمساحات تخزين من 64GB إلى 1TB وألوان راقية',
    'Smartphone',
    'storage',
    '["64 Go", "128 Go", "256 Go", "512 Go", "1 To"]'::jsonb,
    '[
        {"nameFr": "Titane Noir", "nameAr": "تيتانيوم أسود", "hex": "#1C1C1E"},
        {"nameFr": "Titane Naturel", "nameAr": "تيتانيوم طبيعي", "hex": "#9A958D"},
        {"nameFr": "Titane Blanc", "nameAr": "تيتانيوم أبيض", "hex": "#F2F1ED"},
        {"nameFr": "Titane Bleu", "nameAr": "تيتانيوم أزرق", "hex": "#2F3846"},
        {"nameFr": "Or Céleste", "nameAr": "ذهبي ملكي", "hex": "#F4E8CE"},
        {"nameFr": "Sunset Ambre", "nameAr": "برتقالي شمسي", "hex": "#FF6B00"},
        {"nameFr": "Vert Émeraude", "nameAr": "أخضر زمردي", "hex": "#2E473B"}
    ]'::jsonb
),
(
    'cat-watches',
    'watches',
    'Montres Connectées',
    'ساعات ذكية',
    'Montres connectées santé, sport et boîtiers personnalisés',
    'ساعات ذكية متطورة لمتابعة الصحة والتمارين بمقاسات متعددة للهيكل',
    'Watch',
    'watch',
    '["40mm", "41mm", "44mm", "45mm", "49mm Ultra"]'::jsonb,
    '[
        {"nameFr": "Noir Sidéral", "nameAr": "أسود فلكي", "hex": "#1F2022"},
        {"nameFr": "Argent Polaire", "nameAr": "فضي قطبي", "hex": "#E2E4E1"},
        {"nameFr": "Or Stellaire", "nameAr": "ذهبي نجمي", "hex": "#E5D3B3"},
        {"nameFr": "Orange Ultra", "nameAr": "برتقالي ألترا", "hex": "#FF6B00"}
    ]'::jsonb
),
(
    'cat-earbuds',
    'earbuds',
    'Écouteurs sans fil',
    'سماعات أذن لاسلكية',
    'Écouteurs True Wireless avec réduction de bruit active et design transparent',
    'سماعات بلوتوث لاسلكية بتقنية إلغاء الضوضاء وتصميم عصري شفاف',
    'Headphones',
    'none',
    '[]'::jsonb,
    '[
        {"nameFr": "Noir Obsidian Fumé", "nameAr": "أسود بركاني مدخن", "hex": "#121217"},
        {"nameFr": "Blanc Glace Transparent", "nameAr": "أبيض جليدي شفاف", "hex": "#E2E8F0"}
    ]'::jsonb
),
(
    'cat-headphones',
    'headphones',
    'Casques Audio Hi-Fi',
    'سماعات رأس صوتية',
    'Casques circum-auriculaires ANC haute fidélité pour audiophiles et studio',
    'سماعات رأس محيطية احترافية بجودة صوت فائقة ومريحة للمكتب والألعاب',
    'Headphones',
    'none',
    '[]'::jsonb,
    '[
        {"nameFr": "Gris Sidéral Brossé", "nameAr": "رمادي فلكي معدني", "hex": "#26262E"},
        {"nameFr": "Noir Titane Mat", "nameAr": "تيتانيوم أسود مطفي", "hex": "#0F0F14"}
    ]'::jsonb
),
(
    'cat-speakers',
    'speakers',
    'Enceintes & Soundbars',
    'مكبرات صوت وساوند بار',
    'Enceintes Bluetooth nomades étanches et barres de son pour setups TV',
    'مكبرات صوت مقاومة للماء وأشرطة صوت ساوند بار للمكاتب والشاشات',
    'Speaker',
    'none',
    '[]'::jsonb,
    '[
        {"nameFr": "Noir Carbone Cyber", "nameAr": "كربون أسود مدرع", "hex": "#16161D"},
        {"nameFr": "Orange Cyberpunk", "nameAr": "برتقالي شمسي", "hex": "#FF6B00"}
    ]'::jsonb
),
(
    'cat-chargers',
    'chargers',
    'Chargeurs GaN & Câbles',
    'شواحن سريعة GaN وكابلات',
    'Blocs de charge rapide GaN jusqu’à 140W et câbles renforcés haute vitesse',
    'شواحن بتقنية النيتريد فائقة السرعة وكابلات مضفرة مدرعة',
    'Zap',
    'custom',
    '["65W GaN", "100W GaN", "140W GaN", "240W Pro"]'::jsonb,
    '[
        {"nameFr": "Noir Mat & Orange", "nameAr": "أسود مطفي ولمسات برتقالية", "hex": "#18181F"},
        {"nameFr": "Blanc Pur", "nameAr": "أبيض ناصع", "hex": "#FFFFFF"}
    ]'::jsonb
),
(
    'cat-powerbanks',
    'powerbanks',
    'Batteries MagSafe',
    'بنوك طاقة وميج سيف',
    'Batteries magnétiques ultra-fines MagSafe et stations sans fil induction',
    'بطاريات شحن لاسلكية مغناطيسية متوافقة مع الآيفون وأجهزة الأندرويد',
    'BatteryCharging',
    'custom',
    '["5000 mAh", "10000 mAh", "20000 mAh", "30000 mAh"]'::jsonb,
    '[
        {"nameFr": "Noir Titane MagSafe", "nameAr": "تيتانيوم أسود ماج سيف", "hex": "#1E1E24"},
        {"nameFr": "Gris Sidéral", "nameAr": "رمادي فلكي", "hex": "#374151"}
    ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    name_fr = EXCLUDED.name_fr,
    name_ar = EXCLUDED.name_ar,
    slug = EXCLUDED.slug,
    description_fr = EXCLUDED.description_fr,
    description_ar = EXCLUDED.description_ar,
    icon = EXCLUDED.icon,
    variant_type = EXCLUDED.variant_type,
    sizes = EXCLUDED.sizes,
    colors = EXCLUDED.colors;
