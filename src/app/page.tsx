import Link from 'next/link'
import { Award, Truck, Clock, BadgeCheck, Factory, Wrench, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { COMPANY, VALUE_PROPS, FEATURED_CLIENTS } from '@/lib/constants'
import { generateWhatsAppLink } from '@/lib/utils'
import { WHATSAPP } from '@/lib/constants'

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-industrial-900">
        {/* Background overlay - replace with video later */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/hero-bg.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-industrial-900/70" />
        </div>

        <div className="relative container mx-auto px-4 py-20 text-center text-white">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
            Refrigeración Industrial que Funciona
          </h1>
          <p className="text-lg md:text-xl text-industrial-200 mb-8 max-w-2xl mx-auto">
            {COMPANY.yearsExperience} años diseñando sistemas de frío para la industria alimentaria
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/contacto">
              <Button size="xl" className="w-full sm:w-auto">
                Cotizar Proyecto
              </Button>
            </Link>
            <Link href="/refacciones">
              <Button size="xl" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-industrial-900">
                Buscar Refacción
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-70">
            {FEATURED_CLIENTS.map((client) => (
              <div key={client} className="text-sm font-medium text-industrial-300">
                {client}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-4 text-industrial-900">
            Dos Formas de Servirte
          </h2>
          <p className="text-industrial-600 text-center mb-12 max-w-2xl mx-auto">
            Ya sea que necesites un sistema completo o solo refacciones, tenemos la solución
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Projects Card */}
            <div className="group p-8 rounded-2xl border-2 border-industrial-200 hover:border-primary-500 transition-all hover:shadow-xl">
              <div className="w-16 h-16 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mb-6">
                <Factory className="w-8 h-8" />
              </div>
              <h3 className="font-heading text-2xl font-bold mb-4 text-industrial-900">
                Proyectos Llave en Mano
              </h3>
              <p className="text-industrial-600 mb-6">
                Diseño, instalación y arranque de sistemas completos de refrigeración industrial.
              </p>
              <ul className="space-y-2 text-industrial-600 mb-8">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                  Cuartos fríos
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                  Túneles de congelación
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                  Chillers y bancos de hielo
                </li>
              </ul>
              <Link href="/proyectos" className="inline-flex items-center gap-2 font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                Ver Proyectos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Parts Card */}
            <div className="group p-8 rounded-2xl border-2 border-industrial-200 hover:border-accent-500 transition-all hover:shadow-xl">
              <div className="w-16 h-16 rounded-xl bg-accent-100 text-accent-600 flex items-center justify-center mb-6">
                <Wrench className="w-8 h-8" />
              </div>
              <h3 className="font-heading text-2xl font-bold mb-4 text-industrial-900">
                Refacciones y Partes
              </h3>
              <p className="text-industrial-600 mb-6">
                Distribución directa de refacciones originales para equipos de refrigeración.
              </p>
              <ul className="space-y-2 text-industrial-600 mb-8">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent-500 rounded-full" />
                  MYCOM (distribución directa)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent-500 rounded-full" />
                  YORK-FRICK (distribución directa)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent-500 rounded-full" />
                  Danfoss, Parker y más
                </li>
              </ul>
              <Link href="/refacciones" className="inline-flex items-center gap-2 font-semibold text-accent-600 hover:text-accent-700 transition-colors">
                Buscar Refacción
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-industrial-50">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-12 text-industrial-900">
            Por Qué Elegirnos
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-4">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2 text-industrial-900">
                {COMPANY.yearsExperience} años de experiencia
              </h3>
              <p className="text-industrial-600 text-sm">
                Desde 1991 en la industria
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-4">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2 text-industrial-900">
                Distribución directa
              </h3>
              <p className="text-industrial-600 text-sm">
                Refacciones MYCOM y Frick sin intermediarios
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2 text-industrial-900">
                Respuesta 24/7
              </h3>
              <p className="text-industrial-600 text-sm">
                Emergencias atendidas el mismo día
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-4">
                <BadgeCheck className="w-7 h-7" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2 text-industrial-900">
                Ingenieros certificados
              </h3>
              <p className="text-industrial-600 text-sm">
                Experiencia en Baltimore Aircoil, Mayekawa, JCI
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para comenzar tu proyecto?
          </h2>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto">
            Contáctanos hoy y recibe una cotización personalizada para tus necesidades de refrigeración industrial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contacto">
              <Button size="xl" className="w-full sm:w-auto bg-white text-primary-600 hover:bg-primary-50">
                Solicitar Cotización
              </Button>
            </Link>
            <a
              href={generateWhatsAppLink(WHATSAPP.phone, WHATSAPP.quoteMessage)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="xl" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary-600">
                WhatsApp Directo
              </Button>
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
