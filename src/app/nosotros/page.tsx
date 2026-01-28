import { Metadata } from 'next'
import { Award, Users, Shield, Target } from 'lucide-react'
import { COMPANY, FEATURED_CLIENTS } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Sobre Nosotros | Empresa de Refrigeración Industrial en México',
  description: `Frío Ingeniería: ${COMPANY.yearsExperience} años de experiencia en refrigeración industrial. Empresa mexicana especializada en cuartos fríos, túneles de congelación y sistemas de amoniaco. Distribuidor autorizado MYCOM y YORK-FRICK. Atendemos industria alimentaria, cárnica, pesquera y agroindustrial.`,
  keywords: [
    'empresa refrigeración industrial México',
    'Frío Ingeniería',
    'frioingenieria',
    'compañía refrigeración industrial',
    'especialistas refrigeración industrial',
    'distribuidor MYCOM México',
    'distribuidor YORK-FRICK México',
    'refrigeración industrial 34 años experiencia',
    'expertos cuartos fríos México',
    'empresa túneles congelación',
    'refrigeración industria alimentaria México',
    'quiénes somos Frío Ingeniería',
  ],
  openGraph: {
    title: 'Sobre Frío Ingeniería | Refrigeración Industrial',
    description: `${COMPANY.yearsExperience} años diseñando soluciones de refrigeración industrial en México. Distribuidor autorizado MYCOM y YORK-FRICK.`,
    url: 'https://frio-ingenieria.vercel.app/nosotros',
    type: 'website',
  },
  alternates: {
    canonical: 'https://frio-ingenieria.vercel.app/nosotros',
  },
}

export default function NosotrosPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-industrial-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Nosotros
          </h1>
          <p className="text-industrial-300 text-lg max-w-2xl">
            {COMPANY.yearsExperience} años de trayectoria respaldando a la industria alimentaria en México con soluciones de refrigeración confiables.
          </p>
        </div>
      </section>

      {/* History */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl font-bold mb-6 text-industrial-900">
                Nuestra Historia
              </h2>
              <div className="space-y-4 text-industrial-600">
                <p>
                  Desde {COMPANY.foundedYear}, Frío Ingeniería ha sido pionera en el diseño e implementación de sistemas de refrigeración industrial para la industria alimentaria mexicana.
                </p>
                <p>
                  Comenzamos como una pequeña empresa familiar con la visión de ofrecer soluciones de refrigeración de alta calidad. Hoy, después de {COMPANY.yearsExperience} años, somos distribuidores directos de MYCOM y YORK-FRICK, atendiendo a las principales empresas del sector alimenticio.
                </p>
                <p>
                  Nuestra experiencia abarca desde cuartos fríos para pequeñas operaciones hasta complejos sistemas de refrigeración por amoniaco para grandes plantas de procesamiento de alimentos.
                </p>
              </div>
            </div>
            <div className="bg-industrial-200 aspect-video rounded-xl flex items-center justify-center">
              <span className="text-industrial-400">Foto del equipo o instalaciones</span>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-industrial-50">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl font-bold mb-12 text-center text-industrial-900">
            Nuestros Valores
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white rounded-xl">
              <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-4">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2 text-industrial-900">
                Excelencia
              </h3>
              <p className="text-industrial-600 text-sm">
                Compromiso con la calidad en cada proyecto que realizamos.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl">
              <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2 text-industrial-900">
                Confiabilidad
              </h3>
              <p className="text-industrial-600 text-sm">
                Sistemas que funcionan cuando más los necesitas.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl">
              <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2 text-industrial-900">
                Servicio
              </h3>
              <p className="text-industrial-600 text-sm">
                Atención personalizada y soporte técnico 24/7.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl">
              <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-4">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2 text-industrial-900">
                Innovación
              </h3>
              <p className="text-industrial-600 text-sm">
                Soluciones actualizadas con las últimas tecnologías.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl font-bold mb-8 text-center text-industrial-900">
            Certificaciones y Alianzas
          </h2>
          <p className="text-industrial-600 text-center max-w-2xl mx-auto mb-12">
            Somos distribuidores autorizados y contamos con personal certificado por los principales fabricantes de equipos de refrigeración.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {['MYCOM', 'YORK-FRICK', 'Danfoss', 'Parker'].map((cert) => (
              <div
                key={cert}
                className="aspect-video bg-industrial-100 rounded-lg flex items-center justify-center"
              >
                <span className="font-heading font-bold text-industrial-400">{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clients */}
      <section className="py-16 bg-industrial-900 text-white">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl font-bold mb-8 text-center">
            Clientes que Confían en Nosotros
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-12">
            {FEATURED_CLIENTS.map((client) => (
              <div
                key={client}
                className="text-2xl font-heading font-bold text-industrial-400"
              >
                {client}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
