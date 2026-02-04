import { AgentType, AgentRunStatus, AgentConfig, AgentResults } from '@/types/agents'
import { createClient } from '@supabase/supabase-js'

export interface AgentContext {
  runId: string
  agentId: string
  agentType: AgentType
  config: AgentConfig
  startedAt: Date
}

// Create untyped supabase client for agent operations
// (new tables not yet in generated types)
function getAgentSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export abstract class BaseAgent {
  protected agentId: string
  protected agentType: AgentType
  protected supabase = getAgentSupabase()
  protected context: AgentContext | null = null

  constructor(agentType: AgentType) {
    this.agentType = agentType
    this.agentId = `${agentType}_${Date.now()}`
  }

  // Initialize a new agent run
  protected async initRun(config: AgentConfig): Promise<string> {
    const { data, error } = await this.supabase
      .from('agent_runs')
      .insert({
        agent_id: this.agentId,
        agent_type: this.agentType,
        config: config,
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (error) {
      console.error('Failed to initialize agent run:', error)
      throw new Error(`Failed to initialize agent run: ${error.message}`)
    }

    this.context = {
      runId: data.id,
      agentId: this.agentId,
      agentType: this.agentType,
      config,
      startedAt: new Date(),
    }

    return data.id
  }

  // Update the run status
  protected async updateRunStatus(
    status: AgentRunStatus,
    results?: Partial<AgentResults>,
    error?: string
  ): Promise<void> {
    if (!this.context) {
      throw new Error('Agent run not initialized')
    }

    const updateData: Record<string, unknown> = {
      status,
    }

    if (results) {
      updateData.results = results
      updateData.leads_found = results.leadsCreated || 0
      updateData.leads_qualified = (results.leadsByCategory?.HOT || 0) + (results.leadsByCategory?.WARM || 0)
    }

    if (error) {
      updateData.error = error
    }

    if (status === 'completed' || status === 'failed') {
      updateData.completed_at = new Date().toISOString()
    }

    const { error: updateError } = await this.supabase
      .from('agent_runs')
      .update(updateData)
      .eq('id', this.context.runId)

    if (updateError) {
      console.error('Failed to update agent run:', updateError)
    }
  }

  // Log agent activity
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: unknown): void {
    const prefix = `[${this.agentType}:${this.agentId}]`
    const logData = data ? JSON.stringify(data) : ''

    switch (level) {
      case 'info':
        console.log(`${prefix} ${message}`, logData)
        break
      case 'warn':
        console.warn(`${prefix} ${message}`, logData)
        break
      case 'error':
        console.error(`${prefix} ${message}`, logData)
        break
    }
  }

  // Abstract method to be implemented by specific agents
  abstract run(config: AgentConfig): Promise<AgentResults>

  // Execute the agent with error handling
  async execute(config: AgentConfig): Promise<{ runId: string; results: AgentResults }> {
    let runId: string

    try {
      runId = await this.initRun(config)
      this.log('info', 'Agent run started', { runId, config })

      const results = await this.run(config)

      await this.updateRunStatus('completed', results)
      this.log('info', 'Agent run completed', { runId, results })

      return { runId, results }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.log('error', 'Agent run failed', { error: errorMessage })

      if (this.context) {
        await this.updateRunStatus('failed', undefined, errorMessage)
      }

      throw error
    }
  }

  // Get run status
  async getRunStatus(runId: string): Promise<{
    status: AgentRunStatus
    results?: AgentResults
    error?: string
  } | null> {
    const { data, error } = await this.supabase
      .from('agent_runs')
      .select('status, results, error')
      .eq('id', runId)
      .single()

    if (error) {
      this.log('error', 'Failed to get run status', error)
      return null
    }

    return {
      status: data.status as AgentRunStatus,
      results: data.results as AgentResults | undefined,
      error: data.error || undefined,
    }
  }
}

// Utility function to create empty results
export function createEmptyResults(): AgentResults {
  return {
    leadsProcessed: 0,
    leadsCreated: 0,
    leadsUpdated: 0,
    leadsByCategory: {
      HOT: 0,
      WARM: 0,
      COLD: 0,
      DISCARD: 0,
    },
    errors: [],
    sources: [],
  }
}
