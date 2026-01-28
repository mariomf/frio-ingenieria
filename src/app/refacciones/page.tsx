import { Metadata } from 'next'
import { Search, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getAllBrands } from '@/lib/services/brandService'
import { getPartsWithBrand } from '@/lib/services/partService'
import { BrandCard } from '@/components/parts/BrandCard'
import { PartCard } from '@/components/parts/PartCard'

export const metadata: Metadata = {
  title: 'Refacciones para Refrigeración Industrial | MYCOM y YORK-FRICK',
  description: 'Catálogo de refacciones originales para compresores y equipos de refrigeración industrial. Distribuidor autorizado MYCOM y YORK-FRICK en México. Válvulas, filtros, empaques, aceites y más. Cotización en menos de 4 horas.',
  keywords: [
    'refacciones refrigeración industrial',
    'refacciones MYCOM',
    'refacciones YORK-FRICK',
    'refacciones compresores amoniaco',
    'repuestos refrigeración industrial',
    'partes compresores industriales',
    'válvulas refrigeración',
    'filtros refrigeración industrial',
    'aceite compresores refrigeración',
    'empaques compresores MYCOM',
    'distribuidor MYCOM México',
    'distribuidor YORK-FRICK México',
    'refacciones originales refrigeración',
    'comprar refacciones refrigeración',
    'cotización refacciones refrigeración',
  ],
  openGraph: {
    title: 'Refacciones MYCOM y YORK-FRICK | Frío Ingeniería',
    description: 'Distribuidor autorizado de refacciones originales para refrigeración industrial. Cotización rápida en México.',
    url: 'https://frioingenieriamx.com/refacciones',
    type: 'website',
  },
  alternates: {
    canonical: 'https://frioingenieriamx.com/refacciones',
  },
}

export default async function RefaccionesPage() {
  // Obtener datos reales de Supabase
  const brands = await getAllBrands()
  const partsWithBrand = await getPartsWithBrand(8) // Limitar a 8 refacciones destacadas
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-industrial-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Refacciones
          </h1>
          <p className="text-industrial-300 text-lg max-w-2xl mb-8">
            Catálogo de refacciones originales para equipos de refrigeración industrial. Distribución directa de MYCOM y YORK-FRICK.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-industrial-400" />
              <input
                type="text"
                placeholder="Buscar por número de parte (ej. 2519-6033) o descripción..."
                className="w-full pl-12 pr-4 py-4 rounded-xl text-industrial-900 placeholder:text-industrial-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <p className="text-industrial-400 text-sm mt-2">
              Busca por número de parte, descripción o modelo de equipo
            </p>
          </div>
        </div>
      </section>

      {/* Brands Navigation */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h2 className="font-heading text-xl font-semibold mb-6 text-industrial-900">
            Navegar por Marca
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {brands && brands.length > 0 ? (
              brands.map((brand) => <BrandCard key={brand.id} brand={brand} />)
            ) : (
              <div className="col-span-4 text-center py-8 text-industrial-600">
                No se encontraron marcas disponibles
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Parts Grid */}
      <section className="py-12 bg-industrial-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-2xl font-semibold text-industrial-900">
              Refacciones Destacadas
            </h2>
            <div className="flex items-center gap-2 text-industrial-600">
              <ShoppingCart className="w-5 h-5" />
              <span>0 items en cotización</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {partsWithBrand && partsWithBrand.length > 0 ? (
              partsWithBrand.map((part) => (
                <PartCard
                  key={part.id}
                  part={part}
                  brand={part.brands}
                />
              ))
            ) : (
              <div className="col-span-4 text-center py-12">
                <p className="text-industrial-600 mb-4">
                  No hay refacciones disponibles en este momento
                </p>
                <p className="text-industrial-500 text-sm">
                  Contacta con nosotros para obtener la refacción que necesitas
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick Quote Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-3xl font-bold mb-4 text-industrial-900">
              Cotización Rápida
            </h2>
            <p className="text-industrial-600 mb-8">
              ¿No encuentras lo que buscas? Envíanos tu lista de partes y te cotizamos en menos de 4 horas.
            </p>
            <div className="bg-industrial-50 rounded-xl p-8">
              <textarea
                rows={4}
                placeholder="Ingresa los números de parte que necesitas, uno por línea..."
                className="w-full px-4 py-3 border border-industrial-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Nombre"
                  className="px-4 py-3 border border-industrial-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="text"
                  placeholder="Empresa"
                  className="px-4 py-3 border border-industrial-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="px-4 py-3 border border-industrial-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="tel"
                  placeholder="Teléfono"
                  className="px-4 py-3 border border-industrial-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg">Enviar por Email</Button>
                <Button size="lg" variant="outline" className="bg-green-500 text-white border-green-500 hover:bg-green-600">
                  Enviar por WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
