import Link from 'next/link'
import type { Project } from '@/types/database'

interface ProjectCardProps {
  project: Project
}

/**
 * Mapeo de valores de industria y aplicación a etiquetas legibles
 */
const industryLabels: Record<string, string> = {
  'lacteos': 'Lácteos',
  'carnicos': 'Cárnicos',
  'bebidas': 'Bebidas',
  'chocolates': 'Chocolates',
  'frutas-verduras': 'Frutas y Verduras',
  'petroquimica': 'Petroquímica',
}

const applicationLabels: Record<string, string> = {
  'cuartos-frios': 'Cuarto Frío',
  'tuneles': 'Túnel de Congelación',
  'bancos-hielo': 'Banco de Hielo',
  'chillers': 'Chiller',
  'pre-enfriadores': 'Pre-enfriador',
}

/**
 * Componente para mostrar una tarjeta de proyecto con información básica
 */
export function ProjectCard({ project }: ProjectCardProps) {
  const industryLabel = industryLabels[project.industry] || project.industry
  const applicationLabel = applicationLabels[project.application] || project.application

  // Usar la primera imagen del array o un placeholder
  const imageUrl = project.images && project.images.length > 0
    ? project.images[0]
    : null

  return (
    <div className="group bg-white rounded-xl overflow-hidden border border-industrial-200 hover:shadow-lg transition-shadow">
      {/* Imagen del proyecto */}
      <div className="aspect-video bg-industrial-200 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-industrial-400">
            Sin imagen
          </div>
        )}
      </div>

      {/* Información del proyecto */}
      <div className="p-6">
        {/* Tags de industria y aplicación */}
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
            {industryLabel}
          </span>
          <span className="px-2 py-1 bg-industrial-100 text-industrial-700 text-xs font-medium rounded">
            {applicationLabel}
          </span>
        </div>

        {/* Título del proyecto */}
        <h3 className="font-heading font-semibold text-lg mb-2 text-industrial-900 group-hover:text-primary-600 transition-colors">
          {project.title}
        </h3>

        {/* Ubicación y año */}
        <p className="text-industrial-600 text-sm mb-4">
          {project.location}, {project.year}
        </p>

        {/* Especificaciones técnicas y enlace */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-industrial-500">
            {project.capacity_tr ? `${project.capacity_tr} TR` : 'N/A'}
            {project.refrigerant && ` • ${project.refrigerant.toUpperCase()}`}
          </span>
          <Link
            href={`/proyectos/${project.slug}`}
            className="text-primary-600 text-sm font-medium hover:text-primary-700"
          >
            Ver más →
          </Link>
        </div>
      </div>
    </div>
  )
}
