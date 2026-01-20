import type { Metadata } from 'next'
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

export const metadata: Metadata = {
  title: {
    default: 'Frío Ingeniería | Refrigeración Industrial',
    template: '%s | Frío Ingeniería',
  },
  description: '34 años diseñando sistemas de refrigeración industrial para la industria alimentaria. Proyectos llave en mano y refacciones originales MYCOM, YORK-FRICK.',
  keywords: ['refrigeración industrial', 'cuartos fríos', 'túneles de congelación', 'chillers', 'MYCOM', 'YORK-FRICK', 'refacciones', 'México'],
  authors: [{ name: 'Frío Ingeniería' }],
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: 'https://frioingenieriamx.com',
    siteName: 'Frío Ingeniería',
    title: 'Frío Ingeniería | Refrigeración Industrial',
    description: '34 años diseñando sistemas de refrigeración industrial para la industria alimentaria.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${montserrat.variable}`}>
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
