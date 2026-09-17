'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { PRODUCTS, Product } from '@/data/products';
import ProductCard from './ProductCard';
import { SlidersHorizontal, Sparkles } from 'lucide-react';

interface FeaturedProductsProps {
  selectedCategory?: string;
  onSelectCategory?: (cat: string) => void;
}

export default function FeaturedProducts({ selectedCategory = 'all', onSelectCategory }: FeaturedProductsProps) {
  const { lang, t } = useLanguage();
  const [internalCategory, setInternalCategory] = useState('all');

  const currentCategory = onSelectCategory ? selectedCategory : internalCategory;
  const handleCategoryChange = (cat: string) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    } else {
      setInternalCategory(cat);
    }
  };

  const categoriesList = [
    { id: 'all', label: t('products.all') },
    { id: 'earbuds', label: t('products.earbuds') },
    { id: 'headphones', label: t('products.headphones') },
    { id: 'speakers', label: t('products.speakers') },
    { id: 'chargers', label: t('products.chargers') },
    { id: 'powerbanks', label: t('products.powerbanks') },
  ];

  const filteredProducts =
    currentCategory === 'all'
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === currentCategory);

  return (
    <section id="products" className="py-16 bg-[#0D0D11]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFAA2C]">
              2026 FLAGSHIP LINEUP
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#F5F5F7]">
              {t('products.featured_title')}
            </h2>
            <p className="text-xs sm:text-sm text-[#A1A1AA]">
              {t('products.featured_subtitle')}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  currentCategory === cat.id
                    ? 'bg-gradient-to-r from-[#FF6B00] to-[#FFAA2C] text-black shadow-lg shadow-[#FF6B00]/25'
                    : 'bg-[#18181F] text-[#A1A1AA] hover:text-white border border-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
