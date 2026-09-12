import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { MainLayout } from '@/components/layout/MainLayout';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.bonow.com.mx'),
  title: {
    default: 'BONOW - Cupones, Descuentos y Promociones Exclusivas en México',
    template: '%s | BONOW Cupones y Descuentos México',
  },
  description:
    'Descubre la plataforma #1 de cupones de descuento, promociones exclusivas y ofertas en restaurantes, tiendas y servicios en México. Únete a BONOW+ y ahorra dinero en cada compra.',
  keywords: [
    'cupones mexico',
    'descuentos mexico',
    'promociones mexico',
    'ofertas cerca de mi',
    'cupones de descuento',
    'bonow',
    'bonow mexico',
    'cupones bonow',
    'membresia bonow+',
    'descuentos restaurantes mexico',
    'cupones tiendas mexico',
    'cupones gratis mexico',
    'descuentos comercios',
    'plataforma de cupones',
    'ahorrar dinero mexico',
    'ofertas hoy mexico',
    'cupones de comida',
    'descuentos ropa mexico',
    'promociones viajes',
  ],
  authors: [{ name: 'BONOW Plataforma de Cupones', url: 'https://www.bonow.com.mx' }],
  creator: 'BONOW México',
  publisher: 'BONOW',
  category: 'Shopping & Coupons',
  alternates: {
    canonical: 'https://www.bonow.com.mx',
  },
  openGraph: {
    title: 'BONOW - La Plataforma #1 de Cupones y Descuentos en México',
    description:
      'Ahorra en tus restaurantes, tiendas y servicios favoritos con los cupones y promociones exclusivas de BONOW. ¡Tu recompensa, ahora!',
    url: 'https://www.bonow.com.mx',
    siteName: 'BONOW',
    locale: 'es_MX',
    type: 'website',
    images: [
      {
        url: 'https://www.bonow.com.mx/img/fondo1.jpg',
        width: 1200,
        height: 630,
        alt: 'BONOW Cupones Descuentos y Promociones en México',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BONOW - Cupones y Descuentos Exclusivos en México',
    description:
      'Descubre los mejores cupones de descuento cerca de ti. ¡Ahorra en restaurantes, tiendas y activa tu membresía BONOW+!',
    creator: '@bonow_mx',
    images: ['https://www.bonow.com.mx/img/fondo1.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-bonow-seo-mx',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Datos Estructurados JSON-LD Schema.org para Google Search & Rich Snippets
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BONOW',
    alternateName: 'BONOW Cupones México',
    url: 'https://www.bonow.com.mx',
    description:
      'La plataforma líder en México para descubrir cupones de descuento, ofertas y beneficios exclusivos en restaurantes, negocios y servicios.',
    inLanguage: 'es-MX',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.bonow.com.mx/explore?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BONOW México',
    url: 'https://www.bonow.com.mx',
    logo: 'https://www.bonow.com.mx/img/fondo1.jpg',
    description: 'Plataforma mexicana de recompensas, cupones de descuento y promociones para consumidores y empresas.',
    sameAs: [
      'https://facebook.com/bonowmx',
      'https://instagram.com/bonowmx',
      'https://twitter.com/bonow_mx',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      areaServed: 'MX',
      availableLanguage: 'Spanish',
    },
  };

  const couponCatalogSchema = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: 'Catálogo de Cupones y Descuentos BONOW',
    url: 'https://www.bonow.com.mx/coupons',
    description: 'Catálogo de cupones digitales con descuentos en alimentos, tecnología, moda, entretenimiento y servicios.',
  };

  return (
    <html lang="es" className="h-full">
      <head>
        <meta name="theme-color" content="#7c3aed" />
        <link rel="canonical" href="https://www.bonow.com.mx" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(couponCatalogSchema) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full font-sans antialiased`}
      >
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
