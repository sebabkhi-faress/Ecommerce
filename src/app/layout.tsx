import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Readex_Pro, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import AppProviders from '@/components/providers/AppProviders';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-latin',
  display: 'swap',
});

const readexPro = Readex_Pro({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ELECTRONICS. — Boutique High-Tech Flagship 2026 | Algérie COD',
  description:
    'Plateforme e-commerce tech nouvelle génération en Algérie. Écouteurs sans fil transparents, casques Hi-Res, chargeurs GaN 120W et accessoires MagSafe. Livraison express sur 68 Wilayas avec paiement à la livraison (الدفع عند الاستلام).',
  keywords: [
    'Electronics Algérie',
    'High-tech Algérie',
    'سماعات لاسلكية الجزائر',
    'شواحن سريعة GaN',
    'Paiement à la livraison Algérie',
    'COD Algérie 68 Wilayas',
    'Casques ANC',
    'MagSafe Power Bank',
  ],
  authors: [{ name: 'Electronics DZ' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#0D0D11',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      dir="ltr"
      className={`${plusJakartaSans.variable} ${readexPro.variable} ${jetbrainsMono.variable} scroll-smooth`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Readex+Pro:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0D0D11] text-[#F5F5F7] min-h-screen">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
