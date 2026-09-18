'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, PRODUCTS } from '@/data/products';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

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
  isLoading: boolean;
  isDbConnected: boolean;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;
  addProduct: (productData: Partial<Product> & { nameFr: string; nameAr: string; price: number; category: string }) => Promise<{ success: boolean; error?: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
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
    colors: Array.isArray(row.colors) ? row.colors : [
      { nameFr: 'Noir Titane', nameAr: 'أسود تيتانيوم', hex: '#1A1A1F' }
    ],
    images: Array.isArray(row.images) && row.images.length > 0
      ? row.images
      : ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop'],
  };
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
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

        if (!error && data && data.length > 0) {
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

  // Fetch all products from Supabase
  const fetchProducts = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped = data.map(mapRowToProduct);
          setProducts(mapped);
          setIsDbConnected(true);
          try {
            localStorage.setItem('electronics_cached_products', JSON.stringify(mapped));
          } catch (e) {
            // Ignore storage errors
          }
        } else if (!error && data && data.length === 0) {
          // If DB is connected but empty, keep seed products
          setIsDbConnected(true);
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
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
        }
      }
    } catch (e) {
      // Ignore
    }

    fetchProducts();
    fetchCategories();

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

      return () => {
        client.removeChannel(channel);
        client.removeChannel(catChannel);
      };
    }
  }, [fetchProducts, fetchCategories]);

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
    const slug = productData.nameFr
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || id;

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
      specs: productData.specs || [],
      colors: productData.colors || [
        { nameFr: 'Noir Titane', nameAr: 'أسود تيتانيوم', hex: '#1A1A1F' }
      ],
      images: productData.images && productData.images.length > 0
        ? productData.images
        : ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop'],
    };

    // Update locally first for instant UI response
    setProducts((prev) => [newProd, ...prev]);

    // Persist to Supabase if connected
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('products').insert({
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
        });

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

  const deleteProduct = async (id: string): Promise<{ success: boolean; error?: string }> => {
    setProducts((prev) => prev.filter((p) => p.id !== id));

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
          console.error('Error deleting product from Supabase:', error.message);
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

    setCategories((prev) => [...prev.filter((c) => c.slug !== cleanSlug), newCategory]);

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
    setCategories((prev) => prev.filter((c) => c.id !== id && c.slug !== id));

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

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        isLoading,
        isDbConnected,
        getProductBySlug,
        getProductById,
        addProduct,
        deleteProduct,
        refreshProducts: fetchProducts,
        addCategory,
        deleteCategory,
        refreshCategories: fetchCategories,
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
