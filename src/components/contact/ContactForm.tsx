'use client'

import { FormEvent, useState } from 'react'
import { Button } from '@/components/ui/Button'

type FormStatus = {
  type: 'success' | 'error'
  message: string
} | null

const fieldClassName =
  'w-full px-4 py-3 border border-industrial-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500'

export default function ContactForm({ whatsappHref }: { whatsappHref: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<FormStatus>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = Object.fromEntries(formData.entries())

    setIsSubmitting(true)
    setStatus(null)

    try {
      const response = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'No se pudo enviar el mensaje.')
      }

      form.reset()
      setStatus({ type: 'success', message: 'Tu mensaje se envió correctamente. Gracias por contactarnos.' })
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Ocurrió un error al enviar tu mensaje. Intenta de nuevo.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-industrial-700 mb-2">
            Nombre *
          </label>
          <input type="text" id="name" name="name" required maxLength={120} className={fieldClassName} />
        </div>
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-industrial-700 mb-2">
            Empresa *
          </label>
          <input type="text" id="company" name="company" required maxLength={160} className={fieldClassName} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-industrial-700 mb-2">
            Email *
          </label>
          <input type="email" id="email" name="email" required maxLength={254} className={fieldClassName} />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-industrial-700 mb-2">
            Teléfono *
          </label>
          <input type="tel" id="phone" name="phone" required maxLength={40} className={fieldClassName} />
        </div>
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-industrial-700 mb-2">
          Tipo de solicitud
        </label>
        <select id="type" name="type" className={fieldClassName}>
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
          maxLength={5000}
          placeholder="Cuéntanos sobre tu proyecto o necesidad..."
          className={fieldClassName}
        />
      </div>

      {status && (
        <p
          role={status.type === 'error' ? 'alert' : 'status'}
          className={status.type === 'success' ? 'text-green-700' : 'text-red-700'}
        >
          {status.message}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <Button type="submit" size="lg" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
        </Button>
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="flex-1">
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
  )
}
