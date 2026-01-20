'use client'

import { MessageCircle, Phone } from 'lucide-react'
import { WHATSAPP } from '@/lib/constants'
import { generateWhatsAppLink } from '@/lib/utils'

export function WhatsAppButton() {
  const emergencyLink = generateWhatsAppLink(WHATSAPP.phone, WHATSAPP.emergencyMessage)

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* Emergency Button */}
      <a
        href={emergencyLink}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2 rounded-full bg-red-600 px-4 py-3 text-white shadow-lg transition-all hover:bg-red-700 hover:shadow-xl"
      >
        <Phone className="h-5 w-5" />
        <span className="hidden font-medium group-hover:inline">Emergencia 24/7</span>
      </a>

      {/* WhatsApp Button */}
      <a
        href={generateWhatsAppLink(WHATSAPP.phone)}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2 rounded-full bg-green-500 px-4 py-3 text-white shadow-lg transition-all hover:bg-green-600 hover:shadow-xl"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="hidden font-medium group-hover:inline">WhatsApp</span>
      </a>
    </div>
  )
}
