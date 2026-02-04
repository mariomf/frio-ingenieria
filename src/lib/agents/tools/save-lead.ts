import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import {
  SaveLeadInput,
  SaveLeadOutput,
  LeadCategory,
  LeadScoreBreakdown,
} from '@/types/agents'

// Create untyped supabase client for leads operations with new fields
function getLeadsSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Save a single lead to the database
export async function saveLead(input: SaveLeadInput): Promise<SaveLeadOutput> {
  const supabase = getLeadsSupabase()

  // Check if lead already exists by email
  const { data: existingLead } = await supabase
    .from('leads')
    .select('id, score')
    .eq('email', input.lead.email || '')
    .single()

  if (existingLead) {
    // Update existing lead if new score is higher
    if (input.score > (existingLead.score || 0)) {
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          score: input.score,
          score_breakdown: input.scoreBreakdown as unknown as Record<string, unknown>,
          category: input.category,
          industry: input.lead.industry || null,
          location: input.lead.location || null,
          website: input.lead.website || null,
          company_size: input.lead.companySize || null,
          enrichment_data: input.enrichmentData as unknown as Record<string, unknown> || null,
          assigned_agent: input.agentId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingLead.id)

      if (updateError) {
        return {
          id: existingLead.id,
          isNew: false,
          success: false,
          error: updateError.message,
        }
      }

      return {
        id: existingLead.id,
        isNew: false,
        success: true,
      }
    }

    // Lead exists but new score isn't higher
    return {
      id: existingLead.id,
      isNew: false,
      success: true,
    }
  }

  // Create new lead
  const { data: newLead, error: insertError } = await supabase
    .from('leads')
    .insert({
      name: input.lead.name,
      company: input.lead.company || null,
      email: input.lead.email || `no-email-${Date.now()}@unknown.com`,
      phone: input.lead.phone || null,
      source: `ai_prospector:${input.lead.source || 'unknown'}`,
      interest: input.lead.industry || null,
      notes: `Prospected by ${input.agentId}. Score: ${input.score}/${input.category}`,
      status: 'new',
      score: input.score,
      score_breakdown: input.scoreBreakdown as unknown as Record<string, unknown>,
      category: input.category,
      industry: input.lead.industry || null,
      location: input.lead.location || null,
      website: input.lead.website || null,
      company_size: input.lead.companySize || null,
      enrichment_data: input.enrichmentData as unknown as Record<string, unknown> || null,
      assigned_agent: input.agentId,
    })
    .select('id')
    .single()

  if (insertError) {
    return {
      id: '',
      isNew: true,
      success: false,
      error: insertError.message,
    }
  }

  return {
    id: newLead.id,
    isNew: true,
    success: true,
  }
}

// Save multiple leads in batch
export async function saveLeadsBatch(
  leads: Array<{
    lead: SaveLeadInput['lead']
    score: number
    category: LeadCategory
    scoreBreakdown: LeadScoreBreakdown
    enrichmentData?: SaveLeadInput['enrichmentData']
  }>,
  agentId: string
): Promise<{
  created: number
  updated: number
  failed: number
  errors: string[]
}> {
  const results = {
    created: 0,
    updated: 0,
    failed: 0,
    errors: [] as string[],
  }

  for (const item of leads) {
    try {
      const result = await saveLead({
        lead: item.lead,
        score: item.score,
        category: item.category,
        scoreBreakdown: item.scoreBreakdown,
        enrichmentData: item.enrichmentData,
        agentId,
      })

      if (result.success) {
        if (result.isNew) {
          results.created++
        } else {
          results.updated++
        }
      } else {
        results.failed++
        if (result.error) {
          results.errors.push(`${item.lead.company || item.lead.name}: ${result.error}`)
        }
      }
    } catch (error) {
      results.failed++
      results.errors.push(
        `${item.lead.company || item.lead.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  return results
}

// Create LangChain tool for saving
export const createSaveLeadTool = (agentId: string) => {
  return new DynamicStructuredTool({
    name: 'save_lead',
    description:
      'Save a qualified lead to the database. The lead must be qualified first with qualify_lead tool.',
    schema: z.object({
      name: z.string().describe('Contact name'),
      company: z.string().describe('Company name'),
      email: z.string().optional().describe('Email address'),
      phone: z.string().optional().describe('Phone number'),
      industry: z.string().optional().describe('Industry sector'),
      location: z.string().optional().describe('Location'),
      website: z.string().optional().describe('Company website'),
      companySize: z.string().optional().describe('Company size'),
      source: z.string().describe('Source where lead was found'),
      score: z.number().describe('Lead qualification score (0-100)'),
      category: z.enum(['HOT', 'WARM', 'COLD', 'DISCARD']).describe('Lead category'),
      scoreBreakdown: z
        .object({
          demographic: z.object({
            industry: z.number(),
            companySize: z.number(),
            location: z.number(),
            jobTitle: z.number(),
          }),
          intent: z.object({
            equipmentBrands: z.number(),
            refaccionesNeed: z.number(),
          }),
          engagement: z.object({
            purchaseHistory: z.number(),
            previousInteractions: z.number(),
          }),
          total: z.number(),
        })
        .describe('Detailed score breakdown'),
    }),
    func: async (input) => {
      const result = await saveLead({
        lead: {
          name: input.name,
          company: input.company,
          email: input.email,
          phone: input.phone,
          industry: input.industry,
          location: input.location,
          website: input.website,
          companySize: input.companySize,
          source: input.source,
        },
        score: input.score,
        category: input.category,
        scoreBreakdown: input.scoreBreakdown,
        agentId,
      })
      return JSON.stringify(result, null, 2)
    },
  })
}

// Get leads by category
export async function getLeadsByCategory(category: LeadCategory): Promise<unknown[]> {
  const supabase = getLeadsSupabase()

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('category', category)
    .order('score', { ascending: false })

  if (error) {
    console.error('Failed to fetch leads:', error)
    return []
  }

  return data || []
}

// Get lead statistics
export async function getLeadStats(): Promise<{
  total: number
  byCategory: Record<LeadCategory, number>
  byStatus: Record<string, number>
}> {
  const supabase = getLeadsSupabase()

  const { data: leads, error } = await supabase
    .from('leads')
    .select('category, status')

  if (error) {
    console.error('Failed to fetch lead stats:', error)
    return {
      total: 0,
      byCategory: { HOT: 0, WARM: 0, COLD: 0, DISCARD: 0 },
      byStatus: {},
    }
  }

  const byCategory: Record<LeadCategory, number> = { HOT: 0, WARM: 0, COLD: 0, DISCARD: 0 }
  const byStatus: Record<string, number> = {}

  for (const lead of leads || []) {
    if (lead.category) {
      byCategory[lead.category as LeadCategory] = (byCategory[lead.category as LeadCategory] || 0) + 1
    }
    if (lead.status) {
      byStatus[lead.status] = (byStatus[lead.status] || 0) + 1
    }
  }

  return {
    total: leads?.length || 0,
    byCategory,
    byStatus,
  }
}
