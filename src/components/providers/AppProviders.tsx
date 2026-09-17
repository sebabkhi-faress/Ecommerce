'use client';

import React from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { CartProvider } from '@/context/CartContext';
import { OrderProvider } from '@/context/OrderContext';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileDock from '@/components/layout/MobileDock';
import CartDrawer from '@/components/cart/CartDrawer';
import FastCheckoutModal from '@/components/checkout/FastCheckoutModal';
import FloatingWhatsApp from '@/components/common/FloatingWhatsApp';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <CartProvider>
          <OrderProvider>
            <div className="min-h-screen flex flex-col bg-[var(--obsidian)] text-[var(--white-titanium)] selection:bg-[#FF6B00] selection:text-white transition-colors duration-200">
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
      </LanguageProvider>
    </ThemeProvider>
  );
}
