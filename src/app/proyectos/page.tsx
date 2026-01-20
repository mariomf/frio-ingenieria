import { Metadata } from 'next'
import Link from 'next/link'
import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { INDUSTRIES, APPLICATIONS, REFRIGERANTS, CAPACITIES } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Proyectos',
  description: 'Explora nuestros proyectos de refrigeración industrial. Cuartos fríos, túneles de congelación, chillers y más para la industria alimentaria.',
}

export default function ProyectosPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-industrial-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Proyectos
          </h1>
          <p className="text-industrial-300 text-lg max-w-2xl">
            Más de 34 años de experiencia en diseño, instalación y arranque de sistemas de refrigeración industrial para la industria alimentaria.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b sticky top-16 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-industrial-600">
              <Filter className="w-5 h-5" />
              <span className="font-medium">Filtrar por:</span>
            </div>

            <select className="px-4 py-2 border border-industrial-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Industria</option>
              {INDUSTRIES.map((industry) => (
                <option key={industry.value} value={industry.value}>
                  {industry.label}
                </option>
              ))}
            </select>

            <select className="px-4 py-2 border border-industrial-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Aplicación</option>
              {APPLICATIONS.map((app) => (
                <option key={app.value} value={app.value}>
                  {app.label}
                </option>
              ))}
            </select>

            <select className="px-4 py-2 border border-industrial-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Refrigerante</option>
              {REFRIGERANTS.map((ref) => (
                <option key={ref.value} value={ref.value}>
                  {ref.label}
                </option>
              ))}
            </select>

            <select className="px-4 py-2 border border-industrial-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Capacidad</option>
              {CAPACITIES.map((cap) => (
                <option key={cap.value} value={cap.value}>
                  {cap.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Placeholder cards - will be replaced with actual data */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="group bg-white rounded-xl overflow-hidden border border-industrial-200 hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-industrial-200" />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                      Lácteos
                    </span>
                    <span className="px-2 py-1 bg-industrial-100 text-industrial-700 text-xs font-medium rounded">
                      Cuarto Frío
                    </span>
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2 text-industrial-900 group-hover:text-primary-600 transition-colors">
                    Proyecto de Ejemplo {i}
                  </h3>
                  <p className="text-industrial-600 text-sm mb-4">
                    Ciudad de México, 2024
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-industrial-500">150 TR • NH3</span>
                    <Link
                      href={`/proyectos/proyecto-${i}`}
                      className="text-primary-600 text-sm font-medium hover:text-primary-700"
                    >
                      Ver más →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline">Cargar más proyectos</Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl font-bold mb-4">
            ¿Tienes un proyecto en mente?
          </h2>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto">
            Contáctanos para una evaluación sin compromiso de tus necesidades de refrigeración.
          </p>
          <Link href="/contacto">
            <Button size="lg" className="bg-white text-primary-600 hover:bg-primary-50">
              Solicitar Cotización
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
