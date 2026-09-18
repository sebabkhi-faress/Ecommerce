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
  title: 'Bika Store — Boutique High-Tech Flagship 2026 | Algérie COD',
  description:
    'Bika Store : Plateforme e-commerce tech nouvelle génération en Algérie. Écouteurs sans fil transparents, casques Hi-Res, chargeurs GaN 120W et accessoires MagSafe. Livraison express sur 68 Wilayas avec paiement à la livraison (الدفع عند الاستلام).',
  keywords: [
    'Bika Store',
    'Bika Store Algérie',
    'High-tech Algérie',
    'سماعات لاسلكية الجزائر',
    'شواحن سريعة GaN',
    'Paiement à la livraison Algérie',
    'COD Algérie 68 Wilayas',
    'Casques ANC',
    'MagSafe Power Bank',
  ],
  authors: [{ name: 'Bika Store' }],
  openGraph: {
    title: 'Bika Store — Boutique High-Tech Flagship 2026 | Algérie COD',
    description:
      'Bika Store : Plateforme e-commerce tech nouvelle génération en Algérie. Écouteurs sans fil transparents, casques Hi-Res, chargeurs GaN 120W et accessoires MagSafe.',
    siteName: 'Bika Store',
    locale: 'fr_DZ',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#F8F9FA',
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
      className={`light ${plusJakartaSans.variable} ${readexPro.variable} ${jetbrainsMono.variable} scroll-smooth`}
      data-theme="light"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('electronics_theme');
                  if (t === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                    document.documentElement.setAttribute('data-theme', 'dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Readex+Pro:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[var(--obsidian)] text-[var(--white-titanium)] min-h-screen transition-colors duration-200">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
