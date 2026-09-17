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
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_delivery', 'delivered', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. PRODUCTS TABLE
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

-- 3. DISABLE ROW LEVEL SECURITY (NO RLS AS REQUESTED)
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

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
