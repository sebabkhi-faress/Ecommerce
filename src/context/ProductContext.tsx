'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, PRODUCTS } from '@/data/products';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export type { Product } from '@/data/products';

export interface Category {
  id: string;
  slug: string;
  nameFr: string;
  nameAr: string;
  descriptionFr?: string;
  descriptionAr?: string;
  icon?: string;
  createdAt?: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-earbuds',
    slug: 'earbuds',
    nameFr: 'Écouteurs sans fil',
    nameAr: 'سماعات أذن لاسلكية',
    descriptionFr: 'Écouteurs True Wireless avec réduction de bruit active et design transparent',
    descriptionAr: 'سماعات بلوتوث لاسلكية بتقنية إلغاء الضوضاء وتصميم عصري شفاف',
    icon: 'Headphones',
  },
  {
    id: 'cat-headphones',
    slug: 'headphones',
    nameFr: 'Casques Audio Hi-Fi',
    nameAr: 'سماعات رأس صوتية',
    descriptionFr: 'Casques circum-auriculaires ANC haute fidélité pour audiophiles et studio',
    descriptionAr: 'سماعات رأس محيطية احترافية بجودة صوت فائقة ومريحة للمكتب والألعاب',
    icon: 'Headphones',
  },
  {
    id: 'cat-speakers',
    slug: 'speakers',
    nameFr: 'Enceintes & Soundbars',
    nameAr: 'مكبرات صوت وساوند بار',
    descriptionFr: 'Enceintes Bluetooth nomades étanches et barres de son pour setups TV',
    descriptionAr: 'مكبرات صوت مقاومة للماء وأشرطة صوت ساوند بار للمكاتب والشاشات',
    icon: 'Speaker',
  },
  {
    id: 'cat-chargers',
    slug: 'chargers',
    nameFr: 'Chargeurs GaN & Câbles',
    nameAr: 'شواحن سريعة GaN وكابلات',
    descriptionFr: 'Blocs de charge rapide GaN jusqu’à 140W et câbles renforcés haute vitesse',
    descriptionAr: 'شواحن بتقنية النيتريد فائقة السرعة وكابلات مضفرة مدرعة',
    icon: 'Zap',
  },
  {
    id: 'cat-powerbanks',
    slug: 'powerbanks',
    nameFr: 'Batteries MagSafe',
    nameAr: 'بنوك طاقة وميج سيف',
    descriptionFr: 'Batteries magnétiques ultra-fines MagSafe et stations sans fil induction',
    descriptionAr: 'بطاريات شحن لاسلكية مغناطيسية متوافقة مع الآيفون وأجهزة الأندرويد',
    icon: 'BatteryCharging',
  },
];

export interface Promotion {
  id: string;
  name: string;
  targetType: 'category' | 'product';
  targetId: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startAt: string;
  endAt: string;
  isActive: boolean;
  bannerTextFr?: string;
  bannerTextAr?: string;
  createdAt: string;
}

export interface AppliedPromotion {
  promotion: Promotion;
  originalPrice: number;
  discountedPrice: number;
  finalPrice: number;
  discountPercent: number;
  savingsDZD: number;
  savings: number;
  isExpiringSoon: boolean;
}

export const DEFAULT_PROMOTIONS: Promotion[] = [
  {
    id: 'prm-sample-1',
    name: 'Offre Spéciale Écouteurs Sans Fil (-20%)',
    targetType: 'category',
    targetId: 'earbuds',
    discountType: 'percentage',
    discountValue: 20,
    startAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    endAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    isActive: true,
    bannerTextFr: 'Remise exceptionnelle de 20% sur tous les écouteurs sans fil !',
    bannerTextAr: 'تخفيض استثنائي 20% على جميع السماعات اللاسلكية لفترة محدودة !',
    createdAt: new Date().toISOString(),
  },
];

