'use client';

import React from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { CartProvider } from '@/context/CartContext';
import { OrderProvider } from '@/context/OrderContext';
import { ProductProvider } from '@/context/ProductContext';
import { AuthProvider } from '@/context/AuthContext';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileDock from '@/components/layout/MobileDock';
import CartDrawer from '@/components/cart/CartDrawer';
import FastCheckoutModal from '@/components/checkout/FastCheckoutModal';
import FloatingWhatsApp from '@/components/common/FloatingWhatsApp';

export default function AppProviders({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang?: 'fr' | 'ar';
}) {
  return (
    <ThemeProvider>
      <LanguageProvider initialLang={initialLang}>
        <AuthProvider>
          <ProductProvider>
            <CartProvider>
              <OrderProvider>
                <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-clip bg-[var(--obsidian)] text-[var(--white-titanium)] selection:bg-[#FF6B00] selection:text-white transition-colors duration-200">
                  <AnnouncementBar />
                  <Navbar />
                  <main className="flex-1">{children}</main>
                  <Footer />
                  <MobileDock />
                  <CartDrawer />
                  <FastCheckoutModal />
                  <FloatingWhatsApp />
                </div>
              </OrderProvider>
            </CartProvider>
          </ProductProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
