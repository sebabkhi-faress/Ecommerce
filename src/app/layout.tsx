import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let initialLang: 'fr' | 'ar' = 'fr';
  let initialTheme: 'light' | 'dark' = 'light';

  try {
    const cookieStore = await cookies();
    const cookieLang = cookieStore.get('electronics_lang')?.value;
    if (cookieLang === 'ar' || cookieLang === 'fr') {
      initialLang = cookieLang;
    }
    const cookieTheme = cookieStore.get('electronics_theme')?.value;
    if (cookieTheme === 'dark' || cookieTheme === 'light') {
      initialTheme = cookieTheme;
    }
  } catch (e) {
    // Ignore error
  }

  const isArabic = initialLang === 'ar';

  return (
    <html
      lang={initialLang}
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`${initialTheme} ${isArabic ? 'font-arabic' : 'font-latin'} ${plusJakartaSans.variable} ${readexPro.variable} ${jetbrainsMono.variable} scroll-smooth`}
      data-theme={initialTheme}
      data-lang={initialLang}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storedTheme = null;
                  var m = document.cookie.match(/(?:^|; )electronics_theme=([^;]*)/);
                  if (m && (m[1] === 'dark' || m[1] === 'light')) {
                    storedTheme = m[1];
                  } else {
                    var ls = localStorage.getItem('electronics_theme');
                    if (ls === 'dark' || ls === 'light') {
                      storedTheme = ls;
                    }
                  }

                  if (storedTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                    document.documentElement.setAttribute('data-theme', 'dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else if (storedTheme === 'light') {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                    document.documentElement.style.colorScheme = 'light';
                  }

                  if (storedTheme && !document.cookie.includes('electronics_theme=' + storedTheme)) {
                    document.cookie = 'electronics_theme=' + storedTheme + '; path=/; max-age=31536000; SameSite=Lax';
                  }

                  var l = localStorage.getItem('electronics_lang');
                  if (l === 'ar' || l === 'fr') {
                    document.documentElement.lang = l;
                    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
                    document.documentElement.setAttribute('data-lang', l);
                    if (l === 'ar') {
                      document.documentElement.classList.add('font-arabic');
                      document.documentElement.classList.remove('font-latin');
                    } else {
                      document.documentElement.classList.add('font-latin');
                      document.documentElement.classList.remove('font-arabic');
                    }
                    if (!document.cookie.includes('electronics_lang=' + l)) {
                      document.cookie = 'electronics_lang=' + l + '; path=/; max-age=31536000; SameSite=Lax';
                    }
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
      <body className="bg-[var(--obsidian)] text-[var(--white-titanium)] min-h-screen">
        <AppProviders initialLang={initialLang}>{children}</AppProviders>
      </body>
    </html>
  );
}
