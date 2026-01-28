import type { Metadata, Viewport } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1e3a5f' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL('https://frioingenieriamx.com'),
  title: {
    default: 'Frío Ingeniería | Refrigeración Industrial en México | Cuartos Fríos y Túneles de Congelación',
    template: '%s | Frío Ingeniería - Refrigeración Industrial',
  },
  description: 'Frío Ingeniería: 34 años de experiencia en refrigeración industrial en México. Diseño, instalación y mantenimiento de cuartos fríos, túneles de congelación, chillers industriales y sistemas de amoniaco. Distribuidor autorizado MYCOM y YORK-FRICK. Soluciones para la industria alimentaria, cárnica, pesquera y agroindustrial.',
  keywords: [
    // Marca principal
    'frioingenieria',
    'frio ingenieria',
    'frío ingeniería',
    'frioingenieriamx',
    // Términos principales de refrigeración
    'refrigeración industrial',
    'refrigeracion industrial',
    'refrigeración industrial México',
    'sistemas de refrigeración industrial',
    // Productos específicos
    'cuartos fríos',
    'cuartos frios',
    'cámaras frigoríficas',
    'camaras frigorificas',
    'túneles de congelación',
    'tuneles de congelacion',
    'túnel de congelamiento rápido',
    'chillers industriales',
    'enfriadores industriales',
    'sistemas de amoniaco',
    'refrigeración con amoniaco',
    // Equipos y compresores
    'compresores de refrigeración',
    'compresores MYCOM',
    'compresores YORK',
    'compresores FRICK',
    'evaporadores industriales',
    'condensadores industriales',
    'unidades condensadoras',
    // Industrias atendidas
    'refrigeración industria alimentaria',
    'refrigeración industria cárnica',
    'refrigeración industria pesquera',
    'refrigeración agroindustrial',
    'refrigeración para rastros',
    'refrigeración para empacadoras',
    'refrigeración para procesadoras de alimentos',
    // Servicios
    'mantenimiento refrigeración industrial',
    'instalación cuartos fríos',
    'diseño sistemas refrigeración',
    'proyectos llave en mano refrigeración',
    'refacciones refrigeración industrial',
    'refacciones MYCOM',
    'refacciones YORK-FRICK',
    // Ubicación
    'refrigeración industrial México',
    'refrigeración industrial CDMX',
    'refrigeración industrial Guadalajara',
    'refrigeración industrial Monterrey',
    // Términos técnicos
    'IQF congelación',
    'blast freezer',
    'cuarto de conservación',
    'cuarto de congelación',
    'pre-enfriamiento',
    'cadena de frío',
  ],
  authors: [{ name: 'Frío Ingeniería', url: 'https://frioingenieriamx.com' }],
  creator: 'Frío Ingeniería',
  publisher: 'Frío Ingeniería',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: 'https://static.wixstatic.com/media/4141ae_9b330c8981d48b7ba63168704ff35071_fi.gif/v1/fill/w_32%2Ch_32%2Clg_1%2Cusm_0.66_1.00_0.01/4141ae_9b330c8981d48b7ba63168704ff35071_fi.gif',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: 'https://static.wixstatic.com/media/4141ae_9b330c8981d48b7ba63168704ff35071_fi.gif/v1/fill/w_192%2Ch_192%2Clg_1%2Cusm_0.66_1.00_0.01/4141ae_9b330c8981d48b7ba63168704ff35071_fi.gif',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
    shortcut: 'https://static.wixstatic.com/media/4141ae_9b330c8981d48b7ba63168704ff35071_fi.gif/v1/fill/w_32%2Ch_32%2Clg_1%2Cusm_0.66_1.00_0.01/4141ae_9b330c8981d48b7ba63168704ff35071_fi.gif',
    apple: {
      url: 'https://static.wixstatic.com/media/4141ae_9b330c8981d48b7ba63168704ff35071_fi.gif/v1/fill/w_180%2Ch_180%2Clg_1%2Cusm_0.66_1.00_0.01/4141ae_9b330c8981d48b7ba63168704ff35071_fi.gif',
      sizes: '180x180',
      type: 'image/png',
    },
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: 'https://frioingenieriamx.com',
    siteName: 'Frío Ingeniería',
    title: 'Frío Ingeniería | Refrigeración Industrial en México',
    description: '34 años de experiencia en refrigeración industrial. Cuartos fríos, túneles de congelación, chillers y sistemas de amoniaco. Distribuidor autorizado MYCOM y YORK-FRICK.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Frío Ingeniería - Refrigeración Industrial en México',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Frío Ingeniería | Refrigeración Industrial en México',
    description: '34 años de experiencia en refrigeración industrial. Cuartos fríos, túneles de congelación y sistemas de amoniaco.',
    images: ['/images/og-image.jpg'],
    creator: '@frioingenieria',
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
  alternates: {
    canonical: 'https://frioingenieriamx.com',
    languages: {
      'es-MX': 'https://frioingenieriamx.com',
    },
  },
  category: 'technology',
  classification: 'Refrigeración Industrial',
  other: {
    'geo.region': 'MX',
    'geo.placename': 'México',
    'revisit-after': '7 days',
    'rating': 'general',
    'distribution': 'global',
    'coverage': 'México',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://frioingenieriamx.com/#organization',
      name: 'Frío Ingeniería',
      alternateName: ['FrioIngenieria', 'Frio Ingenieria', 'Frío Ingeniería MX'],
      url: 'https://frioingenieriamx.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://static.wixstatic.com/media/4141ae_9b330c8981d48b7ba63168704ff35071_fi.gif',
        width: 192,
        height: 192,
      },
      image: 'https://frioingenieriamx.com/images/og-image.jpg',
      description: 'Empresa mexicana con 34 años de experiencia en refrigeración industrial. Especialistas en cuartos fríos, túneles de congelación, chillers y sistemas de amoniaco.',
      foundingDate: '1990',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'MX',
        addressLocality: 'México',
      },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: '+52-55-1234-5678',
          contactType: 'sales',
          areaServed: 'MX',
          availableLanguage: ['Spanish'],
        },
        {
          '@type': 'ContactPoint',
          telephone: '+52-55-1234-5678',
          contactType: 'customer service',
          areaServed: 'MX',
          availableLanguage: ['Spanish'],
        },
      ],
      sameAs: [
        'https://www.facebook.com/frioingenieria',
        'https://www.linkedin.com/company/frioingenieria',
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Servicios de Refrigeración Industrial',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Diseño y construcción de cuartos fríos',
              description: 'Diseño e instalación de cuartos fríos para conservación y congelación de productos.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Túneles de congelación',
              description: 'Instalación de túneles de congelación rápida IQF y blast freezers.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Sistemas de chillers industriales',
              description: 'Diseño e instalación de sistemas de enfriamiento de agua y chillers industriales.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Mantenimiento preventivo y correctivo',
              description: 'Servicio de mantenimiento para sistemas de refrigeración industrial.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Refacciones originales',
              description: 'Venta de refacciones originales MYCOM y YORK-FRICK.',
            },
          },
        ],
      },
      knowsAbout: [
        'Refrigeración Industrial',
        'Cuartos Fríos',
        'Túneles de Congelación',
        'Chillers Industriales',
        'Sistemas de Amoniaco',
        'Compresores MYCOM',
        'Compresores YORK-FRICK',
        'Cadena de Frío',
        'Industria Alimentaria',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://frioingenieriamx.com/#website',
      url: 'https://frioingenieriamx.com',
      name: 'Frío Ingeniería',
      description: 'Refrigeración Industrial en México - Cuartos Fríos, Túneles de Congelación, Chillers',
      publisher: {
        '@id': 'https://frioingenieriamx.com/#organization',
      },
      potentialAction: [
        {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://frioingenieriamx.com/buscar?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      ],
      inLanguage: 'es-MX',
    },
    {
      '@type': 'LocalBusiness',
      '@id': 'https://frioingenieriamx.com/#localbusiness',
      name: 'Frío Ingeniería',
      image: 'https://frioingenieriamx.com/images/og-image.jpg',
      description: 'Especialistas en refrigeración industrial con 34 años de experiencia. Cuartos fríos, túneles de congelación, chillers y sistemas de amoniaco.',
      url: 'https://frioingenieriamx.com',
      telephone: '+52-55-1234-5678',
      priceRange: '$$$',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'MX',
        addressRegion: 'México',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 19.4326,
        longitude: -99.1332,
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '18:00',
        },
      ],
      areaServed: {
        '@type': 'Country',
        name: 'México',
      },
      serviceType: [
        'Refrigeración Industrial',
        'Cuartos Fríos',
        'Túneles de Congelación',
        'Mantenimiento de Sistemas de Refrigeración',
        'Venta de Refacciones',
      ],
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es-MX" className={`${inter.variable} ${montserrat.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="google-site-verification" content="AjCE_mRRy4oR5uyMBWwWkbkiQUOV--zb4HwS7o-cu0M" />
        <meta name="msvalidate.01" content="tu-codigo-de-verificacion-bing" />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  )
}
