/**
 * Email Service using Resend
 *
 * Provides email notification capabilities for the lead prospection system.
 * Used primarily for HOT lead alerts to the sales team.
 */

import { Resend } from 'resend'
import { COMPANY } from '@/lib/constants'

// Initialize Resend client
let resendClient: Resend | null = null

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not configured')
    return null
  }

  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }

  return resendClient
}

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY
}

/**
 * Get notification recipients from environment
 * Defaults to company email if not configured
 */
function getNotificationRecipients(): string[] {
  const recipients = process.env.LEAD_NOTIFICATION_EMAILS
  if (recipients) {
    return recipients.split(',').map(email => email.trim()).filter(Boolean)
  }
  return [COMPANY.email]
}

/**
 * Get the sender email address
 * Uses a verified domain or Resend's default
 */
function getSenderEmail(): string {
  return process.env.RESEND_FROM_EMAIL || 'Frío Ingeniería <onboarding@resend.dev>'
}

// =====================================================
// Email Templates
// =====================================================

interface HotLeadData {
  id: string
  name: string
  company: string
  email?: string
  phone?: string
  industry?: string
  location?: string
  website?: string
  companySize?: string
  score: number
  source: string
  linkedinContacts?: Array<{
    name: string
    title: string
    email?: string
  }>
}

/**
 * Generate HTML email for HOT lead notification
 */
