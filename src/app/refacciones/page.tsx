import { Metadata } from 'next'
import Link from 'next/link'
import { Search, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { BRANDS } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Refacciones',
  description: 'Catálogo de refacciones originales para refrigeración industrial. Distribución directa MYCOM y YORK-FRICK. Cotización rápida.',
}

export default function RefaccionesPage() {
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
            {BRANDS.map((brand) => (
              <Link
                key={brand.slug}
                href={`/refacciones?marca=${brand.slug}`}
                className="group p-6 border border-industrial-200 rounded-xl hover:border-primary-500 hover:shadow-md transition-all text-center"
              >
                <div className="h-12 flex items-center justify-center mb-3">
                  <span className="font-heading font-bold text-xl text-industrial-700 group-hover:text-primary-600">
                    {brand.name}
                  </span>
                </div>
                {brand.isDirectDistributor && (
                  <span className="inline-block px-2 py-1 bg-accent-100 text-accent-700 text-xs font-medium rounded">
                    Distribución directa
                  </span>
                )}
              </Link>
            ))}
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
            {/* Placeholder cards */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-industrial-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-industrial-100 flex items-center justify-center">
                  <span className="text-industrial-400">Imagen</span>
                </div>
                <div className="p-4">
                  <div className="text-xs text-industrial-500 mb-1">YORK-FRICK</div>
                  <h3 className="font-semibold text-industrial-900 mb-1">2519-603{i}</h3>
                  <p className="text-sm text-industrial-600 mb-3 line-clamp-2">
                    Filtro de aceite para compresor tornillo Frick RWB II
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                      En stock
                    </span>
                    <Button size="sm" variant="outline">
                      Agregar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
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
