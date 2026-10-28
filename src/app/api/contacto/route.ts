import { NextResponse } from 'next/server'
import { z } from 'zod'
import { sendContactMessage } from '@/lib/services/emailService'

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  company: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(1).max(40),
  type: z.enum(['project', 'parts', 'service', 'emergency', 'other']),
  message: z.string().trim().max(5000),
})

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null)
  const parsed = contactSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Revisa los datos del formulario e intenta de nuevo.' },
      { status: 400 }
    )
  }

  const result = await sendContactMessage(parsed.data)

  if (!result.success) {
    console.error('[ContactAPI] Failed to send contact message:', result.error)
    return NextResponse.json(
      { success: false, error: 'No se pudo enviar el mensaje. Intenta de nuevo más tarde.' },
      { status: 503 }
    )
  }

  return NextResponse.json({ success: true })
}
