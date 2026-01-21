import Link from 'next/link'
import type { Brand } from '@/types/database'

interface BrandCardProps {
  brand: Brand
}

/**
 * Componente para mostrar una tarjeta de marca con enlace a la página de refacciones filtrada
 */
export function BrandCard({ brand }: BrandCardProps) {
  return (
    <Link
      href={`/refacciones?marca=${brand.slug}`}
      className="group p-6 border border-industrial-200 rounded-xl hover:border-primary-500 hover:shadow-md transition-all text-center"
    >
      <div className="h-12 flex items-center justify-center mb-3">
        {brand.logo_url ? (
          <img
            src={brand.logo_url}
            alt={`Logo de ${brand.name}`}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="font-heading font-bold text-xl text-industrial-700 group-hover:text-primary-600">
            {brand.name}
          </span>
        )}
      </div>

      {brand.description && (
        <p className="text-sm text-industrial-600 mb-2 line-clamp-2">
          {brand.description}
        </p>
      )}

      {brand.is_direct_distributor && (
        <span className="inline-block px-2 py-1 bg-accent-100 text-accent-700 text-xs font-medium rounded">
          Distribución directa
        </span>
      )}
    </Link>
  )
}
