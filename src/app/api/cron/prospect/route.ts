import { NextRequest, NextResponse } from 'next/server'
import { runProspector } from '@/lib/agents/prospector-agent'
import { sendDailySummary, isEmailConfigured } from '@/lib/services/emailService'
import { getLeadsByCategory } from '@/lib/agents/tools/save-lead'

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

  const startTime = Date.now()
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
      regions: ['mexico', 'central_america'],
      maxLeads: 30, // Balanced for daily runs
      sources: ['all'],
      minScore: 40,
      dryRun: false,
    })

    const duration = Math.round((Date.now() - startTime) / 1000)

    console.log('[CronProspect] Job completed successfully', {
      runId,
      duration: `${duration}s`,
      leadsCreated: results.leadsCreated,
      leadsUpdated: results.leadsUpdated,
      hotLeads: results.leadsByCategory.HOT,
      warmLeads: results.leadsByCategory.WARM,
    })

    // Send daily summary email
    await sendDailySummaryEmail(results)

    return NextResponse.json({
      success: true,
      runId,
      duration: `${duration}s`,
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

/**
 * Send daily summary email with prospection results
 */
async function sendDailySummaryEmail(results: {
  leadsCreated: number
  leadsUpdated: number
  leadsByCategory: { HOT: number; WARM: number; COLD: number; DISCARD: number }
}): Promise<void> {
  if (!isEmailConfigured()) {
    console.log('[CronProspect] Email not configured, skipping summary')
    return
  }

  // Only send if there are new leads
  const totalNewLeads = results.leadsCreated + results.leadsUpdated
  if (totalNewLeads === 0) {
    console.log('[CronProspect] No new leads, skipping summary email')
    return
  }

  try {
    // Get top HOT leads for the summary
    const hotLeads = await getLeadsByCategory('HOT')
    const topLeads = (hotLeads as Array<{ company: string; score: number; industry: string }>)
      .slice(0, 5)
      .map(lead => ({
        company: lead.company || 'Unknown',
        score: lead.score || 0,
        industry: lead.industry,
      }))

    const today = new Date().toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Mexico_City',
    })

    const emailResult = await sendDailySummary({
      date: today,
      totalLeads: totalNewLeads,
      hotLeads: results.leadsByCategory.HOT,
      warmLeads: results.leadsByCategory.WARM,
      coldLeads: results.leadsByCategory.COLD,
      topLeads,
    })

    if (emailResult.success) {
      console.log(`[CronProspect] Daily summary email sent: ${emailResult.messageId}`)
    } else {
      console.error(`[CronProspect] Failed to send summary: ${emailResult.error}`)
    }
  } catch (error) {
    console.error('[CronProspect] Error sending summary email:', error)
  }
}

// Also support POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request)
}

// Vercel Cron configuration
// Schedule: Every day at 6:00 AM (Mexico City time)
// Configured in vercel.json:
// {
//   "crons": [{
//     "path": "/api/cron/prospect",
//     "schedule": "0 6 * * *"
//   }]
// }
