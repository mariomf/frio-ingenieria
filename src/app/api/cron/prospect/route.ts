import { NextRequest, NextResponse } from 'next/server'
import { runProspector } from '@/lib/agents/prospector-agent'

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // If no CRON_SECRET is set, allow in development
  if (!cronSecret && process.env.NODE_ENV === 'development') {
    return true
  }

  return authHeader === `Bearer ${cronSecret}`
}

export async function GET(request: NextRequest) {
  // Verify authorization
  if (!verifyCronSecret(request)) {
    console.warn('[CronProspect] Unauthorized access attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[CronProspect] Starting scheduled prospection job')

  try {
    // Run prospector with default settings for cron job
    const { runId, results } = await runProspector({
      industries: [
        'food_processing',
        'dairy',
        'meat',
        'beverages',
        'cold_storage',
        'pharmaceuticals',
      ],
      regions: ['mexico', 'south_america'],
      maxLeads: 50, // More leads for scheduled job
      sources: ['all'],
      minScore: 40,
      dryRun: false,
    })

    console.log('[CronProspect] Job completed successfully', {
      runId,
      leadsCreated: results.leadsCreated,
      leadsUpdated: results.leadsUpdated,
      hotLeads: results.leadsByCategory.HOT,
      warmLeads: results.leadsByCategory.WARM,
    })

    // Send notification for HOT leads if any were found
    if (results.leadsByCategory.HOT > 0) {
      await notifyHotLeads(runId, results.leadsByCategory.HOT)
    }

    return NextResponse.json({
      success: true,
      runId,
      summary: {
        leadsProcessed: results.leadsProcessed,
        leadsCreated: results.leadsCreated,
        leadsUpdated: results.leadsUpdated,
        byCategory: results.leadsByCategory,
        sources: results.sources,
      },
    })
  } catch (error) {
    console.error('[CronProspect] Job failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Notify about HOT leads (can be extended to send emails, Slack, etc.)
async function notifyHotLeads(runId: string, count: number): Promise<void> {
  console.log(`[CronProspect] 🔥 ${count} HOT leads found in run ${runId}`)

  // TODO: Implement notification via:
  // - Resend email to sales team
  // - Slack webhook
  // - SMS via Twilio

  // For now, just log. In production:
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // await resend.emails.send({
  //   from: 'prospector@frioingenieria.com',
  //   to: 'ventas@frioingenieria.com',
  //   subject: `🔥 ${count} nuevos leads HOT encontrados`,
  //   html: `<p>ProspectorBot encontró ${count} leads calientes...</p>`,
  // })
}

// Also support POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request)
}
