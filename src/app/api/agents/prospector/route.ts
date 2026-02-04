import { NextRequest, NextResponse } from 'next/server'
import { runProspector } from '@/lib/agents/prospector-agent'
import { ProspectorRequest, ProspectorResponse, AgentConfig } from '@/types/agents'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: ProspectorRequest = await request.json()

    // Build agent configuration
    const config: AgentConfig = {
      industries: body.industries || [
        'food_processing',
        'dairy',
        'meat',
        'beverages',
        'cold_storage',
      ],
      regions: body.regions || ['mexico'],
      maxLeads: body.maxLeads || 20,
      sources: body.sources || ['all'],
      minScore: body.minScore || 40,
      dryRun: body.dryRun || false,
    }

    console.log('[ProspectorAPI] Starting prospection with config:', config)

    // Run the prospector agent
    const { runId, results } = await runProspector(config)

    const response: ProspectorResponse = {
      success: true,
      runId,
      results,
    }

    console.log('[ProspectorAPI] Prospection completed:', {
      runId,
      leadsCreated: results.leadsCreated,
      leadsUpdated: results.leadsUpdated,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('[ProspectorAPI] Error:', error)

    const response: ProspectorResponse = {
      success: false,
      runId: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }

    return NextResponse.json(response, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const runId = searchParams.get('runId')

  if (!runId) {
    return NextResponse.json(
      { error: 'runId parameter is required' },
      { status: 400 }
    )
  }

  try {
    // Import supabase to check run status
    const { createServerClient } = await import('@/lib/supabase')
    const supabase = createServerClient()

    // Query agent_runs table (using type assertion since table is new)
    const { data, error } = await supabase
      .from('agent_runs')
      .select('*')
      .eq('id', runId)
      .single() as { data: {
        id: string
        status: string
        agent_type: string
        leads_found: number
        leads_qualified: number
        results: unknown
        error: string | null
        started_at: string | null
        completed_at: string | null
        created_at: string
      } | null, error: unknown }

    if (error || !data) {
      return NextResponse.json(
        { error: 'Run not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      runId: data.id,
      status: data.status,
      agentType: data.agent_type,
      leadsFound: data.leads_found,
      leadsQualified: data.leads_qualified,
      results: data.results,
      error: data.error,
      startedAt: data.started_at,
      completedAt: data.completed_at,
      createdAt: data.created_at,
    })
  } catch (error) {
    console.error('[ProspectorAPI] Error fetching run:', error)
    return NextResponse.json(
      { error: 'Failed to fetch run status' },
      { status: 500 }
    )
  }
}
