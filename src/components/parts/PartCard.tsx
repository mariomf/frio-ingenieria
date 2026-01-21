'use client'

import { Button } from '@/components/ui/Button'
import type { Part, Brand } from '@/types/database'

interface PartCardProps {
  part: Part
  brand?: Brand
  onAddToQuote?: (part: Part) => void
}

/**
 * Componente para mostrar una tarjeta de refacción con información básica
 */
export function PartCard({ part, brand, onAddToQuote }: PartCardProps) {
  const handleAddClick = () => {
    if (onAddToQuote) {
      onAddToQuote(part)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-industrial-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Imagen de la refacción */}
      <div className="aspect-square bg-industrial-100 flex items-center justify-center overflow-hidden">
        {part.image_url ? (
          <img
            src={part.image_url}
            alt={part.description}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-industrial-400 text-sm">Sin imagen</span>
        )}
      </div>

      {/* Información de la refacción */}
      <div className="p-4">
        {/* Marca */}
        {brand && (
          <div className="text-xs text-industrial-500 mb-1 font-medium">
            {brand.name}
          </div>
        )}

        {/* Número de parte */}
        <h3 className="font-semibold text-industrial-900 mb-1">
          {part.part_number}
        </h3>

        {/* Descripción */}
        <p className="text-sm text-industrial-600 mb-3 line-clamp-2">
          {part.description}
        </p>

        {/* Categoría */}
        {part.category && (
          <div className="text-xs text-industrial-500 mb-3">
            {part.category}
            {part.subcategory && ` • ${part.subcategory}`}
          </div>
        )}

        {/* Footer: Stock y botón */}
        <div className="flex items-center justify-between">
          <span
            className={`text-xs px-2 py-1 rounded font-medium ${
              part.in_stock
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {part.in_stock ? 'En stock' : `${part.lead_time_days || '?'} días`}
          </span>
          <Button size="sm" variant="outline" onClick={handleAddClick}>
            Agregar
          </Button>
        </div>
      </div>
    </div>
  )
}
