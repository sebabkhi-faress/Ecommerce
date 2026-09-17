'use client';

import React from 'react';
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
    <LanguageProvider>
      <CartProvider>
        <OrderProvider>
          <div className="min-h-screen flex flex-col bg-[#0D0D11] text-[#F5F5F7] selection:bg-[#FF6B00] selection:text-black">
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
  );
}