export function mapRowToPromotion(row: any): Promotion {
  return {
    id: row.id,
    name: row.name || 'Promotion',
    targetType: row.target_type || 'category',
    targetId: row.target_id || '',
    discountType: row.discount_type || 'percentage',
    discountValue: Number(row.discount_value || 0),
    startAt: row.start_at || new Date().toISOString(),
    endAt: row.end_at || new Date().toISOString(),
    isActive: row.is_active !== false,
    bannerTextFr: row.banner_text_fr || undefined,
    bannerTextAr: row.banner_text_ar || undefined,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function mapRowToCategory(row: any): Category {
  return {
    id: row.id,
    slug: row.slug || row.id,
    nameFr: row.name_fr || row.nameFr || '',
    nameAr: row.name_ar || row.nameAr || '',
    descriptionFr: row.description_fr || row.descriptionFr || '',
    descriptionAr: row.description_ar || row.descriptionAr || '',
    icon: row.icon || 'Layers',
    createdAt: row.created_at,
  };
}

interface ProductContextType {
  products: Product[];
  categories: Category[];
  promotions: Promotion[];
  isLoading: boolean;
  isDbConnected: boolean;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;
  getPromotionForProduct: (product: Product) => AppliedPromotion | null;
  addProduct: (productData: Partial<Product> & { nameFr: string; nameAr: string; price: number; category: string }) => Promise<{ success: boolean; error?: string }>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<{ success: boolean; error?: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
  deleteProducts: (ids: string[]) => Promise<{ success: boolean; error?: string }>;
  refreshProducts: () => Promise<void>;
  addCategory: (categoryData: {
    slug: string;
    nameFr: string;
    nameAr: string;
    descriptionFr?: string;
    descriptionAr?: string;
    icon?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  deleteCategory: (id: string) => Promise<{ success: boolean; error?: string }>;
  refreshCategories: () => Promise<void>;
  addPromotion: (promoData: Omit<Promotion, 'id' | 'createdAt'>) => Promise<{ success: boolean; id?: string; error?: string }>;
  deletePromotion: (id: string) => Promise<{ success: boolean; error?: string }>;
  togglePromotion: (id: string, isActive: boolean) => Promise<{ success: boolean; error?: string }>;
  refreshPromotions: () => Promise<void>;
}

// Map Supabase snake_case row to TypeScript Product
export function mapRowToProduct(row: any): Product {
  return {
    id: row.id,
    slug: row.slug || row.id,
    nameFr: row.name_fr || 'Sans titre',
    nameAr: row.name_ar || 'بدون عنوان',
    category: row.category || 'earbuds',
    price: Number(row.price) || 0,
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    rating: Number(row.rating) || 5.0,
    reviewsCount: Number(row.reviews_count) || 1,
    isFlashDeal: Boolean(row.is_flash_deal),
    isFeatured: Boolean(row.is_featured ?? true),
    isBestSeller: Boolean(row.is_bestseller ?? false),
    inStock: (row.stock_count ?? 10) > 0,
    stockCount: Number(row.stock_count ?? 10),
    badgeFr: row.badge_fr || undefined,
    badgeAr: row.badge_ar || undefined,
    taglineFr: row.tagline_fr || '',
    taglineAr: row.tagline_ar || '',
    descriptionFr: row.description_fr || '',
    descriptionAr: row.description_ar || '',
    featuresFr: Array.isArray(row.features_fr) ? row.features_fr : [],
    featuresAr: Array.isArray(row.features_ar) ? row.features_ar : [],
    specs: Array.isArray(row.specs) ? row.specs : [],
    colors: Array.isArray(row.colors) ? row.colors : [],
    sizes: Array.isArray(row.sizes) && row.sizes.length > 0
      ? row.sizes
      : (Array.isArray(row.specs)
          ? (() => {
              const szSpec = row.specs.find((s: any) => s.labelFr === '__sizes__');
              if (szSpec?.value) {
                try {
                  return JSON.parse(szSpec.value);
                } catch {
                  return szSpec.value.split(',').map((s: string) => s.trim());
                }
              }
              return [];
            })()
          : []),
    images: Array.isArray(row.images) && row.images.length > 0
      ? row.images
      : ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop'],
  };
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [promotions, setPromotions] = useState<Promotion[]>(DEFAULT_PROMOTIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState(false);

  // Fetch all categories from Supabase
  const fetchCategories = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('created_at', { ascending: true });

        if (!error && data) {
          const mapped = data.map(mapRowToCategory);
          setCategories(mapped);
          try {
            localStorage.setItem('electronics_cached_categories', JSON.stringify(mapped));
          } catch (e) {
            // Ignore
          }
        }
      } catch (err) {
        console.warn('Supabase categories fetch failed, using fallback', err);
      }
    }
  }, []);

  // Fetch all promotions from Supabase
  const fetchPromotions = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('promotions')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mapped = data.map(mapRowToPromotion);
          setPromotions(mapped);
          try {
            localStorage.setItem('electronics_cached_promotions', JSON.stringify(mapped));
          } catch (e) {
            // Ignore
          }
        }
      } catch (err) {
        console.warn('Supabase promotions fetch failed, using fallback', err);
      }
    }
  }, []);

  // Fetch all products from Supabase
  const fetchProducts = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mapped = data.map(mapRowToProduct);
          setProducts(mapped);
          setIsDbConnected(true);
          try {
            localStorage.setItem('electronics_cached_products', JSON.stringify(mapped));
          } catch (e) {
            // Ignore storage errors
          }
        }
      } catch (err) {
        console.warn('Supabase products fetch failed, using fallback', err);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // Attempt to load from localStorage cache first for zero layout shift
    try {
      const cached = localStorage.getItem('electronics_cached_products');
      if (cached !== null) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setProducts(parsed);
        }
      }
      const cachedPromos = localStorage.getItem('electronics_cached_promotions');
      if (cachedPromos !== null) {
        const parsedPromos = JSON.parse(cachedPromos);
        if (Array.isArray(parsedPromos)) {
          setPromotions(parsedPromos);
        }
      }
      const cachedCats = localStorage.getItem('electronics_cached_categories');
      if (cachedCats !== null) {
        const parsedCats = JSON.parse(cachedCats);
        if (Array.isArray(parsedCats)) {
          setCategories(parsedCats);
        }
      }
    } catch (e) {
      // Ignore
    }

    fetchProducts();
    fetchCategories();
    fetchPromotions();

    // Subscribe to Realtime product changes
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      const channel = client
        .channel('public:products')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          () => {
            fetchProducts();
          }
        )
        .subscribe();

      const catChannel = client
        .channel('public:categories')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'categories' },
          () => {
            fetchCategories();
          }
        )
        .subscribe();

      const promoChannel = client
        .channel('public:promotions')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'promotions' },
          () => {
            fetchPromotions();
          }
        )
        .subscribe();

      return () => {
        client.removeChannel(channel);
        client.removeChannel(catChannel);
        client.removeChannel(promoChannel);
      };
    }
  }, [fetchProducts, fetchCategories, fetchPromotions]);

  const getProductBySlug = useCallback(
    (slug: string): Product | undefined => {
      return products.find((p) => p.slug === slug || p.id === slug);
    },
    [products]
  );

  const getProductById = useCallback(
    (id: string): Product | undefined => {
      return products.find((p) => p.id === id);
    },
    [products]
  );

  const addProduct = async (
    productData: Partial<Product> & { nameFr: string; nameAr: string; price: number; category: string }
  ): Promise<{ success: boolean; error?: string }> => {
    const id = `prod-${Date.now()}`;
    
    // Generate an SEO-friendly, guaranteed-unique slug with random hash suffix
    const cleanBase = (productData.nameFr || productData.nameAr || 'item')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const baseSlug = cleanBase && cleanBase.length >= 2 ? cleanBase : 'product';
    const uniqueSuffix = `${Date.now().toString(36).slice(-4)}${Math.random().toString(36).slice(2, 4)}`;
    const slug = `${baseSlug}-${uniqueSuffix}`;

    const finalColors = Array.isArray(productData.colors) ? productData.colors : [];
    const finalSizes = Array.isArray(productData.sizes) ? productData.sizes : [];

    // Fallback embed sizes into specs as __sizes__ for zero-schema-error persistence
    const finalSpecs = [
      ...(productData.specs || []).filter((s) => s.labelFr !== '__sizes__'),
      ...(finalSizes.length > 0
        ? [{ labelFr: '__sizes__', labelAr: '__sizes__', value: JSON.stringify(finalSizes) }]
        : []),
    ];

    const newProd: Product = {
      id,
      slug,
      nameFr: productData.nameFr,
      nameAr: productData.nameAr,
      category: productData.category as any,
      price: productData.price,
      originalPrice: productData.originalPrice,
      rating: 5.0,
      reviewsCount: 1,
      isFlashDeal: Boolean(productData.isFlashDeal),
      inStock: true,
      stockCount: productData.stockCount ?? 15,
      badgeFr: productData.badgeFr,
      badgeAr: productData.badgeAr,
      taglineFr: productData.taglineFr || '',
      taglineAr: productData.taglineAr || '',
      descriptionFr: productData.descriptionFr || '',
      descriptionAr: productData.descriptionAr || '',
      featuresFr: productData.featuresFr || [],
      featuresAr: productData.featuresAr || [],
      specs: finalSpecs,
      colors: finalColors,
      sizes: finalSizes,
      images: productData.images && productData.images.length > 0
        ? productData.images
        : ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop'],
    };

    // Update locally first for instant UI response
    setProducts((prev) => {
      const updated = [newProd, ...prev.filter((p) => p.slug !== newProd.slug)];
      try {
        localStorage.setItem('electronics_cached_products', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Persist to Supabase if connected
    if (isSupabaseConfigured && supabase) {
      try {
        const rowToUpsert: any = {
          id: newProd.id,
          slug: newProd.slug,
          name_fr: newProd.nameFr,
          name_ar: newProd.nameAr,
          tagline_fr: newProd.taglineFr,
          tagline_ar: newProd.taglineAr,
          description_fr: newProd.descriptionFr,
          description_ar: newProd.descriptionAr,
          price: newProd.price,
          original_price: newProd.originalPrice || null,
          category: newProd.category,
          stock_count: newProd.stockCount,
          rating: newProd.rating,
          reviews_count: newProd.reviewsCount,
          images: newProd.images,
          colors: newProd.colors,
          specs: newProd.specs,
          features_fr: newProd.featuresFr,
          features_ar: newProd.featuresAr,
          is_flash_deal: newProd.isFlashDeal,
          badge_fr: newProd.badgeFr || null,
          badge_ar: newProd.badgeAr || null,
          sizes: newProd.sizes || [],
        };

        let { error } = await supabase.from('products').upsert(rowToUpsert);

        // If 'sizes' column is missing in user's DB, retry without sizes column (it's safe in specs.__sizes__)
        if (error && error.message?.includes('sizes')) {
          delete rowToUpsert.sizes;
          const retry = await supabase.from('products').upsert(rowToUpsert);
          error = retry.error;
        }

        if (error) {
          console.error('Error inserting product into Supabase:', error.message);
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to insert' };
      }
    }

    return { success: true };
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<{ success: boolean; error?: string }> => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      try {
        localStorage.setItem('electronics_cached_products', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        const rowUpdates: any = {};
        if (updates.nameFr !== undefined) rowUpdates.name_fr = updates.nameFr;
        if (updates.nameAr !== undefined) rowUpdates.name_ar = updates.nameAr;
        if (updates.price !== undefined) rowUpdates.price = updates.price;
        if (updates.originalPrice !== undefined) rowUpdates.original_price = updates.originalPrice;
        if (updates.stockCount !== undefined) {
          rowUpdates.stock_count = updates.stockCount;
        }
        if (updates.category !== undefined) rowUpdates.category = updates.category;
        if (updates.taglineFr !== undefined) rowUpdates.tagline_fr = updates.taglineFr;
        if (updates.taglineAr !== undefined) rowUpdates.tagline_ar = updates.taglineAr;
        if (updates.descriptionFr !== undefined) rowUpdates.description_fr = updates.descriptionFr;
        if (updates.descriptionAr !== undefined) rowUpdates.description_ar = updates.descriptionAr;
        if (updates.isFlashDeal !== undefined) rowUpdates.is_flash_deal = updates.isFlashDeal;
        if (updates.badgeFr !== undefined) rowUpdates.badge_fr = updates.badgeFr;
        if (updates.badgeAr !== undefined) rowUpdates.badge_ar = updates.badgeAr;
        if (updates.images !== undefined) rowUpdates.images = updates.images;
        if (updates.colors !== undefined) rowUpdates.colors = updates.colors;
        if (updates.sizes !== undefined) {
          rowUpdates.sizes = updates.sizes;
        }

        let { error } = await supabase.from('products').update(rowUpdates).eq('id', id);
        if (error && error.message?.includes('sizes')) {
          delete rowUpdates.sizes;
          const retry = await supabase.from('products').update(rowUpdates).eq('id', id);
          error = retry.error;
        }

        if (error) {
          console.error('Error updating product in Supabase:', error.message);
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to update product' };
      }
    }

    return { success: true };
  };

  const deleteProduct = async (id: string): Promise<{ success: boolean; error?: string }> => {
    return deleteProducts([id]);
  };

  const deleteProducts = async (ids: string[]): Promise<{ success: boolean; error?: string }> => {
    if (!ids || ids.length === 0) return { success: true };
    setProducts((prev) => {
      const updated = prev.filter((p) => !ids.includes(p.id));
      try {
        localStorage.setItem('electronics_cached_products', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('products').delete().in('id', ids);
        if (error) {
          console.error('Error deleting products from Supabase:', error.message);
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Delete failed' };
      }
    }

    return { success: true };
  };

  const addCategory = async (categoryData: {
    slug: string;
    nameFr: string;
    nameAr: string;
    descriptionFr?: string;
    descriptionAr?: string;
    icon?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const cleanSlug = categoryData.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const newCategory: Category = {
      id: `cat-${cleanSlug}`,
      slug: cleanSlug,
      nameFr: categoryData.nameFr.trim(),
      nameAr: categoryData.nameAr.trim(),
      descriptionFr: categoryData.descriptionFr?.trim() || '',
      descriptionAr: categoryData.descriptionAr?.trim() || '',
      icon: categoryData.icon || 'Layers',
      createdAt: new Date().toISOString(),
    };

    setCategories((prev) => {
      const updated = [...prev.filter((c) => c.slug !== cleanSlug), newCategory];
      try {
        localStorage.setItem('electronics_cached_categories', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('categories').upsert({
          id: newCategory.id,
          slug: newCategory.slug,
          name_fr: newCategory.nameFr,
          name_ar: newCategory.nameAr,
          description_fr: newCategory.descriptionFr,
          description_ar: newCategory.descriptionAr,
          icon: newCategory.icon,
        });

        if (error) {
          console.error('Error inserting category into Supabase:', error.message);
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to insert category' };
      }
    }

    return { success: true };
  };

  const deleteCategory = async (id: string): Promise<{ success: boolean; error?: string }> => {
    setCategories((prev) => {
      const updated = prev.filter((c) => c.id !== id && c.slug !== id);
      try {
        localStorage.setItem('electronics_cached_categories', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('categories')
          .delete()
          .or(`id.eq.${id},slug.eq.${id}`);

        if (error) {
          console.error('Error deleting category from Supabase:', error.message);
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Delete category failed' };
      }
    }

    return { success: true };
  };

  // Calculate discount for a product based on active promotions
  const getPromotionForProduct = useCallback(
    (product: Product): AppliedPromotion | null => {
      if (!product) return null;
      const now = Date.now();

      const activePromos = promotions.filter((p) => {
        if (!p.isActive) return false;
        const startTime = new Date(p.startAt).getTime();
        const endTime = new Date(p.endAt).getTime();
        if (now < startTime || now > endTime) return false;

        if (p.targetType === 'product') {
          return p.targetId === product.id || p.targetId === product.slug;
        }
        if (p.targetType === 'category') {
          return p.targetId === product.category;
        }
        return false;
      });

      if (activePromos.length === 0) return null;

      let bestDiscount = 0;
      let bestPromo = activePromos[0];
      let bestDiscountedPrice = product.price;

      for (const promo of activePromos) {
        let currentDiscounted = product.price;
        if (promo.discountType === 'percentage') {
          const discountAmount = (product.price * promo.discountValue) / 100;
          currentDiscounted = Math.max(0, Math.round(product.price - discountAmount));
        } else {
          currentDiscounted = Math.max(0, Math.round(product.price - promo.discountValue));
        }

        const savings = product.price - currentDiscounted;
        if (savings > bestDiscount) {
          bestDiscount = savings;
          bestPromo = promo;
          bestDiscountedPrice = currentDiscounted;
        }
      }

      const discountPercent = Math.round(((product.price - bestDiscountedPrice) / product.price) * 100);
      const endTime = new Date(bestPromo.endAt).getTime();
      const isExpiringSoon = endTime - now < 24 * 3600 * 1000;

      return {
        promotion: bestPromo,
        originalPrice: product.price,
        discountedPrice: bestDiscountedPrice,
        finalPrice: bestDiscountedPrice,
        discountPercent: discountPercent > 0 ? discountPercent : 0,
        savingsDZD: bestDiscount,
        savings: bestDiscount,
        isExpiringSoon,
      };
    },
    [promotions]
  );

  const addPromotion = async (
    promoData: Omit<Promotion, 'id' | 'createdAt'>
  ): Promise<{ success: boolean; id?: string; error?: string }> => {
    const id = 'prm-' + Math.random().toString(36).substring(2, 9);
    const newPromo: Promotion = {
      ...promoData,
      id,
      createdAt: new Date().toISOString(),
    };
    setPromotions((prev) => {
      const updated = [newPromo, ...prev];
      try {
        localStorage.setItem('electronics_cached_promotions', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('promotions').insert({
          id: newPromo.id,
          name: newPromo.name,
          target_type: newPromo.targetType,
          target_id: newPromo.targetId,
          discount_type: newPromo.discountType,
          discount_value: newPromo.discountValue,
          start_at: newPromo.startAt,
          end_at: newPromo.endAt,
          is_active: newPromo.isActive,
          banner_text_fr: newPromo.bannerTextFr || null,
          banner_text_ar: newPromo.bannerTextAr || null,
        });

        if (error) {
          console.error('Error inserting promotion:', error.message);
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to create promotion' };
      }
    }

    return { success: true, id };
  };

  const deletePromotion = async (id: string): Promise<{ success: boolean; error?: string }> => {
    setPromotions((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem('electronics_cached_promotions', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('promotions').delete().eq('id', id);
        if (error) {
          console.error('Error deleting promotion:', error.message);
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Delete promotion failed' };
      }
    }

    return { success: true };
  };

  const togglePromotion = async (id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> => {
    setPromotions((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, isActive } : p));
      try {
        localStorage.setItem('electronics_cached_promotions', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('promotions').update({ is_active: isActive }).eq('id', id);
        if (error) {
          console.error('Error updating promotion:', error.message);
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Toggle promotion failed' };
      }
    }

    return { success: true };
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        promotions,
        isLoading,
        isDbConnected,
        getProductBySlug,
        getProductById,
        getPromotionForProduct,
        addProduct,
        updateProduct,
        deleteProduct,
        deleteProducts,
        refreshProducts: fetchProducts,
        addCategory,
        deleteCategory,
        refreshCategories: fetchCategories,
        addPromotion,
        deletePromotion,
        togglePromotion,
        refreshPromotions: fetchPromotions,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}

export function useCategories() {
  const { categories, addCategory, deleteCategory, refreshCategories } = useProducts();
  return { categories, addCategory, deleteCategory, refreshCategories };
}

export function usePromotions() {
  const { promotions, addPromotion, deletePromotion, togglePromotion, refreshPromotions, getPromotionForProduct } = useProducts();
  return { promotions, addPromotion, deletePromotion, togglePromotion, refreshPromotions, getPromotionForProduct };
}
