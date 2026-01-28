import { Metadata } from 'next'
import Link from 'next/link'
import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { INDUSTRIES, APPLICATIONS, REFRIGERANTS, CAPACITIES } from '@/lib/constants'
import { getAllProjects } from '@/lib/services/projectService'
import { ProjectCard } from '@/components/projects/ProjectCard'

export const metadata: Metadata = {
  title: 'Proyectos de Refrigeración Industrial | Cuartos Fríos y Túneles de Congelación',
  description: 'Portafolio de proyectos de refrigeración industrial realizados en México. Cuartos fríos, túneles de congelación IQF, chillers industriales y sistemas de amoniaco para industria alimentaria, cárnica, pesquera y agroindustrial. 34 años de experiencia.',
  keywords: [
    'proyectos refrigeración industrial',
    'proyectos cuartos fríos',
    'instalación túneles congelación',
    'proyectos chillers industriales',
    'refrigeración industria alimentaria',
    'refrigeración industria cárnica',
    'refrigeración industria pesquera',
    'proyectos llave en mano refrigeración',
    'instalación sistemas amoniaco',
    'casos de éxito refrigeración',
    'portafolio refrigeración industrial',
    'proyectos IQF México',
    'blast freezer México',
    'cámaras frigoríficas proyectos',
  ],
  openGraph: {
    title: 'Proyectos de Refrigeración Industrial | Frío Ingeniería',
    description: 'Conoce nuestros proyectos de cuartos fríos, túneles de congelación y sistemas industriales. 34 años de experiencia en México.',
    url: 'https://frio-ingenieria.vercel.app/proyectos',
    type: 'website',
  },
  alternates: {
    canonical: 'https://frio-ingenieria.vercel.app/proyectos',
  },
}

export default async function ProyectosPage() {
  // Obtener proyectos reales de Supabase
  const projects = await getAllProjects()
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
          {projects && projects.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>

              {/* Load More - Opcional: implementar paginación en futuras iteraciones */}
              {projects.length >= 6 && (
                <div className="text-center mt-12">
                  <Button variant="outline">Cargar más proyectos</Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-industrial-600 mb-4">
                No hay proyectos disponibles en este momento
              </p>
              <p className="text-industrial-500 text-sm">
                Estamos trabajando en actualizar nuestro portafolio
              </p>
            </div>
          )}
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
