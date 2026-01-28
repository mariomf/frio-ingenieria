import { Metadata } from 'next'
import Link from 'next/link'
import { FileText, BookOpen, Download } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Recursos y Blog de Refrigeración Industrial | Guías Técnicas',
  description: 'Centro de recursos sobre refrigeración industrial. Blog con artículos técnicos, guías de mantenimiento, manuales de operación y documentación de equipos MYCOM y YORK-FRICK. Aprende de expertos con 34 años de experiencia.',
  keywords: [
    'blog refrigeración industrial',
    'guías refrigeración industrial',
    'artículos refrigeración',
    'manuales refrigeración industrial',
    'documentación técnica refrigeración',
    'tutoriales cuartos fríos',
    'mantenimiento refrigeración guía',
    'fichas técnicas MYCOM',
    'fichas técnicas YORK-FRICK',
    'capacitación refrigeración industrial',
    'recursos refrigeración',
    'información técnica refrigeración',
  ],
  openGraph: {
    title: 'Recursos de Refrigeración Industrial | Frío Ingeniería',
    description: 'Blog, guías técnicas y documentación sobre refrigeración industrial. Aprende de los expertos.',
    url: 'https://frioingenieriamx.com/recursos',
    type: 'website',
  },
  alternates: {
    canonical: 'https://frioingenieriamx.com/recursos',
  },
}

export default function RecursosPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-industrial-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Recursos
          </h1>
          <p className="text-industrial-300 text-lg max-w-2xl">
            Artículos, guías y documentación técnica para mantenerte informado sobre refrigeración industrial.
          </p>
        </div>
      </section>

      {/* Resources Types */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Link
              href="/recursos/blog"
              className="group p-8 border border-industrial-200 rounded-2xl hover:border-primary-500 hover:shadow-lg transition-all"
            >
              <FileText className="w-10 h-10 text-primary-600 mb-4" />
              <h2 className="font-heading text-xl font-bold mb-2 text-industrial-900 group-hover:text-primary-600">
                Blog
              </h2>
              <p className="text-industrial-600">
                Artículos sobre tendencias, mejores prácticas y noticias del sector.
              </p>
            </Link>

            <Link
              href="/recursos/guias"
              className="group p-8 border border-industrial-200 rounded-2xl hover:border-primary-500 hover:shadow-lg transition-all"
            >
              <BookOpen className="w-10 h-10 text-primary-600 mb-4" />
              <h2 className="font-heading text-xl font-bold mb-2 text-industrial-900 group-hover:text-primary-600">
                Guías Técnicas
              </h2>
              <p className="text-industrial-600">
                Documentación detallada sobre operación y mantenimiento de sistemas.
              </p>
            </Link>

            <Link
              href="/recursos/documentos"
              className="group p-8 border border-industrial-200 rounded-2xl hover:border-primary-500 hover:shadow-lg transition-all"
            >
              <Download className="w-10 h-10 text-primary-600 mb-4" />
              <h2 className="font-heading text-xl font-bold mb-2 text-industrial-900 group-hover:text-primary-600">
                Documentos
              </h2>
              <p className="text-industrial-600">
                Fichas técnicas, manuales y especificaciones de equipos.
              </p>
            </Link>
          </div>

          {/* Latest Articles */}
          <div>
            <h2 className="font-heading text-2xl font-bold mb-8 text-industrial-900">
              Últimos Artículos
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <article
                  key={i}
                  className="bg-white border border-industrial-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-video bg-industrial-200" />
                  <div className="p-6">
                    <div className="text-xs text-primary-600 font-medium mb-2">
                      Mantenimiento
                    </div>
                    <h3 className="font-heading font-semibold text-lg mb-2 text-industrial-900">
                      Título del artículo {i}
                    </h3>
                    <p className="text-industrial-600 text-sm mb-4 line-clamp-2">
                      Descripción breve del artículo que muestra un preview del contenido...
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-industrial-400">Enero 2026</span>
                      <span className="text-primary-600 font-medium">Leer más →</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-industrial-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-heading text-3xl font-bold mb-4 text-industrial-900">
              Mantente Informado
            </h2>
            <p className="text-industrial-600 mb-8">
              Suscríbete a nuestro boletín para recibir las últimas noticias y recursos sobre refrigeración industrial.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Tu email"
                className="flex-1 px-4 py-3 border border-industrial-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Suscribirse
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
