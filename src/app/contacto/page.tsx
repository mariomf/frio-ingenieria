import { Metadata } from 'next'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { COMPANY, WHATSAPP } from '@/lib/constants'
import { generateWhatsAppLink } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Contacto | Cotiza tu Proyecto de Refrigeración Industrial',
  description: 'Contacta a Frío Ingeniería para cotizar cuartos fríos, túneles de congelación, chillers o refacciones. Respuesta en menos de 4 horas. Atención de emergencias 24/7 en México. WhatsApp disponible.',
  keywords: [
    'contacto refrigeración industrial',
    'cotización cuartos fríos',
    'cotización refrigeración industrial',
    'contacto Frío Ingeniería',
    'teléfono refrigeración industrial México',
    'emergencias refrigeración 24 horas',
    'WhatsApp refrigeración industrial',
    'solicitar cotización refrigeración',
    'presupuesto cuartos fríos',
    'asesoría refrigeración industrial',
    'consulta refrigeración industrial',
  ],
  openGraph: {
    title: 'Contacta a Frío Ingeniería | Refrigeración Industrial',
    description: 'Solicita cotización de cuartos fríos, túneles de congelación y refacciones. Respuesta en menos de 4 horas.',
    url: 'https://frio-ingenieria.vercel.app/contacto',
    type: 'website',
  },
  alternates: {
    canonical: 'https://frio-ingenieria.vercel.app/contacto',
  },
}

export default function ContactoPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-industrial-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Contacto
          </h1>
          <p className="text-industrial-300 text-lg max-w-2xl">
            Estamos listos para ayudarte. Contáctanos y recibe una respuesta en menos de 4 horas.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="font-heading text-2xl font-bold mb-6 text-industrial-900">
                Envíanos un mensaje
              </h2>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-industrial-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full px-4 py-3 border border-industrial-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-industrial-700 mb-2">
                      Empresa *
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      required
                      className="w-full px-4 py-3 border border-industrial-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-industrial-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 border border-industrial-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-industrial-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      className="w-full px-4 py-3 border border-industrial-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-industrial-700 mb-2">
                    Tipo de solicitud
                  </label>
                  <select
                    id="type"
                    name="type"
                    className="w-full px-4 py-3 border border-industrial-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="project">Cotización de proyecto</option>
                    <option value="parts">Cotización de refacciones</option>
                    <option value="service">Servicio de mantenimiento</option>
                    <option value="emergency">Emergencia</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-industrial-700 mb-2">
                    Mensaje
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    placeholder="Cuéntanos sobre tu proyecto o necesidad..."
                    className="w-full px-4 py-3 border border-industrial-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button type="submit" size="lg" className="flex-1">
                    Enviar Mensaje
                  </Button>
                  <a
                    href={generateWhatsAppLink(WHATSAPP.phone, WHATSAPP.quoteMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button
                      type="button"
                      size="lg"
                      variant="outline"
                      className="w-full bg-green-500 text-white border-green-500 hover:bg-green-600"
                    >
                      WhatsApp Directo
                    </Button>
                  </a>
                </div>
              </form>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="font-heading text-2xl font-bold mb-6 text-industrial-900">
                Información de contacto
              </h2>

              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-industrial-900 mb-1">Teléfono</h3>
                    <a href={`tel:${COMPANY.phone}`} className="text-industrial-600 hover:text-primary-600">
                      {COMPANY.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-industrial-900 mb-1">Email</h3>
                    <a href={`mailto:${COMPANY.email}`} className="text-industrial-600 hover:text-primary-600">
                      {COMPANY.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-industrial-900 mb-1">Ubicación</h3>
                    <p className="text-industrial-600">{COMPANY.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-industrial-900 mb-1">Horario</h3>
                    <p className="text-industrial-600">Lunes a Viernes: 8:00 - 18:00</p>
                    <p className="text-industrial-600">Emergencias: 24/7</p>
                  </div>
                </div>
              </div>

              {/* Emergency Box */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="font-heading font-bold text-red-800 mb-2">
                  ¿Emergencia de refrigeración?
                </h3>
                <p className="text-red-700 text-sm mb-4">
                  Atendemos emergencias las 24 horas del día, los 7 días de la semana.
                </p>
                <a
                  href={generateWhatsAppLink(WHATSAPP.phone, WHATSAPP.emergencyMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-red-600 hover:bg-red-700">
                    Emergencia 24/7 - WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-96 bg-industrial-200">
        <div className="h-full flex items-center justify-center text-industrial-500">
          {/* Replace with actual map embed */}
          <p>Mapa de ubicación</p>
        </div>
      </section>
    </div>
  )
}
