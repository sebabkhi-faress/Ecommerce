'use client';

import React, { useState } from 'react';
import HeroSection from '@/components/home/HeroSection';
import FlashDeals from '@/components/home/FlashDeals';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import TrustPillars from '@/components/home/TrustPillars';
import Testimonials from '@/components/home/Testimonials';

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const handleCategorySelect = (category: string) => {
    setActiveCategory(category);
    const element = document.getElementById('products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4">
      <HeroSection />
      <FlashDeals />
      <CategoryGrid onSelectCategory={handleCategorySelect} activeCategory={activeCategory} />
      <FeaturedProducts selectedCategory={activeCategory} onSelectCategory={setActiveCategory} />
      <TrustPillars />
      <Testimonials />
    </div>
  );
}
