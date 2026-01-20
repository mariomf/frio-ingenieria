import Link from 'next/link'
import { Phone, Mail, MapPin } from 'lucide-react'
import { COMPANY, NAV_ITEMS, BRANDS } from '@/lib/constants'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-industrial-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white font-heading font-bold text-xl">
                FI
              </div>
              <div>
                <div className="font-heading font-bold text-lg">{COMPANY.name}</div>
                <div className="text-xs text-industrial-400">Refrigeración Industrial</div>
              </div>
            </div>
            <p className="text-industrial-300 text-sm mb-4">
              {COMPANY.yearsExperience} años diseñando sistemas de refrigeración industrial para la industria alimentaria en México.
            </p>
            <div className="space-y-2 text-sm text-industrial-300">
              <a href={`tel:${COMPANY.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="h-4 w-4" />
                {COMPANY.phone}
              </a>
              <a href={`mailto:${COMPANY.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="h-4 w-4" />
                {COMPANY.email}
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                {COMPANY.address}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Navegación</h3>
            <ul className="space-y-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-industrial-300 hover:text-white transition-colors text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Marcas</h3>
            <ul className="space-y-2">
              {BRANDS.map((brand) => (
                <li key={brand.slug}>
                  <Link
                    href={`/refacciones?marca=${brand.slug}`}
                    className="text-industrial-300 hover:text-white transition-colors text-sm flex items-center gap-2"
                  >
                    {brand.name}
                    {brand.isDirectDistributor && (
                      <span className="text-xs bg-accent-600 px-1.5 py-0.5 rounded">
                        Distribución directa
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Servicios</h3>
            <ul className="space-y-2 text-sm text-industrial-300">
              <li>
                <Link href="/proyectos" className="hover:text-white transition-colors">
                  Proyectos Llave en Mano
                </Link>
              </li>
              <li>
                <Link href="/refacciones" className="hover:text-white transition-colors">
                  Refacciones Originales
                </Link>
              </li>
              <li>
                <Link href="/servicios#mantenimiento" className="hover:text-white transition-colors">
                  Mantenimiento Preventivo
                </Link>
              </li>
              <li>
                <Link href="/servicios#diagnostico" className="hover:text-white transition-colors">
                  Diagnóstico Técnico
                </Link>
              </li>
              <li>
                <Link href="/servicios#capacitacion" className="hover:text-white transition-colors">
                  Capacitación
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-industrial-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-industrial-400 text-sm">
            © {currentYear} {COMPANY.name}. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm text-industrial-400">
            <Link href="/privacidad" className="hover:text-white transition-colors">
              Política de Privacidad
            </Link>
            <Link href="/terminos" className="hover:text-white transition-colors">
              Términos de Servicio
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
