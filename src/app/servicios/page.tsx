import { Metadata } from 'next'
import Link from 'next/link'
import { Wrench, Search, GraduationCap, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Servicios de Mantenimiento y Diagnóstico de Refrigeración Industrial',
  description: 'Servicios especializados de mantenimiento preventivo y correctivo, diagnóstico energético y capacitación para sistemas de refrigeración industrial. Atención de emergencias 24/7. Expertos en compresores MYCOM, YORK-FRICK y sistemas de amoniaco en México.',
  keywords: [
    'mantenimiento refrigeración industrial',
    'servicio refrigeración industrial',
    'mantenimiento cuartos fríos',
    'reparación sistemas refrigeración',
    'diagnóstico refrigeración',
    'auditoría energética refrigeración',
    'capacitación refrigeración industrial',
    'servicio 24 horas refrigeración',
    'emergencias refrigeración',
    'mantenimiento compresores amoniaco',
    'servicio MYCOM',
    'servicio YORK-FRICK',
    'detección fugas amoniaco',
    'mantenimiento preventivo cuartos fríos',
  ],
  openGraph: {
    title: 'Servicios de Refrigeración Industrial | Frío Ingeniería',
    description: 'Mantenimiento, diagnóstico y capacitación para sistemas de refrigeración industrial. Servicio 24/7 en México.',
    url: 'https://frioingenieriamx.com/servicios',
    type: 'website',
  },
  alternates: {
    canonical: 'https://frioingenieriamx.com/servicios',
  },
}

export default function ServiciosPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-industrial-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Servicios
          </h1>
          <p className="text-industrial-300 text-lg max-w-2xl">
            Servicios especializados para mantener tus sistemas de refrigeración operando al máximo rendimiento.
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Maintenance */}
            <div id="mantenimiento" className="bg-white border border-industrial-200 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mb-6">
                <Wrench className="w-8 h-8" />
              </div>
              <h2 className="font-heading text-2xl font-bold mb-4 text-industrial-900">
                Mantenimiento
              </h2>
              <p className="text-industrial-600 mb-6">
                Planes de mantenimiento preventivo y correctivo para maximizar la vida útil de tus equipos.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-industrial-600">Mantenimiento preventivo programado</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-industrial-600">Reparaciones correctivas</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-industrial-600">Servicio de emergencia 24/7</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-industrial-600">Contratos anuales con descuento</span>
                </li>
              </ul>
              <Link href="/contacto">
                <Button className="w-full">Solicitar Cotización</Button>
              </Link>
            </div>

            {/* Diagnostics */}
            <div id="diagnostico" className="bg-white border border-industrial-200 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 rounded-xl bg-accent-100 text-accent-600 flex items-center justify-center mb-6">
                <Search className="w-8 h-8" />
              </div>
              <h2 className="font-heading text-2xl font-bold mb-4 text-industrial-900">
                Diagnóstico
              </h2>
              <p className="text-industrial-600 mb-6">
                Evaluación técnica completa de tus sistemas con recomendaciones de optimización.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-industrial-600">Auditoría energética</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-industrial-600">Análisis de eficiencia</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-industrial-600">Detección de fugas</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-industrial-600">Reporte ejecutivo con recomendaciones</span>
                </li>
              </ul>
              <Link href="/contacto">
                <Button className="w-full">Solicitar Diagnóstico</Button>
              </Link>
            </div>

            {/* Training */}
            <div id="capacitacion" className="bg-white border border-industrial-200 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-6">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h2 className="font-heading text-2xl font-bold mb-4 text-industrial-900">
                Capacitación
              </h2>
              <p className="text-industrial-600 mb-6">
                Entrenamiento especializado para operadores y personal de mantenimiento.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-industrial-600">Operación de sistemas de amoniaco</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-industrial-600">Seguridad en refrigeración</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-industrial-600">Mantenimiento básico</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-industrial-600">Certificación incluida</span>
                </li>
              </ul>
              <Link href="/contacto">
                <Button className="w-full">Solicitar Información</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency CTA */}
      <section className="py-16 bg-red-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl font-bold mb-4">
            Servicio de Emergencia 24/7
          </h2>
          <p className="text-red-100 mb-8 max-w-xl mx-auto">
            ¿Tu sistema de refrigeración falló? Atendemos emergencias las 24 horas del día, los 7 días de la semana.
          </p>
          <Link href="/contacto">
            <Button size="xl" className="bg-white text-red-600 hover:bg-red-50">
              Contactar Ahora
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
