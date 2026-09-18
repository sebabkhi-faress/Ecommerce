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

export const CATEGORIES: {
  id: string;
  nameFr: string;
  nameAr: string;
  descriptionFr: string;
  descriptionAr: string;
  icon: string;
  count?: number;
}[] = [];

// Pure backend architecture: No hardcoded static sample/dummy products. All data loads from Supabase.
export const PRODUCTS: Product[] = [];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function formatDZD(amount: number, lang: 'ar' | 'fr' = 'fr'): string {
  const formatted = (amount || 0).toLocaleString('fr-DZ');
  return lang === 'ar' ? `${formatted} د.ج` : `${formatted} DZD`;
}