function generateHotLeadEmailHtml(lead: HotLeadData): string {
  const contactsHtml = lead.linkedinContacts && lead.linkedinContacts.length > 0
    ? `
      <h3 style="color: #1e40af; margin-top: 24px;">Contactos Clave</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
        <thead>
          <tr style="background: #f1f5f9;">
            <th style="padding: 8px; text-align: left; border: 1px solid #e2e8f0;">Nombre</th>
            <th style="padding: 8px; text-align: left; border: 1px solid #e2e8f0;">Puesto</th>
            <th style="padding: 8px; text-align: left; border: 1px solid #e2e8f0;">Email</th>
          </tr>
        </thead>
        <tbody>
          ${lead.linkedinContacts.map(contact => `
            <tr>
              <td style="padding: 8px; border: 1px solid #e2e8f0;">${contact.name}</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0;">${contact.title}</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0;">${contact.email || 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
    : ''

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">

  <!-- Header -->
  <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 24px;">🔥 LEAD HOT DETECTADO</h1>
    <p style="margin: 8px 0 0; opacity: 0.9;">Score: ${lead.score}/100 - Contactar en 24h</p>
  </div>

  <!-- Content -->
  <div style="background: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-top: none;">

    <!-- Company Info -->
    <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 20px;">${lead.company}</h2>
      <table style="width: 100%;">
        <tr>
          <td style="padding: 4px 0; color: #64748b; width: 120px;">Contacto:</td>
          <td style="padding: 4px 0; font-weight: 500;">${lead.name}</td>
        </tr>
        ${lead.industry ? `
        <tr>
          <td style="padding: 4px 0; color: #64748b;">Industria:</td>
          <td style="padding: 4px 0;">${lead.industry}</td>
        </tr>
        ` : ''}
        ${lead.location ? `
        <tr>
          <td style="padding: 4px 0; color: #64748b;">Ubicación:</td>
          <td style="padding: 4px 0;">${lead.location}</td>
        </tr>
        ` : ''}
        ${lead.companySize ? `
        <tr>
          <td style="padding: 4px 0; color: #64748b;">Tamaño:</td>
          <td style="padding: 4px 0;">${lead.companySize} empleados</td>
        </tr>
        ` : ''}
      </table>
    </div>

    <!-- Contact Info -->
    <h3 style="color: #1e40af; margin-bottom: 12px;">Información de Contacto</h3>
    <table style="width: 100%; margin-bottom: 20px;">
      ${lead.email ? `
      <tr>
        <td style="padding: 4px 0; color: #64748b; width: 120px;">📧 Email:</td>
        <td style="padding: 4px 0;"><a href="mailto:${lead.email}" style="color: #2563eb;">${lead.email}</a></td>
      </tr>
      ` : ''}
      ${lead.phone ? `
      <tr>
        <td style="padding: 4px 0; color: #64748b;">📞 Teléfono:</td>
        <td style="padding: 4px 0;"><a href="tel:${lead.phone}" style="color: #2563eb;">${lead.phone}</a></td>
      </tr>
      ` : ''}
      ${lead.website ? `
      <tr>
        <td style="padding: 4px 0; color: #64748b;">🌐 Website:</td>
        <td style="padding: 4px 0;"><a href="${lead.website}" target="_blank" style="color: #2563eb;">${lead.website}</a></td>
      </tr>
      ` : ''}
    </table>

    <!-- Key Contacts from Apollo/LinkedIn -->
    ${contactsHtml}

    <!-- Score Breakdown -->
    <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #f59e0b;">
      <strong style="color: #92400e;">💡 Por qué es HOT:</strong>
      <ul style="margin: 8px 0 0; padding-left: 20px; color: #78350f;">
        <li>Score alto (${lead.score}/100) indica alto potencial</li>
        ${lead.industry ? `<li>Industria objetivo: ${lead.industry}</li>` : ''}
        ${lead.companySize ? `<li>Tamaño de empresa adecuado</li>` : ''}
        <li>Fuente: ${lead.source}</li>
      </ul>
    </div>

    <!-- CTA -->
    <div style="text-align: center; margin-top: 24px;">
      <a href="${COMPANY.website}/dashboard/leads"
         style="display: inline-block; background: #2563eb; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        Ver en Dashboard
      </a>
    </div>

  </div>

  <!-- Footer -->
  <div style="background: #f1f5f9; padding: 16px; border-radius: 0 0 12px 12px; text-align: center; font-size: 12px; color: #64748b;">
    <p style="margin: 0;">Este es un email automático del sistema de prospección de ${COMPANY.name}</p>
    <p style="margin: 4px 0 0;">Generado el ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}</p>
  </div>

</body>
</html>
  `
}

/**
 * Generate plain text email for HOT lead notification
 */
function generateHotLeadEmailText(lead: HotLeadData): string {
  let text = `
🔥 LEAD HOT DETECTADO - Score: ${lead.score}/100

EMPRESA: ${lead.company}
Contacto: ${lead.name}
${lead.industry ? `Industria: ${lead.industry}` : ''}
${lead.location ? `Ubicación: ${lead.location}` : ''}
${lead.companySize ? `Tamaño: ${lead.companySize} empleados` : ''}

INFORMACIÓN DE CONTACTO:
${lead.email ? `Email: ${lead.email}` : ''}
${lead.phone ? `Teléfono: ${lead.phone}` : ''}
${lead.website ? `Website: ${lead.website}` : ''}
`

  if (lead.linkedinContacts && lead.linkedinContacts.length > 0) {
    text += `
CONTACTOS CLAVE:
${lead.linkedinContacts.map(c => `- ${c.name} (${c.title})${c.email ? ` - ${c.email}` : ''}`).join('\n')}
`
  }

  text += `
---
Fuente: ${lead.source}
Acción recomendada: Contactar en las próximas 24 horas

Ver en dashboard: ${COMPANY.website}/dashboard/leads
`

  return text.trim()
}

// =====================================================
// Email Sending Functions
// =====================================================

interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send HOT lead notification email
 */
export async function sendHotLeadNotification(lead: HotLeadData): Promise<SendEmailResult> {
  const resend = getResendClient()

  if (!resend) {
    console.log('[Email] Resend not configured, skipping notification')
    return { success: false, error: 'Email service not configured' }
  }

  const recipients = getNotificationRecipients()
  const sender = getSenderEmail()

  console.log(`[Email] Sending HOT lead notification for: ${lead.company}`)
  console.log(`[Email] Recipients: ${recipients.join(', ')}`)

  try {
    const { data, error } = await resend.emails.send({
      from: sender,
      to: recipients,
      subject: `🔥 Lead HOT: ${lead.company} (Score ${lead.score}/100)`,
      html: generateHotLeadEmailHtml(lead),
      text: generateHotLeadEmailText(lead),
      tags: [
        { name: 'category', value: 'hot-lead' },
        { name: 'source', value: lead.source },
      ],
    })

    if (error) {
      console.error('[Email] Failed to send:', error)
      return { success: false, error: error.message }
    }

    console.log(`[Email] Sent successfully, ID: ${data?.id}`)
    return { success: true, messageId: data?.id }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Email] Exception:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Send daily summary email with all new leads
 */
export async function sendDailySummary(summary: {
  date: string
  totalLeads: number
  hotLeads: number
  warmLeads: number
  coldLeads: number
  topLeads: Array<{ company: string; score: number; industry?: string }>
}): Promise<SendEmailResult> {
  const resend = getResendClient()

  if (!resend) {
    return { success: false, error: 'Email service not configured' }
  }

  const recipients = getNotificationRecipients()
  const sender = getSenderEmail()

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: #1e40af; color: white; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 24px;">📊 Resumen Diario de Prospección</h1>
    <p style="margin: 8px 0 0; opacity: 0.9;">${summary.date}</p>
  </div>

  <div style="background: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-top: none;">

    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px;">
      <div style="background: #f8fafc; padding: 16px; border-radius: 8px; text-align: center;">
        <div style="font-size: 28px; font-weight: bold; color: #0f172a;">${summary.totalLeads}</div>
        <div style="font-size: 12px; color: #64748b;">Total</div>
      </div>
      <div style="background: #fef2f2; padding: 16px; border-radius: 8px; text-align: center;">
        <div style="font-size: 28px; font-weight: bold; color: #dc2626;">${summary.hotLeads}</div>
        <div style="font-size: 12px; color: #dc2626;">HOT 🔥</div>
      </div>
      <div style="background: #fefce8; padding: 16px; border-radius: 8px; text-align: center;">
        <div style="font-size: 28px; font-weight: bold; color: #ca8a04;">${summary.warmLeads}</div>
        <div style="font-size: 12px; color: #ca8a04;">WARM</div>
      </div>
      <div style="background: #f0f9ff; padding: 16px; border-radius: 8px; text-align: center;">
        <div style="font-size: 28px; font-weight: bold; color: #0284c7;">${summary.coldLeads}</div>
        <div style="font-size: 12px; color: #0284c7;">COLD</div>
      </div>
    </div>

    ${summary.topLeads.length > 0 ? `
    <h3 style="color: #1e40af;">Top Leads del Día</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background: #f1f5f9;">
          <th style="padding: 8px; text-align: left; border: 1px solid #e2e8f0;">Empresa</th>
          <th style="padding: 8px; text-align: left; border: 1px solid #e2e8f0;">Industria</th>
          <th style="padding: 8px; text-align: center; border: 1px solid #e2e8f0;">Score</th>
        </tr>
      </thead>
      <tbody>
        ${summary.topLeads.map(lead => `
        <tr>
          <td style="padding: 8px; border: 1px solid #e2e8f0;">${lead.company}</td>
          <td style="padding: 8px; border: 1px solid #e2e8f0;">${lead.industry || 'N/A'}</td>
          <td style="padding: 8px; text-align: center; border: 1px solid #e2e8f0; font-weight: bold;">${lead.score}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    ` : '<p style="color: #64748b;">No se encontraron leads nuevos hoy.</p>'}

    <div style="text-align: center; margin-top: 24px;">
      <a href="${COMPANY.website}/dashboard/leads"
         style="display: inline-block; background: #2563eb; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        Ver Dashboard Completo
      </a>
    </div>

  </div>

  <div style="background: #f1f5f9; padding: 16px; border-radius: 0 0 12px 12px; text-align: center; font-size: 12px; color: #64748b;">
    <p style="margin: 0;">${COMPANY.name} - Sistema de Prospección AI</p>
  </div>

</body>
</html>
  `

  try {
    const { data, error } = await resend.emails.send({
      from: sender,
      to: recipients,
      subject: `📊 Resumen Prospección: ${summary.totalLeads} leads (${summary.hotLeads} HOT) - ${summary.date}`,
      html,
      tags: [
        { name: 'category', value: 'daily-summary' },
      ],
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration(): Promise<SendEmailResult> {
  const resend = getResendClient()

  if (!resend) {
    return { success: false, error: 'RESEND_API_KEY not configured' }
  }

  const recipients = getNotificationRecipients()
  const sender = getSenderEmail()

  try {
    const { data, error } = await resend.emails.send({
      from: sender,
      to: recipients,
      subject: `✅ Test: Notificaciones ${COMPANY.name} configuradas`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>✅ Configuración exitosa</h2>
          <p>Las notificaciones de email para el sistema de prospección están funcionando correctamente.</p>
          <p><strong>Destinatarios:</strong> ${recipients.join(', ')}</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-MX')}</p>
        </div>
      `,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
